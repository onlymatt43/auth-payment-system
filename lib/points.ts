import client from './turso';

/**
 * Service de gestion des points utilisateurs
 */

export interface UserBalance {
  id: number;
  email: string;
  points: number;
  total_spent: number;
  total_purchased: number;
  created_at: string;
  updated_at: string;
}

export interface PointTransaction {
  id: number;
  email: string;
  type: 'purchase' | 'spend' | 'refund' | 'bonus';
  points: number;
  balance_after: number;
  metadata?: string; // JSON
  created_at: string;
}

export interface PointConfig {
  id: number;
  point_dollar_value: number;
  point_minutes_value: number;
  updated_at: string;
}

/**
 * Récupère le solde d'un utilisateur
 */
export async function getUserBalance(email: string): Promise<UserBalance | null> {
  const result = await client.execute({
    sql: 'SELECT * FROM user_balances WHERE email = ?',
    args: [email],
  });

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as any as UserBalance;
}

/**
 * Crée un solde initial pour un nouvel utilisateur  
 */
export async function createUserBalance(email: string): Promise<UserBalance> {
  await client.execute({
    sql: 'INSERT INTO user_balances (email, points) VALUES (?, 0)',
    args: [email],
  });

  return getUserBalance(email) as Promise<UserBalance>;
}

/**
 * Crédite des points (achat PayPal, bonus, refund)
 */
export async function creditPoints(
  email: string,
  points: number,
  type: 'purchase' | 'refund' | 'bonus' = 'purchase',
  metadata?: Record<string, any>
): Promise<UserBalance> {
  // Récupère ou crée le solde
  let balance = await getUserBalance(email);
  if (!balance) {
    balance = await createUserBalance(email);
  }

  const newBalance = balance.points + points;
  const newTotalPurchased = type === 'purchase' ? balance.total_purchased + points : balance.total_purchased;

  // Met à jour le solde
  await client.execute({
    sql: `UPDATE user_balances 
          SET points = ?, 
              total_purchased = ?,
              updated_at = CURRENT_TIMESTAMP 
          WHERE email = ?`,
    args: [newBalance, newTotalPurchased, email],
  });

  // Enregistre la transaction
  await client.execute({
    sql: `INSERT INTO point_transactions (email, type, points, balance_after, metadata)
          VALUES (?, ?, ?, ?, ?)`,
    args: [email, type, points, newBalance, metadata ? JSON.stringify(metadata) : null],
  });

  return getUserBalance(email) as Promise<UserBalance>;
}

/**
 * Débite des points (accès projet)
 */
export async function debitPoints(
  email: string,
  points: number,
  metadata?: Record<string, any>
): Promise<UserBalance> {
  const balance = await getUserBalance(email);
  
  if (!balance) {
    throw new Error('User balance not found');
  }

  if (balance.points < points) {
    throw new Error('Insufficient points');
  }

  const newBalance = balance.points - points;
  const newTotalSpent = balance.total_spent + points;

  // Met à jour le solde
  await client.execute({
    sql: `UPDATE user_balances 
          SET points = ?, 
              total_spent = ?,
              updated_at = CURRENT_TIMESTAMP 
          WHERE email = ?`,
    args: [newBalance, newTotalSpent, email],
  });

  // Enregistre la transaction
  await client.execute({
    sql: `INSERT INTO point_transactions (email, type, points, balance_after, metadata)
          VALUES (?, 'spend', ?, ?, ?)`,
    args: [email, points, newBalance, metadata ? JSON.stringify(metadata) : null],
  });

  return getUserBalance(email) as Promise<UserBalance>;
}

/**
 * Récupère l'historique des transactions d'un utilisateur
 */
export async function getTransactionHistory(
  email: string,
  limit = 50
): Promise<PointTransaction[]> {
  const result = await client.execute({
    sql: `SELECT * FROM point_transactions 
          WHERE email = ? 
          ORDER BY created_at DESC 
          LIMIT ?`,
    args: [email, limit],
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
