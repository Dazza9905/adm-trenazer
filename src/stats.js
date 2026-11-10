export function summarize(attempts) {
  return {
    total: attempts.length,
    solved: attempts.filter((a) => a.solved).length,
    independent: attempts.filter((a) => a.solved && !a.errors && !a.hints)
      .length,
    errors: attempts.reduce((sum, a) => sum + a.errors, 0),
    hints: attempts.reduce((sum, a) => sum + a.hints, 0),
  };
}

export function choosePracticeModule(
  attempts,
  moduleIds,
  level,
  random = Math.random,
) {
  const recent = attempts.filter((a) => a.level === level).slice(-100);
  const weights = moduleIds.map((id) => {
    const group = summarize(recent.filter((a) => a.moduleId === id));
    // A neutral prior keeps new topics in rotation and softens small samples.
    return 1 + (4 * (group.total - group.independent + 1)) / (group.total + 2);
  });
  let choice = random() * weights.reduce((sum, weight) => sum + weight, 0);
  for (let i = 0; i < moduleIds.length; i++) {
    choice -= weights[i];
    if (choice < 0) return moduleIds[i];
  }
  return moduleIds.at(-1);
}

export function validateBackup(data, moduleIds) {
  const levels = ["easy", "medium", "hard", "fiit"];
  const count = (n) => Number.isSafeInteger(n) && n >= 0;
  if (
    data?.version !== 1 ||
    !Array.isArray(data.attempts) ||
    data.attempts.length > 2000 ||
    !data.progress ||
    typeof data.progress !== "object" ||
    Array.isArray(data.progress) ||
    !Object.entries(data.progress).every(
      ([id, n]) => moduleIds.includes(id) && count(n),
    ) ||
    !data.attempts.every(
      (a) =>
        a &&
        moduleIds.includes(a.moduleId) &&
        levels.includes(a.level) &&
        count(a.errors) &&
        count(a.hints) &&
        typeof a.solved === "boolean",
    )
  )
    throw new Error("Súbor nemá podporovaný formát tréningových dát.");
  return {
    attempts: data.attempts.map(
      ({ moduleId, level, errors, hints, solved }) => ({
        moduleId,
        level,
        errors,
        hints,
        solved,
      }),
    ),
    progress: { ...data.progress },
  };
}
