import { NextResponse } from 'next/server';
import client from '../../../lib/turso';

export async function POST() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS access_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        secret TEXT NOT NULL,
        ip TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    return NextResponse.json({ message: 'Database setup complete' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to setup database' }, { status: 500 });
  }
}