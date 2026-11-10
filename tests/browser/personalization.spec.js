import { test, expect } from "@playwright/test";

test("profil sa zbiera aj bez personalizácie a prepínač riadi ďalší výber", async ({
  page,
}) => {
  await page.goto("/#nastavenia");
  await expect(
    page.locator('[data-setting="personalization"][data-value="off"]'),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator(".settings-back").click();
  await page.locator('[data-module="degree"]').click();
  await page.locator("#answer").fill("999");
  await page.locator("#check").click();
  let saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("adm-v1")),
  );
  expect(saved.personalization).toBe(false);
  expect(saved.attempts).toMatchObject([{ moduleId: "degree", errors: 1 }]);
  await page.locator("#dismiss-feedback").click();
  await page.locator("#new").click();
  await expect(page.locator("h1")).toHaveText("Stupne vrcholov");

  await page.locator('.settings-link[href="#nastavenia"]').click();
  await page
    .locator('[data-setting="personalization"][data-value="on"]')
    .click();
  await page.reload();
  await expect(
    page.locator('[data-setting="personalization"][data-value="on"]'),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator(".settings-back").click();
  await page.locator('[data-module="degree"]').click();
  await expect(page.locator("h1")).toHaveText("Stupne vrcholov");
  const vertex = await page.locator(".vertex.current text").textContent();
  const notation = await page.locator(".notation p").nth(1).textContent();
  const degree = [...notation.matchAll(/([A-Z])[–→]([A-Z])/g)].reduce(
    (sum, edge) =>
      sum + Number(edge[1] === vertex) + Number(edge[2] === vertex),
    0,
  );
  await page.locator("#answer").fill(String(degree));
  // Control the next selection only; graph generation retains normal randomness.
  await page.evaluate(() => {
    const original = Math.random;
    Math.random = () => {
      Math.random = original;
      return 0;
    };
  });
  await page.locator("#check").click();
  await expect(page.locator("h1")).toHaveText("Susedia a počty", {
    timeout: 4000,
  });
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem("adm-v1")));
  expect(saved.attempts).toHaveLength(2);
  expect(saved.attempts[0].errors).toBe(1);
  expect(saved.attempts[1].solved).toBe(true);

  await page.locator('.settings-link[href="#nastavenia"]').click();
  await page
    .locator('[data-setting="personalization"][data-value="off"]')
    .click();
  await page.locator(".settings-back").click();
  await page.locator('[data-module="degree"]').click();
  await page.locator("#new").click();
  await expect(page.locator("h1")).toHaveText("Stupne vrcholov");
  await page.locator("#answer").fill("999");
  await page.locator("#check").click();
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem("adm-v1")));
  expect(saved.personalization).toBe(false);
  expect(saved.attempts).toHaveLength(3);
});
