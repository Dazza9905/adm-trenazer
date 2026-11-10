import {
  isCv9,
  step9,
  make9,
  initial9,
  action9,
  hint9,
  withCopies,
  finishEuler,
  conditionAnswers,
  conditionLabels,
  hamiltonPaths,
  tourCost,
  cutVertices,
  weight,
} from "./cv9.js";
import { view9, matrix9 } from "./cv9-view.js";
import "beercss";
import "./style.css";
import { presentations, labels, walkLabels, theory } from "./content.js";
import {
  randomGraph,
  properties,
  degree,
  components,
  bipartition,
  oddCycle,
  directedCycle,
  walkInfo,
  incident,
  other,
  initialAlgorithm,
  algorithmAction,
  hintAction,
  isBridge,
} from "./graph.js";
const $ = (s) => document.querySelector(s);
const safe = (x) =>
  String(x).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let saved = {};
try {
  saved = JSON.parse(localStorage.getItem("adm-v1")) || {};
} catch {}
let level = ["easy", "medium", "hard", "fiit"].includes(saved.level)
    ? saved.level
    : "easy",
  theme = saved.theme || "dark",
  moduleId = "types",
  mode = "steps",
  menu = false,
  feedback = null,
  selected = [],
  answer = "",
  sequence = [],
  focusVertex = "",
  countVariant = 0,
  q9 = null,
  draft9 = [],
  matrixMode = true,
  g,
  history = [],
  cursor = 0,
  awarded = false,
  help = false;
let progress = saved.progress || {},
  streak = 0;
const modules = presentations.flatMap((p) => p.modules);
const presentation = () =>
  presentations.find((p) => p.modules.some((m) => m.id === moduleId));
const module = () => modules.find((m) => m.id === moduleId);
const algo = () => ["fleury", "hierholzer"].includes(moduleId);
const state = () => history[cursor];
function persist() {
  try {
    localStorage.setItem("adm-v1", JSON.stringify({ level, theme, progress }));
  } catch {}
}
function makeSequence() {
  let v = g.vertices[Math.floor(Math.random() * g.vertices.length)],
    seq = [v];
  for (let i = 0; i < 2 + Math.floor(Math.random() * 6); i++) {
    const choices = incident(g, v);
    if (!choices.length) break;
    v = other(choices[Math.floor(Math.random() * choices.length)], v);
    seq.push(v);
  }
  return seq;
}
function countTask() {
  const neighbors = [
    ...new Set(incident(g, focusVertex).map((e) => other(e, focusVertex))),
  ];
  const p = properties(g),
    parts = bipartition(g);
  const tasks = [
    {
      question: `Koľko rôznych susedov má vrchol ${focusVertex}?`,
      value: neighbors.length,
      explanation: `Susedia ${focusVertex}: ${neighbors.join(", ") || "žiadni"}. Násobné hrany nepridávajú ďalšieho suseda; pri slučke je vrchol vlastným susedom.`,
      hint: "Počítaj rôzne susedné vrcholy, nie hrany.",
    },
    {
      question: "Aký je súčet stupňov všetkých vrcholov?",
      value: 2 * g.edges.length,
      explanation: `${g.vertices.map((v) => degree(g, v)).join(" + ")} = ${2 * g.edges.length} = 2 × ${g.edges.length} hrán.`,
      hint: "Každá hrana má dva konce. Použi súčet stupňov = 2|E|.",
    },
    {
      question: `Koľko hrán je incidentných s vrcholom ${focusVertex}?`,
      value: incident(g, focusVertex).length,
      explanation: `Incidentné hrany: ${
        incident(g, focusVertex)
          .map((e) => e.a + "–" + e.b)
          .join(", ") || "žiadne"
      }. Slučku tu počítaj ako jednu hranu.`,
      hint: "Vyber hrany, ktorých koncovým vrcholom je označený vrchol. Každú hranu počítaj raz.",
    },
    {
      question: p.complete
        ? `Koľko hrán má zobrazený kompletný graf K${g.vertices.length}?`
        : p.completeBipartite
          ? `Koľko hrán má tento kompletný bipartitný graf?`
          : "Koľko hrán má tento graf?",
      value: g.edges.length,
      explanation: p.complete
        ? `${g.vertices.length} × ${g.vertices.length - 1} / 2 = ${g.edges.length}.`
        : p.completeBipartite
          ? `${parts[0].length} × ${parts[1].length} = ${g.edges.length}.`
          : `E má ${g.edges.length} prvkov. Slučka je jedna hrana a násobné hrany počítame osobitne.`,
      hint: p.complete
        ? "Použi vzorec n(n−1)/2."
        : p.completeBipartite
          ? "Vynásob veľkosti dvoch skupín."
          : "Počítaj aj slučky a jednotlivé násobné hrany.",
    },
  ];
  return tasks[countVariant];
}
function fresh() {
  if (isCv9(moduleId)) {
    q9 = make9(moduleId, level);
    g = q9.g;
    draft9 = [];
    selected = [];
    answer = "";
    feedback = null;
    awarded = false;
    history = [initial9()];
    cursor = 0;
    render();
    return;
  }
  countVariant = Math.floor(Math.random() * 4);
  g = randomGraph(level, moduleId);
  if (["walk", "cost"].includes(moduleId)) {
    g.directed = false;
    if (!g.edges.length) {
      fresh();
      return;
    }
    sequence = makeSequence();
    if (moduleId === "walk" && Math.random() < 0.25) {
      sequence = [...g.vertices.slice(0, 3)].sort(() => Math.random() - 0.5);
    }
    if (sequence.length < 2) {
      fresh();
      return;
    }
  }
  focusVertex = g.vertices[Math.floor(Math.random() * g.vertices.length)];
  selected = [];
  answer = "";
  feedback = null;
  awarded = false;
  history = [initialAlgorithm(g)];
  cursor = 0;
  render();
}
function success() {
  if (!awarded) {
    progress[moduleId] = (progress[moduleId] || 0) + 1;
    streak++;
    awarded = true;
    persist();
  }
}
function explain(key) {
  const p = properties(g),
    odd = g.vertices.filter((v) => degree(g, v) % 2),
    parts = bipartition(g),
    cs = components(g);
  switch (key) {
    case "connected":
      return cs.length === 1
        ? "Všetky vrcholy sú v jednej komponente."
        : `Graf má ${cs.length} komponenty: ${cs.map((c) => `{${c.join(", ")}}`).join(", ")}. Medzi nimi cesta neexistuje.`;
    case "simple": {
      const loop = g.edges.find((e) => e.a === e.b),
        seen = new Set();
      const duplicate = g.edges.find((e) => {
        const k = [e.a, e.b].sort().join(":");
        if (seen.has(k)) return true;
        seen.add(k);
        return false;
      });
      return loop
        ? `Vo vrchole ${loop.a} je slučka.`
        : duplicate
          ? `Medzi ${duplicate.a} a ${duplicate.b} sú násobné hrany.`
          : "Graf nemá slučky ani násobné hrany.";
    }
    case "complete": {
      const missing = g.vertices.flatMap((a, i) =>
        g.vertices
          .slice(i + 1)
          .filter(
            (b) =>
              !g.edges.some(
                (e) => (e.a === a && e.b === b) || (e.a === b && e.b === a),
              ),
          )
          .map((b) => `${a}–${b}`),
      );
      return p.complete
        ? `Každý pár vrcholov spája práve jedna hrana; spolu ${g.edges.length}.`
        : `${missing.length ? `Chýba napríklad hrana ${missing[0]}. ` : ""}${!p.simple ? "Graf navyše nie je jednoduchý." : ""}`;
    }
    case "bipartite":
    case "completeBipartite":
      return parts
        ? `Rozdelenie: {${parts[0].join(", ")}} a {${parts[1].join(", ")}}. ${p.completeBipartite ? "Každý vrchol prvej skupiny susedí s každým z druhej." : `Kompletný bipartitný graf musí byť jednoduchý a mať všetkých ${parts[0].length * parts[1].length} hrán medzi skupinami; tento má ${g.edges.length}.`}`
        : `Dvojfarebné rozdelenie neexistuje. Nepárny cyklus ${oddCycle(g).join(" → ")} má ${oddCycle(g).length - 1} hrán; pri striedaní dvoch farieb sa farby dostanú do konfliktu.`;
    case "euler":
    case "semi":
      return `Graf ${p.connected ? "je" : "nie je"} súvislý. Nepárne vrcholy: ${odd.length ? odd.map((v) => `${v} (${degree(g, v)})`).join(", ") : "žiadne"}. ${key === "euler" ? "Eulerovský vyžaduje všetky stupne párne." : "Semi-eulerovský vyžaduje presne dva nepárne vrcholy."}`;
    case "directed":
      return g.directed
        ? "Hrany majú šípky: smer A → B sa líši od B → A."
        : "Hrany nemajú šípky, prechádzať ich možno oboma smermi.";
    case "dag": {
      const cycle = directedCycle(g);
      return !g.directed
        ? "Graf nemá orientované hrany, preto ho neoznačujeme ako DAG."
        : cycle
          ? `Po šípkach sa dá vrátiť do štartu: ${cycle.join(" → ")}. Preto nejde o DAG.`
          : `Všetky šípky idú od abecedne skoršieho k neskoršiemu vrcholu (${g.vertices.join(", ")}); orientovaný cyklus nevznikne.`;
    }
    case "weighted":
      return g.weighted
        ? "Čísla na hranách sú ich váhy."
        : "Hrany nemajú priradené zobrazené váhy.";
  }
}
function check() {
  if (isCv9(moduleId)) {
    check9();
    return;
  }
  let details = [],
    correct = true;
  if (moduleId === "types" || moduleId === "walk") {
    let expected = moduleId === "types" ? properties(g) : walkInfo(g, sequence);
    const keys =
      moduleId === "types"
        ? Object.keys(labels).filter(
            (k) =>
              !g.directed ||
              !["euler", "semi", "complete", "completeBipartite"].includes(k),
          )
        : Object.keys(walkLabels);
    for (const key of keys) {
      if (selected.includes(key) !== expected[key]) {
        correct = false;
        details.push(
          `${labels[key] || walkLabels[key]}: ${expected[key] ? "áno" : "nie"}. ${moduleId === "types" ? explain(key) : walkExplanation(key, expected)}`,
        );
      }
    }
  } else if (moduleId === "degree") {
    const n = degree(g, focusVertex);
    correct = answer !== "" && Number(answer) === n;
    details = [
      `deg(${focusVertex}) = ${n}. Incidentné hrany: ${
        incident(g, focusVertex)
          .map((e) => `${e.a}–${e.b}${e.a === e.b ? " (slučka: +2)" : " (+1)"}`)
          .join(", ") || "žiadne (+0)"
      }.`,
    ];
  } else if (moduleId === "counts") {
    const task = countTask();
    correct = answer !== "" && Number(answer) === task.value;
    details = [task.explanation];
  } else if (moduleId === "cost") {
    const info = walkInfo(g, sequence);
    correct = answer !== "" && Number(answer) === info.cost;
    const weights = sequence
      .slice(1)
      .map(
        (v, i) =>
          g.edges.find(
            (e) =>
              (e.a === sequence[i] && e.b === v) ||
              (e.b === sequence[i] && e.a === v),
          )?.weight,
      );
    details = [
      `${sequence.join(" → ")}: ${weights.join(" + ")} = ${info.cost}. Každý prechod hrany sa započítava.`,
    ];
  } else {
    const seq = answer
      .toUpperCase()
      .split(/[\s,;→\-]+/)
      .filter(Boolean);
    const info = walkInfo(g, seq);
    correct =
      info.trail &&
      info.used.length === g.edges.length &&
      (moduleId !== "hierholzer" || info.circuit);
    if (!correct)
      details.push(
        info.missing.length
          ? `Neexistujúce prechody: ${info.missing.join(", ")}.`
          : info.repeated.length
            ? `Opakované hrany: ${info.repeated.join(", ")}.`
            : `Použil si ${new Set(info.used).size} z ${g.edges.length} hrán. ${moduleId === "hierholzer" ? "Okruh musí skončiť v štarte." : ""}`,
      );
    if (correct && moduleId === "fleury") {
      let s = initialAlgorithm(g);
      for (const v of seq) {
        const action =
          s.at === null
            ? { type: "vertex", v }
            : {
                type: "edge",
                id: incident(g, s.at, s.used).find((e) => other(e, s.at) === v)
                  ?.id,
              };
        const r = algorithmAction(g, s, action, "fleury");
        if (r.error) {
          correct = false;
          details = [r.error];
          break;
        }
        s = r.state;
      }
    }
  }
  feedback = {
    ok: correct,
    title: correct ? "Presne tak. Dobrá práca!" : "Ešte to skús upraviť.",
    details: correct
      ? ["Odpoveď je správna. Môžeš pokračovať ďalším príkladom."]
      : details,
  };
  if (correct) success();
  else streak = 0;
  render();
}
function walkExplanation(key, info) {
  if (!info.walk)
    return `Prechody ${info.missing.join(", ")} nie sú hranami grafu.`;
  if (key === "walk")
    return `Každý prechod v ${sequence.join(" → ")} vedie po hrane.`;
  if (key === "trail")
    return info.repeated.length
      ? `Opakuje sa hrana ${info.repeated[0]}.`
      : "Žiadna hrana sa neopakuje.";
  if (key === "path")
    return new Set(sequence).size < sequence.length
      ? `Vrchol ${sequence.find((v, i) => sequence.indexOf(v) !== i)} sa opakuje.`
      : "Žiadny vrchol sa neopakuje.";
  return `Štart je ${sequence[0]}, koniec ${sequence.at(-1)}. ${info.repeated.length ? "Navyše sa opakujú hrany." : "Hrany sa neopakujú."}`;
}
function perform(action, hint = false) {
  if (
    action.type === "vertex" &&
    state().at !== null &&
    !(moduleId === "hierholzer" && !state().cycle.length)
  ) {
    const matches = g.edges.filter(
      (e) =>
        (e.a === state().at && e.b === action.v) ||
        (e.b === state().at && e.a === action.v),
    );
    const edge = matches.find((e) => !state().used.includes(e.id));
    if (!edge) {
      feedback = {
        ok: false,
        title: "Tento krok zatiaľ neplatí.",
        details: [
          matches.length
            ? `Všetky hrany medzi ${state().at} a ${action.v} si už použil.`
            : `Vrchol ${state().at} nie je spojený s vrcholom ${action.v}.`,
        ],
      };
      render();
      return;
    }
    action = { type: "edge", id: edge.id };
  }
  const r = algorithmAction(g, state(), action, moduleId);
  if (r.error) {
    feedback = {
      ok: false,
      title: "Tento krok zatiaľ neplatí.",
      details: [r.error],
    };
  } else {
    history = history.slice(0, cursor + 1);
    history.push(r.state);
    cursor++;
    feedback = r.state.done
      ? {
          ok: true,
          title: "Všetky hrany sú prejdené!",
          details: [`Výsledok: ${r.state.route.join(" → ")}`],
        }
      : r.note || hint
        ? {
            ok: true,
            title: hint ? "Nápoveda doplnila jeden krok." : "Cyklus vložený.",
            details: [r.note || `Pokračujeme vo vrchole ${r.state.at}.`],
          }
        : null;
    if (r.state.done) success();
  }
  render();
}
function hint() {
  if (isCv9(moduleId)) {
    help9();
    return;
  }
  if (algo() && mode === "steps") {
    if (!state().done) perform(hintAction(g, state(), moduleId), true);
    return;
  }
  if (algo()) {
    let s = initialAlgorithm(g);
    const parts = answer
      .toUpperCase()
      .split(/[\s,;→\-]+/)
      .filter(Boolean);
    for (const v of parts) {
      const action =
        s.at === null
          ? { type: "vertex", v }
          : {
              type: "edge",
              id: incident(g, s.at, s.used).find((e) => other(e, s.at) === v)
                ?.id,
            };
      const r = algorithmAction(g, s, action, "fleury");
      if (r.error) {
        feedback = {
          ok: false,
          title: "Najprv oprav zadaný postup.",
          details: [r.error],
        };
        render();
        return;
      }
      s = r.state;
    }
    if (!s.done) {
      const a = hintAction(g, s, "fleury");
      const r = algorithmAction(g, s, a, "fleury");
      answer = r.state.route.join(" → ");
      feedback = { ok: true, title: "Doplnený jeden krok", details: [answer] };
    }
  } else {
    const info = walkInfo(g, sequence);
    feedback = {
      ok: true,
      title: "Malé nasmerovanie",
      details: [
        moduleId === "counts"
          ? countTask().hint
          : moduleId === "types"
            ? `${explain("connected")} Stupne: ${g.vertices.map((v) => `${v}: ${degree(g, v)}`).join(", ")}.`
            : moduleId === "degree"
              ? `Pri ${focusVertex} nájdeš ${incident(g, focusVertex).length} hrán. Každú slučku počítaj dvakrát.`
              : moduleId === "walk"
                ? `Porovnaj opakovania: ${info.repeated.length ? `hrana ${info.repeated[0]} sa opakuje` : "žiadna hrana sa neopakuje"}. Štart ${sequence[0]}, koniec ${sequence.at(-1)}.`
                : "Prejdi postupne zadanú sekvenciu a spočítaj čísla na hranách. Opakované prechody započítaj znova.",
      ],
    };
  }
  render();
}
function graphSVG() {
  const n = g.vertices.length,
    pos = Object.fromEntries(
      g.vertices.map((v, i) => [
        v,
        {
          x: 240 + 165 * Math.cos((2 * Math.PI * i) / n - Math.PI / 2),
          y: 215 + 155 * Math.sin((2 * Math.PI * i) / n - Math.PI / 2),
        },
      ]),
    );
  const s = state();
  let out =
    '<svg viewBox="0 -35 480 485" role="group" aria-label="Interaktívny graf"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/></marker></defs>';
  for (const e of g.edges) {
    const a = pos[e.a],
      b = pos[e.b],
      same = g.edges.filter(
        (x) => [x.a, x.b].sort().join() === [e.a, e.b].sort().join(),
      ),
      idx = same.indexOf(e),
      offset = (idx - (same.length - 1) / 2) * 55 * (e.a < e.b ? 1 : -1);
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1,
      mx = (a.x + b.x) / 2 - ((b.y - a.y) / len) * offset,
      my = (a.y + b.y) / 2 + ((b.x - a.x) / len) * offset;
    const dx = (b.x - a.x) / len,
      dy = (b.y - a.y) / len;
    const d =
      e.a === e.b
        ? `M ${a.x - 12} ${a.y - 16} C ${a.x - 80} ${a.y - 85} ${a.x + 80} ${a.y - 85} ${a.x + 12} ${a.y - 16}`
        : `M ${a.x + dx * 24} ${a.y + dy * 24} Q ${mx} ${my} ${b.x - dx * 27} ${b.y - dy * 27}`;
    const used =
      ((algo() && mode === "steps") || isCv9(moduleId)) &&
      s.used.includes(e.id);
    out += `<g class="edge ${used ? "used" : ""}"><path class="edge-hit" d="${d}"/><path class="edge-line" d="${d}" ${g.directed ? 'marker-end="url(#arrow)"' : ""}/>${g.weighted ? `<circle cx="${e.a === e.b ? a.x : mx}" cy="${e.a === e.b ? a.y - 60 : my}" r="14" class="weight-bg"/><text x="${e.a === e.b ? a.x : mx}" y="${(e.a === e.b ? a.y - 60 : my) + 5}" class="weight">${e.weight}</text>` : ""}</g>`;
  }
  for (const v of g.vertices) {
    const p = pos[v],
      active =
        (["degree", "counts"].includes(moduleId) && v === focusVertex) ||
        (algo() && mode === "steps" && s.at === v);
    out += `<g class="vertex ${active ? "current" : ""}" data-vertex="${v}" tabindex="0" role="button" aria-label="Vrchol ${v}"><circle cx="${p.x}" cy="${p.y}" r="24"/><text x="${p.x}" y="${p.y + 6}">${v}</text></g>`;
  }
  return out + "</svg>";
}
function render() {
  if (location.hash === "#nastavenia") {
    renderSettings();
    return;
  }
  if (isCv9(moduleId))
    g = ["eulerize", "semi9"].includes(moduleId)
      ? withCopies(q9, state())
      : q9.g;
  document.body.className = theme;
  const m = module(),
    s = state(),
    total = Object.values(progress).reduce((a, b) => a + b, 0);
  $("#app").innerHTML =
    `<header class="topbar"><button class="circle transparent menu-toggle" id="menu" aria-label="Otvoriť menu">☰</button><a class="brand" href="#"><span class="brand-mark">a<span>↗</span></span><span>ADM<span class="brand-sub">tréningový priestor</span></span></a><div class="header-end"><a class="settings-link" href="#nastavenia" aria-label="Nastavenia">⚙</a><span class="saved"><span class="status-dot"></span> Pokrok uložený v zariadení</span><button id="theme" class="circle tonal" aria-label="Prepnúť svetlý a tmavý režim">${theme === "dark" ? "☀" : "☾"}</button></div></header><div class="layout"><aside class="sidebar ${menu ? "open" : ""}"><span class="eyebrow nav-label">PREZENTÁCIE</span>${presentations.map((p) => `<details class="presentation-folder" open><summary><span class="presentation-icon">▤</span><span>${p.title}<small>${p.subtitle}</small></span></summary><nav class="module-nav">${p.modules.map((x) => `<button class="nav-item ${moduleId === x.id ? "active" : ""}" data-module="${x.id}"><span class="nav-icon">${x.icon}</span><span>${x.title}</span>${progress[x.id] ? `<span class="nav-count">${progress[x.id]}</span>` : ""}</button>`).join("")}</nav></details>`).join("")}<div class="sidebar-bottom"><div class="progress-label"><span>Každý príklad sa počíta</span><b>${total}</b></div><div class="progress-track"><span style="width:${Math.min(100, total * 5)}%"></span></div><small>správne vyriešených príkladov</small><a href="${presentation().source}" target="_blank" rel="noopener" class="source-link">↗ Otvoriť prezentáciu</a></div></aside>${menu ? '<button class="scrim" id="close-menu" aria-label="Zatvoriť menu"></button>' : ""}<main><div class="page-heading"><div><h1>${m.title}</h1></div><span class="topic-badge">${m.icon}</span></div><div class="toolbar"><div class="difficulty"><span>Obťažnosť</span><div class="segments" aria-label="Obťažnosť">${["easy", "medium", "hard", "fiit"].map((l) => `<button data-level="${l}" class="${level === l ? "chosen" : ""}" aria-pressed="${level === l}">${{ easy: "Easy", medium: "Med", hard: "Hard", fiit: "FIIT ☠" }[l]}</button>`).join("")}</div></div><button id="new" class="border round">↻ Nový príklad</button></div><section class="task-card"><h2>${isCv9(moduleId) ? prompt9() : moduleId === "counts" ? countTask().question : m.prompt}</h2>${algo() ? `<div class="mode-switch"><button data-mode="steps" class="${mode === "steps" ? "chosen" : ""}">Krok za krokom</button><button data-mode="whole" class="${mode === "whole" ? "chosen" : ""}">Celý výsledok</button></div>` : ""}</section><div class="workspace ${algo() && mode === "steps" ? "algorithm-steps" : ""}"><section class="graph-card"><div class="panel-heading"><span>PRACOVNÁ PLOCHA</span><span class="graph-meta">${g.vertices.length} vrcholov · ${g.edges.length} hrán</span></div>${isCv9(moduleId) && g.weighted && matrixMode ? matrix9(g) : graphSVG()}${isCv9(moduleId) && g.weighted ? `<button id="v9-matrix" class="matrix-toggle border">${matrixMode ? "Zobraziť graf" : "Matica váh"}</button>` : ""}<div class="graph-caption"><span class="legend-dot"></span>${algo() && mode === "steps" ? "Vyber ďalší vrchol v grafe" : moduleId === "degree" ? `Zvýraznený vrchol: ${focusVertex}` : "Vrcholy v kruhu, možnosti na dosah."}</div><details class="notation"><summary>Zápis grafu G = (V, E)</summary><p>V = {${g.vertices.join(", ")}}</p><p>E = {${g.edges.map((e) => `${e.a}${g.directed ? "→" : "–"}${e.b}${g.weighted ? ` [${e.weight}]` : ""}`).join(", ")}}</p><small>Násobné hrany sú v zápise uvedené samostatne.</small></details></section><section class="answer-card"><div class="panel-heading"><span>${algo() ? "TVOJ POSTUP" : "TVOJA ODPOVEĎ"}</span><span class="tiny-pill">${algo() ? "↝" : "✎"}</span></div>${["walk", "cost"].includes(moduleId) ? `<div class="sequence-label">Zadaná prechádzka</div><div class="sequence">${sequence.join(" → ")}</div>` : ""}${
      isCv9(moduleId) && !["complete9", "tsp9"].includes(moduleId)
        ? view9(q9, s, {
            draft: draft9,
            answer,
            selected,
            cursor,
            length: history.length,
          })
        : ["types", "walk"].includes(moduleId)
          ? `<p class="answer-intro">Môže platiť viac odpovedí súčasne.</p><div class="options">${Object.entries(
              moduleId === "types" ? labels : walkLabels,
            )
              .filter(
                ([k]) =>
                  !g.directed ||
                  !["euler", "semi", "complete", "completeBipartite"].includes(
                    k,
                  ),
              )
              .map(
                ([k, v], i) =>
                  `<button class="option ${selected.includes(k) ? "selected" : ""}" data-option="${k}" aria-pressed="${selected.includes(k)}"><span class="option-letter">${String.fromCharCode(65 + i)}</span><span>${v}</span><span class="checkbox">${selected.includes(k) ? "✓" : ""}</span></button>`,
              )
              .join(
                "",
              )}</div>${g.directed && moduleId === "types" ? '<p class="muted">Pri šípkach hodnotíme súvislosť a bipartitnosť po zanedbaní smeru. Kompletné a eulerovské grafy trénujeme na neorientovaných príkladoch.</p>' : ""}`
          : algo() && mode === "steps"
            ? `<p class="answer-intro">${s.done ? "Hotovo. Prejdená je každá hrana." : s.at === null ? "Začni výberom štartovacieho vrcholu." : moduleId === "hierholzer" && !s.cycle.length ? "Vyber vrchol okruhu s nepoužitou hranou." : `Si vo vrchole ${s.at}. Vyber ďalší vrchol.`}</p><div class="sequence">${s.route.join(" → ") || "Tvoj postup sa začne tu…"}</div>${s.cycle.length ? `<div class="cycle-box"><small>Rozpracovaný cyklus</small><p>${s.cycle.join(" → ")}</p></div>` : ""}<div class="step-progress"><span>Použité hrany</span><b>${s.used.length} / ${g.edges.length}</b></div><progress value="${s.used.length}" max="${g.edges.length}"></progress><div class="step-choices" style="--vertex-columns: ${Math.ceil(g.vertices.length / 2)}">${g.vertices
                .map(
                  (v) =>
                    `<button class="tonal" data-start="${v}">${v}</button>`,
                )
                .join(
                  "",
                )}</div><div class="history-controls"><button id="back" class="border" ${cursor === 0 ? "disabled" : ""}>← Späť</button><span>Krok ${cursor}</span><button id="forward" class="border" ${cursor === history.length - 1 ? "disabled" : ""}>Ďalej →</button></div><label class="history-label">Návrat k vypracovanému kroku<select id="history">${history.map((_, i) => `<option value="${i}" ${cursor === i ? "selected" : ""}>Krok ${i}</option>`).join("")}</select></label>`
            : `<label class="input-label" for="answer">${moduleId === "counts" ? "Výsledný počet" : moduleId === "degree" ? `Stupeň vrcholu ${focusVertex}` : moduleId === "cost" ? "Cena prechádzky" : "Postupnosť vrcholov oddelená medzerou"}</label><input id="answer" class="answer-input" type="text" inputmode="none" autocomplete="off" value="${safe(answer)}" placeholder="${algo() ? "A → B → C…" : "Tvoja odpoveď"}"><div class="keypad">${(algo() ? [...g.vertices, "→", "⌫", "AC", "↵"] : ["1", "2", "3", "⌫", "4", "5", "6", "AC", "7", "8", "9", "✦", "←", "0", "→", "↵"]).map((k) => `<button data-key="${k}" class="${["⌫", "↵"].includes(k) ? "accent-key" : ""}" aria-label="${k === "⌫" ? "Vymazať posledný znak" : k === "AC" ? "Vymazať odpoveď" : k === "↵" ? "Skontrolovať odpoveď" : k === "✦" ? "Nápoveda" : k}">${k}</button>`).join("")}</div>${algo() ? '<p class="muted">Klikanie na vrcholy tiež dopĺňa zápis. Celý výsledok kontroluje hrany; skladanie cyklov precvičíš v krokovom režime.</p>' : ""}`
    }${feedback ? `<div class="feedback ${feedback.ok ? "positive" : "negative"}" role="status"><button id="dismiss-feedback" class="feedback-dismiss" aria-label="Zavrieť vysvetlenie">×</button><b>${feedback.ok ? "✓" : "↳"} ${feedback.title}</b>${feedback.details.map((d) => `<p>${safe(d)}</p>`).join("")}</div>` : ""}<div class="answer-actions">${!algo() || mode === "whole" ? '<button id="check" class="primary round">Skontrolovať <span>↗</span></button>' : s.done ? '<button id="next" class="primary round">Ďalší príklad ↗</button>' : ""}<button id="hint" class="border round">✦ Nápoveda</button></div>${awarded && !algo() ? '<button id="next" class="transparent next-link">Ďalší príklad →</button>' : ""}</section></div><details class="theory" ${help ? "open" : ""}><summary>◉ Malý ťahák <span>Definície a pravidlá z prezentácie</span></summary><p>${theory[moduleId]}</p></details><footer>Učenie po malých krokoch. <span>ADM / Cvičenie 8 · ${total} vyriešených</span></footer></main></div>`;
  bind();
}
function bind() {
  document
    .querySelectorAll("[data-v9]")
    .forEach((el) => (el.onclick = () => vertex9(el.dataset.v9)));
  const dismiss = document.querySelector("#dismiss-feedback");
  if (dismiss)
    dismiss.onclick = () => {
      feedback = null;
      render();
    };
  const click = (s, f) => {
    const el = $(s);
    if (el) el.onclick = f;
  };
  click("#menu", () => {
    menu = !menu;
    render();
  });
  click("#close-menu", () => {
    menu = false;
    render();
  });
  click("#theme", () => {
    theme = theme === "light" ? "dark" : "light";
    persist();
    render();
  });
  click("#v9-matrix", () => {
    matrixMode = !matrixMode;
    render();
  });
  click("#v9-delete", () => {
    answer = answer.split(" → ").slice(0, -1).join(" → ");
    render();
  });
  click("#v9-clear", () => {
    answer = "";
    render();
  });
  click("#new", fresh);
  click("#next", fresh);
  click("#check", check);
  click("#hint", hint);
  document.querySelectorAll("[data-module]").forEach(
    (el) =>
      (el.onclick = () => {
        moduleId = el.dataset.module;
        menu = false;
        fresh();
      }),
  );
  document.querySelectorAll("[data-level]").forEach(
    (el) =>
      (el.onclick = () => {
        level = el.dataset.level;
        persist();
        fresh();
      }),
  );
  document.querySelectorAll("[data-mode]").forEach(
    (el) =>
      (el.onclick = () => {
        mode = el.dataset.mode;
        feedback = null;
        render();
      }),
  );
  document.querySelectorAll("[data-option]").forEach(
    (el) =>
      (el.onclick = () => {
        const k = el.dataset.option;
        selected = selected.includes(k)
          ? selected.filter((x) => x !== k)
          : [...selected, k];
        feedback = null;
        render();
      }),
  );
  document
    .querySelectorAll("[data-start]")
    .forEach(
      (el) =>
        (el.onclick = () => perform({ type: "vertex", v: el.dataset.start })),
    );
  document.querySelectorAll("[data-vertex]").forEach((el) => {
    el.onclick = () => {
      if (algo() && mode === "steps")
        perform({ type: "vertex", v: el.dataset.vertex });
      else if (isCv9(moduleId)) vertex9(el.dataset.vertex);
      else if (algo()) {
        answer += (answer ? " → " : "") + el.dataset.vertex;
        render();
      }
    };
    el.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.onclick();
      }
    };
  });
  click("#back", () => {
    cursor--;
    draft9 = [];
    feedback = null;
    render();
  });
  click("#forward", () => {
    cursor++;
    draft9 = [];
    feedback = null;
    render();
  });
  if ($("#history"))
    $("#history").onchange = (e) => {
      cursor = Number(e.target.value);
      feedback = null;
      render();
    };
  const input = $("#answer");
  if (input) {
    input.oninput = () => (answer = input.value);
    input.onkeydown = (e) => {
      if (e.key === "Enter") check();
    };
    document.querySelectorAll("[data-key]").forEach(
      (el) =>
        (el.onclick = () => {
          const k = el.dataset.key;
          if (k === "↵") {
            check();
            return;
          }
          if (k === "✦") {
            hint();
            return;
          }
          const start = input.selectionStart ?? answer.length,
            end = input.selectionEnd ?? start;
          if (k === "←" || (k === "→" && !algo())) {
            input.focus();
            const i = Math.max(
              0,
              Math.min(answer.length, start + (k === "←" ? -1 : 1)),
            );
            input.setSelectionRange(i, i);
            return;
          }
          let insert = k === "AC" ? "" : k === "⌫" ? "" : k === "→" ? " → " : k;
          if (
            algo() &&
            g.vertices.includes(k) &&
            start === end &&
            /[A-Z]$/.test(answer.slice(0, start))
          )
            insert = " → " + k;
          let a = start,
            b = end;
          if (k === "⌫" && a === b) a = Math.max(0, a - 1);
          answer =
            k === "AC" ? "" : answer.slice(0, a) + insert + answer.slice(b);
          input.value = answer;
          input.focus({ preventScroll: true });
          const at = k === "AC" ? 0 : a + insert.length;
          input.setSelectionRange(at, at);
        }),
    );
  }
  $(".theory").ontoggle = (e) => (help = e.target.open);
}
fresh();

window.addEventListener("hashchange", render);

function renderSettings() {
  document.body.className = theme;
  const fields = [
    {
      title: "Vzhľad",
      description:
        "Tmavá téma je predvolená. Tvoja voľba sa uloží v tomto prehliadači.",
      key: "theme",
      options: [
        ["dark", "Tmavý"],
        ["light", "Svetlý"],
      ],
      value: theme,
    },
    {
      title: "Obťažnosť",
      description:
        "Platí pre nové príklady. Nápovedu môžeš použiť na každej obťažnosti.",
      key: "level",
      options: [
        ["easy", "Easy"],
        ["medium", "Med"],
        ["hard", "Hard"],
        ["fiit", "FIIT ☠"],
      ],
      value: level,
    },
  ];
  $("#app").innerHTML =
    `<header class="topbar"><a href="#" class="settings-back">← Späť na tréning</a><span class="brand">ADM</span></header><main class="settings-page"><h1>Nastavenia</h1><p>Prispôsob si tréning. Zmeny sa ukladajú automaticky.</p>${fields.map((field) => `<section class="settings-card"><h2>${field.title}</h2><p>${field.description}</p><div class="settings-options">${field.options.map(([value, label]) => `<button data-setting="${field.key}" data-value="${value}" aria-pressed="${field.value === value}" class="${field.value === value ? "primary" : "border"}">${label}</button>`).join("")}</div></section>`).join("")}<section class="settings-card"><h2>Spôsob skúšania</h2><p>V algoritmoch zadávaš iba vrcholy. Na každej obťažnosti máš na výber všetky vrcholy; nesprávny krok sa vysvetlí až po zadaní. Nápoveda sa zobrazí iba po stlačení tlačidla.</p></section><section class="settings-card"><h2>Ukladanie</h2><p>Pokrok a nastavenia zostávajú v tomto prehliadači, bez účtu a bez odosielania na server.</p></section></main>`;
  document.querySelectorAll("[data-setting]").forEach(
    (button) =>
      (button.onclick = () => {
        if (button.dataset.setting === "theme") theme = button.dataset.value;
        else {
          level = button.dataset.value;
          g = randomGraph(level, moduleId);
          history = [initialAlgorithm(g)];
          cursor = 0;
          selected = [];
          answer = "";
          feedback = null;
          awarded = false;
          focusVertex = g.vertices[0];
          if (["walk", "cost"].includes(moduleId)) {
            while (!g.edges.length) g = randomGraph(level, moduleId);
            sequence = makeSequence();
          }
        }
        persist();
        renderSettings();
      }),
  );
}

function prompt9() {
  if (moduleId === "complete9")
    return [
      `Koľko hrán má K${g.vertices.length}?`,
      `Aký stupeň má každý vrchol K${g.vertices.length}?`,
      `Koľko rôznych neorientovaných Hamiltonovských cyklov má K${g.vertices.length}?`,
    ][q9.variant];
  if (moduleId === "hamilton")
    return `Zadaj Hamiltonovskú ${q9.closed ? "kružnicu (cyklus) s návratom do štartu" : "cestu bez návratu do štartu"}.`;
  return module().prompt;
}
function vertex9(v) {
  if (moduleId === "hamilton") {
    answer += (answer ? " → " : "") + v;
    feedback = null;
    render();
    return;
  }
  if (!step9(moduleId)) return;
  const s = state(),
    pair =
      ["eulerize", "semi9", "cheap9"].includes(moduleId) ||
      (moduleId === "insert9" && ["first", "second"].includes(s.phase));
  if (pair) {
    draft9.push(v);
    if (draft9.length < 2) {
      render();
      return;
    }
    const pair = draft9;
    draft9 = [];
    perform9(pair);
  } else perform9([v]);
}
function perform9(vs, hint = false) {
  const r = action9(q9, state(), vs);
  if (r.error)
    feedback = { ok: false, title: "Tento krok neplatí.", details: [r.error] };
  else {
    history = history.slice(0, cursor + 1);
    history.push(r.state);
    cursor++;
    if (r.state.done) {
      success();
      feedback = {
        ok: true,
        title: "Hotovo.",
        details: [
          moduleId === "rnn9"
            ? `Najlepší výsledok: ${Math.min(...r.state.results.map((r) => r.cost))}.`
            : `Cena výsledku: ${r.state.cost}.`,
        ],
      };
    } else
      feedback = hint
        ? { ok: true, title: "Doplnený jeden krok.", details: [vs.join(" → ")] }
        : null;
  }
  render();
}
function check9() {
  let ok = false,
    text = "";
  if (["eulerize", "semi9"].includes(moduleId)) {
    const result = finishEuler(q9, state());
    ok = result.ok;
    text = result.text;
  } else if (step9(moduleId)) {
    ok = state().done;
    text = ok ? "Všetky kroky sú správne." : "Postup ešte nie je dokončený.";
  } else if (moduleId === "conditions9") {
    const expected = conditionAnswers(g),
      mismatch = Object.keys(expected).filter(
        (k) => selected.includes(k) !== expected[k],
      );
    ok = !mismatch.length;
    const cuts = cutVertices(g),
      cycle = hamiltonPaths(g)[0];
    text =
      mismatch
        .map((k) => `${conditionLabels[k]}: ${expected[k] ? "áno" : "nie"}.`)
        .join(" ") +
      ` Stupne: ${g.vertices.map((v) => v + ": " + degree(g, v)).join(", ")}. Artikulácie: ${cuts.join(", ") || "žiadne"}. Počet komponentov: ${components(g).length}. ${cycle ? "Hamiltonovský cyklus: " + cycle.join(" → ") : "Vyčerpávajúca kontrola všetkých poradí vrcholov nenašla Hamiltonovský cyklus."}`;
  } else if (moduleId === "hamilton") {
    const seq = answer.split(/[\s,;→\-]+/).filter(Boolean),
      base = q9.closed ? seq.slice(0, -1) : seq;
    const missing = g.vertices.filter((v) => !base.includes(v)),
      repeated = base.filter((v, i) => base.indexOf(v) !== i),
      bad = seq
        .slice(1)
        .flatMap((v, i) =>
          !Number.isFinite(weight(g, seq[i], v)) ? [`${seq[i]} → ${v}`] : [],
        );
    ok =
      seq.length === g.vertices.length + (q9.closed ? 1 : 0) &&
      !missing.length &&
      !repeated.length &&
      !bad.length &&
      base.every((v) => g.vertices.includes(v)) &&
      (!q9.closed || seq[0] === seq.at(-1));
    text = ok
      ? "Každý vrchol je navštívený práve raz."
      : `Chýbajúce vrcholy: ${missing.join(", ") || "žiadne"}. Opakované: ${repeated.join(", ") || "žiadne"}. ${bad.length ? `Neexistujúce hrany: ${bad.join(", ")}. ` : ""}${q9.closed ? "Cyklus musí skončiť v štarte." : "Cesta sa nevracia do štartu."}`;
  } else {
    ok = answer.trim() !== "" && Number(answer) === q9.number;
    const n = g.vertices.length;
    text =
      moduleId === "complete9"
        ? [
            `${n}(${n}−1)/2 = ${q9.number} hrán.`,
            `${n}−1 = ${q9.number}.`,
            `(${n}−1)!/2 = ${q9.number}; opačné smery tvoria ten istý cyklus.`,
          ][q9.variant]
        : `Optimálna cena je ${q9.optimum}. Cyklus: ${q9.solutions.find((r) => tourCost(g, r) === q9.optimum).join(" → ")}. Porovnané boli všetky poradia vrcholov.`;
  }
  feedback = {
    ok,
    title: ok ? "Správne." : "Oprav svoju odpoveď.",
    details: [text],
  };
  if (ok) success();
  render();
}
function help9() {
  if (step9(moduleId)) {
    if (state().done) return;
    const action = hint9(q9, state());
    if (action) {
      draft9 = [];
      perform9(action, true);
    } else {
      feedback = {
        ok: true,
        title: "Parita už spĺňa cieľ.",
        details: ["Skontroluj cenu a potvrď výsledok tlačidlom Skontrolovať."],
      };
      render();
    }
    return;
  }
  if (moduleId === "hamilton") {
    const seq = answer.split(/[\s,;→\-]+/).filter(Boolean),
      candidates =
        q9.closed && seq.length
          ? q9.solutions.map((r) => {
              const base = r.slice(0, -1),
                i = base.indexOf(seq[0]);
              if (i < 0) return r;
              const rotated = [...base.slice(i), ...base.slice(0, i)];
              return [...rotated, rotated[0]];
            })
          : q9.solutions,
      solution = candidates.find((r) => seq.every((v, i) => r[i] === v));
    if (solution && seq.length < solution.length) {
      answer = solution.slice(0, seq.length + 1).join(" → ");
      feedback = null;
    } else
      feedback = {
        ok: false,
        title: "Skús sa vrátiť.",
        details: [
          "Tento začiatok už nemožno doplniť na požadovanú prechádzku, alebo je už hotová.",
        ],
      };
  } else
    feedback = {
      ok: true,
      title: "Nápoveda",
      details: [
        moduleId === "complete9"
          ? [
              "Použi n(n−1)/2.",
              "V kompletnom grafe susedíš so všetkými ostatnými.",
              "Zafixuj štart. Zvyšné poradia vydeľ dvoma za opačný smer.",
            ][q9.variant]
          : moduleId === "conditions9"
            ? `Stupne: ${g.vertices.map((v) => v + ": " + degree(g, v)).join(", ")}. Diracov prah je ${g.vertices.length}/2. Je postačujúci, nie nutný.`
            : `Najlacnejší cyklus má cenu ${q9.optimum}. Skús spočítať cenu rôznych poradí; heuristický výsledok nemusí byť optimálny.`,
      ],
    };
  render();
}
