import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  return NextResponse.json({
    url_exists: !!url,
    url_value: url,
    token_exists: !!token,
    token_length: token?.length || 0,
    token_start: token?.substring(0, 20) || '',
    token_end: token?.substring(token?.length - 20) || '',
  });
}
