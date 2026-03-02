/**
 * Admin Authentication Helper
 * NOTE: This is a temporary solution. Migrate to NextAuth with admin role for better security.
 */

import crypto from 'crypto';

/**
 * Hash password using PBKDF2
 * @param password Plain text password
 * @returns hashed password
 */
export function hashAdminPassword(password: string): string {
  const salt = process.env.ADMIN_PASSWORD_SALT || 'onlymatt-admin-salt';
  return crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
}

/**
 * Verify admin password
 * @param plainPassword Plain text password from user
 * @param hashedPassword Hashed password from env
 * @returns true if password matches
 */
export function verifyAdminPassword(plainPassword: string, hashedPassword: string): boolean {
  const hashed = hashAdminPassword(plainPassword);
  
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(hashed),
    Buffer.from(hashedPassword)
  );
}

/**
 * Get expected hash for current ADMIN_PASSWORD
 * Run this once to get the hash to store in your secure secret manager
 * Command: node -e "import('./lib/admin-auth.ts').then(m => console.log(m.hashAdminPassword(process.env.ADMIN_PASSWORD)))"
 */
export function getPasswordHash(password: string): string {
  return hashAdminPassword(password);
}
