import { NextResponse } from 'next/server';
import client from '@/lib/turso';

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  let connectionWorks = false;
  let error = null;
  
  try {
    await client.execute('SELECT 1 as test');
    connectionWorks = true;
  } catch (e: any) {
    error = e.message;
  }

  return NextResponse.json({
    url_exists: !!url,
    url_value: url,
    token_exists: !!token,
    token_length: token?.length || 0,
    token_start: token?.substring(0, 20) || '',
    token_end: token?.substring(token?.length - 20) || '',
    connection_works: connectionWorks,
    error: error,
  });
}
