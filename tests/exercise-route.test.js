import { test } from "node:test";
import assert from "node:assert/strict";
import {
  exercisePath,
  parseExercisePath,
  seededRandom,
} from "../src/exercise-route.js";
import { presentations } from "../src/content.js";
import { randomGraph } from "../src/graph.js";
import { make9 } from "../src/cv9.js";
import { marked } from "marked";
import { theory } from "../src/content.js";

test("odkaz obsahuje prezentáciu, názov, obťažnosť a seed", () => {
  for (const p of presentations)
    for (const module of p.modules) {
      const path = exercisePath(p, module, "hard", "1234abcd");
      assert.match(path, /^\/cv[89]\/[a-z0-9-]+\/hard\/1234abcd$/);
      assert.deepEqual(parseExercisePath(path, presentations), {
        moduleId: module.id,
        level: "hard",
        seed: "1234abcd",
      });
    }
  for (const path of [
    "/cv9/eulerizacia/hard/wrong",
    "/cv9/eulerizacia/unknown/1234abcd",
    "/cv8/eulerizacia/hard/1234abcd",
    "/cv9/missing/hard/1234abcd",
    "/",
  ]) {
    assert.equal(parseExercisePath(path, presentations), null);
  }
});

test("seed obnovuje grafy aj varianty otázok oboch prezentácií", () => {
  for (const seed of ["00000000", "12345678", "ffffffff"]) {
    assert.deepEqual(
      randomGraph("hard", "cost", seededRandom(seed)),
      randomGraph("hard", "cost", seededRandom(seed)),
    );
    assert.deepEqual(
      make9("eulerize", "hard", seededRandom(seed)),
      make9("eulerize", "hard", seededRandom(seed)),
    );
    assert.deepEqual(
      make9("complete9", "hard", seededRandom(seed)),
      make9("complete9", "hard", seededRandom(seed)),
    );
  }
  assert.notDeepEqual(
    randomGraph("hard", "cost", seededRandom("12345678")),
    randomGraph("hard", "cost", seededRandom("87654321")),
  );
});

test("každý ťahák vysvetľuje postup a logiku v Markdown sekciách", () => {
  for (const module of presentations.flatMap((p) => p.modules)) {
    const text = theory[module.id];
    assert.match(text, /### Ako postupovať/);
    assert.match(text, /### Prečo to funguje/);
    const html = marked.parse(text);
    assert.match(html, /<ol>/);
    assert.match(html, /<h3>/);
    assert.match(html, /<strong>/);
  }
});
