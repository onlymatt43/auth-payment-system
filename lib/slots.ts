'use server';

import { auth } from '@/lib/auth';
import client from '@/lib/turso';
import { slotsRatelimit } from '@/lib/rate-limit';

// Simple in-memory fallback rate limiting if Upstash is not configured
const spinAttempts = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour
const RATE_LIMIT_MAX_SPINS = 5; // 5 spins per hour

function parseSqliteUtcDate(value: string): Date {
  // SQLite CURRENT_TIMESTAMP is UTC without timezone (YYYY-MM-DD HH:MM:SS).
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return new Date(value.replace(' ', 'T') + 'Z');
  }
  return new Date(value);
}

function checkAndRecordFallbackRateLimit(email: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const attempts = spinAttempts.get(email) || [];
  const recent = attempts.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_SPINS) {
    return { allowed: false, remaining: 0 };
  }

  recent.push(now);
  spinAttempts.set(email, recent);

  return { allowed: true, remaining: RATE_LIMIT_MAX_SPINS - recent.length };
}

// Résultats possibles des slots
const SLOT_OUTCOMES = [
  { points: 0, probability: 0.40, reels: ['3', '4', '3'], multiplier: 0 },
  { points: 5, probability: 0.25, reels: ['3', '3', '4'], multiplier: 1 },
  { points: 10, probability: 0.15, reels: ['3', '3', '3'], multiplier: 1 },
  { points: 25, probability: 0.10, reels: ['4', '4', '3'], multiplier: 2.5 },
  { points: 50, probability: 0.06, reels: ['4', '4', '4'], multiplier: 5 },
  { points: 100, probability: 0.03, reels: ['🍁', '🍁', '4'], multiplier: 10 },
  { points: 250, probability: 0.01, reels: ['🍁', '🍁', '🍁'], multiplier: 25, jackpot: true },
];

function selectOutcome(): typeof SLOT_OUTCOMES[0] {
  const random = Math.random();
  let cumulativeProbability = 0;

  for (const outcome of SLOT_OUTCOMES) {
    cumulativeProbability += outcome.probability;
    if (random <= cumulativeProbability) {
      return outcome;
    }
  }

  return SLOT_OUTCOMES[SLOT_OUTCOMES.length - 1];
}

async function checkDailyFreeSpinEligibility(userId: number) {
  const result = await client.execute({
    sql: `
      SELECT last_free_spin FROM daily_free_spins 
      WHERE user_id = ?
    `,
    args: [userId],
  });

  if (result.rows.length === 0) {
    // New user - create entry
    await client.execute({
      sql: `
        INSERT INTO daily_free_spins (user_id, last_free_spin, spins_used_today)
        VALUES (?, CURRENT_TIMESTAMP, 1)
      `,
      args: [userId],
    });
    return true;
  }

  const lastSpin = parseSqliteUtcDate(result.rows[0].last_free_spin as string);
  const now = new Date();
  const hoursSinceLastSpin = (now.getTime() - lastSpin.getTime()) / (1000 * 60 * 60);

  if (hoursSinceLastSpin >= 24) {
    // Reset daily counter
    await client.execute({
      sql: `
        UPDATE daily_free_spins 
        SET last_free_spin = CURRENT_TIMESTAMP, spins_used_today = 1
        WHERE user_id = ?
      `,
      args: [userId],
    });
    return true;
  }

  return false;
}

async function deductPoints(userId: number, amount: number) {
  const result = await client.execute({
    sql: `
      SELECT balance FROM users_points WHERE user_id = ?
    `,
    args: [userId],
  });

  if (result.rows.length === 0) {
    throw new Error('User balance not found');
  }

  const currentBalance = (result.rows[0].balance as number) || 0;

  if (currentBalance < amount) {
    throw new Error('Insufficient points');
  }

  await client.execute({
    sql: `
      UPDATE users_points SET balance = balance - ? WHERE user_id = ?
    `,
    args: [amount, userId],
  });

  // Log transaction for spin cost
  await client.execute({
    sql: `
      INSERT INTO transactions (user_id, type, amount, balance_before, balance_after)
      VALUES (?, 'slots_cost', ?, ?, ?)
    `,
    args: [userId, -amount, currentBalance, currentBalance - amount],
  });
}

async function addPoints(userId: number, amount: number) {
  const result = await client.execute({
    sql: `
      SELECT balance FROM users_points WHERE user_id = ?
    `,
    args: [userId],
  });

  const currentBalance = (result.rows[0]?.balance as number) || 0;

  await client.execute({
    sql: `
      UPDATE users_points SET balance = balance + ?, total_earned = total_earned + ? WHERE user_id = ?
    `,
    args: [amount, amount, userId],
  });

  // Log transaction
  await client.execute({
    sql: `
      INSERT INTO transactions (user_id, type, amount, balance_before, balance_after)
      VALUES (?, 'slots_win', ?, ?, ?)
    `,
    args: [userId, amount, currentBalance, currentBalance + amount],
  });
}

export async function spinSlots(payWithPoints: boolean = false, pointsCost: number = 0) {
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, error: 'Not authenticated' };
  }

  const canonicalEmail = session.user.email.trim().toLowerCase();

  // 🔒 SECURITY: Check rate limiting (Upstash if configured, otherwise in-memory fallback)
  if (slotsRatelimit) {
    const { success } = await slotsRatelimit.limit(canonicalEmail);
    if (!success) {
      return {
        success: false,
        error: 'Too many spins. Maximum 5 spins per hour. Try again later.',
        rateLimited: true,
      };
    }
  } else {
    const { allowed } = checkAndRecordFallbackRateLimit(canonicalEmail);
    if (!allowed) {
      return {
        success: false,
        error: 'Too many spins. Maximum 5 spins per hour. Try again later.',
        rateLimited: true,
      };
    }
  }

  try {
    // Get user ID from email
    const userResult = await client.execute({
      sql: `SELECT id FROM users WHERE lower(email) = ? LIMIT 1`,
      args: [canonicalEmail],
    });

    if (userResult.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const userId = userResult.rows[0].id as number;

    // Check if it's a paid spin or free spin
    if (payWithPoints && pointsCost > 0) {
      await deductPoints(userId, pointsCost);
    } else {
      // Check daily free spin eligibility
      const eligibleForFree = await checkDailyFreeSpinEligibility(userId);
      if (!eligibleForFree) {
        return { success: false, error: 'Daily free spin already used' };
      }
    }

    // Get outcome
    const outcome = selectOutcome();

    // Add points if won
    if (outcome.points > 0) {
      await addPoints(userId, outcome.points);
    }

    // Record the spin (compatible with old and new DB schemas)
    try {
      await client.execute({
        sql: `
          INSERT INTO user_spins (
            user_id,
            email,
            spin_cost,
            spin_result,
            reels,
            multiplier,
            is_jackpot
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          userId,
          canonicalEmail,
          payWithPoints ? pointsCost : 0,
          outcome.points,
          JSON.stringify(outcome.reels),
          outcome.multiplier,
          outcome.jackpot ? 1 : 0,
        ],
      });
    } catch (insertError) {
      const message = insertError instanceof Error ? insertError.message : String(insertError);
      if (!message.includes('no column named email')) {
        throw insertError;
      }

      await client.execute({
        sql: `
          INSERT INTO user_spins (
            user_id,
            spin_cost,
            spin_result,
            reels,
            multiplier,
            is_jackpot
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
          userId,
          payWithPoints ? pointsCost : 0,
          outcome.points,
          JSON.stringify(outcome.reels),
          outcome.multiplier,
          outcome.jackpot ? 1 : 0,
        ],
      });
    }

    // Get updated balance
    const balanceResult = await client.execute({
      sql: `SELECT balance FROM users_points WHERE user_id = ?`,
      args: [userId],
    });

    return {
      success: true,
      result: outcome.points,
      reels: outcome.reels,
      multiplier: outcome.multiplier,
      isJackpot: outcome.jackpot || false,
      newBalance: (balanceResult.rows[0]?.balance as number) || 0,
    };
  } catch (error) {
    const { createSafeLog } = await import('./log-sanitizer');
    console.error('Spin error:', createSafeLog('Spin failed', {
      error: error instanceof Error ? error.message : String(error),
    }, ['EMAIL']));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Spin failed',
    };
  }
}
