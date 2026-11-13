# ADM · Grafy do hlavy

Slovenský tréning podľa `cv8.pdf`. BeerCSS / Material You, svetlá a tmavá téma, mobilné ovládanie, vlastná klávesnica. Bez účtu a bez AI pri kontrole odpovedí. Lokálne sa ukladajú nastavenia a počty vyriešených príkladov, nie rozpracovaná úloha.

## Spustenie

```sh
devenv shell
npm ci
adm-serve
```

`adm-serve` zostaví produkčný balík a spustí ho na **http://127.0.0.1:4173** (strict port). Pangolin nastav na HTTP, destination `127.0.0.1`, port `4173`. Pangolin konektor musí bežať v rovnakom sieťovom priestore ako server; v oddelenom kontajneri localhost označuje kontajner.

Alternatívne `devenv up` spustí deklarovaný proces `adm`. Vývoj: `npm run dev`. Overenie: `npm test` a `npm run build`.

## Obsah a rozšírenie

Zdrojové prezentácie nie sú súčasťou repozitára. Pre lokálny hosting vlož `cv8.pdf` a `Cv09_Blazek_prezentacia.pdf` do koreňa projektu a vytvor na ne odkazy v `public/`. Tieto súbory a odkazy Git ignoruje.

`src/content.js` obsahuje register prezentácií a modulov, zadania, vysvetlenia pravidiel. `src/graph.js` obsahuje generátor, matematické kontroly a čistý stavový model algoritmov. `src/main.js` obsluhuje rozhranie a konkrétne vysvetlenia. Novú prezentáciu pridaj do projektu, následne doplň jej moduly a kontrolné funkcie. Automatické spracovanie nahraných PDF nie je súčasťou aplikácie.

Vlastnosti sa vyberajú všetky súčasne. Pri orientovaných grafoch sa Eulerove vlastnosti neponúkajú (prezentácia ich definuje pre neorientované grafy). Okruh rešpektuje definíciu prezentácie: uzavretý ťah, vrcholy sa môžu opakovať. Hierholzerov tréning používa eulerovské grafy a vkladanie cyklov; Fleury aj semi-eulerovské. Celý výsledok overuje platnosť výsledného ťahu, pri Fleuryho algoritme navyše pravidlo mostov. Vkladanie cyklov sa kontroluje v krokovom režime. Návrat ku kroku a nová voľba nahradí neskoršiu vetvu histórie. Nápoveda je dostupná na každej obťažnosti.

Závislosti sú lokálne balené cez npm. Fonty z Google Fonts sú voliteľné; pri nedostupnosti sa použije systémový font. Pre verejný prístup sa očakáva reverzný proxy Pangolin; samotný proces nemá prihlasovanie.

Pre beh na pozadí: `devenv up -d`. Zastavenie: `devenv down`. Po zmene aplikácie proces reštartuj, aby `adm-serve` zostavil aktuálny balík. Kontrola rozhrania na desktope a mobiloch: `npm run test:ui` (pri spustenom serveri; Chromium je deklarované v devenv). Preview server prijíma názov domény od reverzného proxy, stále počúva iba na loopbacku.

Rozhranie tréningu používa výšku obrazovky na mobile aj desktope; menu má vlastné posúvanie. Rozsiahle vysvetlenia a ťahák sa zobrazujú v samostatnej vrstve. Nastavenia sú na `/#nastavenia` (téma a obťažnosť), predvolený vzhľad je tmavý. Algoritmy na každej obťažnosti ponúkajú **všetky vrcholy**, bez filtrovania možností alebo deaktivovania nesprávnych odpovedí. Pri násobných hranách sa vyberie jedna nepoužitá hrana medzi zadanými vrcholmi. Chyba sa vyhodnotí až po zadaní kroku; nápoveda je dobrovoľná.

Štatistiky na `/#statistiky` zobrazujú skutočné dáta z posledných X skúšaných príkladov (najviac 2 000). Sledujú samostatné vyriešenie bez chyby a nápovedy, dokončenie, chyby a nápovedy podľa témy a obťažnosti. Počítajú sa aj rozpracované príklady po prvej odpovedi, kroku alebo nápovede. Staršie súhrnné počty sa spätne nepovažujú za históriu. V nastaveniach je export a import zálohy JSON; import nahrádza históriu a počty vyriešených príkladov, pričom ponechá tému a obťažnosť. Neplatný súbor sa odmietne bez zmeny dát.

Ťahák sa otvára vedľa voľby obťažnosti a zatvára tlačidlom ×. Téma sa mení v nastaveniach. V režime Učenie zostáva výsledok zobrazený až do zatvorenia vysvetlenia alebo kliknutia na Ďalší príklad. Pri vlastnostiach grafov je vyhodnotená voľba konečná aj pri chybe; pred novým príkladom sa zobrazí vysvetlenie. Pri algoritmických krokoch sa dá chyba opraviť.

Režim **Učenie / Testovanie** v nastaveniach riadi automatické vysvetlenia po odpovedi. Učenie zobrazí popup, testovanie iba stručný výsledok v zadaní. Ručne vyžiadaná nápoveda funguje v oboch režimoch. Voľba sa uloží v prehliadači; zaznamenávanie tréningových dát funguje v oboch režimoch. Testovanie prechádza na ďalší príklad automaticky, Učenie čaká na kliknutie.

**Personalizácia cvičení** v nastaveniach mení iba výber ďalších príkladov. Profil a štatistiky sa zbierajú aj pri vypnutej personalizácii. Predvolene je vypnutá a tréning pokračuje v ručne vybratej téme. Po zapnutí sa pri novom príklade častejšie vyberajú slabšie témy podľa posledných 100 skúšaných príkladov pri aktuálnej obťažnosti: zohľadňujú sa chyby, nápovedy aj nedokončenie. Výber stále zahŕňa ostatné a zatiaľ neskúšané témy. Ručný výber témy platí pre aktuálny príklad a obťažnosť sa automaticky nemení. Voľba sa uchová v prehliadači aj pri importe tréningových dát.

## Cvičenie 9

`Cv09_Blazek_prezentacia.pdf` má vlastný priečinok v menu. Obsahuje eulerizáciu a semi-eulerizáciu s kontrolou minimálnej ceny duplikácie, Hamiltonovské cesty/cykly, nutné podmienky a Diracovu podmienku, počty v Kₙ, nearest neighbor, repetitive NN, cheapest link, nearest insertion a optimum TSP počítané brute force. Generované TSP grafy majú podľa obťažnosti 4–7 vrcholov, aby kontrola optima bola rýchla. Pri nearest insertion sa používa variant zo slajdov (najbližšia hrana YX a dve možnosti Z pri Y). Hrany zadávaj dvojicou vrcholov; do výberu sa ponúkajú všetky vrcholy. Pri NN sa posledný návrat do štartu doplní automaticky. Matematické funkcie sú v `src/cv9.js`, nové odpovedné panely v `src/cv9-view.js`. Váhy sa dajú čítať z matice alebo z diagramu. Opakovanie Hierholzerovho algoritmu z úvodu novej prezentácie zostáva v tréningu Cvičenia 8.

Každý príklad má vlastnú adresu `/cvXX/nazov/obtiaznost/seed`, napríklad `/cv9/eulerizacia/hard/12345678`. Odkaz určuje aj obťažnosť a obnovuje rovnaké zadanie, graf, váhy a prípadnú zadanú prechádzku. Pri návrate na koreň webu sa otvorí posledný príklad uložený v tomto prehliadači. Nový príklad dostane nový seed; ručný výber témy a obťažnosti sa premietne do adresy. Rozpracované odpovede a kroky sa cez seed neobnovujú, príklad sa otvorí od začiatku.

Ťaháky pre oba okruhy obsahujú Markdown sekcie s postupom riešenia, logikou pravidiel a typickými chybami. Zobrazujú sa cez knižnicu `marked`; dlhší obsah má vlastné posúvanie a tlačidlo × zostáva dostupné.
