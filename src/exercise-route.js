const levels = ["easy", "medium", "hard", "fiit"];
export const exerciseSlug = (title) =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function exercisePath(presentation, module, level, seed) {
  return `/${presentation.id}/${exerciseSlug(module.title)}/${level}/${seed}`;
}

export function parseExercisePath(path, presentations) {
  const parts = path.replace(/\/$/, "").split("/").slice(1);
  if (
    parts.length !== 4 ||
    !levels.includes(parts[2]) ||
    !/^[0-9a-f]{8}$/.test(parts[3])
  )
    return null;
  const presentation = presentations.find((p) => p.id === parts[0]);
  const module = presentation?.modules.find(
    (m) => exerciseSlug(m.title) === parts[1],
  );
  return module
    ? { moduleId: module.id, level: parts[2], seed: parts[3] }
    : null;
}

export function seededRandom(seed) {
  let state = Number.parseInt(seed, 16) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function newExerciseSeed() {
  return crypto
    .getRandomValues(new Uint32Array(1))[0]
    .toString(16)
    .padStart(8, "0");
}
