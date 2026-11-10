import { test } from "node:test";
import assert from "node:assert/strict";
import {
  graph,
  degree,
  properties,
  walkInfo,
  randomGraph,
  initialAlgorithm,
  algorithmAction,
  hintAction,
  isBridge,
  oddCycle,
  directedCycle,
} from "../src/graph.js";
test("slučky a násobné hrany: stupne a ťah rozlišujú konkrétne hrany", () => {
  const g = graph(
    ["A", "B"],
    [
      ["A", "A"],
      ["A", "B"],
      ["B", "A"],
    ],
  );
  assert.equal(degree(g, "A"), 4);
  assert.equal(properties(g).simple, false);
  assert.equal(walkInfo(g, ["A", "B", "A"]).trail, true);
  assert.equal(walkInfo(g, ["A", "B", "A", "B"]).trail, false);
  assert.equal(properties(g).euler, true);
});
test("izolovaný vrchol zabraňuje súvislosti aj eulerovskosti podľa PDF", () => {
  const g = graph(
    ["A", "B", "C", "D"],
    [
      ["A", "B"],
      ["B", "C"],
      ["C", "A"],
    ],
  );
  assert.equal(properties(g).euler, false);
});
test("kompletný bipartitný a orientovaná prechádzka", () => {
  const g = graph(
    ["A", "B", "C", "D"],
    [
      ["A", "C"],
      ["A", "D"],
      ["B", "C"],
      ["B", "D"],
    ],
  );
  assert.equal(properties(g).completeBipartite, true);
  g.directed = true;
  assert.equal(walkInfo(g, ["C", "A"]).walk, false);
});
test("Fleury odmietne most pred zvyškom cyklu a nesprávny štart", () => {
  const g = graph(
    ["A", "B", "C", "D"],
    [
      ["A", "B"],
      ["B", "C"],
      ["C", "A"],
      ["A", "D"],
    ],
  );
  assert.equal(isBridge(g, "e3"), true);
  let s = algorithmAction(
    g,
    initialAlgorithm(g),
    { type: "vertex", v: "B" },
    "fleury",
  );
  assert.ok(s.error);
  s = algorithmAction(
    g,
    initialAlgorithm(g),
    { type: "vertex", v: "A" },
    "fleury",
  ).state;
  assert.ok(algorithmAction(g, s, { type: "edge", id: "e3" }, "fleury").error);
});
test("náhodné algoritmické grafy vždy vyrieši nápoveda a výsledok je platný", () => {
  for (const level of ["easy", "medium", "hard", "fiit"])
    for (const kind of ["fleury", "hierholzer"])
      for (let trial = 0; trial < 100; trial++) {
        const g = randomGraph(level, kind);
        let s = initialAlgorithm(g),
          steps = 0;
        while (!s.done && steps++ < 100) {
          const result = algorithmAction(g, s, hintAction(g, s, kind), kind);
          assert.ok(!result.error, result.error);
          s = result.state;
        }
        assert.ok(s.done);
        const info = walkInfo(g, s.route);
        assert.equal(info.trail, true);
        assert.equal(info.used.length, g.edges.length);
        if (kind === "hierholzer") assert.equal(info.circuit, true);
      }
});
test("cena opakovanej hrany a uzavretý ťah s opakovaným vrcholom", () => {
  const g = graph(
    ["A", "B", "C", "D", "E"],
    [
      ["A", "B", 3],
      ["B", "C", 2],
      ["C", "A", 4],
      ["A", "D", 5],
      ["D", "E", 6],
      ["E", "A", 7],
    ],
  );
  assert.equal(walkInfo(g, ["A", "B", "A"]).cost, 6);
  const w = walkInfo(g, ["A", "B", "C", "A", "D", "E", "A"]);
  assert.equal(w.circuit, true);
  assert.equal(w.path, false);
});

test("konkrétni svedkovia nepárneho a orientovaného cyklu", () => {
  const g = graph(
    ["A", "B", "C"],
    [
      ["A", "B"],
      ["B", "C"],
      ["C", "A"],
    ],
    { directed: true },
  );
  assert.equal(oddCycle(g).length, 4);
  assert.deepEqual(directedCycle(g), ["A", "B", "C", "A"]);
  assert.equal(properties(g).dag, false);
  g.edges.pop();
  assert.equal(properties(g).dag, true);
  assert.equal(oddCycle(g), null);
});
