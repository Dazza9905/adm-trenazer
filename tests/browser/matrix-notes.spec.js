import { test, expect } from "@playwright/test";

for (const width of [390, 1366]) {
  test(`poznámky v matici prežijú kroky a prepínanie zobrazenia (${width})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/cv9/eulerizacia/hard/12345678");
    const notes = page.locator("[data-matrix-note]");
    await expect(page.locator(".weight-matrix")).not.toContainText("∞");
    // Direct edges keep their numeric weights and have no editable field.
    const directEdges = page
      .locator(".weight-matrix tbody td")
      .filter({ hasText: /^\d+$/ });
    expect(await directEdges.count()).toBeGreaterThan(0);
    await expect(directEdges.locator("input")).toHaveCount(0);
    const key = await notes.first().getAttribute("data-matrix-note");
    const pair = page.locator(`[data-matrix-note="${key}"]`);
    const original = await pair.first().locator("..").textContent();
    expect(original).toBe("");
    await pair.first().fill("7 cez C");
    await expect(pair.nth(1)).toHaveValue("7 cez C");
    await expect(pair.first().locator("..")).toHaveText(original);

    // Selecting an answer vertex rerenders the page without losing notes.
    await page.locator("[data-v9]").first().click();
    await expect(pair.first()).toHaveValue("7 cez C");
    await page.locator("#v9-matrix").click();
    await expect(notes).toHaveCount(0);
    await page.locator("#v9-matrix").click();
    await expect(pair.first()).toHaveValue("7 cez C");
    await pair.nth(1).fill("");
    await expect(pair.first()).toHaveValue("");
    await pair.first().fill("<b>7</b>");
    await page.locator("#v9-matrix").click();
    await page.locator("#v9-matrix").click();
    await expect(pair.first()).toHaveValue("<b>7</b>");
    await expect(page.locator(".weight-matrix b")).toHaveCount(0);
    expect(
      await page
        .locator(".weight-matrix")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBeTruthy();

    await page.locator("#new").click();
    expect(
      await notes.evaluateAll((els) => els.every((el) => el.value === "")),
    ).toBeTruthy();
  });
}
