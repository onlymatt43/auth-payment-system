import { test, expect } from '@playwright/test';

test.describe('Email-first login', () => {
  test('requests a code and reveals verification step', async ({ page }) => {
    await page.route('**/api/auth/email/request-code', async (route) => {
      const request = route.request();
      const payload = typeof request.postDataJSON === 'function' ? request.postDataJSON() : {};
      expect(payload.email).toBe('test@example.com');

      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/login');

    const emailInput = page.getByTestId('login-email-input');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('test@example.com');

    await page.getByTestId('login-request-code').click();
    await expect(page.getByTestId('login-code-input')).toBeVisible();
  });

  test('still exposes Google as secondary option when configured', async ({ page }) => {
    await page.goto('/login');
    const googleButton = page.getByTestId('login-google');
    if (await googleButton.count()) {
      await expect(googleButton.first()).toBeVisible();
    }
  });
});
