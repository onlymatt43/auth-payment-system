import { test, expect } from '@playwright/test';

test.describe('Account page', () => {
  test('redirects unauthenticated users to /shop', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(null),
      });
    });

    await page.goto('/account');
    await page.waitForURL(/\/shop$/);
    await expect(page).toHaveURL(/\/shop$/);
  });

  test('renders account stats and history for authenticated user', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          user: { email: 'test@example.com', role: 'user' },
          expires: '2099-01-01T00:00:00.000Z',
        }),
      });
    });

    await page.route('**/api/account', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          balance: 120,
          total_spent: 35,
          total_earned: 155,
          created_at: '2026-03-08T00:00:00.000Z',
          updated_at: '2026-03-08T01:00:00.000Z',
          transactions: [
            {
              id: 1,
              type: 'purchase',
              amount: 50,
              balance_after: 120,
              created_at: '2026-03-08T00:30:00.000Z',
            },
          ],
        }),
      });
    });

    await page.goto('/account');

    await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();
    await expect(page.getByText(/^120$/).first()).toBeVisible();
    await expect(page.getByText('Recent Transactions')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'purchase' })).toBeVisible();
  });
});
