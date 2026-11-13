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
  eulerize: `### Ako postupovať
1. Over súvislosť a vypíš vrcholy s nepárnym stupňom.
2. Rozdeľ ich do dvojíc. Pre každú dvojicu nájdi **najlacnejšiu cestu** medzi jej vrcholmi; nemusí to byť priama hrana.
3. Porovnaj možné párovania a vyber to s najmenším súčtom cien ciest.
4. Duplikuj všetky hrany vybraných ciest. V aplikácii zadávaj každú hranu dvojicou jej vrcholov.
5. Skontroluj, že všetky stupne sú párne a cena duplikácie je najmenšia, potom stlač Skontrolovať.

### Prečo to funguje
Duplikácia cesty zmení paritu iba jej koncov: vnútorné vrcholy dostanú dve nové incidentné hrany, konce jednu. Spárovaním všetkých nepárnych vrcholov ich preto zmeníš na párne.

### Na čo si dať pozor
Duplikovať smieš iba existujúce hrany. Nestačí zvoliť najbližšiu dvojicu ako prvú: **najlacnejšie párovanie ako celok** môže byť iné. Ak je graf už eulerovský, netreba duplikovať nič.`,
  semi9: `### Ako postupovať
1. Vypíš nepárne vrcholy. Cieľom sú **presne dva**, ktoré budú začiatkom a koncom otvoreného ťahu.
2. Ak sú už dva, najlacnejšie riešenie je nič neduplikovať.
3. Ak ich je viac, vyber, ktoré dva necháš nepárne. Ostatné spáruj pomocou najlacnejších ciest.
4. Porovnaj možné ponechané dvojice aj párovania ostatných vrcholov. Vyber najmenšiu celkovú cenu a duplikuj hrany týchto ciest.
5. Ak nebol nepárny žiadny vrchol, duplikuj najlacnejšiu hranu medzi dvoma rôznymi vrcholmi: vytvorí práve dva nepárne konce.

### Prečo to funguje
Duplikovaná cesta zmení paritu svojich koncov, vnútorných vrcholov nie. Pri otvorenom eulerovskom ťahu nepotrebuje štart spárovaný príchod a koniec spárovaný odchod.

### Na čo si dať pozor
Neopravuj všetky nepárne vrcholy na párne: tým by vznikol eulerovský graf, ale tu zadanie vyžaduje práve dva nepárne vrcholy.`,
  hamilton: `### Ako postupovať
1. Prečítaj, či sa žiada **cesta alebo cyklus**.
2. Skladaj postupnosť susedných vrcholov. Každý vrchol navštív práve raz.
3. Ak ďalší krok vedie iba k už navštíveným vrcholom, vráť sa k skoršej voľbe a skús inú vetvu.
4. Pri ceste skonči po návšteve všetkých vrcholov. Pri cykle musí existovať aj hrana z posledného vrcholu do štartu; štart na konci zopakuj.

### Prečo to funguje
Hamiltonovská úloha pokrýva **vrcholy**. Nemusí použiť všetky hrany grafu. Systematické skúšanie a návrat pri slepej vetve umožnia nájsť platné poradie.

### Na čo si dať pozor
Nezamieňaj Hamiltonovskú úlohu s Eulerovou, ktorá pokrýva hrany. Pri cykle má každý vrchol dve použité susedné hrany. Vrchol nízkeho stupňa preto výrazne obmedzuje tvoje možnosti.`,
  conditions9: `### Ako postupovať
Každé tvrdenie over samostatne a označ všetky pravdivé.

1. Skontroluj súvislosť: dostaneš sa po hranách ku všetkým vrcholom?
2. Vypíš stupne a over, či je každý aspoň 2.
3. Hľadaj artikuláciu: ak odstrániš vrchol aj jeho hrany, zvýši sa počet oddelených komponentov?
4. Pre Diracovu podmienku over **deg(v) ≥ n/2 pre každý vrchol**. Pri nepárnom n musí celočíselný stupeň dosiahnuť najbližšie vyššie celé číslo.
5. Existenciu Hamiltonovského cyklu over konkrétnym cyklom alebo systematickým prehľadaním možností.

### Prečo to funguje
Hamiltonovský cyklus potrebuje súvislosť, dva susedné kroky pri každom vrchole a nemôže prechádzať medzi časťami iba cez jedinú artikuláciu. Diracova veta pre jednoduchý neorientovaný graf s n ≥ 3 dáva silnejšiu **postačujúcu** podmienku existencie cyklu.

### Na čo si dať pozor
Nutná podmienka nemusí stačiť. Ak Diracova podmienka neplatí, neznamená to, že cyklus neexistuje. Napríklad kružnica s piatimi vrcholmi má Hamiltonovský cyklus, hoci každý stupeň je iba 2.`,
  complete9: `### Ako postupovať
1. Zisti počet vrcholov n a prečítaj, či sa pýta na hrany, stupeň alebo počet cyklov.
2. Počet hrán Kₙ je **n(n−1)/2**.
3. Stupeň každého vrcholu je **n−1**.
4. Počet rôznych neorientovaných Hamiltonovských cyklov pre n ≥ 3 je **(n−1)!/2**.

### Prečo to funguje
Pri hranách každý vrchol spájaš so všetkými ostatnými, ale každú dvojicu započítaš dvakrát. Pri cykloch zafixuješ jeden štart, ostatných n−1 vrcholov usporiadaš a vydelíš dvomi za opačné smery toho istého cyklu.

### Príklad a kontrola
Pre K₅ dostaneš 10 hrán, stupeň 4 a 12 rôznych neorientovaných Hamiltonovských cyklov. Faktoriál znamená násobenie zostupných kladných celých čísel: 4! = 4 × 3 × 2 × 1.`,
  nn9: `### Ako postupovať
1. Vyber štartovací vrchol.
2. Z aktuálneho vrcholu porovnaj ceny iba do **ešte nenavštívených** vrcholov.
3. Prejdi do najlacnejšieho z nich a označ ho za navštívený.
4. Opakuj, kým neprejdeš všetky vrcholy. Nakoniec sa vráť do štartu; aplikácia tento návrat doplní automaticky.

### Prečo to funguje
Nearest neighbor robí vždy lokálne najlacnejší ďalší krok. Je rýchly, ale nevidí, aké drahé spojenia si môže nechať na koniec. Preto je to **heuristika, nie záruka najlacnejšieho cyklu**.

### Na čo si dať pozor
Nehľadaj najlacnejšiu hranu celého grafu: hľadaj ju z aktuálneho vrcholu. Nevracaj sa do už navštíveného vrcholu pred dokončením. Pri rovnakých najnižších cenách môžeš vybrať ktorúkoľvek z nich.`,
  rnn9: `### Ako postupovať
1. Spusť nearest neighbor z prvého určeného štartu.
2. V každom kroku zvoľ najlacnejší prechod do nenavštíveného vrcholu a po prejdení všetkých sa vráť do štartu.
3. Zapíš cenu celého cyklu vrátane návratu.
4. Zopakuj tento postup zo všetkých vrcholov. V aplikácii sa štarty skúšajú v poradí vrcholov.
5. Porovnaj ceny dokončených behov a vyber najmenšiu.

### Prečo to funguje
Výsledok nearest neighbor závisí od štartu. Opakovaním z rôznych štartov rozšíriš množinu skúšaných trás a môžeš nájsť lacnejší výsledok.

### Na čo si dať pozor
Pre nový beh zabudni na navštívené vrcholy predošlého behu. Porovnávaj **celkové ceny**, nie iba prvú hranu. Ani najlepší z týchto behov nemusí byť globálne optimum.`,
  cheap9: `### Ako postupovať
1. Zoraď si hrany celého grafu podľa ceny od najlacnejšej.
2. Vyber najlacnejšiu **prípustnú** nepoužitú hranu.
3. Hranu odmietni, ak by niektorému vrcholu dala tretí použitý koniec, alebo ak by uzavrela menší cyklus ešte pred zahrnutím všetkých vrcholov.
4. Pokračuj, až posledná hrana uzavrie jeden cyklus cez všetky vrcholy.

### Prečo to funguje
Hamiltonovský cyklus má v každom vrchole stupeň 2. Menší predčasný cyklus by sa už nedal pripojiť k ostatným vrcholom bez prekročenia tohto stupňa.

### Na čo si dať pozor
Na rozdiel od nearest neighbor nevyberáš iba z jedného aktuálneho vrcholu: rozhoduješ medzi hranami **celého grafu**. Najlacnejšia hrana môže byť zakázaná, preto vždy najprv over prípustnosť. Táto heuristika nezaručuje globálne optimum.`,
  insert9: `### Ako postupovať
1. Vyber najlacnejšiu hranu celého grafu.
2. Vyber najlacnejšiu ďalšiu hranu incidentnú s prvou, ktorá pripojí tretí vrchol. Aplikácia uzavrie počiatočný trojuholník.
3. Medzi hranami z hotového cyklu do nenavštívených vrcholov nájdi najlacnejšiu hranu **Y–X**. Vyber jej vonkajší vrchol X.
4. Nájdi oboch susedov Z vrcholu Y na cykle. Pre každého spočítaj **Δ = w(YX) + w(XZ) − w(YZ)**.
5. Vyber suseda Z s menším prírastkom. Hrana Y–Z sa nahradí dvojicou Y–X a X–Z.
6. Opakuj výber nového X a jeho vloženie, až cyklus obsahuje všetky vrcholy.

### Prečo to funguje
K pôvodnej cene pridáš dve nové hrany a odčítaš odstránenú. Vloženie medzi susedov zachová jediný uzavretý cyklus.

### Na čo si dať pozor
Používame **variant z prezentácie**: po výbere Y–X porovnávaš iba dvoch susedov Y. Nevyberáš ľubovoľnú najlepšiu hranu z celého cyklu ako pri inom variante cheapest insertion.`,
  tsp9: `### Ako postupovať
1. Zafixuj si jeden štartovací vrchol, aby si rovnaký cyklus nepočítal z rôznych začiatkov.
2. Skúšaj poradia ostatných vrcholov. Každé platné poradie musí prejsť všetkými vrcholmi práve raz a vrátiť sa do štartu.
3. Pre každú trasu spočítaj všetky váhy **vrátane poslednej hrany späť do štartu**.
4. Porovnaj výsledky a zadaj najmenšiu cenu. Pri neorientovanom grafe stačí jednu trasu a jej obrátenie posúdiť ako ten istý cyklus.

### Prečo to funguje
Brute force prejde všetky možnosti, a preto zaručí optimum. Nevýhodou je faktoriálny rast počtu poradí. Pri malých grafoch si pomôž priebežnou najlepšou cenou: ak rozpracovaná trasa pri kladných váhach už stojí viac, netreba ju dokončiť.

### Na čo si dať pozor
Najlacnejší výsledok jednej heuristiky ešte nemusí byť optimum. Nearest neighbor, opakovaný nearest neighbor, cheapest link a nearest insertion skúšajú iba časť možností.`,
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
