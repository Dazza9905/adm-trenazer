import { test } from "node:test";
import assert from "node:assert/strict";
import { placeWeightLabels } from "../src/graph-layout.js";

function fixture(pairs) {
  const vertices = Object.fromEntries(
    "ABCDEF".split("").map((v, i) => [
      v,
      {
        x: 240 + 165 * Math.cos((2 * Math.PI * i) / 6 - Math.PI / 2),
        y: 215 + 155 * Math.sin((2 * Math.PI * i) / 6 - Math.PI / 2),
      },
    ]),
  );
  const curves = pairs.map(([a, b]) => ({
    id: a + b,
    points: [
      vertices[a],
      {
        x: (vertices[a].x + vertices[b].x) / 2,
        y: (vertices[a].y + vertices[b].y) / 2,
      },
      vertices[b],
    ],
  }));
  return { curves, vertices: Object.values(vertices) };
}

test("ceny F–C a B–E sú oddelené a zostávajú na svojich hranách", () => {
  const { curves, vertices } = fixture([
    "AB",
    "BC",
    "CD",
    "DE",
    "EF",
    "FC",
    "BE",
    "AC",
    "FD",
    "EC",
  ]);
  const labels = placeWeightLabels(curves, vertices);
  for (const curve of curves) {
    const p = labels.get(curve.id);
    const [a, , b] = curve.points;
    assert.ok(
      Math.abs((p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x)) < 1e-7,
    );
    for (const vertex of vertices)
      assert.ok(Math.hypot(p.x - vertex.x, p.y - vertex.y) >= 44 - 1e-7);
  }
  const points = [...labels.values()];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      assert.ok(
        Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y) >=
          36 - 1e-7,
      );
    }
  }
  assert.deepEqual(placeWeightLabels(curves, vertices), labels);
});

test("váha oblúka a slučky leží na krivke, nie na riadiacom bode", () => {
  const labels = placeWeightLabels(
    [
      {
        id: "arc",
        points: [
          { x: 0, y: 100 },
          { x: 100, y: 0 },
          { x: 200, y: 100 },
        ],
      },
      {
        id: "loop",
        points: [
          { x: 288, y: 84 },
          { x: 220, y: 15 },
          { x: 380, y: 15 },
          { x: 312, y: 84 },
        ],
      },
    ],
    [],
  );
  assert.deepEqual(labels.get("arc"), { x: 100, y: 50 });
  assert.deepEqual(labels.get("loop"), { x: 300, y: 32.25 });
  assert.equal(placeWeightLabels([], []).size, 0);
});
