import {
  exercisePath,
  parseExercisePath,
  seededRandom,
  newExerciseSeed,
} from "./exercise-route.js";
import { marked } from "marked";
import { summarize, validateBackup, choosePracticeModule } from "./stats.js";
import { placeWeightLabels } from "./graph-layout.js";
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
  matrixNotes = {},
  g,
  history = [],
  cursor = 0,
  awarded = false,
  help = false;
let progress = saved.progress || {},
  streak = 0;
let attempts = Array.isArray(saved.attempts) ? saved.attempts.slice(-2000) : [];
let activeAttempt = null;
let statsLimit = 20;
let completionTimer;
let finalized = false;
let trainingMode = saved.trainingMode === "testing" ? "testing" : "learning";
let feedbackRequested = false;
let personalization = saved.personalization === true;
let lastExercise = saved.lastExercise || "";
const folders = Object.fromEntries(
  presentations.map((p) => [
    p.id,
    typeof saved.folders?.[p.id] === "boolean" ? saved.folders[p.id] : true,
  ]),
);
function rememberFolders() {
  let changed = false;
  document.querySelectorAll("[data-folder]").forEach((el) => {
    if (folders[el.dataset.folder] !== el.open) {
      folders[el.dataset.folder] = el.open;
      changed = true;
    }
  });
  if (changed) persist();
}
const modules = presentations.flatMap((p) => p.modules);
const presentation = () =>
  presentations.find((p) => p.modules.some((m) => m.id === moduleId));
const module = () => modules.find((m) => m.id === moduleId);
const algo = () => ["fleury", "hierholzer"].includes(moduleId);
const state = () => history[cursor];
function persist() {
  try {
    localStorage.setItem(
      "adm-v1",
      JSON.stringify({
        level,
        theme,
        trainingMode,
        personalization,
        progress,
        attempts,
        folders,
        lastExercise,
      }),
    );
  } catch {}
}
function recordAttempt(event) {
  if (awarded) return;
  if (!activeAttempt) {
    activeAttempt = { moduleId, level, errors: 0, hints: 0, solved: false };
    attempts.push(activeAttempt);
    attempts = attempts.slice(-2000);
  }
  if (event === "error") activeAttempt.errors++;
  if (event === "hint") activeAttempt.hints++;
  if (event === "solved") activeAttempt.solved = true;
  persist();
}
function makeSequence(rng) {
  let v = g.vertices[Math.floor(rng() * g.vertices.length)],
    seq = [v];
  for (let i = 0; i < 2 + Math.floor(rng() * 6); i++) {
    const choices = incident(g, v);
    if (!choices.length) break;
    v = other(choices[Math.floor(rng() * choices.length)], v);
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
function nextExercise(options) {
  if (personalization) {
    moduleId = choosePracticeModule(
      attempts,
      modules.map((m) => m.id),
      level,
    );
  }
  fresh(options);
}
function fresh({ seed = newExerciseSeed(), navigation = "push" } = {}) {
  matrixNotes = {};
  clearTimeout(completionTimer);
  finalized = false;
  feedbackRequested = false;
  activeAttempt = null;
  const rng = seededRandom(seed);
  if (isCv9(moduleId)) {
    q9 = make9(moduleId, level, rng);
    g = q9.g;
    history = [initial9()];
  } else {
    while (true) {
      countVariant = Math.floor(rng() * 4);
      g = randomGraph(level, moduleId, rng);
      if (["walk", "cost"].includes(moduleId)) {
        g.directed = false;
        if (!g.edges.length) continue;
        sequence = makeSequence(rng);
        if (moduleId === "walk" && rng() < 0.25) {
          sequence = g.vertices.slice(0, 3);
          for (let i = sequence.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
          }
        }
        if (sequence.length < 2) continue;
      }
      break;
    }
    focusVertex = g.vertices[Math.floor(rng() * g.vertices.length)];
    history = [initialAlgorithm(g)];
  }
  draft9 = [];
  selected = [];
  answer = "";
  feedback = null;
  awarded = false;
  cursor = 0;
  lastExercise = exercisePath(presentation(), module(), level, seed);
  const target = lastExercise + location.hash;
  if (location.pathname + location.hash !== target) {
    window.history[navigation === "push" ? "pushState" : "replaceState"](
      {},
      "",
      target,
    );
  }
  persist();
  render();
}
function success() {
  if (!awarded) {
    recordAttempt("solved");
    progress[moduleId] = (progress[moduleId] || 0) + 1;
    streak++;
    awarded = true;
    persist();
    advanceAfterFeedback();
  }
}
function advanceAfterFeedback(delay = 1200) {
  finalized = true;
  clearTimeout(completionTimer);
  if (trainingMode === "learning") return;
  const completedAttempt = activeAttempt;
  completionTimer = setTimeout(() => {
    if (activeAttempt === completedAttempt && !location.hash && finalized)
      nextExercise();
  }, delay);
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
  if (finalized) return;
  feedbackRequested = false;
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
      ? [
          trainingMode === "learning"
            ? "Správne. Pokračuj zatvorením vysvetlenia alebo tlačidlom Ďalší príklad."
            : "Správne. Pokračujeme ďalším príkladom…",
        ]
      : details,
  };
  if (correct) success();
  else {
    recordAttempt("error");
    streak = 0;
    if (moduleId === "types") {
      feedback.title = "Tentoraz nesprávne. Pozri si vysvetlenie.";
      advanceAfterFeedback(4500);
    }
  }
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
  if (finalized) return;
  feedbackRequested = hint;
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
      recordAttempt("error");
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
    recordAttempt("error");
    feedback = {
      ok: false,
      title: "Tento krok zatiaľ neplatí.",
      details: [r.error],
    };
  } else {
    recordAttempt();
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
        : { ok: true, title: "Správne.", details: [] };
    if (r.state.done) success();
  }
  render();
}
function hint() {
  if (finalized) return;
  feedbackRequested = true;
  if (!(algo() && mode === "steps" && state().done)) recordAttempt("hint");
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
  const curves = [];
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
    if (g.weighted) {
      curves.push({
        id: e.id,
        points:
          e.a === e.b
            ? [
                { x: a.x - 12, y: a.y - 16 },
                { x: a.x - 80, y: a.y - 85 },
                { x: a.x + 80, y: a.y - 85 },
                { x: a.x + 12, y: a.y - 16 },
              ]
            : [
                { x: a.x + dx * 24, y: a.y + dy * 24 },
                { x: mx, y: my },
                { x: b.x - dx * 27, y: b.y - dy * 27 },
              ],
      });
    }
    const d =
      e.a === e.b
        ? `M ${a.x - 12} ${a.y - 16} C ${a.x - 80} ${a.y - 85} ${a.x + 80} ${a.y - 85} ${a.x + 12} ${a.y - 16}`
        : `M ${a.x + dx * 24} ${a.y + dy * 24} Q ${mx} ${my} ${b.x - dx * 27} ${b.y - dy * 27}`;
    const used =
      ((algo() && mode === "steps") || isCv9(moduleId)) &&
      s.used.includes(e.id);
    out += `<g class="edge ${used ? "used" : ""}"><path class="edge-hit" d="${d}"/><path class="edge-line" d="${d}" ${g.directed ? 'marker-end="url(#arrow)"' : ""}/></g>`;
  }
  const weightPositions = placeWeightLabels(curves, Object.values(pos));
  for (const e of g.weighted ? g.edges : []) {
    const p = weightPositions.get(e.id);
    out += `<g class="edge-weight" data-weight-edge="${e.id}" pointer-events="none"><circle cx="${p.x}" cy="${p.y}" r="16" class="weight-bg"/><text x="${p.x}" y="${p.y + 5}" class="weight">${e.weight}</text></g>`;
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
  rememberFolders();
  if (location.hash === "#statistiky") {
    renderStats();
    return;
  }
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
    `<header class="topbar"><button class="circle transparent menu-toggle" id="menu" aria-label="Otvoriť menu">☰</button><a class="brand" href="#"><span class="brand-mark">a<span>↗</span></span><span>ADM<span class="brand-sub">tréningový priestor</span></span></a><div class="header-end"><a class="settings-link stats-link" href="#statistiky" aria-label="Štatistiky">▥</a><a class="settings-link" href="#nastavenia" aria-label="Nastavenia">⚙</a><span class="saved"><span class="status-dot"></span> Pokrok uložený v zariadení</span></div></header><div class="layout"><aside class="sidebar ${menu ? "open" : ""}"><span class="eyebrow nav-label">PREZENTÁCIE</span>${presentations.map((p) => `<details class="presentation-folder" data-folder="${p.id}" ${folders[p.id] ? "open" : ""}><summary><span class="presentation-icon">▤</span><span>${p.title}<small>${p.subtitle}</small></span></summary><nav class="module-nav">${p.modules.map((x) => `<button class="nav-item ${moduleId === x.id ? "active" : ""}" data-module="${x.id}"><span class="nav-icon">${x.icon}</span><span>${x.title}</span>${progress[x.id] ? `<span class="nav-count">${progress[x.id]}</span>` : ""}</button>`).join("")}</nav></details>`).join("")}<div class="sidebar-bottom"><div class="progress-label"><span>Každý príklad sa počíta</span><b>${total}</b></div><div class="progress-track"><span style="width:${Math.min(100, total * 5)}%"></span></div><small>správne vyriešených príkladov</small><a href="${presentation().source}" target="_blank" rel="noopener" class="source-link">↗ Otvoriť prezentáciu</a></div></aside>${menu ? '<button class="scrim" id="close-menu" aria-label="Zatvoriť menu"></button>' : ""}<main><div class="page-heading"><div><h1>${m.title}</h1></div><button id="new" class="border round">↻ Nový príklad</button><span class="topic-badge">${m.icon}</span></div><div class="toolbar"><div class="difficulty"><div class="segments" aria-label="Obťažnosť">${["easy", "medium", "hard", "fiit"].map((l) => `<button data-level="${l}" class="${level === l ? "chosen" : ""}" aria-pressed="${level === l}">${{ easy: "Easy", medium: "Med", hard: "Hard", fiit: "FIIT ☠" }[l]}</button>`).join("")}</div></div><details class="theory" ${help ? "open" : ""}><summary>Malý ťahák <span>Postup, logika a pravidlá</span></summary><button id="close-theory" class="theory-close" aria-label="Zavrieť ťahák">×</button><div class="theory-content">${marked.parse(theory[moduleId])}</div></details></div><section class="task-card"><h2 ${trainingMode === "testing" && feedback && !feedbackRequested ? 'role="status"' : ""}>${trainingMode === "testing" && feedback && !feedbackRequested ? (feedback.ok ? "✓ Správne." : "↳ Nesprávne.") : isCv9(moduleId) ? prompt9() : moduleId === "counts" ? countTask().question : m.prompt}</h2>${algo() ? `<div class="mode-switch"><button data-mode="steps" class="${mode === "steps" ? "chosen" : ""}">Krok za krokom</button><button data-mode="whole" class="${mode === "whole" ? "chosen" : ""}">Celý výsledok</button></div>` : ""}</section><div class="workspace"><section class="graph-card"><div class="panel-heading"><span>PRACOVNÁ PLOCHA</span><span class="graph-meta">${g.vertices.length} vrcholov · ${g.edges.length} hrán</span></div>${isCv9(moduleId) && g.weighted && matrixMode ? matrix9(g, ["eulerize", "semi9"].includes(moduleId)) : graphSVG()}${isCv9(moduleId) && g.weighted ? `<button id="v9-matrix" class="matrix-toggle border">${matrixMode ? "Zobraziť graf" : "Matica váh"}</button>` : ""}<div class="graph-caption"><span class="legend-dot"></span>${algo() && mode === "steps" ? "Vyber ďalší vrchol v grafe" : moduleId === "degree" ? `Zvýraznený vrchol: ${focusVertex}` : "Vrcholy v kruhu, možnosti na dosah."}</div><details class="notation"><summary>Zápis grafu G = (V, E)</summary><p>V = {${g.vertices.join(", ")}}</p><p>E = {${g.edges.map((e) => `${e.a}${g.directed ? "→" : "–"}${e.b}${g.weighted ? ` [${e.weight}]` : ""}`).join(", ")}}</p><small>Násobné hrany sú v zápise uvedené samostatne.</small></details></section><section class="answer-card"><div class="panel-heading"><span>${algo() ? "TVOJ POSTUP" : "TVOJA ODPOVEĎ"}</span><span class="tiny-pill">${algo() ? "↝" : "✎"}</span></div>${["walk", "cost"].includes(moduleId) ? `<div class="sequence-label">Zadaná prechádzka</div><div class="sequence">${sequence.join(" → ")}</div>` : ""}${
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
            ? `<p class="answer-intro">${s.done ? "Hotovo. Prejdená je každá hrana." : s.at === null ? "Vyber štartovací vrchol." : moduleId === "hierholzer" && !s.cycle.length ? "Vyber vrchol okruhu s nepoužitou hranou." : `Ďalší vrchol po ${s.at}`}</p><div class="sequence">${s.route.join(" → ") || "Tvoj postup sa začne tu…"}</div>${s.cycle.length ? `<div class="cycle-box"><small>Rozpracovaný cyklus</small><p>${s.cycle.join(" → ")}</p></div>` : ""}<div class="step-progress" aria-label="Použité hrany"><b>${s.used.length} / ${g.edges.length}</b></div><progress value="${s.used.length}" max="${g.edges.length}"></progress><div class="step-choices" style="--vertex-columns: ${Math.ceil(g.vertices.length / 2)}">${g.vertices
                .map(
                  (v) =>
                    `<button class="tonal" data-start="${v}">${v}</button>`,
                )
                .join(
                  "",
                )}</div><div class="history-controls"><button id="back" class="border" ${cursor === 0 ? "disabled" : ""}>← Späť</button><span aria-label="Krok ${cursor}">${cursor}</span><button id="forward" class="border" ${cursor === history.length - 1 ? "disabled" : ""}>Ďalej →</button><button id="hint" class="border round">✦ Nápoveda</button></div><label class="history-label"><select id="history" aria-label="Návrat k vypracovanému kroku">${history.map((_, i) => `<option value="${i}" ${cursor === i ? "selected" : ""}>${i}</option>`).join("")}</select></label>`
            : `<label class="input-label" for="answer">${moduleId === "counts" ? "Výsledný počet" : moduleId === "degree" ? `Stupeň vrcholu ${focusVertex}` : moduleId === "cost" ? "Cena prechádzky" : "Postupnosť vrcholov oddelená medzerou"}</label><input id="answer" class="answer-input" type="text" inputmode="none" autocomplete="off" value="${safe(answer)}" placeholder="${algo() ? "A → B → C…" : "Tvoja odpoveď"}"><div class="keypad">${(algo() ? [...g.vertices, "→", "⌫", "AC", "↵"] : ["1", "2", "3", "⌫", "4", "5", "6", "AC", "7", "8", "9", "✦", "←", "0", "→", "↵"]).map((k) => `<button data-key="${k}" class="${["⌫", "↵"].includes(k) ? "accent-key" : ""}" aria-label="${k === "⌫" ? "Vymazať posledný znak" : k === "AC" ? "Vymazať odpoveď" : k === "↵" ? "Skontrolovať odpoveď" : k === "✦" ? "Nápoveda" : k}">${k}</button>`).join("")}</div>${algo() ? '<p class="muted">Klikanie na vrcholy tiež dopĺňa zápis. Celý výsledok kontroluje hrany; skladanie cyklov precvičíš v krokovom režime.</p>' : ""}`
    }${feedback && (trainingMode === "learning" || feedbackRequested) ? `<div class="feedback ${feedback.ok ? "positive" : "negative"}" data-complete="${awarded}" role="status"><button id="dismiss-feedback" class="feedback-dismiss" aria-label="Zavrieť vysvetlenie">×</button><b>${feedback.ok ? "✓" : "↳"} ${feedback.title}</b>${feedback.details.map((d) => `<p>${safe(d)}</p>`).join("")}</div>` : ""}<div class="answer-actions">${!algo() || mode === "whole" ? '<button id="check" class="primary round">Skontrolovať <span>↗</span></button>' : ""}${!algo() || mode === "whole" ? '<button id="hint" class="border round">✦ Nápoveda</button>' : ""}</div>${(isCv9(moduleId) && awarded) || (trainingMode === "learning" && finalized) ? '<button id="next" class="transparent next-link">Ďalší príklad →</button>' : ""}</section></div><footer>Učenie po malých krokoch. <span>ADM / ${presentation().title} · ${total} vyriešených</span></footer></main></div>`;
  bind();
}
function bind() {
  document.querySelectorAll("[data-folder]").forEach(
    (el) =>
      (el.ontoggle = () => {
        if (el.isConnected) rememberFolders();
      }),
  );
  document
    .querySelectorAll("[data-v9]")
    .forEach((el) => (el.onclick = () => vertex9(el.dataset.v9)));
  const dismiss = document.querySelector("#dismiss-feedback");
  if (dismiss)
    dismiss.onclick = () => {
      if (finalized && trainingMode === "learning") {
        nextExercise();
        return;
      }
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
  click("#close-theory", () => {
    $(".theory").open = false;
    help = false;
    $(".theory summary").focus();
  });
  click("#v9-matrix", () => {
    matrixMode = !matrixMode;
    render();
  });
  const matrixInputs = document.querySelectorAll("[data-matrix-note]");
  matrixInputs.forEach((input) => {
    const key = input.dataset.matrixNote;
    input.value = matrixNotes[key] || "";
    input.oninput = () => {
      matrixNotes[key] = input.value;
      matrixInputs.forEach((other) => {
        if (other !== input && other.dataset.matrixNote === key)
          other.value = input.value;
      });
    };
  });
  click("#v9-delete", () => {
    answer = answer.split(" → ").slice(0, -1).join(" → ");
    render();
  });
  click("#v9-clear", () => {
    answer = "";
    render();
  });
  click("#new", () => nextExercise());
  click("#next", () => nextExercise());
  click("#check", check);
  click("#hint", hint);
  if (finalized) {
    document
      .querySelectorAll("[data-option], #check, #hint, [data-start]")
      .forEach((button) => {
        button.disabled = true;
      });
  }
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
    clearTimeout(completionTimer);
    finalized = false;
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
      clearTimeout(completionTimer);
      finalized = false;
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
const initialRoute =
  parseExercisePath(location.pathname, presentations) ||
  (location.pathname === "/" && parseExercisePath(lastExercise, presentations));
if (initialRoute) {
  moduleId = initialRoute.moduleId;
  level = initialRoute.level;
  fresh({ seed: initialRoute.seed, navigation: "replace" });
} else {
  nextExercise({ navigation: "replace" });
}
window.addEventListener("popstate", () => {
  const route = parseExercisePath(location.pathname, presentations);
  if (route && location.pathname !== lastExercise) {
    moduleId = route.moduleId;
    level = route.level;
    fresh({ seed: route.seed, navigation: "replace" });
  } else render();
});

window.addEventListener("hashchange", () => {
  clearTimeout(completionTimer);
  if (!location.hash && finalized) nextExercise();
  else render();
});

function renderSettings() {
  document.body.className = theme;
  const fields = [
    {
      title: "Personalizácia cvičení",
      description:
        "Zapnutá: ďalšie príklady častejšie vyberajú témy, v ktorých robíš chyby, používaš nápovedu alebo ich nedokončíš. Vychádza z posledných 100 skúšaných príkladov pri zvolenej obťažnosti. Ostatné témy sa tiež opakujú. Vypnutá: pokračuješ v ručne vybratej téme.",
      key: "personalization",
      options: [
        ["off", "Vypnutá"],
        ["on", "Zapnutá"],
      ],
      value: personalization ? "on" : "off",
    },
    {
      title: "Režim tréningu",
      description:
        "Učenie zobrazí vysvetlenia po odpovedi. Testovanie ich vypne; ručne vyžiadaná nápoveda zostáva dostupná.",
      key: "trainingMode",
      options: [
        ["learning", "Učenie"],
        ["testing", "Testovanie"],
      ],
      value: trainingMode,
    },
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
    `<header class="topbar"><a href="#" class="settings-back">← Späť na tréning</a><span class="brand">ADM</span></header><main class="settings-page"><h1>Nastavenia</h1><p>Prispôsob si tréning. Zmeny sa ukladajú automaticky.</p>${fields.map((field) => `<section class="settings-card"><h2>${field.title}</h2><p>${field.description}</p><div class="settings-options">${field.options.map(([value, label]) => `<button data-setting="${field.key}" data-value="${value}" aria-pressed="${field.value === value}" class="${field.value === value ? "primary" : "border"}">${label}</button>`).join("")}</div></section>`).join("")}<section class="settings-card"><h2>Spôsob skúšania</h2><p>V algoritmoch zadávaš iba vrcholy. Na každej obťažnosti máš na výber všetky vrcholy; nesprávny krok sa vysvetlí až po zadaní. Nápoveda sa zobrazí iba po stlačení tlačidla.</p></section><section class="settings-card"><h2>Tréningové dáta</h2><p>História a pokrok zostávajú v tomto prehliadači. Export uloží zálohu JSON. Import nahradí históriu aj počty vyriešených príkladov údajmi zo súboru; vzhľad a obťažnosť zostanú zachované.</p><div class="settings-options"><button id="export-data" class="border">Exportovať dáta</button><button id="import-data" class="border">Importovať dáta</button><input id="import-file" type="file" accept="application/json,.json" hidden></div><p id="data-status" role="status"></p></section></main>`;
  $("#export-data").onclick = () => {
    const blob = new Blob(
      [JSON.stringify({ version: 1, attempts, progress }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      "adm-trening-" + new Date().toISOString().slice(0, 10) + ".json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $("#data-status").textContent = "Záloha je pripravená na stiahnutie.";
  };
  $("#import-data").onclick = () => $("#import-file").click();
  $("#import-file").onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 2_000_000)
        throw new Error("Súbor je príliš veľký (maximum 2 MB).");
      const backup = validateBackup(
        JSON.parse(await file.text()),
        modules.map((m) => m.id),
      );
      localStorage.setItem(
        "adm-v1",
        JSON.stringify({
          level,
          theme,
          trainingMode,
          personalization,
          folders,
          lastExercise,
          ...backup,
        }),
      );
      attempts = backup.attempts;
      progress = backup.progress;
      activeAttempt = null;
      $("#data-status").textContent =
        "Importované: " +
        attempts.length +
        " príkladov. História a pokrok boli nahradené.";
    } catch (error) {
      $("#data-status").textContent =
        "Import sa nepodaril. " +
        (error instanceof SyntaxError
          ? "Súbor nie je platný JSON."
          : error.message);
    }
    event.target.value = "";
  };
  document.querySelectorAll("[data-setting]").forEach(
    (button) =>
      (button.onclick = () => {
        if (button.dataset.setting === "theme") theme = button.dataset.value;
        else if (button.dataset.setting === "personalization") {
          personalization = button.dataset.value === "on";
        } else if (button.dataset.setting === "trainingMode") {
          trainingMode = button.dataset.value;
          feedback = null;
          feedbackRequested = false;
        } else {
          level = button.dataset.value;
          fresh({ navigation: "replace" });
        }
        persist();
        renderSettings();
      }),
  );
}

function renderStats() {
  document.body.className = theme;
  const recent = attempts.slice(-statsLimit);
  const summary = summarize(recent);
  const percent = (n, total) => (total ? Math.round((100 * n) / total) : 0);
  const levels = { easy: "Easy", medium: "Med", hard: "Hard", fiit: "FIIT ☠" };
  const rows = modules
    .map((m) => {
      const values = summarize(recent.filter((a) => a.moduleId === m.id));
      const rate = percent(values.independent, values.total);
      const layers = Object.entries(levels).map(([id, title]) => {
        const group = summarize(
          recent.filter((a) => a.moduleId === m.id && a.level === id),
        );
        return {
          id,
          title,
          total: group.total,
          rate: percent(group.independent, group.total),
        };
      });
      const description = layers
        .map(
          (l) =>
            `${l.title}: ${l.total ? `${l.rate} % z ${l.total} príkladov` : "bez údajov"}`,
        )
        .join("; ");
      return `<div class="stats-row"><div class="stats-row-heading"><b>${m.title}</b><span>${values.total ? `${rate} % spolu` : "Zatiaľ bez údajov"}</span></div><div class="stats-bar stats-bar-layered" role="img" aria-label="${m.title}. ${description}">${layers.map((l, i) => `<span class="stats-level-${l.id}" data-stat-level="${l.id}" style="width:${l.rate}%;z-index:${i + 1}"></span>`).join("")}</div><div class="stats-level-list">${layers.map((l) => `<span class="stats-level-label stats-level-${l.id}" title="${l.title}: ${l.total} príkladov">${l.title} ${l.total ? `${l.rate} %` : "—"}</span>`).join("")}</div><small>${values.total} príkladov · ${values.errors} chýb · ${values.hints} nápovied</small></div>`;
    })
    .join("");
  const difficulty = Object.entries(levels)
    .map(([id, title]) => {
      const values = summarize(recent.filter((a) => a.level === id));
      const maxErrors = Math.max(
        1,
        ...Object.keys(levels).map(
          (l) => summarize(recent.filter((a) => a.level === l)).errors,
        ),
      );
      return `<div class="stats-row"><div class="stats-row-heading"><b>${title}</b><span>${values.errors} chýb / ${values.total} príkladov</span></div><div class="stats-bar errors" role="img" aria-label="${title}: ${values.errors} chýb v ${values.total} príkladoch"><span style="width:${(100 * values.errors) / maxErrors}%"></span></div></div>`;
    })
    .join("");
  $("#app").innerHTML =
    `<header class="topbar"><a href="#" class="settings-back">← Späť na tréning</a><a href="#nastavenia" class="settings-back">Nastavenia</a></header><main class="settings-page stats-page"><h1>Čo už vieš</h1><p>Prehľad posledných skúšaných príkladov. Samostatne znamená vyriešené bez chyby a bez nápovedy.</p><label class="stats-filter">Posledných <input id="stats-limit" type="number" min="1" max="2000" step="1" value="${statsLimit}"> príkladov</label><p>Zobrazených ${summary.total} z ${attempts.length} uložených príkladov.</p>${!summary.total ? '<section class="settings-card"><h2>Začni tréningom</h2><p>Po prvej odpovedi, kroku alebo nápovede sa tu objaví tvoj prehľad. Staršie počty vyriešených úloh neobsahujú údaje o chybách.</p><a href="#" class="settings-back">Prejsť na tréning →</a></section>' : `<div class="stats-totals"><section class="settings-card"><b>${percent(summary.independent, summary.total)} %</b><span>samostatne</span></section><section class="settings-card"><b>${summary.solved} / ${summary.total}</b><span>vyriešených</span></section><section class="settings-card"><b>${summary.errors}</b><span>chýb</span></section></div><section class="settings-card"><h2>Čo ti ide a čo precvičiť</h2><p>Úspešnosť v každej obťažnosti má vlastnú vrstvu v jednom pruhu. Ťažšia obťažnosť prekrýva ľahšiu. Malý počet príkladov ešte nemusí vystihovať tvoje vedomosti.</p>${rows}</section><section class="settings-card"><h2>Chyby podľa obťažnosti</h2><p>Každá nesprávna odpoveď alebo neplatný krok je jedna chyba. Jeden príklad môže mať viac chýb.</p>${difficulty}</section>`}<p>Počítajú sa aj rozpracované a opustené príklady, pri ktorých si už odpovedal alebo použil nápovedu. Ukladá sa posledných 2 000 príkladov iba v tomto prehliadači.</p></main>`;
  $("#stats-limit").onchange = (event) => {
    const value = Number(event.target.value);
    if (!Number.isInteger(value) || value < 1 || value > 2000) {
      event.target.value = statsLimit;
      return;
    }
    statsLimit = value;
    renderStats();
  };
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
  if (finalized) return;
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
  if (finalized) return;
  feedbackRequested = hint;
  const r = action9(q9, state(), vs);
  recordAttempt(r.error ? "error" : undefined);
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
  recordAttempt(ok ? undefined : "error");
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
