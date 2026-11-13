import { test, expect } from "@playwright/test";

test("Cvičenie 9 zachová štatistiky a pokračuje po zatvorení výsledku eulerizácie", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-module="eulerize"]').click();
  for (let i = 0; i < 6; i++) await page.locator("#hint").click();
  await page.locator("#check").click();
  await expect(page.locator('.feedback[data-complete="true"]')).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("adm-v1")),
  );
  expect(saved.attempts).toMatchObject([
    { moduleId: "eulerize", solved: true, errors: 0 },
  ]);
  expect(saved.attempts[0].hints).toBeGreaterThan(0);
  expect(saved.progress.eulerize).toBe(1);
  await page.locator("#dismiss-feedback").click();
  await expect(page.locator("#check")).toBeEnabled();
  await expect(page.locator('.feedback[data-complete="true"]')).toHaveCount(0);
  await page.locator(".stats-link").click();
  await expect(
    page
      .locator(".stats-row")
      .filter({ has: page.getByText("Eulerizácia", { exact: true }) }),
  ).toContainText("1 príkladov");
});

test("import a personalizácia zahŕňajú moduly Cvičenia 9", async ({ page }) => {
  await page.goto("/#nastavenia");
  await page
    .locator('[data-setting="personalization"][data-value="on"]')
    .click();
  await page.locator("#import-file").setInputFiles({
    name: "cv9.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        version: 1,
        progress: { nn9: 1 },
        attempts: [
          { moduleId: "nn9", level: "easy", errors: 2, hints: 1, solved: true },
        ],
      }),
    ),
  });
  await expect(page.locator("#data-status")).toContainText("Importované: 1");
  await page.reload();
  await expect(
    page.locator('[data-setting="personalization"][data-value="on"]'),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator(".settings-back").click();
  // A draw at the end of the cumulative weights selects the last cv9 module.
  await page.evaluate(() => {
    const original = Math.random;
    Math.random = () => {
      Math.random = original;
      return 0.999999;
    };
  });
  await page.locator("#new").click();
  await expect(page.locator('[data-module="tsp9"]')).toHaveClass(/active/);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("adm-v1")).attempts,
    ),
  ).toMatchObject([{ moduleId: "nn9", errors: 2, hints: 1 }]);
});
