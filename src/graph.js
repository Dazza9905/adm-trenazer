export const other = (e, v) => (e.a === v ? e.b : e.a);
export const incident = (g, v, used = []) =>
  g.edges.filter((e) => !used.includes(e.id) && (e.a === v || e.b === v));
export function degree(g, v) {
  return g.edges.reduce((n, e) => n + (e.a === v) + (e.b === v), 0);
}
export function components(g, edges = g.edges) {
  const unseen = new Set(g.vertices),
    result = [];
  while (unseen.size) {
    const todo = [unseen.values().next().value],
      c = [];
    unseen.delete(todo[0]);
    while (todo.length) {
      const v = todo.pop();
      c.push(v);
      for (const e of edges) {
        if (e.a !== v && e.b !== v) continue;
        const w = other(e, v);
        if (unseen.delete(w)) todo.push(w);
      }
    }
    result.push(c);
  }
  return result;
}
export function bipartition(g) {
  const colors = {};
  for (const root of g.vertices) {
    if (root in colors) continue;
    colors[root] = 0;
    const q = [root];
    while (q.length) {
      const v = q.shift();
      for (const e of incident(g, v)) {
        const w = other(e, v);
        if (colors[w] === colors[v]) return null;
        if (!(w in colors)) {
          colors[w] = 1 - colors[v];
          q.push(w);
        }
      }
    }
  }
  return [
    g.vertices.filter((v) => colors[v] === 0),
    g.vertices.filter((v) => colors[v] === 1),
  ];
}
export function properties(g) {
  const pairs = g.edges.map((e) => [e.a, e.b].sort().join(":"));
  const simple =
    g.edges.every((e) => e.a !== e.b) && new Set(pairs).size === pairs.length;
  const connected = components(g).length === 1;
  const odd = g.vertices.filter((v) => degree(g, v) % 2);
  const parts = bipartition(g);
  return {
    simple,
    connected,
    complete:
      simple &&
      g.edges.length === (g.vertices.length * (g.vertices.length - 1)) / 2,
    bipartite: !!parts,
    completeBipartite:
      !!parts && simple && g.edges.length === parts[0].length * parts[1].length,
    euler: connected && odd.length === 0,
    semi: connected && odd.length === 2,
    directed: !!g.directed,
    weighted: !!g.weighted,
    dag: !!g.directed && !directedCycle(g),
  };
}
export function directedCycle(g) {
  const done = new Set(),
    active = [];
  function visit(v) {
    const i = active.indexOf(v);
    if (i >= 0) return [...active.slice(i), v];
    if (done.has(v)) return null;
    active.push(v);
    for (const e of g.edges.filter((e) => e.a === v)) {
      const cycle = visit(e.b);
      if (cycle) return cycle;
    }
    active.pop();
    done.add(v);
    return null;
  }
  for (const v of g.vertices) {
    const cycle = visit(v);
    if (cycle) return cycle;
  }
  return null;
}
export function oddCycle(g) {
  const color = {},
    parent = {};
  for (const root of g.vertices) {
    if (root in color) continue;
    color[root] = 0;
    parent[root] = null;
    const queue = [root];
    while (queue.length) {
      const v = queue.shift();
      for (const e of incident(g, v)) {
        const w = other(e, v);
        if (!(w in color)) {
          color[w] = 1 - color[v];
          parent[w] = v;
          queue.push(w);
        } else if (color[w] === color[v]) {
          const left = [],
            right = [];
          for (let x = v; x !== null; x = parent[x]) left.push(x);
          let x = w;
          while (!left.includes(x)) {
            right.push(x);
            x = parent[x];
          }
          return [...left.slice(0, left.indexOf(x) + 1), ...right.reverse(), v];
        }
      }
    }
  }
  return null;
}
export function isBridge(g, id, used = []) {
  const remaining = g.edges.filter((e) => !used.includes(e.id));
  return (
    components(
      g,
      remaining.filter((e) => e.id !== id),
    ).length > components(g, remaining).length
  );
}
export function fleuryStep(g, state, id) {
  const e = g.edges.find((e) => e.id === id);
  if (!e) return "Taká hrana v grafe nie je.";
  if (state.used.includes(id))
    return `Hranu ${e.a}–${e.b} si už použil. V ťahu sa každá hrana smie použiť iba raz.`;
  if (e.a !== state.at && e.b !== state.at)
    return `Si vo vrchole ${state.at}. Hrana ${e.a}–${e.b} s ním nesusedí.`;
  const choices = incident(g, state.at, state.used);
  if (choices.length > 1 && isBridge(g, id, state.used))
    return `Hrana ${e.a}–${e.b} je v zostávajúcom grafe most. Z vrcholu ${state.at} môžeš ísť aj inou hranou; most teraz neber, aby si neodrezal nepoužité hrany.`;
  return null;
}
export function walkInfo(g, seq) {
  const used = [],
    repeated = [],
    missing = [];
  let cost = 0;
  for (let i = 1; i < seq.length; i++) {
    const a = seq[i - 1],
      b = seq[i];
    const matches = g.edges.filter(
      (e) =>
        (e.a === a && e.b === b) || (!g.directed && e.b === a && e.a === b),
    );
    const edge = matches.find((e) => !used.includes(e.id)) || matches[0];
    if (!edge) {
      missing.push(`${a} → ${b}`);
      continue;
    }
    if (used.includes(edge.id)) repeated.push(`${a}–${b}`);
    used.push(edge.id);
    cost += edge.weight ?? 1;
  }
  const valid =
    seq.length > 1 &&
    seq.every((v) => g.vertices.includes(v)) &&
    !missing.length;
  const trail = valid && !repeated.length;
  return {
    walk: valid,
    trail,
    path: trail && new Set(seq).size === seq.length,
    circuit: trail && seq[0] === seq.at(-1),
    used,
    repeated,
    missing,
    cost,
  };
}
export function graph(vertices, edges, extras = {}) {
  return {
    vertices,
    edges: edges.map(([a, b, weight], i) => ({
      id: `e${i}`,
      a,
      b,
      weight: weight ?? 1,
    })),
    ...extras,
  };
}
export function randomGraph(level = "easy", kind = "types", rng = Math.random) {
  const n = { easy: 4, medium: 5, hard: 7, fiit: 9 }[level];
  const vertices = Array.from({ length: n }, (_, i) =>
    String.fromCharCode(65 + i),
  );
  let edges = [];
  const add = (a, b) =>
    edges.push([vertices[a], vertices[b], 1 + Math.floor(rng() * 9)]);
  if (kind === "fleury" || kind === "hierholzer") {
    const order = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (let i = 0; i < n; i++) add(order[i], order[(i + 1) % n]);
    // Every additional cycle preserves even degrees.
    if (n >= 5) {
      const start = Math.floor(rng() * n);
      const [a, b, c] = [
        order[start],
        order[(start + 2) % n],
        order[(start + 4) % n],
      ];
      add(a, b);
      add(b, c);
      add(c, a);
    }
    if (level === "fiit") {
      add(1, 1);
      add(2, 3);
      add(2, 3);
    }
    if (kind === "fleury" && rng() < 0.45) {
      add(0, Math.floor(n / 2));
    }
  } else {
    const family = Math.floor(rng() * 7);
    for (let a = 0; a < n; a++)
      for (let b = a + 1; b < n; b++) {
        const yes =
          family === 0 ||
          (family === 1 && a < Math.floor(n / 2) && b >= Math.floor(n / 2)) ||
          (family === 2 && b === a + 1) ||
          (family === 3 && (b === a + 1 || (a === 0 && b === n - 1))) ||
          (family >= 4 && rng() < 0.32);
        if (yes) add(a, b);
      }
    if (family === 5) {
      add(0, 0);
      add(0, 1);
      add(0, 1);
    }
  }
  // Vertex-only cost answers must identify an unambiguous edge weight.
  if (kind === "cost")
    edges = edges.filter(
      (e, i) =>
        edges.findIndex(
          (x) =>
            [x[0], x[1]].sort().join(":") === [e[0], e[1]].sort().join(":"),
        ) === i,
    );
  return graph(vertices, edges, {
    weighted: kind === "cost" || (kind === "types" && rng() < 0.25),
    directed: kind === "types" && rng() < 0.2,
  });
}
export function initialAlgorithm(g) {
  return { at: null, used: [], route: [], cycle: [], splice: 0, done: false };
}
export function algorithmAction(g, s, action, kind) {
  s = structuredClone(s);
  if (s.done) return { error: "Tento postup je hotový." };
  if (action.type === "vertex") {
    const v = action.v;
    if (!g.vertices.includes(v)) return { error: "Vyber vrchol z grafu." };
    if (s.at === null) {
      if (kind === "fleury") {
        const odd = g.vertices.filter((v) => degree(g, v) % 2);
        if (odd.length && !odd.includes(v))
          return {
            error: `Nepárne stupne majú ${odd.join(" a ")}. Semi-eulerovský ťah musí začať v jednom z nich; ${v} má stupeň ${degree(g, v)}.`,
          };
      }
      s.at = v;
      s.route = [v];
      if (kind === "hierholzer") s.cycle = [v];
      return { state: s };
    }
    if (kind === "hierholzer" && !s.cycle.length) {
      const i = s.route.indexOf(v);
      if (i < 0 || !incident(g, v, s.used).length)
        return {
          error: `Vyber vrchol hotového okruhu s nepoužitou hranou. Vrchol ${v} túto podmienku nespĺňa.`,
        };
      s.splice = i;
      s.cycle = [v];
      s.at = v;
      return { state: s };
    }
    return { error: "Teraz vyber konkrétnu hranu, ktorou pokračuješ." };
  }
  if (s.at === null) return { error: "Najprv vyber štartovací vrchol." };
  if (kind === "hierholzer" && !s.cycle.length)
    return {
      error: "Najprv vyber vrchol okruhu, v ktorom začneš nový cyklus.",
    };
  const e = g.edges.find((e) => e.id === action.id);
  if (!e) return { error: "Vyber existujúcu hranu." };
  const error =
    kind === "fleury"
      ? fleuryStep(g, s, e.id)
      : s.used.includes(e.id)
        ? `Hrana ${e.a}–${e.b} už patrí do vytvoreného cyklu.`
        : e.a !== s.at && e.b !== s.at
          ? `Hrana ${e.a}–${e.b} nevychádza z aktuálneho vrcholu ${s.at}.`
          : null;
  if (error) return { error };
  s.used.push(e.id);
  s.at = other(e, s.at);
  let note = "";
  if (kind === "fleury") {
    s.route.push(s.at);
    s.done = s.used.length === g.edges.length;
  } else {
    s.cycle.push(s.at);
    if (s.at === s.cycle[0]) {
      s.route = [
        ...s.route.slice(0, s.splice),
        ...s.cycle,
        ...s.route.slice(s.splice + 1),
      ];
      note = `Cyklus ${s.cycle.join(" → ")} je uzavretý a vložený do okruhu vo vrchole ${s.at}.`;
      s.cycle = [];
      s.done = s.used.length === g.edges.length;
    }
  }
  return { state: s, note };
}
export function hintAction(g, s, kind) {
  if (s.at === null) {
    const odd = g.vertices.filter((v) => degree(g, v) % 2);
    return { type: "vertex", v: odd[0] || g.vertices[0] };
  }
  if (kind === "hierholzer" && !s.cycle.length)
    return {
      type: "vertex",
      v: s.route.find((v) => incident(g, v, s.used).length),
    };
  return {
    type: "edge",
    id: incident(g, s.at, s.used).find(
      (e) => kind !== "fleury" || !fleuryStep(g, s, e.id),
    )?.id,
  };
}
