import { test, expect } from "@playwright/test";

test("štatistiky ukladajú chyby, nápovedu a počítajú posledné príklady", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-module="degree"]').click();
  await page.locator("#answer").fill("999");
  await page.locator("#check").click();
  await page.locator("#check").click();
  await page.locator("#hint").click();
  let attempts = await page.evaluate(
    () => JSON.parse(localStorage.getItem("adm-v1")).attempts,
  );
  expect(attempts).toHaveLength(1);
  expect(attempts[0]).toMatchObject({
    moduleId: "degree",
    level: "easy",
    errors: 2,
    hints: 1,
    solved: false,
  });
  await page.locator("#dismiss-feedback").click();
  await page.locator("#new").click();
  await page.locator('[data-module="fleury"]').click();
  for (
    let i = 0;
    i < 30 && !(await page.locator('.feedback[data-complete="true"]').count());
    i++
  ) {
    await page.locator("#hint").click();
  }
  await expect(page.locator('.feedback[data-complete="true"]')).toBeVisible();
  await page.locator(".stats-link").click();
  await expect(page.locator("h1")).toHaveText("Čo už vieš");
  await expect(page.locator(".stats-totals")).toContainText("1 / 2");
  await expect(page.locator(".stats-totals")).toContainText("2chýb");
  await page.locator("#stats-limit").fill("1");
  await page.locator("#stats-limit").press("Tab");
  await expect(page.locator(".stats-totals")).toContainText("1 / 1");
  await expect(page.locator(".stats-totals")).toContainText("0chýb");
  await page.reload();
  await expect(page.locator("h1")).toHaveText("Čo už vieš");
  await expect(page.locator(".stats-totals")).toContainText("1 / 2");
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 700 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await expect(page.locator(".stats-bar")).toHaveCount(11);
  }
});

test("prázdna história a horný ťahák", async ({ page }) => {
  await page.goto("/#statistiky");
  await expect(
    page.getByRole("heading", { name: "Začni tréningom" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Prejsť na tréning →" }).click();
  await expect(page.locator("#theme")).toHaveCount(0);
  await page.locator(".toolbar .theory summary").click();
  await expect(page.locator(".theory p")).toBeVisible();
  await page.getByRole("button", { name: "Zavrieť ťahák" }).click();
  await expect(page.locator(".theory")).not.toHaveAttribute("open");
});

test("import a export dát v nastaveniach", async ({ page }) => {
  await page.goto("/#nastavenia");
  const backup = {
    version: 1,
    progress: { degree: 1 },
    attempts: [
      { moduleId: "degree", level: "hard", errors: 2, hints: 0, solved: true },
    ],
  };
  const upload = async (data) =>
    page.locator("#import-file").setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(data)),
    });
  await upload(backup);
  await expect(page.locator("#data-status")).toContainText("Importované: 1");
  const downloadEvent = page.waitForEvent("download");
  await page.locator("#export-data").click();
  const download = await downloadEvent;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  expect(JSON.parse(Buffer.concat(chunks).toString())).toEqual(backup);
  await upload({ version: 99 });
  await expect(page.locator("#data-status")).toContainText(
    "Import sa nepodaril",
  );
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("adm-v1")).attempts,
    ),
  ).toEqual(backup.attempts);
  await page.goto("/#statistiky");
  await expect(page.locator(".stats-totals")).toContainText("1 / 1");
  await expect(page.locator(".stats-totals")).toContainText("2chýb");
});

test("správny príklad automaticky pokračuje ďalším", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-module="degree"]').click();
  // Degree is the number of edge ends at the highlighted vertex.
  const answer = await page.locator(".vertex.current text").textContent();
  // Read the graph notation to count incident edges, including loops twice.
  const notation = await page.locator(".notation p").nth(1).textContent();
  const edges = [...notation.matchAll(/([A-Z])[–→]([A-Z])/g)];
  const expected = edges.reduce(
    (sum, edge) =>
      sum + Number(edge[1] === answer) + Number(edge[2] === answer),
    0,
  );
  await page.locator("#answer").fill(String(expected));
  await page.locator("#check").click();
  await expect(page.locator('.feedback[data-complete="true"]')).toBeVisible();
  await expect(page.locator("#answer")).toHaveValue("", { timeout: 4000 });
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("adm-v1")).attempts,
    ),
  ).toMatchObject([{ solved: true, errors: 0, hints: 0 }]);
});

test("vlastnosti: vyhodnotená voľba je konečná aj pri chybe", async ({
  page,
}) => {
  await page.goto("/");
  for (const button of await page.locator("[data-option]").all())
    await button.click();
  await page.locator("#check").click();
  await expect(page.locator(".feedback.negative")).toBeVisible();
  await expect(page.locator("#check")).toBeDisabled();
  await expect(page.locator("[data-option]:enabled")).toHaveCount(0);
  await expect(page.locator("#check")).toBeEnabled({ timeout: 6000 });
  const attempts = await page.evaluate(
    () => JSON.parse(localStorage.getItem("adm-v1")).attempts,
  );
  expect(attempts).toHaveLength(1);
  expect(attempts[0]).toMatchObject({ errors: 1, solved: false });
});

test("sledy sa naďalej vyhodnocujú ako výber vlastností prechádzky", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-module="walk"]').click();
  for (const button of await page.locator("[data-option]").all())
    await button.click();
  await page.locator("#check").click();
  // A valid walk must not be checked as an empty, manually entered Euler route.
  await expect(page.locator(".feedback")).not.toContainText("Použil si 0");
  const data = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("adm-v1")),
  );
  expect(data.attempts).toHaveLength(1);
  expect(data.attempts[0].moduleId).toBe("walk");
});

test("testovanie vypne automatické popupy, učenie ich zapne", async ({
  page,
}) => {
  await page.goto("/#nastavenia");
  await page
    .locator('[data-setting="trainingMode"][data-value="testing"]')
    .click();
  await page.locator(".settings-back").click();
  await page.locator('[data-module="degree"]').click();
  await page.locator("#answer").fill("999");
  await page.locator("#check").click();
  await expect(page.locator(".feedback")).toHaveCount(0);
  await expect(page.locator('.task-card [role="status"]')).toHaveText(
    "↳ Nesprávne.",
  );
  await page.locator("#hint").click();
  await expect(page.locator(".feedback")).toBeVisible();
  await expect(page.locator(".feedback p")).toHaveCSS("font-size", "18px");
  await page.locator("#dismiss-feedback").click();
  await page.reload();
  await page.locator('.settings-link[href="#nastavenia"]').click();
  await expect(
    page.locator('[data-setting="trainingMode"][data-value="testing"]'),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .locator('[data-setting="trainingMode"][data-value="learning"]')
    .click();
  await page.locator(".settings-back").click();
  await page.locator('[data-module="degree"]').click();
  await page.locator("#answer").fill("999");
  await page.locator("#check").click();
  await expect(page.locator(".feedback.negative")).toBeVisible();
});

test("obťažnosti sú prekryté v jednom pruhu s ťažšou navrchu", async ({
  page,
}) => {
  const attempts = ["easy", "medium", "hard", "fiit"].flatMap((level, index) =>
    Array.from({ length: 4 }, (_, i) => ({
      moduleId: "degree",
      level,
      solved: true,
      errors: i < 4 - index ? 0 : 1,
      hints: 0,
    })),
  );
  await page.addInitScript(
    (attempts) => localStorage.setItem("adm-v1", JSON.stringify({ attempts })),
    attempts,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#statistiky");
  const row = page
    .locator(".stats-row")
    .filter({ has: page.getByText("Stupne vrcholov", { exact: true }) });
  const bar = row.locator(".stats-bar-layered");
  await bar.scrollIntoViewIfNeeded();
  await expect(bar.locator("span")).toHaveCount(4);
  for (const [level, width] of [
    ["easy", 100],
    ["medium", 75],
    ["hard", 50],
    ["fiit", 25],
  ]) {
    await expect(bar.locator(`[data-stat-level="${level}"]`)).toHaveAttribute(
      "style",
      new RegExp(`width:${width}%`),
    );
  }
  expect(
    await bar.evaluate((e) => {
      const rect = e.getBoundingClientRect();
      return [0.125, 0.375, 0.625, 0.875].map(
        (part) =>
          document.elementFromPoint(
            rect.x + rect.width * part,
            rect.y + rect.height / 2,
          ).dataset.statLevel,
      );
    }),
  ).toEqual(["fiit", "hard", "medium", "easy"]);
});
