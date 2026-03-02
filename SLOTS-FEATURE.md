# 🎰 Slot Machine Feature Guide

## Overview

The slot machine is a gamified feature that allows users to spin and earn points. Users get **1 free spin every 24 hours** or can spend points for additional spins.

## Files Created

### Database
- **`scripts/setup-slots-system.sql`** - Database schema with two tables:
  - `user_spins`: Records every spin with results, reels, multiplier, and jackpot status
  - `daily_free_spins`: Tracks free spin eligibility per user

### Backend
- **`lib/slots.ts`** - Server action containing all slot machine logic:
  - `SLOT_OUTCOMES`: Probability distribution for 7 possible outcomes
  - `selectOutcome()`: Probability-weighted random selection
  - `checkDailyFreeSpinEligibility()`: Validates 24-hour cooldown
  - `spinSlots()`: Main server action handling the complete spin flow

### API
- **`app/api/slots/spin/route.ts`** - POST endpoint to call the server action

### Frontend
- **`app/slots/page.tsx`** - Complete slot machine UI with:
  - 3 animated emoji reels
  - Free spin button (24h cooldown)
  - Paid spin buttons (10, 25, 50 points options)
  - Result modal with win/loss display and glow effects
  - Balance display with neon styling

## Probability Distribution

The slot machine uses a carefully balanced probability system:

| Outcome | Probability | Points | Multiplier | Visual |
|---------|-------------|--------|-----------|---------|
| Loss | 40% | 0 | 0x | [🎯 💎 🎪] |
| Small Win | 25% | 5 | 1x | [🍒 🍒 🎪] |
| Small Win | 15% | 10 | 1x | [🍒 🍒 🍒] |
| Medium Win | 10% | 25 | 2.5x | [💎 💎 🎪] |
| Medium Win | 6% | 50 | 5x | [💎 💎 💎] |
| Big Win | 3% | 100 | 10x | [👑 👑 🎪] |
| **JACKPOT** | 1% | 250 | 25x | [👑 👑 👑] |

**Total Win Rate: 60%** (allows for engagement while maintaining challenge)

## Database Migration

The database tables were created by running:
```bash
export $(grep -v '^#' .env.local | xargs) && node scripts/run-migration.js
```

### Tables Created

#### `user_spins`
- Records every spin including cost, result, reels, multiplier, and jackpot flag
- Indexed by user_id and created_at for fast queries
- Foreign key relationship with users table

#### `daily_free_spins`
- Tracks the last free spin timestamp and daily usage count per user
- Ensures maximum of 1 free spin per 24-hour period
- Automatically resets at UTC midnight

## Game Flow

### Free Spin
1. User clicks "SPIN GRATUIT (24h)" button
2. Check if 24 hours have passed since last free spin
3. If eligible: select outcome → award points → record spin
4. If not eligible: show error "Come back in X hours"

### Paid Spin
1. User selects points amount (10, 25, or 50)
2. Verify user has sufficient points
3. Deduct points from balance
4. Select outcome → award points → record spin
5. Update balance display

### Win Display
- Result modal shows:
  - Win/loss status with emoji (✨ for wins, ❌ for errors)
  - Exact points awarded
  - Multiplier if > 1x
  - "JACKPOT" highlight if triggered
  - New balance after spin

## Authentication

- **Unauthenticated users**: Redirected to `/shop` to sign in
- **Authenticated users**: Full access to free and paid spins
- Session verified via NextAuth

## Integration Points

### To link from other pages:
```tsx
import Link from 'next/link';

<Link href="/slots">
  🎰 PLAY SLOTS
</Link>
```

### Direct button import:
```tsx
<button onClick={() => router.push('/slots')} className="btn-neon">
  🎰 PLAY SLOTS
</button>
```

## Environment Variables Required

- `TURSO_DATABASE_URL` - Turso database URL
- `TURSO_AUTH_TOKEN` - Turso authentication token
- `NEXTAUTH_SECRET` - NextAuth session secret
- `NEXTAUTH_URL` - NextAuth base URL (points.onlymatt.ca)

## Future Enhancements

### Email Integration
- Welcome email with first free spin offer for new users
- Daily reminder emails for users with available free spins

### Leaderboard
- Display top spinners by points won
- Weekly/monthly rankings with prizes

### Special Events
- Double point multiplier events
- Exclusive emoji reels during holidays
- Specific time-limited spin challenges

### Animations
- Enhanced reel spinning animations (3D perspective, easing)
- Confetti effect on jackpot wins
- Custom sound effects (toggle in settings)

### Social Features
- Share spin results on pages
- Friend challenges (spin competitions)
- Achievement badges

## Testing

### Local Testing
```bash
npm run dev  # Start development server
# Navigate to http://localhost:3000/slots
```

### Test Scenarios
1. **First-time user**: Free spin should work immediately
2. **24-hour cooldown**: Second free spin attempt should show error
3. **Insufficient points**: Paid spin should fail gracefully
4. **Balance update**: Should reflect immediately after win
5. **Jackpot**: 1/100 chance should trigger special display

### Manual Database Queries
```sql
-- View all spins for a user
SELECT * FROM user_spins WHERE user_id = ? ORDER BY created_at DESC;

-- Check free spin eligibility
SELECT * FROM daily_free_spins WHERE user_id = ?;

-- View today's wins
SELECT SUM(spin_result) as total_points FROM user_spins 
WHERE user_id = ? AND DATE(created_at) = CURRENT_DATE;
```

## Performance Considerations

- Indexed queries on `user_id` and `created_at` for fast lookups
- Probability selection is O(1) with weighted random approach
- Database inserts batch points transactions with spin records
- Frontend uses React state for UI updates (no full page refresh)

## Security Notes

- Server-side validation ensures points can't be negative
- User ID is derived from NextAuth session (can't be spoofed)
- Spin costs are server-side enforced, not client-side
- All database writes use prepared statements to prevent SQL injection
- Daily free spin eligibility verified server-side only

## Styling

The slot machine integrates with the edgy design system:
- **Colors**: Neon yellow, pink, blue accents
- **Effects**: Glass morphism, glowing borders, gradient text
- **Layout**: Responsive (mobile-first approach)
- **Animations**: Bounce effect for spinning reels, pulse on results

## Accessibility

- Semantic HTML structure with proper headings
- Button labels describe actions ("SPIN GRATUIT" vs "SPIN POUR 10 PTS")
- Color not the only indicator of status
- Keyboard navigable (tab through buttons)
