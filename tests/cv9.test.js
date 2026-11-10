import { test } from "node:test";
import assert from "node:assert/strict";
import { graph, degree } from "../src/graph.js";
import {
  make9,
  initial9,
  action9,
  hint9,
  finishEuler,
  hamiltonPaths,
  conditionAnswers,
  cutVertices,
  tourCost,
  nnTour,
} from "../src/cv9.js";
test("Dirac je postačujúca, nie nutná: C5", () => {
  const g = graph(
    ["A", "B", "C", "D", "E"],
    [
      ["A", "B"],
      ["B", "C"],
      ["C", "D"],
      ["D", "E"],
      ["E", "A"],
    ],
  );
  assert.equal(conditionAnswers(g).dirac, false);
  assert.equal(conditionAnswers(g).hamilton, true);
  assert.deepEqual(cutVertices(g), []);
});
test("artikulácia zabráni Hamiltonovskému cyklu", () => {
  const g = graph(
    ["A", "B", "C", "D", "E"],
    [
      ["A", "B"],
      ["B", "C"],
      ["C", "A"],
      ["A", "D"],
      ["D", "E"],
      ["E", "A"],
    ],
  );
  assert.deepEqual(cutVertices(g), ["A"]);
  assert.equal(hamiltonPaths(g).length, 0);
});
test("heuristiky a nápoveda ukončia všetky generované úlohy", () => {
  for (const level of ["easy", "medium", "hard", "fiit"])
    for (const id of ["nn9", "rnn9", "cheap9", "insert9", "eulerize", "semi9"])
      for (let trial = 0; trial < 20; trial++) {
        const q = make9(id, level);
        let s = initial9(),
          steps = 0;
        while (!s.done && steps++ < 100) {
          const a = hint9(q, s);
          if (!a) break;
          const r = action9(q, s, a);
          assert.ok(!r.error, `${id} ${r.error}`);
          s = r.state;
          if (["eulerize", "semi9"].includes(id) && finishEuler(q, s).ok) break;
        }
        if (["eulerize", "semi9"].includes(id))
          assert.equal(
            finishEuler(q, s).ok,
            true,
            `${id} ${JSON.stringify(q.optimalPair)}`,
          );
        else {
          assert.ok(s.done, id);
          if (id === "cheap9") {
            const es = q.g.edges.filter((e) => s.used.includes(e.id));
            const gg = { ...q.g, edges: es };
            assert.ok(gg.vertices.every((v) => degree(gg, v) === 2));
          } else if (id === "rnn9") {
            assert.equal(s.results.length, q.g.vertices.length);
            assert.deepEqual(
              s.results.map((x) => x.cost),
              q.g.vertices.map((v) => tourCost(q.g, nnTour(q.g, v))),
            );
          } else {
            assert.equal(
              new Set(s.route.slice(0, -1)).size,
              q.g.vertices.length,
            );
            assert.equal(s.route[0], s.route.at(-1));
          }
        }
      }
});
test("brute force dosiahne známe optimum a počet cyklov", () => {
  const g = graph(
    ["A", "B", "C", "D"],
    [
      ["A", "B", 1],
      ["B", "C", 1],
      ["C", "D", 1],
      ["D", "A", 1],
      ["A", "C", 10],
      ["B", "D", 10],
    ],
  );
  const tours = hamiltonPaths(g);
  assert.equal(tours.length, 6);
  assert.equal(Math.min(...tours.map((r) => tourCost(g, r))), 4);
});
