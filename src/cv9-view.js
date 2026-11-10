import { step9, conditionLabels } from "./cv9.js";
export function view9(q, s, { draft, answer, selected, cursor, length }) {
  const keys = q.g.vertices
    .map((v) => `<button class="tonal" data-v9="${v}">${v}</button>`)
    .join("");
  if (q.id === "conditions9")
    return `<div class="options">${Object.entries(conditionLabels)
      .map(
        ([k, v]) =>
          `<button class="option ${selected.includes(k) ? "selected" : ""}" data-option="${k}" aria-pressed="${selected.includes(k)}"><span>${v}</span><span class="checkbox">${selected.includes(k) ? "✓" : ""}</span></button>`,
      )
      .join("")}</div>`;
  if (["complete9", "tsp9"].includes(q.id)) return null;
  if (q.id === "hamilton")
    return `<div class="sequence">${answer || "Zadaj postupnosť vrcholov…"}</div><div class="step-choices" style="--vertex-columns:${Math.ceil(q.g.vertices.length / 2)}">${keys}</div><div class="history-controls"><button class="border" id="v9-delete">⌫ Späť</button><button class="border" id="v9-clear">Vymazať</button></div>`;
  const pairs =
    ["eulerize", "semi9", "cheap9"].includes(q.id) ||
    (q.id === "insert9" && ["first", "second"].includes(s.phase));
  const instruction = s.done
    ? "Hotovo."
    : pairs
      ? `Zadaj dva vrcholy hrany${draft.length ? `: ${draft[0]} → …` : "."}`
      : q.id === "insert9"
        ? s.phase === "outside"
          ? "Vyber nový vrchol X."
          : `Y=${s.y}, X=${s.x}. Vyber suseda Z na vloženie.`
        : !s.route.length
          ? `Vyber štart${q.id === "rnn9" ? ` ${q.g.vertices[s.results.length]}` : ""}.`
          : "Vyber ďalší vrchol.";
  return `<div class="sequence v9-status">${instruction}</div>${s.route.length ? `<div class="sequence">${s.route.join(" → ")}${s.cost ? ` · cena ${s.cost}` : ""}</div>` : ""}${
    ["eulerize", "semi9"].includes(q.id)
      ? `<div class="sequence">Duplikované: ${
          s.copies
            .map((id) => {
              const e = q.g.edges.find((e) => e.id === id);
              return e.a + "–" + e.b;
            })
            .join(", ") || "žiadne"
        } · cena ${s.cost}</div>`
      : ""
  }${
    q.id === "cheap9"
      ? `<div class="sequence">${
          s.used
            .map((id) => {
              const e = q.g.edges.find((e) => e.id === id);
              return e.a + "–" + e.b;
            })
            .join(", ") || "Zatiaľ bez hrán"
        } · cena ${s.cost}</div>`
      : ""
  }${s.results.length ? `<details class="v9-results"><summary>Výsledky behov (${s.results.length}/${q.g.vertices.length}) · najlepšia cena ${Math.min(...s.results.map((r) => r.cost))}</summary>${s.results.map((r) => `<p>${r.route.join(" → ")} = ${r.cost}</p>`).join("")}</details>` : ""}<div class="step-choices" style="--vertex-columns:${Math.ceil(q.g.vertices.length / 2)}">${keys}</div><div class="history-controls"><button id="back" class="border" ${cursor === 0 ? "disabled" : ""}>← Späť</button><span>Krok ${cursor}</span><button id="forward" class="border" ${cursor === length - 1 ? "disabled" : ""}>Ďalej →</button></div>`;
}
export function matrix9(g) {
  return `<div class="weight-matrix"><table aria-label="Matica váh"><thead><tr><th></th>${g.vertices.map((v) => `<th>${v}</th>`).join("")}</tr></thead><tbody>${g.vertices.map((a) => `<tr><th>${a}</th>${g.vertices.map((b) => `<td>${a === b ? "—" : (g.edges.find((e) => (e.a === a && e.b === b) || (e.b === a && e.a === b))?.weight ?? "∞")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
