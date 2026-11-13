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
  counts: `### Ako postupovať
1. Najprv si prečítaj, **čo sa počíta**: susedia, incidentné hrany, všetky hrany alebo súčet stupňov.
2. Pri susedoch si vypíš rôzne vrcholy spojené s označeným vrcholom. Rovnaký vrchol započítaj iba raz.
3. Pri incidentných hranách počítaj každú hranu dotýkajúcu sa vrcholu. Násobné hrany počítaj samostatne; slučku ako jednu hranu.
4. Pri počte všetkých hrán prejdi graf systematicky a každú hranu označ iba raz.

### Prečo to funguje
Stupeň počíta **konce hrán**, preto slučka pridáva dva. Každá neorientovaná hrana má dva konce, takže súčet stupňov je **2 × počet hrán**.

### Užitočné skratky
- Kompletný graf Kₙ má **n(n−1)/2** hrán: každý vrchol spojíš s ostatnými a delením dvomi odstrániš dvojité počítanie.
- Kompletný bipartitný graf s časťami veľkosti m a n má **m × n** hrán.
- Slučka robí vrchol jeho vlastným susedom. Viac hrán do toho istého vrcholu nepridáva ďalších rôznych susedov.`,
  types: `### Ako postupovať
Vlastnosti kontroluj **každú zvlášť** a označ všetky pravdivé možnosti.

1. Pozri, či graf má šípky a číselné váhy: určujú orientovanosť a ohodnotenie.
2. Skontroluj slučky a násobné hrany. Jednoduchý graf nemá ani jedno.
3. Skús sa po hranách dostať z jedného vrcholu ku všetkým ostatným. Ak to ide, graf je súvislý; v tejto kontrole súvislosti zanedbávame smer šípok.
4. Kompletný neorientovaný graf má medzi každými dvoma rôznymi vrcholmi hranu a je jednoduchý.
5. Skús vrcholy vyfarbiť dvomi farbami tak, aby každá hrana spájala rôzne farby. Ak uspeješ, graf je bipartitný. Ak sú navyše prepojené všetky dvojice naprieč skupinami a graf je jednoduchý, je kompletne bipartitný.
6. Pre Eulerove vlastnosti over súvislosť a spočítaj nepárne stupne: **0 znamená eulerovský, presne 2 semi-eulerovský**.
7. Pri DAG sleduj smer šípok: nesmie existovať orientovaný cyklus.

### Prečo to funguje
Dvojfarebnosť rozdelí graf na dve skupiny bez vnútorných hrán. Nepárne stupne určujú možné konce eulerovského ťahu: každý vnútorný príchod potrebuje aj odchod.

### Na čo si dať pozor
Jedna vlastnosť nevylučuje ostatné. Bipartitný graf nemusí byť kompletný bipartitný. Eulerove vlastnosti tu ponúkame len pri neorientovaných grafoch.`,
  degree: `### Ako postupovať
1. Nájdi zvýraznený vrchol.
2. Prejdi všetky hrany, ktoré sa ho dotýkajú. Za bežnú hranu pripočítaj **1**.
3. Za každú slučku pripočítaj **2** a každú z násobných hrán započítaj samostatne.
4. Zadaj výsledný súčet. Izolovaný vrchol má stupeň 0.

### Prečo to funguje
Stupeň je počet koncov hrán vo vrchole. Bežná hrana má v danom vrchole jeden koniec, slučka oba.

### Kontrola
V neorientovanom grafe musí súčet stupňov všetkých vrcholov vyjsť **2 × počet hrán**. Počet susedov nie je vždy stupeň: slučky a násobné hrany tieto počty odlišujú.`,
  walk: `### Ako postupovať
1. Čítaj zadanú postupnosť po susedných dvojiciach. Každý prechod musí byť skutočnou hranou grafu; inak nejde ani o sled.
2. Pozri, či sa opakuje niektorá **hrana**. Ak nie, ide o ťah.
3. Pozri, či sa opakuje niektorý **vrchol**. Ak nie, ide o cestu.
4. Porovnaj prvý a posledný vrchol. Ak sú rovnaké a hrany sa neopakujú, ide podľa tejto prezentácie o okruh.
5. Označ všetky platné vlastnosti, nielen tú najprísnejšiu.

### Prečo to funguje
Každá cesta je aj ťah a sled. Ťah môže navštíviť rovnaký vrchol viackrát, ale nesmie znovu použiť tú istú hranu.

### Na čo si dať pozor
Pri neorientovanej hrane je A–B tá istá hrana ako B–A. **Okruh je tu uzavretý ťah**, preto môže opakovať vnútorné vrcholy. Samotný návrat do štartu ešte nestačí: nesmieš opakovať hranu.`,
  cost: `### Ako postupovať
1. Rozdeľ zadanú prechádzku na jednotlivé prechody: napríklad A → B → C dá hrany A–B a B–C.
2. Ku každému prechodu nájdi váhu príslušnej hrany v grafe.
3. Váhy postupne sčítaj. Ak sa po tej istej hrane vraciaš, pripočítaj jej cenu znovu.
4. Zadaj súčet za **celú prechádzku**, nie iba za rôzne použité hrany.

### Prečo to funguje
Cena sa platí pri každom prejdení hrany. Ak A–B stojí 4 a B–C stojí 7, prechádzka A → B → C → B stojí **4 + 7 + 7 = 18**.

### Na čo si dať pozor
Váha hrany nie je stupeň vrcholu. Čítaj cenu konkrétnej hrany, nie číslo najbližšie k miestu, kde sa hrany križujú.`,
  fleury: `### Ako postupovať
1. Spočítaj nepárne stupne. Pri dvoch nepárnych vrcholoch začni v jednom z nich; pri eulerovskom grafe môžeš začať kdekoľvek.
2. Z aktuálneho vrcholu posudzuj iba **nepoužité** susedné hrany.
3. Ak máš viac možností, vyber takú, ktorá nie je mostom zostávajúceho grafu. Predstav si jej odstránenie: nesmie oddeliť časť s hranami, ktoré ešte potrebuješ prejsť.
4. Most použi iba vtedy, keď už nemáš inú možnosť.
5. Zvolenú hranu považuj za použitú, prejdi do jej druhého vrcholu a opakuj až do prejdenia všetkých hrán.

### Prečo to funguje
Predčasným prejdením mosta by si si odrezal cestu k neprejdeným hranám. Odkladanie mostov umožní najprv dokončiť hrany na aktuálnej strane.

### Na čo si dať pozor
Most posudzuj **po už vykonaných krokoch**, nie iba v pôvodnom grafe. Pri násobných hranách ostáva druhá paralelná hrana samostatnou možnosťou.`,
  hierholzer: `### Ako postupovať
1. V tomto tréningu začínaš v eulerovskom grafe. Vyber ľubovoľný štart.
2. Kráčaj po nepoužitých hranách, až sa vrátiš do štartu a vytvoríš uzavretý cyklus.
3. Ak ostali nepoužité hrany, vyber vrchol **už vytvoreného okruhu**, z ktorého nejaká taká hrana vychádza.
4. Vytvor z neho ďalší uzavretý cyklus.
5. Vlož nový cyklus do pôvodného okruhu v spoločnom vrchole. Opakuj, kým nepoužiješ všetky hrany.

### Prečo to funguje
Párne stupne zabezpečia, že sa pri budovaní cyklu nezasekneš v inom vrchole. Vloženie cyklu zachová uzavretosť okruhu a pridá ďalšie nepoužité hrany.

### Na čo si dať pozor
Nepoužívaj už prejdenú hranu. Na rozdiel od Fleuryho algoritmu tu nevyberáš podľa mostov: podstatné je **skladanie a vkladanie cyklov**.`,
};

Object.assign(theory, cv9Theory);
