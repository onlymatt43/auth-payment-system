import { test, expect } from '@playwright/test';

test.describe('Email-first login', () => {
  test('requests a code and reveals verification step', async ({ page }) => {
    await page.route('**/api/auth/email/request-code', async (route) => {
      const payload = route.request().postDataJSON() as { email?: string };
      expect(payload.email).toBe('test@example.com');

      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ success: true }),
      });
    });

    await page.route('**/api/auth/providers', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          google: { id: 'google', name: 'Google', type: 'oauth', signinUrl: '/api/auth/signin/google' },
          credentials: { id: 'email-code', name: 'Email', type: 'credentials', signinUrl: '/api/auth/callback/credentials' },
        }),
      });
    });

    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('test@example.com');

    await page.getByRole('button', { name: /Continue|Continuer/i }).click();

    await expect(page.getByText(/You will receive a code by email|Tu vas recevoir un code par email/i)).toBeVisible();

    await page.getByRole('button', { name: /Message/i }).click();
    await expect(page.locator('input[type="text"]')).toBeVisible();
  });

  test('keeps Google as secondary option after email step', async ({ page }) => {
    await page.route('**/api/auth/email/request-code', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ success: true }),
      });
    });

    await page.route('**/api/auth/providers', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          google: { id: 'google', name: 'Google', type: 'oauth', signinUrl: '/api/auth/signin/google' },
          credentials: { id: 'email-code', name: 'Email', type: 'credentials', signinUrl: '/api/auth/callback/credentials' },
        }),
      });
    });

    await page.goto('/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.getByRole('button', { name: /Continue|Continuer/i }).click();

    await expect(page.getByRole('button', { name: /Connect with Google|Connecte avec Google/i })).toBeVisible();
  });
});
