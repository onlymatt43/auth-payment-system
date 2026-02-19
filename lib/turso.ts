import { createClient } from '@libsql/client';
import type { Client } from '@libsql/client';

let client: Client | null = null;

function getClient(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    
    if (!url || !authToken) {
      throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
    }
    
    client = createClient({ url, authToken });
  }
  return client;
}

// Create a Proxy to maintain backward compatibility with the old API
const clientProxy = new Proxy({} as Client, {
  get(_target, prop) {
    return getClient()[prop as keyof Client];
  }
});

export default clientProxy;