import { test, expect } from "@playwright/test";
for (const width of [320, 390, 1440])
  test(`tréning, nápoveda a história pri šírke ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("Vlastnosti grafov");
    expect((await page.locator("h1").boundingBox()).y).toBeLessThan(200);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.locator('[data-option="simple"]').click();
    await page.locator("#check").click();
    await expect(page.locator(".feedback")).toBeVisible();
    async function choose(id) {
      if (width < 880) await page.locator("#menu").click();
      await page.locator(`[data-module="${id}"]`).click();
    }
    await choose("counts");
    await page.locator("#hint").click();
    await expect(page.locator(".feedback")).toBeVisible();
    await choose("degree");
    await page.locator('[data-key="3"]').click();
    await expect(page.locator("#answer")).toHaveValue("3");
    await page.locator("#check").click();
    await expect(page.locator(".feedback")).toBeVisible();
    await choose("fleury");
    for (let i = 0; i < 30 && !(await page.locator("#next").count()); i++)
      await page.locator("#hint").click();
    await expect(page.locator("#next")).toBeVisible();
    const route = await page.locator(".sequence").innerText();
    await page.locator("#back").click();
    await expect(page.locator("#forward")).toBeEnabled();
    await page.locator("#forward").click();
    await expect(page.locator(".sequence")).toHaveText(route);
    await choose("hierholzer");
    for (let i = 0; i < 35 && !(await page.locator("#next").count()); i++)
      await page.locator("#hint").click();
    await expect(page.locator("#next")).toBeVisible();
    await page.locator('[data-mode="whole"]').click();
    await page.locator("#new").click();
    for (let i = 0; i < 15; i++) await page.locator("#hint").click();
    await page.locator("#check").click();
    await expect(page.locator(".feedback.positive")).toBeVisible();
    await choose("cost");
    await page.locator("#hint").click();
    await expect(page.locator(".feedback")).toBeVisible();
    await choose("walk");
    await page.locator("#check").click();
    await expect(page.locator(".feedback")).toBeVisible();
    await page.locator('[data-level="fiit"]').click();
    await page.locator("#theme").click();
    await page.reload();
    await expect(page.locator("body")).toHaveClass("dark");
    await expect(page.locator('[data-level="fiit"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    expect(errors).toEqual([]);
  });
