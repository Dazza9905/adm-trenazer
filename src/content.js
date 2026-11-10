import { cv9Modules, cv9Theory } from "./cv9.js";
export const presentations = [
  {
    id: "cv8",
    title: "Cvičenie 8",
    subtitle: "Teória grafov",
    source: "/cv8.pdf",
    modules: [
      {
        id: "counts",
        icon: "#",
        title: "Susedia a počty",
        description: "Incidencia, súčet stupňov a počty hrán",
        prompt: "Vypočítaj požadovaný počet.",
      },
      {
        id: "types",
        icon: "◈",
        title: "Vlastnosti grafov",
        description: "Súvislosť, bipartitnosť, Euler a ďalšie",
        prompt: "Označ všetky vlastnosti zobrazeného grafu.",
      },
      {
        id: "degree",
        icon: "✳",
        title: "Stupne vrcholov",
        description: "Hrany, slučky a súčet stupňov",
        prompt: "Urči stupeň zvýrazneného vrcholu.",
      },
      {
        id: "walk",
        icon: "↝",
        title: "Sled, ťah, cesta, okruh",
        description: "Čo sa smie opakovať?",
        prompt: "Označ všetky pojmy, ktoré platia pre zadanú prechádzku.",
      },
      {
        id: "cost",
        icon: "Σ",
        title: "Cena prechádzky",
        description: "Sčítaj váhy prejdených hrán",
        prompt: "Vypočítaj cenu zadanej prechádzky.",
      },
      {
        id: "fleury",
        icon: "⌁",
        title: "Fleuryho algoritmus",
        description: "Prejdi hrany. Daj pozor na mosty.",
        prompt: "Nájdi eulerovský ťah. Most použi, len keď nemáš inú možnosť.",
      },
      {
        id: "hierholzer",
        icon: "◎",
        title: "Hierholzerov algoritmus",
        description: "Vytvor cykly a poskladaj okruh",
        prompt:
          "Uzavri cyklus, potom vo vrchole okruhu vytvor ďalší a vlož ho do výsledku.",
      },
    ],
  },
];
presentations.push({
  id: "cv9",
  title: "Cvičenie 9",
  subtitle: "Eulerizácia, Hamilton a TSP",
  source: "/Cv09_Blazek_prezentacia.pdf",
  modules: cv9Modules,
});
export const labels = {
  connected: "Súvislý (spojitý)",
  simple: "Jednoduchý",
  complete: "Kompletný",
  bipartite: "Bipartitný",
  completeBipartite: "Kompletný bipartitný",
  euler: "Eulerovský",
  semi: "Semi-eulerovský",
  directed: "Orientovaný",
  dag: "Orientovaný acyklický (DAG)",
  weighted: "Ohodnotený",
};
export const walkLabels = {
  walk: "Sled",
  trail: "Ťah",
  path: "Cesta",
  circuit: "Okruh",
};
export const theory = {
  counts:
    "Susedia vrcholu sú rôzne vrcholy spojené hranou; slučka robí vrchol vlastným susedom. Incidencia znamená, že vrchol je koncovým vrcholom hrany. Slučka je jedna incidentná hrana, ale k stupňu prispieva dvakrát. Súčet stupňov je 2|E|. Kompletný graf Kₙ má n(n−1)/2 hrán a každý vrchol stupeň n−1. Kompletný bipartitný graf Kₘ,ₙ má m·n hrán.",
  types:
    "Vlastnosti sa nevylučujú. Jednoduchý graf nemá slučky ani násobné hrany. Súvislý graf má cestu medzi každými dvoma vrcholmi. Bipartitný graf možno rozdeliť na dve skupiny bez hrán vnútri skupín. Eulerovský graf je súvislý a všetky stupne sú párne; semi-eulerovský má presne dva nepárne stupne. Eulerovské vlastnosti tu hodnotíme pre neorientované grafy. DAG je orientovaný graf bez orientovaného cyklu: po šípkach sa nikdy nevrátiš do štartu.",
  degree:
    "Stupeň vrcholu je počet incidentných koncov hrán. Slučka prispieva dvakrát. V neorientovanom grafe je súčet stupňov rovný 2 × počtu hrán.",
  walk: "Sled môže opakovať vrcholy aj hrany. Ťah neopakuje hrany. Cesta neopakuje vrcholy. Okruh je podľa tejto prezentácie uzavretý ťah: končí v štarte a neopakuje hrany, vrcholy opakovať môže.",
  cost: "Cena prechádzky je súčet váh všetkých prejdených hrán. Ak prejdeš hranu viackrát, jej váhu pripočítaš pri každom prechode.",
  fleury:
    "Pri semi-eulerovskom grafe začni v nepárnom vrchole, pri eulerovskom kdekoľvek. Vyber nepoužitú susednú hranu, ktorá nie je mostom zostávajúceho grafu. Most vezmi iba vtedy, ak je jedinou možnosťou. Hranu odstráň a pokračuj.",
  hierholzer:
    "Podľa prezentácie pracujeme s eulerovským grafom. Po nepoužitých hranách vytvor uzavretý cyklus. Ak ostali hrany, vyber vrchol už hotového okruhu s nepoužitou hranou. Vytvor odtiaľ ďalší cyklus a vlož ho do okruhu. Opakuj až do použitia všetkých hrán.",
};

Object.assign(theory, cv9Theory);
