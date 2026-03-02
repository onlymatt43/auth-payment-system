'use server';

import { auth } from '@/lib/auth';
import client from '@/lib/turso';

// Résultats possibles des slots
const SLOT_OUTCOMES = [
  { points: 0, probability: 0.40, reels: ['🎯', '💎', '🎪'], multiplier: 0 },
  { points: 5, probability: 0.25, reels: ['🍒', '🍒', '🎪'], multiplier: 1 },
  { points: 10, probability: 0.15, reels: ['🍒', '🍒', '🍒'], multiplier: 1 },
  { points: 25, probability: 0.10, reels: ['💎', '💎', '🎪'], multiplier: 2.5 },
  { points: 50, probability: 0.06, reels: ['💎', '💎', '💎'], multiplier: 5 },
  { points: 100, probability: 0.03, reels: ['👑', '👑', '🎪'], multiplier: 10 },
  { points: 250, probability: 0.01, reels: ['👑', '👑', '👑'], multiplier: 25, jackpot: true },
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

  const lastSpin = new Date(result.rows[0].last_free_spin as string);
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
      SELECT points FROM users WHERE id = ?
    `,
    args: [userId],
  });

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  const currentPoints = (result.rows[0].points as number) || 0;

  if (currentPoints < amount) {
    throw new Error('Insufficient points');
  }

  await client.execute({
    sql: `
      UPDATE users SET points = points - ? WHERE id = ?
    `,
    args: [amount, userId],
  });
}

async function addPoints(userId: number, amount: number) {
  await client.execute({
    sql: `
      UPDATE users SET points = points + ? WHERE id = ?
    `,
    args: [amount, userId],
  });

  // Log transaction
  await client.execute({
    sql: `
      INSERT INTO transactions (user_id, type, points, metadata)
      VALUES (?, 'slots_win', ?, ?)
    `,
    args: [userId, amount, JSON.stringify({ source: 'slot_machine' })],
  });
}

export async function spinSlots(payWithPoints: boolean = false, pointsCost: number = 0) {
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // Get user ID from email
    const userResult = await client.execute({
      sql: `SELECT id FROM users WHERE email = ?`,
      args: [session.user.email],
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

    // Record the spin
    const spinRecord = await client.execute({
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
        session.user.email,
        payWithPoints ? pointsCost : 0,
        outcome.points,
        JSON.stringify(outcome.reels),
        outcome.multiplier,
        outcome.jackpot ? 1 : 0,
      ],
    });

    // Get updated balance
    const balanceResult = await client.execute({
      sql: `SELECT points FROM users WHERE id = ?`,
      args: [userId],
    });

    return {
      success: true,
      result: outcome.points,
      reels: outcome.reels,
      multiplier: outcome.multiplier,
      isJackpot: outcome.jackpot || false,
      newBalance: (balanceResult.rows[0]?.points as number) || 0,
    };
  } catch (error) {
    console.error('Spin error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Spin failed',
    };
  }
}
