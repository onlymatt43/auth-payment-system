import { test, expect } from '@playwright/test';

const successMessage = 'Code envoyé! Vérifie ta boîte de réception.';

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

    const emailInput = page.getByPlaceholder('email@exemple.com');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('test@example.com');

    await page.getByRole('button', { name: 'Recevoir le code' }).click();

    await expect(page.getByText(successMessage)).toBeVisible();
    await expect(page.getByPlaceholder('123456')).toBeVisible();
  });

  test('still exposes Google as the secondary option', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByText('Option #2')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuer avec Google' })).toBeVisible();
  });
});
