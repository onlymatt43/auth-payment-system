import { test, expect } from '@playwright/test';

const mockPackages = [
  { id: 1, name: 'Starter Pack', points: 100, price_usd: 9.99, active: true },
  { id: 2, name: 'High Roller', points: 750, price_usd: 59.99, active: true },
];

test.describe('Shop page (signed out)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/packages', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ packages: mockPackages }),
      });
    });
  });

  test('reminds anonymous visitors to sign in before buying', async ({ page }) => {
    await page.goto('/shop');

    await expect(page.getByTestId('shop-login-reminder')).toBeVisible();
    await expect(page.getByTestId('shop-login-button')).toBeVisible();

    const disabledButton = page.getByTestId('package-cta-1');
    await expect(disabledButton).toBeDisabled();
  });

  test('CTA button routes unsigned visitors to /login', async ({ page }) => {
    await page.goto('/shop');

    await page.getByTestId('cta-get-onlypoints').click();
    await page.waitForURL(/\/login$/);
    await expect(page).toHaveURL(/\/login$/);
  });
});
