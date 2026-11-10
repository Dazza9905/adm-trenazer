import { test, expect } from "@playwright/test";
for (const width of [390, 1366])
  test(`stav priečinkov prežije prepnutie aj obnovenie (${width})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    const a = page.locator('[data-folder="cv8"]'),
      b = page.locator('[data-folder="cv9"]');
    async function menu() {
      if (width < 880) await page.locator("#menu").click();
    }
    await menu();
    await a.locator("summary").click();
    await expect(a).not.toHaveAttribute("open");
    await expect(b).toHaveAttribute("open");
    await page.locator('[data-module="hamilton"]').click();
    await expect(a).not.toHaveAttribute("open");
    await expect(b).toHaveAttribute("open");
    await menu();
    await b.locator("summary").click();
    if (width < 880)
      await page
        .locator("#close-menu")
        .click({ position: { x: width - 10, y: 100 } });
    await page.locator("#new").click();
    await page.reload();
    await expect(a).not.toHaveAttribute("open");
    await expect(b).not.toHaveAttribute("open");
    await menu();
    await a.locator("summary").click();
    await page.locator('[data-module="degree"]').click();
    await expect(a).toHaveAttribute("open");
    await expect(b).not.toHaveAttribute("open");
    await page.locator(".settings-link").click();
    await page.locator(".settings-back").click();
    await expect(a).toHaveAttribute("open");
    await expect(b).not.toHaveAttribute("open");
    await page.reload();
    await expect(a).toHaveAttribute("open");
    await expect(b).not.toHaveAttribute("open");
  });
