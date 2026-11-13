import { test, expect } from "@playwright/test";

async function snapshot(page) {
  return {
    question: await page.locator(".task-card h2").textContent(),
    notation: await page.locator(".notation p").allTextContents(),
    sequence: await page.locator(".answer-card .sequence").allTextContents(),
    focus: await page.locator(".vertex.current text").allTextContents(),
  };
}

test("odkazy obnovujú rovnaké zadanie aj v novom prehliadači", async ({
  page,
  browser,
}) => {
  for (const path of [
    "/cv8/susedia-a-pocty/fiit/12345678",
    "/cv8/stupne-vrcholov/hard/87654321",
    "/cv8/cena-prechadzky/hard/12345678",
    "/cv8/sled-tah-cesta-okruh/hard/abcdef12",
    "/cv9/eulerizacia/hard/12345678",
    "/cv9/kompletne-grafy-a-brute-force/hard/12345678",
    "/cv9/nearest-neighbor/fiit/12345678",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(path + "$"));
    const before = await snapshot(page);
    await page.reload();
    expect(await snapshot(page)).toEqual(before);
    const context = await browser.newContext();
    const other = await context.newPage();
    await other.goto("http://127.0.0.1:4173" + path);
    expect(await snapshot(other)).toEqual(before);
    await context.close();
  }
});

test("pamätá posledný príklad, mení adresu a podporuje späť aj dopredu", async ({
  page,
}) => {
  await page.goto("/cv8/stupne-vrcholov/hard/12345678");
  const original = await snapshot(page);
  await page.locator("#new").click();
  await expect(page).not.toHaveURL(/12345678$/);
  const nextPath = new URL(page.url()).pathname;
  const next = await snapshot(page);
  await page.goBack();
  await expect(page).toHaveURL(/\/cv8\/stupne-vrcholov\/hard\/12345678$/);
  expect(await snapshot(page)).toEqual(original);
  await page.goForward();
  await expect(page).toHaveURL(new RegExp(nextPath + "$"));
  expect(await snapshot(page)).toEqual(next);
  await page.goto("/");
  await expect(page).toHaveURL(new RegExp(nextPath + "$"));
  expect(await snapshot(page)).toEqual(next);
  await page.locator('[data-level="easy"]').click();
  await expect(page).toHaveURL(/\/stupne-vrcholov\/easy\/[0-9a-f]{8}$/);
  await page.locator('.settings-link[href="#nastavenia"]').click();
  await page.locator('[data-setting="level"][data-value="fiit"]').click();
  await expect(page).toHaveURL(/\/fiit\/[0-9a-f]{8}#nastavenia$/);
  await page.locator(".settings-back").click();
  await page.reload();
  await expect(page.locator('[data-level="fiit"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

for (const width of [390, 1366]) {
  test(`Markdown ťahák má čitateľné sekcie a dostupné zatvorenie ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/cv9/eulerizacia/hard/12345678");
    await page.locator(".theory summary").click();
    await expect(page.locator(".theory-content h3").first()).toHaveText(
      "Ako postupovať",
    );
    await expect(page.locator(".theory-content ol")).toBeVisible();
    await expect(page.locator(".theory-content")).not.toContainText("###");
    await page
      .locator(".theory-content")
      .evaluate((e) => (e.scrollTop = e.scrollHeight));
    await expect(
      page.getByRole("button", { name: "Zavrieť ťahák" }),
    ).toBeInViewport();
    await page.getByRole("button", { name: "Zavrieť ťahák" }).click();
    await expect(page.locator(".theory")).not.toHaveAttribute("open");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  });
}
