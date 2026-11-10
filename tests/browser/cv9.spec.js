import { test, expect } from "@playwright/test";
for (const [width, height] of [
  [390, 844],
  [1366, 768],
])
  test(`Cvičenie 9: moduly a algoritmy ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const id of [
      "eulerize",
      "semi9",
      "hamilton",
      "conditions9",
      "complete9",
      "nn9",
      "rnn9",
      "cheap9",
      "insert9",
      "tsp9",
    ]) {
      if (width < 880) await page.locator("#menu").click();
      await page.locator(`[data-module="${id}"]`).click();
      await page.locator('[data-level="medium"]').click();
      await expect(page.locator(".source-link")).toHaveAttribute(
        "href",
        "/Cv09_Blazek_prezentacia.pdf",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollHeight <= innerHeight + 1,
        ),
      ).toBeTruthy();
      if (["nn9", "rnn9", "cheap9", "insert9"].includes(id)) {
        for (let i = 0; i < 40 && !(await page.locator("#next").count()); i++)
          await page.locator("#hint").click();
        await expect(page.locator("#next")).toBeVisible();
      } else if (["eulerize", "semi9"].includes(id)) {
        for (let i = 0; i < 6; i++) await page.locator("#hint").click();
        await page.locator("#check").click();
        await expect(page.locator(".feedback.positive")).toBeVisible();
      } else {
        await page.locator("#hint").click();
        if (id === "hamilton") {
          for (let i = 0; i < 6; i++) await page.locator("#hint").click();
          await page.locator("#check").click();
          await expect(page.locator(".feedback.positive")).toBeVisible();
        }
      }
      if (await page.locator("#dismiss-feedback").isVisible())
        await page.locator("#dismiss-feedback").click();
    }
    expect(errors).toEqual([]);
  });
