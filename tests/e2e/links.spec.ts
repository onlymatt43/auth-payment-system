import { test, expect } from '@playwright/test';

const publicPages = ['/', '/shop', '/login', '/slots', '/account', '/privacy', '/terms', '/how-it-works', '/shop/success'];

test.describe('Internal link health', () => {
  test('core public routes return non-error status', async ({ request }) => {
    for (const path of publicPages) {
      const res = await request.get(path);
      expect(res.status(), `${path} should not return a server/client error`).toBeLessThan(400);
    }
  });

  test('footer links on /shop are all valid', async ({ page, request }) => {
    await page.goto('/shop');

    const hrefs = await page.locator('footer a[href^="/"]').evaluateAll((els) =>
      Array.from(new Set(els.map((el) => el.getAttribute('href')).filter(Boolean)))
    );

    for (const href of hrefs as string[]) {
      const res = await request.get(href);
      expect(res.status(), `Footer link ${href} should not be broken`).toBeLessThan(400);
    }
  });
});
