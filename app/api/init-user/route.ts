import { auth } from '@/lib/auth';
import client from '@/lib/turso';
import { NextResponse } from 'next/server';

/**
 * Initialize user on first login
 * Creates entry in users_points table if doesn't exist
 */
export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user ID from email
    const userResult = await client.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [session.user.email],
    });

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id as number;

    // Check if user already has points entry
    const pointsResult = await client.execute({
      sql: 'SELECT id FROM users_points WHERE user_id = ?',
      args: [userId],
    });

    // If not, create it
    if (pointsResult.rows.length === 0) {
      await client.execute({
        sql: 'INSERT INTO users_points (user_id, balance, total_earned, total_spent) VALUES (?, 0, 0, 0)',
        args: [userId],
      });
    }

    return NextResponse.json(
      { success: true, userId, email: session.user.email },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error initializing user:', error);
    return NextResponse.json(
      { error: 'Failed to initialize user' },
      { status: 500 }
    );
  }
}
