import client from './turso';

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS email_login_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  used_at DATETIME
);`;

const CREATE_INDEX_SQL = `CREATE INDEX IF NOT EXISTS idx_email_login_codes_email ON email_login_codes(email);`;

const CODE_TTL_SECONDS = 10 * 60;
let tableReady: Promise<void> | null = null;

async function ensureTable() {
  if (!tableReady) {
    tableReady = (async () => {
      await client.execute(CREATE_TABLE_SQL);
      await client.execute(CREATE_INDEX_SQL);
    })();
  }
  await tableReady;
}

async function hashCode(code: string) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('SubtleCrypto unavailable');
  }
  const data = new TextEncoder().encode(code);
  const digest = await subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createEmailLoginCode(email: string) {
  await ensureTable();
  const code = (Math.floor(100000 + Math.random() * 900000)).toString();
  const codeHash = await hashCode(code);
  const expiresAt = Math.floor(Date.now() / 1000) + CODE_TTL_SECONDS;

  await client.execute({
    sql: `INSERT INTO email_login_codes (email, code_hash, expires_at) VALUES (?, ?, ?)` ,
    args: [email, codeHash, expiresAt],
  });

  return { code, expiresAt };
}

export async function verifyEmailLoginCode(email: string, code: string) {
  await ensureTable();
  const codeHash = await hashCode(code);
  const now = Math.floor(Date.now() / 1000);

  const result = await client.execute({
    sql: `SELECT id FROM email_login_codes WHERE email = ? AND code_hash = ? AND used = 0 AND expires_at >= ? ORDER BY created_at DESC LIMIT 1`,
    args: [email, codeHash, now],
  });

  if (result.rows.length === 0) {
    return false;
  }

  const id = result.rows[0].id as number;

  await client.execute({
    sql: `UPDATE email_login_codes SET used = 1, used_at = CURRENT_TIMESTAMP WHERE id = ?`,
    args: [id],
  });

  return true;
}
