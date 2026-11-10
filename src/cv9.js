import {
  graph,
  degree,
  components,
  randomGraph,
  other,
  incident,
} from "./graph.js";
export const cv9Modules = [
  [
    "eulerize",
    "Eulerizácia",
    "Duplikuj existujúce hrany tak, aby vznikol eulerovský graf s najmenšou cenou duplikácie.",
  ],
  [
    "semi9",
    "Semi-eulerizácia",
    "Duplikuj existujúce hrany: presne dva vrcholy majú zostať nepárne. Minimalizuj cenu duplikácie.",
  ],
  [
    "hamilton",
    "Hamiltonovská cesta a cyklus",
    "Zadaj požadovanú prechádzku cez všetky vrcholy.",
  ],
  [
    "conditions9",
    "Hamiltonovské podmienky",
    "Označ všetky pravdivé tvrdenia o tomto grafe.",
  ],
  ["complete9", "Kompletné grafy a brute force", "Vypočítaj požadovaný počet."],
  [
    "nn9",
    "Nearest neighbor",
    "Začni ľubovoľným vrcholom. Potom vždy vyber najbližší nenavštívený vrchol.",
  ],
  [
    "rnn9",
    "Repetitive nearest neighbor",
    "Vykonaj nearest neighbor postupne zo všetkých štartov.",
  ],
  [
    "cheap9",
    "Cheapest link",
    "Pridávaj najlacnejšiu prípustnú hranu. Nevytvor stupeň 3 ani predčasný cyklus.",
  ],
  [
    "insert9",
    "Nearest insertion",
    "Vytvor počiatočný trojuholník a postupne vkladaj najbližšie vrcholy.",
  ],
  [
    "tsp9",
    "Obchodný cestujúci: optimum",
    "Urči cenu najlacnejšieho Hamiltonovského cyklu (brute force).",
  ],
].map(([id, title, prompt]) => ({
  id,
  title,
  prompt,
  description: "",
  icon: "◇",
}));
export const cv9Theory = {
  eulerize:
    "Eulerizácia duplikuje iba existujúce hrany. Výsledný graf musí byť súvislý a mať všetky stupne párne. Vo váženom grafe minimalizujeme súčet váh duplikovaných hrán. Párujeme nepárne vrcholy najkratšími cestami; vnútorné vrcholy cesty dostanú +2.",
  semi9:
    "Semi-eulerizácia necháva práve dva nepárne vrcholy. Duplikujeme existujúce hrany a hľadáme najmenšiu cenu. Dva nepárne vrcholy budú štartom a koncom otvoreného eulerovského ťahu.",
  hamilton:
    "Hamiltonovská cesta prejde každým vrcholom práve raz. Hamiltonovský cyklus sa navyše vráti do štartu. Na rozdiel od eulerovského nemusí použiť všetky hrany.",
  conditions9:
    "Súvislosť, minimálny stupeň aspoň 2 a neprítomnosť artikulácie sú nutné, ale spolu nestačia. Diracova podmienka pre jednoduchý neorientovaný graf s n ≥ 3: každý stupeň je aspoň n/2. Je postačujúca, nie nutná. Artikulácia je vrchol, ktorého odstránenie zvýši počet komponentov.",
  complete9:
    "Kₙ má n(n−1)/2 hrán, stupeň každého vrcholu n−1 a (n−1)!/2 rôznych neorientovaných Hamiltonovských cyklov (n ≥ 3). Otočenie ani opačný smer nepočítame znovu. Brute force porovná všetky a zaručí optimum; počet rastie faktoriálne.",
  nn9: "Nearest neighbor vyberá z aktuálneho vrcholu najlacnejšiu hranu do ešte nenavštíveného vrcholu. Nakoniec sa vracia do štartu. Je to heuristika, nemusí nájsť optimum. Pri rovnakej váhe prijímame ktorúkoľvek najlacnejšiu možnosť.",
  rnn9: "Nearest neighbor zopakujeme zo všetkých n štartov a vyberieme najlacnejší výsledok. Ani táto heuristika nemusí dosiahnuť globálne optimum.",
  cheap9:
    "Cheapest link porovnáva hrany celého grafu. Nepridá hranu, ktorá by vytvorila stupeň 3 alebo cyklus skôr, ako zahrnie všetky vrcholy. Posledná hrana smie uzavrieť celý Hamiltonovský cyklus. Heuristika nezaručuje optimum.",
  insert9:
    "Variant z prezentácie: vyber najlacnejšiu hranu, potom najlacnejšiu hranu incidentnú s prvou a uzavri trojuholník. Vyber najlacnejšiu hranu YX z cyklu k novému vrcholu X. Pre oboch susedov Z vrcholu Y porovnaj Δ = w(YX)+w(XZ)−w(YZ). Vlož X medzi Y a Z s najnižším Δ. Neporovnávame všetky hrany cyklu ako v inom variante cheapest insertion.",
  tsp9: "Obchodný cestujúci hľadá najlacnejší Hamiltonovský cyklus. Brute force porovná všetky cykly a zaručí optimum. Nearest neighbor, repetitive NN, cheapest link a nearest insertion sú heuristiky a môžu dať drahší výsledok.",
};
export const isCv9 = (id) => cv9Modules.some((m) => m.id === id);
export const step9 = (id) =>
  ["eulerize", "semi9", "nn9", "rnn9", "cheap9", "insert9"].includes(id);
export const weight = (g, a, b) =>
  g.edges.find((e) => (e.a === a && e.b === b) || (e.b === a && e.a === b))
    ?.weight ?? Infinity;
export function tourCost(g, r) {
  return r.slice(1).reduce((s, v, i) => s + weight(g, r[i], v), 0);
}
export function hamiltonPaths(g, closed = true) {
  const found = [];
  function visit(r) {
    if (r.length === g.vertices.length) {
      if (!closed || Number.isFinite(weight(g, r.at(-1), r[0])))
        found.push(closed ? [...r, r[0]] : r);
      return;
    }
    for (const v of g.vertices)
      if (!r.includes(v) && Number.isFinite(weight(g, r.at(-1), v)))
        visit([...r, v]);
  }
  for (const v of closed ? [g.vertices[0]] : g.vertices) visit([v]);
  return found;
}
export function cutVertices(g) {
  const count = components(g).length;
  return g.vertices.filter(
    (v) =>
      components(
        { ...g, vertices: g.vertices.filter((x) => x !== v) },
        g.edges.filter((e) => e.a !== v && e.b !== v),
      ).length > count,
  );
}
export function nnTour(g, start) {
  const r = [start];
  while (r.length < g.vertices.length) {
    const candidates = g.vertices
      .filter((v) => !r.includes(v))
      .sort(
        (a, b) =>
          weight(g, r.at(-1), a) - weight(g, r.at(-1), b) || a.localeCompare(b),
      );
    r.push(candidates[0]);
  }
  return [...r, start];
}
export function pairing(g, semi = false) {
  const odd = g.vertices.filter((v) => degree(g, v) % 2),
    paths = {};
  for (const a of g.vertices) {
    const dist = Object.fromEntries(g.vertices.map((v) => [v, Infinity])),
      route = { [a]: [] },
      todo = new Set(g.vertices);
    dist[a] = 0;
    while (todo.size) {
      const v = [...todo].sort((a, b) => dist[a] - dist[b])[0];
      todo.delete(v);
      for (const e of incident(g, v)) {
        const w = other(e, v);
        if (dist[w] > dist[v] + e.weight) {
          dist[w] = dist[v] + e.weight;
          route[w] = [...route[v], e.id];
        }
      }
    }
    for (const b of g.vertices)
      paths[a + b] = { cost: dist[b], edges: route[b] };
  }
  function match(vs) {
    if (!vs.length) return { cost: 0, edges: [] };
    const a = vs[0];
    let best = { cost: Infinity, edges: [] };
    for (const b of vs.slice(1)) {
      const rest = match(vs.filter((v) => v !== a && v !== b)),
        p = paths[a + b];
      if (rest.cost + p.cost < best.cost)
        best = { cost: rest.cost + p.cost, edges: [...p.edges, ...rest.edges] };
    }
    return best;
  }
  if (!semi) return match(odd);
  if (!odd.length) {
    const e = [...g.edges].sort((a, b) => a.weight - b.weight)[0];
    return { cost: e.weight, edges: [e.id] };
  }
  let best = { cost: Infinity, edges: [] };
  for (let i = 0; i < odd.length; i++)
    for (let j = i + 1; j < odd.length; j++) {
      const x = match(odd.filter((_, k) => k !== i && k !== j));
      if (x.cost < best.cost) best = x;
    }
  return best;
}
export function make9(id, level, rng = Math.random) {
  const n = { easy: 4, medium: 5, hard: 6, fiit: 7 }[level];
  const vs = Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));
  let g;
  if (["hamilton", "conditions9"].includes(id)) {
    g = randomGraph(level, "types", rng);
    g = graph(
      g.vertices.slice(0, n),
      g.edges
        .filter(
          (e) =>
            g.vertices.indexOf(e.a) < n &&
            g.vertices.indexOf(e.b) < n &&
            e.a !== e.b,
        )
        .filter(
          (e, i, a) =>
            a.findIndex(
              (x) => [x.a, x.b].sort().join() === [e.a, e.b].sort().join(),
            ) === i,
        )
        .map((e) => [e.a, e.b]),
    );
    if (id === "hamilton") {
      for (let i = 1; i < n; i++)
        if (!Number.isFinite(weight(g, vs[i - 1], vs[i])))
          g.edges.push({ id: "h" + i, a: vs[i - 1], b: vs[i], weight: 1 });
      if (rng() < 0.6 && !Number.isFinite(weight(g, vs.at(-1), vs[0])))
        g.edges.push({ id: "close", a: vs.at(-1), b: vs[0], weight: 1 });
    }
  } else {
    const edges = [];
    for (let a = 0; a < n; a++)
      for (let b = a + 1; b < n; b++)
        if (!["eulerize", "semi9"].includes(id) || b === a + 1 || rng() < 0.2)
          edges.push([vs[a], vs[b], 0]);
    const weights = Array.from({ length: 60 }, (_, i) => i + 1);
    for (let i = weights.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [weights[i], weights[j]] = [weights[j], weights[i]];
    }
    edges.forEach((e, i) => (e[2] = weights[i]));
    g = graph(vs, edges, { weighted: id !== "complete9" });
  }
  const closed = rng() < 0.6,
    variant = Math.floor(rng() * 3),
    solutions =
      id === "hamilton"
        ? hamiltonPaths(g, closed)
        : id === "tsp9"
          ? hamiltonPaths(g)
          : [];
  if (id === "hamilton" && !solutions.length) return make9(id, level, rng);
  const optimum =
    id === "tsp9" ? Math.min(...solutions.map((r) => tourCost(g, r))) : null;
  const factorial = (x) => (x < 2 ? 1 : x * factorial(x - 1));
  return {
    id,
    g,
    closed,
    variant,
    solutions,
    optimum,
    number:
      id === "complete9"
        ? [(n * (n - 1)) / 2, n - 1, factorial(n - 1) / 2][variant]
        : optimum,
    optimalPair: ["eulerize", "semi9"].includes(id)
      ? pairing(g, id === "semi9")
      : null,
  };
}
export function initial9() {
  return {
    used: [],
    route: [],
    copies: [],
    results: [],
    cost: 0,
    done: false,
    phase: "first",
    cycle: [],
  };
}
function feasible(g, used, e) {
  const selected = g.edges.filter((x) => used.includes(x.id));
  if (selected.some((x) => x.id === e.id)) return "Táto hrana je už vybraná.";
  const dg = (v) => selected.filter((x) => x.a === v || x.b === v).length;
  if (dg(e.a) >= 2 || dg(e.b) >= 2)
    return `Hrana ${e.a}–${e.b} by vytvorila stupeň 3 vo vrchole ${dg(e.a) >= 2 ? e.a : e.b}.`;
  const reaches = new Set([e.a]);
  let more = true;
  while (more) {
    more = false;
    for (const x of selected)
      if (reaches.has(x.a) !== reaches.has(x.b)) {
        reaches.add(x.a);
        reaches.add(x.b);
        more = true;
      }
  }
  if (reaches.has(e.b) && used.length !== g.vertices.length - 1)
    return `Hrana ${e.a}–${e.b} by uzavrela cyklus pred zahrnutím všetkých vrcholov.`;
  return null;
}
export function action9(q, old, vs) {
  const s = structuredClone(old),
    g = q.g,
    id = q.id;
  const fail = (error) => ({ error });
  if (s.done) return fail("Príklad je už hotový.");
  if (
    ["eulerize", "semi9", "cheap9"].includes(id) ||
    (id === "insert9" && ["first", "second"].includes(s.phase))
  ) {
    const [a, b] = vs,
      e = g.edges.find(
        (e) => (e.a === a && e.b === b) || (e.a === b && e.b === a),
      );
    if (!e)
      return fail(
        `Medzi ${a} a ${b} nie je hrana. Duplikovať alebo vybrať môžeš iba existujúcu hranu.`,
      );
    if (["eulerize", "semi9"].includes(id)) {
      s.copies.push(e.id);
      s.cost += e.weight;
      return { state: s };
    }
    if (id === "cheap9") {
      const invalid = feasible(g, s.used, e);
      if (invalid) return fail(invalid);
      const choices = g.edges.filter((e) => !feasible(g, s.used, e));
      const min = Math.min(...choices.map((e) => e.weight));
      if (e.weight !== min) {
        const better = choices.find((e) => e.weight === min);
        return fail(
          `${a}–${b} stojí ${e.weight}, ale prípustná hrana ${better.a}–${better.b} stojí iba ${min}.`,
        );
      }
      s.used.push(e.id);
      s.cost += e.weight;
      s.done = s.used.length === g.vertices.length;
      return { state: s };
    }
    const choices = g.edges.filter(
      (e) =>
        s.phase === "first" ||
        (!s.used.includes(e.id) &&
          s.route.includes(e.a) !== s.route.includes(e.b)),
    );
    const min = Math.min(...choices.map((e) => e.weight));
    if (e.weight !== min || !choices.includes(e))
      return fail(
        `V tejto fáze vyber najlacnejšiu ${s.phase === "first" ? "hranu grafu" : "hranu incidentnú s prvou hranou do tretieho vrcholu"}. Minimum je ${min}, hrana ${a}–${b} má váhu ${e.weight}.`,
      );
    if (s.phase === "first") {
      s.route = [a, b];
      s.used = [e.id];
      s.phase = "second";
    } else {
      const x = s.route.includes(a) ? b : a;
      s.route = [...s.route, x, s.route[0]];
      s.used = s.route
        .slice(1)
        .map(
          (v, i) =>
            g.edges.find(
              (e) =>
                (e.a === v && e.b === s.route[i]) ||
                (e.b === v && e.a === s.route[i]),
            ).id,
        );
      s.phase = "outside";
      s.cost = tourCost(g, s.route);
      s.done = s.route.length === g.vertices.length + 1;
    }
    return { state: s };
  }
  const v = vs[0];
  if (!g.vertices.includes(v)) return fail("Zadaj vrchol z grafu.");
  if (["nn9", "rnn9"].includes(id)) {
    if (!s.route.length) {
      const expected = g.vertices[s.results.length];
      if (id === "rnn9" && v !== expected)
        return fail(`Tento beh začína vo vrchole ${expected}.`);
      s.route = [v];
      return { state: s };
    }
    const at = s.route.at(-1),
      left = g.vertices.filter((v) => !s.route.includes(v));
    if (!left.includes(v))
      return fail(`Vrchol ${v} si v tomto behu už navštívil.`);
    const min = Math.min(...left.map((x) => weight(g, at, x)));
    if (weight(g, at, v) !== min)
      return fail(
        `Z ${at} do ${v} je cena ${weight(g, at, v)}. Najbližší nenavštívený vrchol je ${left.find((x) => weight(g, at, x) === min)} s cenou ${min}.`,
      );
    s.route.push(v);
    s.used.push(
      g.edges.find(
        (e) => (e.a === at && e.b === v) || (e.b === at && e.a === v),
      ).id,
    );
    if (s.route.length === g.vertices.length) {
      const last = s.route.at(-1),
        first = s.route[0];
      s.used.push(
        g.edges.find(
          (e) =>
            (e.a === last && e.b === first) || (e.b === last && e.a === first),
        ).id,
      );
      s.route.push(s.route[0]);
      s.cost = tourCost(g, s.route);
      if (id === "nn9") s.done = true;
      else {
        s.results.push({ route: s.route, cost: s.cost });
        s.done = s.results.length === g.vertices.length;
        if (!s.done) {
          s.route = [];
          s.used = [];
        }
      }
    }
    return { state: s };
  }
  if (id === "insert9") {
    const cycle = s.route.slice(0, -1);
    if (s.phase === "outside") {
      const pairs = cycle.flatMap((y) =>
          g.vertices
            .filter((x) => !cycle.includes(x))
            .map((x) => ({ x, y, w: weight(g, y, x) })),
        ),
        min = Math.min(...pairs.map((p) => p.w)),
        chosen = pairs.find((p) => p.x === v && p.w === min);
      if (!chosen)
        return fail(
          `Najlacnejšia hrana z cyklu do nového vrcholu má cenu ${min}; vrchol ${v} nie je jej vonkajším koncom.`,
        );
      s.x = v;
      s.y = chosen.y;
      s.phase = "splice";
      return { state: s };
    }
    const i = cycle.indexOf(s.y),
      neighbors = [
        cycle[(i + cycle.length - 1) % cycle.length],
        cycle[(i + 1) % cycle.length],
      ],
      delta = (z) =>
        weight(g, s.y, s.x) + weight(g, s.x, z) - weight(g, s.y, z),
      min = Math.min(...neighbors.map(delta));
    if (!neighbors.includes(v) || delta(v) !== min)
      return fail(
        `Pre Y=${s.y}, X=${s.x}: ${neighbors.map((z) => `Z=${z}: ${weight(g, s.y, s.x)}+${weight(g, s.x, z)}−${weight(g, s.y, z)}=${delta(z)}`).join("; ")}. Vyber suseda s najnižším prírastkom.`,
      );
    const j = cycle.indexOf(v),
      insert = (i + 1) % cycle.length === j ? i + 1 : j + 1;
    cycle.splice(insert, 0, s.x);
    s.route = [...cycle, cycle[0]];
    s.cost = tourCost(g, s.route);
    s.phase = "outside";
    s.done = cycle.length === g.vertices.length;
    s.used = s.route
      .slice(1)
      .map(
        (v, i) =>
          g.edges.find(
            (e) =>
              (e.a === v && e.b === s.route[i]) ||
              (e.b === v && e.a === s.route[i]),
          ).id,
      );
    return { state: s };
  }
  return fail("Neplatný krok.");
}
export function hint9(q, s) {
  const id = q.id;
  if (["eulerize", "semi9"].includes(id)) {
    // A correction hint follows the cheapest plan from the current parity.
    const current = withCopies(q, s),
      p = pairing(current, id === "semi9"),
      e = current.edges.find((e) => e.id === p.edges[0]);
    return e ? [e.a, e.b] : null;
  }
  if (id === "cheap9") {
    const e = q.g.edges
      .filter((e) => !feasible(q.g, s.used, e))
      .sort((a, b) => a.weight - b.weight)[0];
    return e ? [e.a, e.b] : null;
  }
  if (id === "insert9" && ["first", "second"].includes(s.phase)) {
    const e = q.g.edges
      .filter(
        (e) =>
          s.phase === "first" ||
          (!s.used.includes(e.id) &&
            s.route.includes(e.a) !== s.route.includes(e.b)),
      )
      .sort((a, b) => a.weight - b.weight)[0];
    return [e.a, e.b];
  }
  for (const v of q.g.vertices) if (!action9(q, s, [v]).error) return [v];
  return null;
}
export function withCopies(q, s) {
  return {
    ...q.g,
    edges: [
      ...q.g.edges,
      ...s.copies.map((id, i) => ({
        ...q.g.edges.find((e) => e.id === id),
        id: "copy" + i,
      })),
    ],
  };
}
export function finishEuler(q, s) {
  const g = withCopies(q, s),
    odd = g.vertices.filter((v) => degree(g, v) % 2),
    want = q.id === "semi9" ? 2 : 0;
  if (odd.length !== want)
    return {
      ok: false,
      text: `Nepárne vrcholy: ${odd.join(", ") || "žiadne"} (${odd.length}). Potrebujeme ${want}. Stupne: ${g.vertices.map((v) => `${v}=${degree(g, v)}`).join(", ")}.`,
    };
  if (s.cost !== q.optimalPair.cost)
    return {
      ok: false,
      text: `Parita je správna, ale duplikácia stojí ${s.cost}. Optimálna cena je ${q.optimalPair.cost}; skús sa vrátiť a zmeniť párovanie.`,
    };
  return {
    ok: true,
    text: `Správne: ${want} nepárnych vrcholov, cena duplikácie ${s.cost}.`,
  };
}
export function conditionAnswers(g) {
  const cuts = cutVertices(g);
  return {
    connected: components(g).length === 1,
    minDegree: g.vertices.every((v) => degree(g, v) >= 2),
    noCut: !cuts.length,
    dirac: g.vertices.every((v) => degree(g, v) >= g.vertices.length / 2),
    hamilton: !!hamiltonPaths(g).length,
  };
}
export const conditionLabels = {
  connected: "Graf je súvislý",
  minDegree: "Každý stupeň je aspoň 2",
  noCut: "Graf nemá artikuláciu",
  dirac: "Platí Diracova podmienka",
  hamilton: "Existuje Hamiltonovský cyklus",
};
