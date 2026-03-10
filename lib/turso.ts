import { createClient } from '@libsql/client';

const resolvedUrl = process.env.TURSO_DATABASE_URL || (process.env.NODE_ENV === 'production' ? undefined : 'file:local.db');
const isLocalFile = !!resolvedUrl && resolvedUrl.startsWith('file:');

if (!resolvedUrl) {
  throw new Error('Missing TURSO_DATABASE_URL. Set it in environment variables.');
}

if (!isLocalFile && !process.env.TURSO_AUTH_TOKEN) {
  throw new Error('Missing TURSO_AUTH_TOKEN for remote Turso database.');
}

const client = createClient({
  url: resolvedUrl,
  authToken: isLocalFile ? undefined : process.env.TURSO_AUTH_TOKEN,
  intMode: 'number',
});

export default client;
