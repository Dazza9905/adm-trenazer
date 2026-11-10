import { test, expect } from "@playwright/test";
for (const [width, height] of [
  [320, 568],
  [390, 844],
  [1366, 768],
  [1440, 900],
])
  test(`pracovná plocha bez posúvania ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.locator("body")).toHaveClass("dark");
    async function fit() {
      expect(
        await page.evaluate(
          () => document.documentElement.scrollHeight <= innerHeight + 1,
        ),
      ).toBeTruthy();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      const box = await page.locator("#hint").boundingBox();
      expect(box.y + box.height).toBeLessThanOrEqual(height + 1);
    }
    async function choose(id) {
      if (width < 880) await page.locator("#menu").click();
      await page.locator(`[data-module="${id}"]`).click();
    }
    for (const id of [
      "types",
      "degree",
      "counts",
      "cost",
      "walk",
      "fleury",
      "hierholzer",
    ]) {
      await choose(id);
      await page.locator('[data-level="fiit"]').click();
      await fit();
      if (id === "hierholzer") {
        for (
          let i = 0;
          i < 20 &&
          !(await page.locator('.feedback[data-complete="true"]').count());
          i++
        ) {
          await page.locator("#hint").click();
          await fit();
          await expect(page.locator("[data-start]")).toHaveCount(9);
          if (!(await page.locator('.feedback[data-complete="true"]').count()))
            await expect(page.locator("[data-start]:disabled")).toHaveCount(0);
        }
      }
    }
    await page.locator('.settings-link[href="#nastavenia"]').click();
    await expect(page.locator("h1")).toHaveText("Nastavenia");
    await page.locator('[data-setting="theme"][data-value="light"]').click();
    await expect(page.locator("body")).toHaveClass("light");
    await page.reload();
    await expect(page.locator("body")).toHaveClass("light");
    await page.locator(".settings-back").click();
    await expect(page.locator(".workspace")).toBeVisible();
  });

test("všetky vrcholy na každej obťažnosti a chyba až po odpovedi", async ({
  page,
}) => {
  await page.goto("/");
  for (const id of ["fleury", "hierholzer"]) {
    await page.locator(`[data-module="${id}"]`).click();
    for (const level of ["easy", "medium", "hard", "fiit"]) {
      await page.locator(`[data-level="${level}"]`).click();
      const count = { easy: 4, medium: 5, hard: 7, fiit: 9 }[level];
      await expect(page.locator("[data-start]")).toHaveCount(count);
      await page.locator('[data-start="A"]').click();
      await page.locator('[data-start="A"]').click();
      await expect(page.locator(".feedback.negative")).toBeVisible();
      await expect(page.locator(".history-controls > span")).toHaveText("1");
      await expect(page.locator("[data-start]:disabled")).toHaveCount(0);
      await expect(page.locator("[data-step]")).toHaveCount(0);
      let advanced = false;
      for (const vertex of ["B", "C", "D", "E", "F", "G", "H", "I"].slice(
        0,
        count - 1,
      )) {
        await page.locator(`[data-start="${vertex}"]`).click();
        if (
          (await page.locator(".history-controls > span").innerText()) === "2"
        ) {
          advanced = true;
          break;
        }
      }
      expect(advanced).toBeTruthy();
      await expect(page.locator("[data-start]")).toHaveCount(count);
    }
  }
});
