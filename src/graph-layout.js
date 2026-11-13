function pointOnCurve(points, t) {
  while (points.length > 1) {
    points = points.slice(1).map((p, i) => ({
      x: points[i].x * (1 - t) + p.x * t,
      y: points[i].y * (1 - t) + p.y * t,
    }));
  }
  return points[0];
}

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function segmentDistance(p, a, b) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const t = Math.max(
    0,
    Math.min(
      1,
      ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1),
    ),
  );
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
}

export function placeWeightLabels(curves, vertices) {
  const positions = new Map();
  const samples = curves.map((curve) =>
    Array.from({ length: 21 }, (_, i) => pointOnCurve(curve.points, i / 20)),
  );
  // Search along the actual edge, preferring its middle when there is room.
  const parameters = [0.5];
  for (let step = 1; step <= 14; step++) {
    parameters.push(0.5 - step * 0.025, 0.5 + step * 0.025);
  }
  curves.forEach((curve, index) => {
    let best,
      bestScore = Infinity;
    for (const t of parameters) {
      const p = pointOnCurve(curve.points, t);
      let score = Math.abs(t - 0.5);
      for (const vertex of vertices)
        score += 1000 * Math.max(0, 44 - distance(p, vertex));
      for (const label of positions.values())
        score += 1000 * Math.max(0, 36 - distance(p, label));
      // Prefer clear stretches over intersections with unrelated edges.
      samples.forEach((points, other) => {
        if (other === index) return;
        let clearance = Infinity;
        for (let i = 1; i < points.length; i++) {
          clearance = Math.min(
            clearance,
            segmentDistance(p, points[i - 1], points[i]),
          );
        }
        score += Math.max(0, 18 - clearance);
      });
      if (score < bestScore) {
        best = p;
        bestScore = score;
      }
      if (score === 0) break;
    }
    positions.set(curve.id, best);
  });
  return positions;
}
