## OnlyPoint$ – End-to-End Test Plan

This plan verifies all critical flows for the points + PayPal + slots + admin system.

It is designed to be:

- **Comprehensive**: covers auth, payments, points, slots, admin, project-links, rate limiting, and security.
- **Environment-aware**: works for both **staging** and **production** (with `PAYPAL_MODE` set appropriately).
- **Repeatable**: you can run a **short smoke subset before every deploy**, and a full plan before big releases.

---

## 0. Quick Smoke Test (Pre-Deploy)

Run these on **staging** before promoting to production:

- **Auth**
  - [ ] Log in via **email code**.
  - [ ] Log in via **Google**.
- **Shop & PayPal**
  - [ ] On `/shop`, see packages and login reminder when logged out.
  - [ ] Logged in, start a PayPal purchase and complete it (sandbox).
  - [ ] After redirect back, balance increases and `/account` shows a new transaction.
- **Slots**
  - [ ] Visit `/slots`, run **1 free spin**; second free spin is blocked within 24h.
  - [ ] Run **paid spins** until spins per hour limit is reached (5/hour) and see a clear “too many spins” error.
- **Admin**
  - [ ] As admin, access `/admin/points`, change `$ per point` slightly, and see the new value reflected.
- **Project-links**
  - [ ] From `project-links` (staging), successfully call the points API to **check** and **spend** points using `API_SECRET_KEY`.

If any of these fail, **do not promote** the deployment until fixed.

---

## 1. Preconditions & Environment Sanity

Before running the full plan:

- **Environment variables (Vercel → Settings → Environment Variables)**
  - **Auth / NextAuth**
    - [ ] `NEXTAUTH_URL` points to the correct base URL (e.g. `https://points.onlymatt.ca`).
    - [ ] `NEXTAUTH_SECRET` is a strong random string (64 hex chars recommended).
    - [ ] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` are set and match Google Console.
  - **PayPal**
    - [ ] `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` are set.
    - [ ] `PAYPAL_MODE` is `sandbox` in staging, `live` in production.
  - **Turso**
    - [ ] `TURSO_DATABASE_URL` points to the correct DB (shared with project-links).
    - [ ] `TURSO_AUTH_TOKEN` has required permissions.
  - **Cross-project API**
    - [ ] `API_SECRET_KEY` is a strong secret shared with `project-links`.
  - **Upstash (rate limiting)**
    - [ ] `UPSTASH_REDIS_REST_URL` configured.
    - [ ] `UPSTASH_REDIS_REST_TOKEN` configured.

- **Database migrations**
  - [ ] Core tables exist and have expected columns:
    - `users`, `users_points`, `transactions`, `point_packages`, `point_config`, `project_costs`.
    - Slots-related: `user_spins`, `daily_free_spins`.
    - Email login: `email_login_codes`.

- **Admin user**
  - [ ] At least one `users` row has `role = 'admin'` and email you control.

---

## 2. Authentication & Sessions

### 2.1 Email Login Flow

**Goal**: Ensure email login works and is rate-limited correctly.

**Steps – happy path**

1. Go to `/login`.
2. In the email field, enter `user+test@example.com`.
3. Click the button to receive a login code.
4. Retrieve the 6-digit code from the mailbox (or from logs in a dev environment).
5. Enter the code and submit.

**Expected**

- The UI shows a “code sent” success message and a 6-digit input.
- Submitting the **correct** code:
  - Creates/ensures a user row in `users` with that email.
  - Establishes a NextAuth session.
  - Marks the `email_login_codes` row as `used=1`.

**Steps – invalid/expired code**

1. Repeat steps 1–3 above.
2. Enter a random or old code.

**Expected**

- UI shows “Code invalide ou expiré”.
- No new user row is created.
- No session is established.

**Rate limiting checks**

- **Per-email limit**
  - Call `/api/auth/email/request-code` (via UI or REST client) with the **same email** 3 times in < 15 minutes.
  - 4th attempt in that window should return HTTP 429 with a message similar to:
    - “Trop de demandes de code. Réessaie plus tard.”

- **Per-IP limit**
  - From the same IP, request codes for **10 different emails** within 1 hour.
  - The 11th attempt should return HTTP 429 with a message similar to:
    - “Trop de tentatives depuis cette adresse IP. Réessaie plus tard.”

---

### 2.2 Google OAuth Login

**Goal**: Ensure Google login works and DB user provisioning is correct.

**Steps – new user**

1. Go to `/login`.
2. Click “Continuer avec Google”.
3. Use a Google account (e.g. `new.user@gmail.com`) that does **not** exist in `users`.

**Expected**

- User is redirected to Google, then back to the app.
- `users` gets a new row:
  - `email = new.user@gmail.com`.
  - `role = 'user'` by default.
- A session is active; UI shows the user as logged in on `/shop`.

**Steps – existing user**

1. Log out.
2. Log in again using the same Google email.

**Expected**

- No duplicate rows in `users`.
- Session reuses the existing user ID.

---

## 3. Shop & PayPal Purchase Flow

### 3.1 Anonymous View

**Goal**: Ensure logged-out users see the right CTAs and cannot purchase.

**Steps**

1. Visit `/shop` **logged out**.

**Expected**

- A reminder banner encourages the user to log in.
- Login button (`data-testid="shop-login-button"`) is visible.
- Package cards are shown (assuming DB has active `point_packages`).
- “Buy with PayPal” buttons are:
  - Visible but **disabled**, or
  - Show “login to buy” behavior (as implemented).

---

### 3.2 Start Purchase (Logged In)

**Goal**: Ensure creating a PayPal order works.

**Steps**

1. Log in as a normal user.
2. Visit `/shop`.
3. Choose a package (e.g. “Starter Pack”) and click its “buy with PayPal” button.

**Expected**

- Browser sends POST to `/api/paypal/create-order`:
  - Body: `{ "package_id": <id> }`.
- Response:
  - `success: true`.
  - `order_id` is non-empty.
  - `approval_url` is a valid PayPal URL.
- Browser navigates to `approval_url` (PayPal checkout page).

---

### 3.3 Complete PayPal Payment & Credit Points

**Use sandbox in staging, real PayPal in production with a small test package.**

**Steps**

1. On PayPal (sandbox or live), approve the payment with a buyer account.
2. After approval, PayPal redirects back to `/api/paypal/capture?token=...`.

**Expected**

- Server calls PayPal capture API and receives a `COMPLETED` payment.
- Capture handler:
  - Parses `custom_id` JSON from the PayPal response.
  - Verifies:
    - `email` in `custom_id` matches `session.user.email`.
    - `points` in `custom_id` equals `point_packages.points` in DB.
    - Captured `amount` equals `price_usd` (± \$0.01).
  - On success:
    - Calls `creditPoints(email, points, 'purchase', { ...metadata })`.
    - Redirects to `/shop/success?points=<points>&balance=<new_balance>`.
- DB state:
  - `users_points.balance` increased by the `points` amount.
  - `transactions` includes a new row for this purchase with correct amounts and metadata.

---

## 4. Points Accounting & Account Page

### 4.1 Balance Initialization

**Goal**: Ensure a first-time buyer gets a balance row created automatically.**

**Steps**

1. Create a brand new user via email or Google.
2. After login, call `/api/balance` (via `/shop` UI).

**Expected**

- Backend may internally call `/api/init-user` once to create a `users_points` row.
- Response:
  - `balance = 0`.
  - `total_earned = 0`.
  - `total_spent = 0`.
  - No errors.

---

### 4.2 Account Page & History

**Steps**

1. For a user with at least one purchase and one slot spin, visit `/account`.

**Expected**

- Balance equals `users_points.balance`.
- Transactions include:
  - A PayPal purchase entry.
  - Slots-related entries (`slots_win` / `slots_cost`) and/or `spend` entries from project-links.
- Transactions are sorted newest first.

---

## 5. Slots (Free & Paid, Rate Limiting)

### 5.1 Free Spin

**Steps – first free spin**

1. Log in as a user.
2. Go to `/slots`.
3. Trigger the **free spin**.

**Expected**

- Success response:
  - `success: true`.
  - `result` is one of the configured outcomes.
  - `reels` is an array of emoji.
  - `newBalance` reflects any awarded points.
- DB:
  - `daily_free_spins` has a row for this user with `last_free_spin` set.
  - `user_spins` has a new row with `spin_cost = 0`.
  - `transactions` may have a `slots_win` row if points were won.

**Steps – second free spin (before 24h)**

1. Attempt another free spin immediately.

**Expected**

- Response:
  - `success: false`.
  - `error: 'Daily free spin already used'` (or equivalent).
- No additional `daily_free_spins` row is created.

---

### 5.2 Paid Spins

**Steps**

1. Ensure user has a positive balance (e.g. 100 points).
2. On `/slots`, choose a **paid spin** option (10, 25, or 50 points).
3. Trigger spin.

**Expected**

- If balance is sufficient:
  - `deductPoints` reduces `users_points.balance` by the selected cost.
  - `user_spins` row has `spin_cost` equal to that cost.
  - `transactions` includes:
    - A `slots_cost` entry with negative amount (the cost).
    - Optionally a `slots_win` entry if points are won.
  - UI shows updated balance.

- If balance is **insufficient**:
  - Response includes `error: 'Insufficient points'`.
  - No `user_spins` or `transactions` entries are created for that failed attempt.

---

### 5.3 Spin Rate Limiting (5 per Hour)

**Steps**

1. On `/slots`, rapidly trigger spins (mix of free/paid) until you hit 5 spins total within one hour.
2. Attempt a 6th spin.

**Expected**

- For spins 1–5:
  - Requests succeed (assuming sufficient points for paid spins).
- On spin 6:
  - Response:
    - `success: false`.
    - `rateLimited: true`.
    - `error: 'Too many spins. Maximum 5 spins per hour. Try again later.'`.

Note: With Upstash configured, the limiter is **centralized across instances**; without Upstash, the same logic applies per process (sufficient for dev/local).

---

## 6. Admin Flows

### 6.1 Access Control

**Non-admin user**

1. Log in as a user with `role = 'user'`.
2. Visit `/admin/points`.

**Expected**

- UI shows an “ACCÈS REFUSÉ” style page.
- No calls to `/api/admin/config`, `/api/admin/packages`, or `/api/admin/projects` succeed for this user.

**Admin user**

1. Log in as the admin Google account (`role = 'admin'` in `users`).
2. Visit `/admin/points`.

**Expected**

- Admin UI loads:
  - `/api/admin/config` returns current `point_config`.
  - `/api/admin/packages` lists available packages.
  - `/api/admin/projects` lists project costs.
- No client-side admin password or header is used—only NextAuth role.

---

### 6.2 Update Global Config

**Steps**

1. On `/admin/points`, modify:
   - `$ per point` (slight change, e.g. 0.10 → 0.11).
   - `minutes per point` (e.g. 6 → 7).
2. Click “METTRE À JOUR”.

**Expected**

- PUT `/api/admin/config` validates the values and updates `point_config`.
- Response returns updated config.
- UI:
  - Shows the new values in the “Actuel” display.
  - Project durations (points × minutes) recalculate accordingly.

---

### 6.3 Manage Packages

**Steps**

1. In the PACKAGES section of `/admin/points`, create a **test package**:
   - Name: “Test Pack”.
   - Points: 1.
   - Price USD: 0.01 (or other tiny test value).
2. Save, then visit `/shop`.

**Expected**

- `/shop` lists the new “Test Pack” with 1 point and \$0.01 price.
- Using the PayPal flow on this package:
  - Redirects to PayPal with that price.
  - Returns to `/shop/success` and credits exactly 1 point.

---

## 7. Project-links Integration

Assuming `project-links` is configured with:

- `AUTH_SYSTEM_URL = https://points.onlymatt.ca`
- `AUTH_API_KEY = <same as API_SECRET_KEY>`

### 7.1 Check Points for a Project

**Steps**

1. From `project-links` **backend** (or REST client with the API key), call:
   - `GET /api/points/spend?email=<user_email>&project_slug=<slug>` **(or the equivalent check endpoint as implemented)** with header:
     - `x-api-key: <API_SECRET_KEY>`
2. Test two cases:
   - User has enough points.
   - User has too few points.

**Expected**

- Enough points:
  - Response shows:
    - `has_enough: true`.
    - `required`, `available`, `shortfall = 0`.
- Not enough points:
  - Response shows:
    - `has_enough: false`.
    - Correct `shortfall` (`required - available`).

---

### 7.2 Spend Points and Open a Session

**Steps**

1. Ensure the user has enough points to access the project.
2. From `project-links` backend, POST:

```json
{
  "email": "user@example.com",
  "project_slug": "only-surrr"
}
```

with header `x-api-key: <API_SECRET_KEY>` to `/api/points/spend`.

**Expected**

- On success:
  - `success: true`.
  - `points_spent` equal to `project_costs.points_required`.
  - `balance_remaining` equals prior balance - `points_spent`.
  - `session.duration_minutes` and `session.expires_at` computed using `point_config.point_minutes_value`.
- On insufficient points:
  - HTTP status 402.
  - JSON contains `{ "error": "Insufficient points", "required", "available" }`.

---

## 8. Rate Limiting & Abuse Resistance

Most of this is covered in previous sections; this section summarizes the **abuse cases**:

- **Email code endpoint** `/api/auth/email/request-code`:
  - Per-email: max 3 codes / 15 minutes.
  - Per-IP: max 10 requests / hour.
- **Slots spins**:
  - Max 5 spins per email / hour (Upstash-backed if configured, in-memory fallback otherwise).
  - 1 free spin / 24 hours (server-enforced with `daily_free_spins`).

Verify that:

- Over-limit responses return HTTP 429 (or clear error JSON) and do **not** modify balances or DB state.
- UI shows a clear human-readable message for the user.

---

## 9. Security Headers, HTTPS, and CORS

### 9.1 HTTPS & HSTS

**Steps**

1. Try `http://points.onlymatt.ca` (if HTTP is reachable).
2. In browser devtools, inspect response headers for a normal page (`/` or `/shop`).

**Expected**

- All traffic is redirected or forced to HTTPS.
- Response headers include:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`

---

### 9.2 CORS Behavior

**Steps**

1. From another origin (e.g. small test app or a tool like Postman with browser-like checks), send:
   - A **simple GET** to `/api/packages` without credentials.
2. Attempt a **credentialed** cross-origin fetch (e.g. `fetch` with `credentials: 'include'`) from another origin.

**Expected**

- Simple GET:
  - Succeeds; browser sees `Access-Control-Allow-Origin: *`.
- Credentialed request:
  - Browser refuses to send cookies with `*` origin (standards-compliant).
  - Your app does not depend on cross-site credentialed XHR, so this is acceptable and safe.

---

## 10. Observability & Rollback

### 10.1 Logs & Sanitization

**Steps**

1. Trigger a failing PayPal capture (e.g. cancel payment on PayPal).
2. Trigger a slots error (e.g. over spin rate limit).

**Expected**

- Vercel logs show error messages that:
  - Use the `createSafeLog` helper where applicable.
  - Do **not** contain raw email addresses, tokens, or secrets.
  - Still provide enough detail (“Capture failed”, “Spin failed”) to debug.

---

### 10.2 Rollback Flow

**Steps**

1. Deploy a small non-critical change.
2. In Vercel, go to the project → Deployments.
3. Choose the previous deployment → “Promote to Production”.

**Expected**

- App switches back to the previous version without errors.
- DB state is preserved (balances, transactions, spins).

---

## 11. When to Run This Plan

- **Before first production launch**:
  - Run the **full plan** on staging, then a **smoke subset** after promoting to production.
- **Before major feature releases** (PayPal changes, slots changes, points logic changes):
  - Run sections 2–7.
- **Before each regular deploy**:
  - Run the **Quick Smoke Test** from section 0.

If any critical step fails (payments not crediting correctly, spins mis-accounting points, admin bypass, etc.), treat it as a **no-go** for production until resolved.

