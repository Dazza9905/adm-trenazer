import { test } from "node:test";
import assert from "node:assert/strict";
import {
  summarize,
  validateBackup,
  choosePracticeModule,
} from "../src/stats.js";

const attempts = [
  { moduleId: "degree", level: "easy", errors: 0, hints: 0, solved: true },
  { moduleId: "degree", level: "hard", errors: 2, hints: 1, solved: true },
  { moduleId: "degree", level: "hard", errors: 1, hints: 0, solved: false },
];

test("samostatná úspešnosť zahŕňa aj nedokončené príklady", () => {
  assert.deepEqual(summarize(attempts), {
    total: 3,
    solved: 2,
    independent: 1,
    errors: 3,
    hints: 1,
  });
  assert.equal(summarize(attempts.slice(-1)).errors, 1);
  assert.equal(summarize([]).total, 0);
});

test("záloha zachová dáta a odmietne neplatné vstupy", () => {
  const backup = { version: 1, attempts, progress: { degree: 2 } };
  assert.deepEqual(validateBackup(backup, ["degree"]), {
    attempts,
    progress: { degree: 2 },
  });
  for (const bad of [
    null,
    {},
    { ...backup, version: 2 },
    { ...backup, progress: { unknown: 3 } },
    { ...backup, attempts: [{ ...attempts[0], errors: -1 }] },
    { ...backup, attempts: [{ ...attempts[0], solved: "true" }] },
    { ...backup, attempts: Array(2001).fill(attempts[0]) },
  ]) {
    assert.throws(() => validateBackup(bad, ["degree"]));
  }
});

test("personalizácia uprednostní slabšie témy bez vyradenia ostatných", () => {
  const ids = ["strong", "weak", "new"];
  const history = Array.from({ length: 10 }, () => [
    { moduleId: "strong", level: "easy", solved: true, errors: 0, hints: 0 },
    { moduleId: "weak", level: "easy", solved: true, errors: 1, hints: 0 },
  ]).flat();
  const counts = { strong: 0, weak: 0, new: 0 };
  for (let i = 0; i < 1000; i++) {
    counts[
      choosePracticeModule(history, ids, "easy", () => (i + 0.5) / 1000)
    ]++;
  }
  assert.ok(counts.weak > counts.new && counts.new > counts.strong);
  assert.ok(counts.strong > 0);
  const hinted = [
    { moduleId: "weak", level: "easy", solved: true, errors: 0, hints: 1 },
  ];
  const abandoned = [{ ...hinted[0], solved: false, hints: 0 }];
  for (const sample of [hinted, abandoned]) {
    assert.equal(
      choosePracticeModule(sample, ["weak", "new"], "easy", () => 0.52),
      "weak",
    );
  }
});

test("výber používa iba posledných 100 príkladov zvolenej obťažnosti", () => {
  const ids = ["degree", "other"];
  const recent = Array.from({ length: 100 }, () => attempts[0]);
  const old = Array.from({ length: 100 }, () => ({
    ...attempts[1],
    level: "easy",
  }));
  const otherLevel = Array.from({ length: 100 }, () => attempts[1]);
  for (const value of [0, 0.25, 0.35, 0.5, 0.75, 0.99]) {
    const pick = (history) =>
      choosePracticeModule(history, ids, "easy", () => value);
    assert.equal(pick([...old, ...recent, ...otherLevel]), pick(recent));
  }
});
