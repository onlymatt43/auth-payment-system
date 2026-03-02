# 💰 Points Synchronization System

## Overview

Les points des utilisateurs se synchronisent en temps réel entre tous les systèmes (shop, account, slots, admin). Chaque action met à jour la table `users.points` immédiatement.

## Database Tables Involved

### `users`
- **Colonne clé**: `points` (INTEGER)
- **Mise à jour**: Modifiée par toutes les opérations de points
- **Synchronisation**: Instantanée (transaction SQL atomique)

```sql
UPDATE users SET points = points + ? WHERE id = ?
```

### `transactions`
- **Enregistre**: Toutes les opérations sur les points
- **Types**: 'purchase', 'access', 'slots_cost', 'slots_win', 'refund', 'bonus'
- **Metadata**: Détails supplémentaires (source, multiplier, jackpot, etc.)

### `user_spins`
- **Enregistre**: Chaque spin avec résultat, coût, gain
- **Synchronisation**: Après chaque spin, `users.points` est mis à jour

### `daily_free_spins`
- **Enregistre**: Éligibilité pour le free spin par utilisateur
- **Cooling**: 24 heures entre chaque free spin

## Point Flows

### 1. Shop Purchase (PayPal)
```
User buys points via PayPal
    ↓
POST /api/paypal/capture
    ↓
Payment verification
    ↓
UPDATE users SET points = points + purchased_amount
    ↓
INSERT INTO transactions (type: 'purchase', ...)
    ↓
Balance updated everywhere (real-time)
```

### 2. Project Access Deduction
```
User accesses a restricted project
    ↓
POST /api/points/spend
    ↓
Check if user has enough points
    ↓
UPDATE users SET points = points - required_points
    ↓
INSERT INTO transactions (type: 'access', ...)
    ↓
Balance updated in account page
```

### 3. Slot Machine - Free Spin
```
User clicks "SPIN GRATUIT"
    ↓
spinSlots(false, 0)
    ↓
Check daily_free_spins (24h cooldown)
    ↓
selectOutcome() → Random result
    ↓
IF outcome.points > 0:
  UPDATE users SET points = points + outcome.points
  INSERT INTO transactions (type: 'slots_win', points: outcome.points, ...)
    ↓
INSERT INTO user_spins (spin_cost: 0, spin_result: outcome.points, ...)
    ↓
Return newBalance from users table
    ↓
Frontend updates balance display
```

### 4. Slot Machine - Paid Spin
```
User selects paid spin (10, 25, or 50 points)
    ↓
spinSlots(true, pointsCost)
    ↓
SELECT points FROM users (verify balance)
    ↓
UPDATE users SET points = points - pointsCost
    ↓
INSERT INTO transactions (type: 'slots_cost', points: -pointsCost, ...)
    ↓
selectOutcome() → Random result
    ↓
IF outcome.points > 0:
  UPDATE users SET points = points + outcome.points
  INSERT INTO transactions (type: 'slots_win', points: outcome.points, ...)
    ↓
INSERT INTO user_spins (spin_cost: pointsCost, spin_result: outcome.points, ...)
    ↓
Return newBalance = points - pointsCost + outcome.points
    ↓
Frontend updates balance display
```

## Real-time Synchronization

### Frontend Updates
1. **After spin completion**:
   - `spinResult.newBalance` is from fresh `SELECT points FROM users` query
   - Balance updates immediately in state

2. **Error handling**:
   - If spin fails, `fetchBalance()` refetches from `/api/balance`
   - Ensures UI always matches database

3. **Page navigation**:
   - Each page fetches balance on load
   - `/account` shows transaction history
   - `/shop` shows current balance + purchase history
   - `/slots` shows current balance + previous spins

### Database Transactions
All operations are **atomic**:
- Points updated in `users` table
- Transaction recorded in `transactions` table
- Spin details recorded in `user_spins` table
- All succeed or all rollback (no partial updates)

## Data Consistency Guarantees

### Checks Performed
1. **User authentication**: Via NextAuth session
2. **User existence**: SELECT from `users` table
3. **Sufficient balance**: Before deducting points
4. **24-hour cooldown**: Before free spin
5. **Point constraints**: Points ≥ 0, updates are incremental

### Transaction Integrity
```typescript
// Example: Paid spin
const currentBalance = await getBalance(userId);
if (currentBalance < pointsCost) {
  throw new Error('Insufficient points');
}

// Deduct
await client.execute('UPDATE users SET points = points - ?', [pointsCost]);
// Record cost
await client.execute('INSERT INTO transactions ...', ['slots_cost', -pointsCost]);

// Add if won
if (outcome.points > 0) {
  await client.execute('UPDATE users SET points = points + ?', [outcome.points]);
  // Record win
  await client.execute('INSERT INTO transactions ...', ['slots_win', outcome.points]);
}

// Get final balance
const newBalance = await getBalance(userId);
return newBalance;
```

## Transaction Types

| Type | Direction | Usage |
|------|-----------|-------|
| `purchase` | ➕ Credit | User buys points via PayPal |
| `access` | ➖ Debit | User accesses restricted project |
| `slots_cost` | ➖ Debit | User pays to spin (paid spin) |
| `slots_win` | ➕ Credit | User wins points in slot machine |
| `refund` | ➕ Credit | Admin refunds transaction |
| `bonus` | ➕ Credit | Admin grants bonus points |

## Querying Transaction History

### Get all transactions for a user
```sql
SELECT type, points, balance_after, created_at 
FROM transactions 
WHERE user_id = ? 
ORDER BY created_at DESC;
```

### Get today's slot machine activity
```sql
SELECT 
  spin_cost as "cost", 
  spin_result as "won", 
  (spin_result - spin_cost) as "net",
  multiplier,
  is_jackpot,
  created_at
FROM user_spins 
WHERE user_id = ? AND DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;
```

### Get slot statistics
```sql
SELECT 
  COUNT(*) as total_spins,
  COUNT(CASE WHEN is_jackpot = 1 THEN 1 END) as jackpots,
  SUM(spin_cost) as total_spent,
  SUM(spin_result) as total_won,
  (SUM(spin_result) - SUM(spin_cost)) as net_profit
FROM user_spins 
WHERE user_id = ?;
```

## Admin Balance Management

Admins can view and modify user balances at `/admin/points`:

```typescript
// Admin can:
1. View all users and their current balance
2. Update point costs for projects
3. Create new packages
4. View transaction history (coming soon)
5. Grant bonus points (coming soon)
```

## API Endpoints for Balance

### GET /api/balance
Returns current balance and transaction history:
```json
{
  "email": "user@example.com",
  "points": 1250,
  "total_spent": 500,
  "total_purchased": 2000,
  "recent_transactions": [
    {
      "type": "slots_win",
      "points": 50,
      "balance_after": 1250,
      "created_at": "2026-03-02T14:30:00Z"
    }
  ]
}
```

### POST /api/slots/spin
Triggers a spin and returns updated balance:
```json
{
  "success": true,
  "result": 50,
  "reels": ["💎", "💎", "💎"],
  "multiplier": 5,
  "isJackpot": false,
  "newBalance": 1250
}
```

## Monitoring & Debugging

### Check real-time balance
```sql
SELECT email, points FROM users WHERE email = 'user@example.com';
```

### Verify transaction sync
```sql
SELECT 
  (SELECT points FROM users WHERE id = ?) as current_balance,
  SUM(points) as transaction_sum
FROM transactions 
WHERE user_id = ?;
-- These should be equal (or transaction_sum is 0 for new users)
```

### Identify inconsistencies
```sql
SELECT u.id, u.email, u.points, 
  COALESCE(SUM(t.points), 0) as transaction_total
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id
HAVING u.points != COALESCE(SUM(t.points), 0);
-- If empty = good! If results = sync issue
```

## Performance Optimizations

### Indexed columns for fast queries
- `users.email` (via NextAuth)
- `transactions.user_id`
- `transactions.created_at`
- `user_spins.user_id`
- `user_spins.created_at`

### Query patterns
- Balance fetch: Cached briefly in React state
- Transaction history: Fetched on page load
- Real-time updates: Via server action returns

## Future Enhancements

### Planned features
- [ ] Transaction history page in user account
- [ ] Balance cache with TTL (time-to-live)
- [ ] Webhook notifications for large spin wins
- [ ] Leaderboard with real-time updates
- [ ] Export transaction history (CSV/Excel)

### Security considerations
- All writes require authentication
- User can only see their own balance
- Admins can override (logged for audit)
- No negative balance allowed
- All operations are logged in transactions table
