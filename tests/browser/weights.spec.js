import { test, expect } from "@playwright/test";
for (const width of [390, 1366]) {
  test(`ceny hrán sa neprekrývajú pri šírke ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => {
      let seed = 12345;
      Math.random = () => {
        seed = (1664525 * seed + 1013904223) >>> 0;
        return seed / 4294967296;
      };
    });
    await page.goto("/");
    for (const id of ["cost", "eulerize", "nn9"]) {
      if (width < 880) await page.locator("#menu").click();
      await page.locator(`[data-module="${id}"]`).click();
      for (const level of ["hard", "fiit"]) {
        await page.locator(`[data-level="${level}"]`).click();
        if (await page.locator(".weight-matrix").count()) {
          await page.locator("#v9-matrix").click();
        }
        const texts = page.locator(".graph-card svg .weight");
        expect(await texts.count()).toBeGreaterThan(0);
        const overlaps = await texts.evaluateAll((nodes) => {
          const boxes = nodes.map((e) => e.getBoundingClientRect());
          return boxes.flatMap((a, i) =>
            boxes
              .slice(i + 1)
              .filter(
                (b) =>
                  a.left < b.right &&
                  a.right > b.left &&
                  a.top < b.bottom &&
                  a.bottom > b.top,
              ),
          );
        });
        expect(overlaps).toHaveLength(0);
        expect(
          await page
            .locator(".edge-weight")
            .evaluateAll((nodes) =>
              nodes.every((e) =>
                e.previousElementSibling.matches(".edge, .edge-weight"),
              ),
            ),
        ).toBeTruthy();
      }
    }
  });
}
