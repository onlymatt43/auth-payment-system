import client from './turso';

/**
 * Service de gestion des points utilisateurs
 */

export interface UserBalance {
  id: number;
  user_id: number;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface PointTransaction {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  balance_after: number;
  description?: string;
  metadata?: string;
  created_at: string;
}

export interface PointConfig {
  id: number;
  point_dollar_value: number;
  point_minutes_value: number;
  updated_at: string;
}

/**
 * Get user ID from email
 */
async function getUserIdFromEmail(email: string): Promise<number | null> {
  const result = await client.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [email],
  });

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0].id as number;
}

/**
 * Récupère le solde d'un utilisateur
 */
export async function getUserBalance(email: string): Promise<UserBalance | null> {
  const userId = await getUserIdFromEmail(email);
  if (!userId) {
    return null;
  }

  const result = await client.execute({
    sql: 'SELECT * FROM users_points WHERE user_id = ?',
    args: [userId],
  });

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as any as UserBalance;
}

/**
 * Crée un solde initial pour un nouvel utilisateur  
 */
export async function createUserBalance(email: string): Promise<UserBalance | null> {
  const userId = await getUserIdFromEmail(email);
  if (!userId) {
    return null;
  }

  await client.execute({
    sql: 'INSERT INTO users_points (user_id, balance, total_earned, total_spent) VALUES (?, 0, 0, 0)',
    args: [userId],
  });

  return getUserBalance(email);
}

/**
 * Crédite des points (achat PayPal, bonus, refund)
 */
export async function creditPoints(
  email: string,
  points: number,
  type: 'purchase' | 'spend' | 'refund' | 'bonus' = 'purchase',
  metadata?: Record<string, any>
): Promise<UserBalance | null> {
  const userId = await getUserIdFromEmail(email);
  if (!userId) {
    return null;
  }

  // Récupère ou crée le solde
  let balance = await getUserBalance(email);
  if (!balance) {
    balance = await createUserBalance(email);
  }

  if (!balance) {
    return null;
  }

  const newBalance = balance.balance + points;
  const newTotalEarned = type === 'purchase' || type === 'bonus' ? balance.total_earned + points : balance.total_earned;

  // Met à jour le solde
  await client.execute({
    sql: `UPDATE users_points 
          SET balance = ?, 
              total_earned = ?,
              updated_at = CURRENT_TIMESTAMP 
          WHERE user_id = ?`,
    args: [newBalance, newTotalEarned, userId],
  });

  // Enregistre la transaction
  await client.execute({
    sql: `INSERT INTO transactions (user_id, type, amount, balance_after, description, metadata)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [userId, type, points, newBalance, '', metadata ? JSON.stringify(metadata) : null],
  });

  return getUserBalance(email);
}

/**
 * Débite des points (accès projet)
 */
export async function debitPoints(
  email: string,
  points: number,
  metadata?: Record<string, any>
): Promise<UserBalance | null> {
  const userId = await getUserIdFromEmail(email);
  if (!userId) {
    return null;
  }

  const balance = await getUserBalance(email);
  
  if (!balance) {
    throw new Error('User balance not found');
  }

  if (balance.balance < points) {
    throw new Error('Insufficient points');
  }

  const newBalance = balance.balance - points;
  const newTotalSpent = balance.total_spent + points;

  // Met à jour le solde
  await client.execute({
    sql: `UPDATE users_points 
          SET balance = ?, 
              total_spent = ?,
              updated_at = CURRENT_TIMESTAMP 
          WHERE user_id = ?`,
    args: [newBalance, newTotalSpent, userId],
  });

  // Enregistre la transaction
  await client.execute({
    sql: `INSERT INTO transactions (user_id, type, amount, balance_after, description, metadata)
          VALUES (?, 'spend', ?, ?, ?, ?)`,
    args: [userId, points, newBalance, '', metadata ? JSON.stringify(metadata) : null],
  });

  return getUserBalance(email);
}

/**
 * Récupère l'historique des transactions d'un utilisateur
 */
export async function getTransactionHistory(
  email: string,
  limit = 50
): Promise<PointTransaction[]> {
  const userId = await getUserIdFromEmail(email);
  if (!userId) {
    return [];
  }

  const result = await client.execute({
    sql: `SELECT * FROM transactions 
          WHERE user_id = ? 
          ORDER BY created_at DESC 
          LIMIT ?`,
    args: [userId, limit],
  });

  return result.rows as any as PointTransaction[];
}

/**
 * Récupère la configuration globale des points
 */
export async function getPointConfig(): Promise<PointConfig> {
  const result = await client.execute({
    sql: 'SELECT * FROM point_config WHERE id = 1',
    args: [],
  });

  if (result.rows.length === 0) {
    throw new Error('Point configuration not found');
  }

  return result.rows[0] as any as PointConfig;
}

/**
 * Met à jour la configuration globale des points (admin)
 */
export async function updatePointConfig(
  dollarValue?: number,
  minutesValue?: number
): Promise<PointConfig> {
  const updates: string[] = [];
  const args: any[] = [];

  if (dollarValue !== undefined) {
    updates.push('point_dollar_value = ?');
    args.push(dollarValue);
  }

  if (minutesValue !== undefined) {
    updates.push('point_minutes_value = ?');
    args.push(minutesValue);
  }

  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    await client.execute({
      sql: `UPDATE point_config SET ${updates.join(', ')} WHERE id = 1`,
      args,
    });
  }

  return getPointConfig();
}
