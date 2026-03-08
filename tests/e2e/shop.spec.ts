import { test, expect } from '@playwright/test';

const mockPackages = [
  { id: 1, name: 'Starter Pack', points: 100, price_usd: 9.99, active: true },
  { id: 2, name: 'High Roller', points: 750, price_usd: 59.99, active: true },
];

test.describe('Shop page', () => {
  test('signed-out users see connect headline and disabled package CTA', async ({ page }) => {
    await page.route('**/api/packages', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ packages: mockPackages }),
      });
    });

    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(null),
      });
    });

    await page.goto('/shop');

    await expect(page.getByTestId('shop-login-headline')).toBeVisible();
    await expect(page.getByTestId('shop-login-headline')).toHaveText(/CONNECT HERE/i);
    await expect(page.getByTestId('package-cta-1')).toBeDisabled();
  });

  test('signed-in users can start checkout', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          user: { email: 'test@example.com' },
          expires: '2099-01-01T00:00:00.000Z',
        }),
      });
    });

    await page.route('**/api/packages', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ packages: mockPackages }),
      });
    });

    await page.route('**/api/balance', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          balance: 25,
          total_earned: 25,
          total_spent: 0,
          recent_transactions: [],
        }),
      });
    });

    await page.route('**/api/paypal/create-order', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          success: true,
          approval_url: '/shop/success?points=100&balance=125',
        }),
      });
    });

    await page.goto('/shop');

    await expect(page.getByText('test@example.com')).toBeVisible();

    const buyButton = page.getByTestId('package-cta-1');
    await expect(buyButton).toBeEnabled();
    await buyButton.click();

    await page.waitForURL(/\/shop\/success\?points=100&balance=125/);
  });
});
