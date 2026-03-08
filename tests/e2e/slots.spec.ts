import { test, expect } from '@playwright/test';

test.describe('Slots page', () => {
  test('shows login prompt when user is not authenticated', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(null),
      });
    });

    await page.goto('/slots');
    await expect(page.getByText(/Login to play|Connecte-toi pour jouer/i)).toBeVisible();
  });

  test('loads balance and redirects to shop if paid spin cost exceeds balance', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          user: { email: 'slots@example.com', role: 'user' },
          expires: '2099-01-01T00:00:00.000Z',
        }),
      });
    });

    await page.route('**/api/balance', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: 'slots@example.com',
          balance: 25,
          total_earned: 25,
          total_spent: 0,
          recent_transactions: [],
        }),
      });
    });

    await page.route('**/api/slots/check-free-spin', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          canSpin: true,
          nextSpinTime: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/slots');

    await expect(page.getByText(/^25$/).first()).toBeVisible();

    await page.getByRole('button', { name: /50\s*pts/i }).click();
    await page.waitForURL(/\/shop\?source=slots/);
    await expect(page).toHaveURL(/\/shop\?source=slots/);
  });
});
