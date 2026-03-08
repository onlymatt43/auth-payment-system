import { test, expect } from '@playwright/test';

test.describe('Admin points page', () => {
  test('shows access denied for authenticated non-admin user', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          user: { email: 'user@example.com', role: 'user' },
          expires: '2099-01-01T00:00:00.000Z',
        }),
      });
    });

    await page.goto('/admin/points');
    await expect(page.getByText('ACCÈS REFUSÉ')).toBeVisible();
  });

  test('loads admin data for admin user', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          user: { email: 'admin@example.com', role: 'admin' },
          expires: '2099-01-01T00:00:00.000Z',
        }),
      });
    });

    await page.route('**/api/admin/config', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ point_dollar_value: 0.1, point_minutes_value: 6 }),
        });
        return;
      }
      await route.continue();
    });

    await page.route('**/api/admin/packages', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            packages: [{ id: 1, name: 'Starter Pack', points: 50, price_usd: 5, paypal_plan_id: null, active: true }],
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.route('**/api/admin/projects', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          projects: [{ id: 1, project_slug: 'p1', project_name: 'Project 1', points_required: 25, active: true }],
        }),
      });
    });

    await page.goto('/admin/points');

    await expect(page.getByText('ADMINISTRATION')).toBeVisible();
    await expect(page.getByText('Starter Pack')).toBeVisible();
    await expect(page.getByText('Project 1')).toBeVisible();
  });
});
