# D&D Portal Wiki — performance- en renderingaudit

Datum: 21 november 2026
Scope: lokale productiebuild van de huidige checkout; applicatiecode is niet gewijzigd.

## Samenvatting

De dominante oorzaak van de grote HTML is server-side rendering van veel linkcomponenten met volledige hoverpopups. In de build staan 1.500 HTML-bestanden met samen 165.641.936 bytes; het gemiddelde bestand is circa 110,5 kB. De grootste pagina is `/classes/pugilist/` met 420.007 bytes. Die pagina bevat 169 volledige popups, 585 linkcontainers en 285 afbeeldingen.

Dit is geen browser-waterfallmeting. De audit kan daarom wel vaststellen welke bytes in de statische output zitten, maar niet zonder een echte mobiele netwerkmeting vaststellen welk aandeel van de gemelde PageSpeed-score door TTFB, CSS, afbeeldingen, JavaScript, fonts of derde partijen wordt veroorzaakt. De gemelde scores 32 mobiel en 50 desktop zijn als uitgangspunt genoteerd, niet opnieuw gemeten.

## Gemeten baseline

Buildcommando’s:

- `pnpm check`: geslaagd; `svelte-check found 0 errors and 0 warnings`.
- `pnpm build`: geslaagd; static output geschreven naar `build`.
- Aanvullend `pnpm test`: geslaagd; 1 testfile, 5 tests.

Buildobservaties:

| Metriek                      |                        Waarde |
| ---------------------------- | ----------------------------: |
| HTML-bestanden               |                         1.500 |
| HTML totaal                  | 165.641.936 bytes (157,9 MiB) |
| Gemiddelde HTML              |           circa 110.500 bytes |
| Volledige popup-markers      |                        80.691 |
| Description-popup-markers    |                        48.124 |
| Linkcontainer-markers        |                       341.269 |
| Client JavaScript in `build` |               4.982.538 bytes |
| Client CSS in `build`        |                 175.373 bytes |
| WebP in `build`              |               9.167.480 bytes |
| PNG in `build`               |               3.452.185 bytes |
| SVG in `build`               |                 985.415 bytes |

De HTML-telling is gebaseerd op alle `index.html`-bestanden plus de statische HTML-uitvoer in `build`; de routeanalyse gebruikt 1.499 route-`index.html`-bestanden. Het kleine verschil is de root-/speciale outputstructuur.

De actuele lokale build bevat daarmee 1.500 HTML-bestanden, niet ruim 2.000. Dat verschil is een belangrijk auditresultaat: het kan komen door een andere checkout, gewijzigde prerender-input of doordat “pagina” elders ook niet-HTML routes/records omvat. Het rapport gebruikt uitsluitend de reproduceerbare build die hier daadwerkelijk is gegenereerd.

De productiebuild meldt bovendien drie grote clientchunks: ongeveer 3.777 kB minified (791 kB gzip), 714 kB (101 kB gzip) en een 167 kB layout-CSS chunk. De buildwaarschuwing over chunks groter dan 1.000 kB is dus reëel. Server-side zijn onder meer `faq.js` circa 1.707 kB, `spell-data.js` circa 926 kB en `generated.js` circa 829 kB.

## Top 20 grootste HTML-pagina’s

De oorzaak-kolom is gebaseerd op de getelde markers in de gegenereerde HTML. `full` is een volledige hoverpopup; `desc` is een description-popup; `links` is een `link-container`.

|   # | Route                  |   Bytes |   KiB | full | desc | links | img |
| --: | ---------------------- | ------: | ----: | ---: | ---: | ----: | --: |
|   1 | `/classes/pugilist/`   | 420.007 | 410,2 |  169 |   39 |   585 | 285 |
|   2 | `/classes/shinobi/`    | 389.355 | 380,2 |  139 |   39 |   495 | 288 |
|   3 | `/classes/barbarian/`  | 388.077 | 379,0 |  162 |   48 |   582 | 281 |
|   4 | `/classes/cleric/`     | 334.378 | 326,5 |  115 |   49 |   443 | 199 |
|   5 | `/classes/ranger/`     | 331.396 | 323,6 |  133 |   39 |   477 | 247 |
|   6 | `/classes/monk/`       | 330.585 | 322,8 |  122 |   39 |   444 | 246 |
|   7 | `/classes/cleric-5e/`  | 329.697 | 322,0 |  113 |   49 |   437 | 195 |
|   8 | `/classes/ranger-5e/`  | 326.776 | 319,1 |  131 |   39 |   471 | 243 |
|   9 | `/classes/monk-5e/`    | 325.973 | 318,3 |  120 |   39 |   438 | 242 |
|  10 | `/classes/paladin/`    | 310.366 | 303,1 |  124 |   39 |   450 | 223 |
|  11 | `/classes/fighter/`    | 307.934 | 300,7 |  118 |   49 |   452 | 204 |
|  12 | `/classes/paladin-5e/` | 305.724 | 298,6 |  122 |   39 |   444 | 219 |
|  13 | `/classes/fighter-5e/` | 303.204 | 296,1 |  116 |   49 |   446 | 204 |
|  14 | `/classes/wizard/`     | 302.696 | 295,6 |  115 |   39 |   423 | 188 |
|  15 | `/classes/rogue-5e/`   | 301.097 | 294,0 |  119 |   39 |   435 | 226 |
|  16 | `/classes/bard/`       | 300.598 | 293,6 |  113 |   47 |   433 | 193 |
|  17 | `/classes/warlock/`    | 298.446 | 291,5 |  113 |   39 |   417 | 194 |
|  18 | `/classes/wizard-5e/`  | 297.965 | 291,0 |  113 |   39 |   417 | 184 |
|  19 | `/classes/bard-5e/`    | 295.969 | 289,0 |  111 |   47 |   427 | 189 |
|  20 | `/classes/warlock-5e/` | 293.747 | 286,9 |  111 |   39 |   411 | 190 |

De hoofdoorzaak van alle twintig regels is hetzelfde patroon: class-content met veel interne links, waarbij per link full-popup-HTML wordt SSR-gerenderd; de tweede versterkende factor is het aantal inline `<img>`-elementen. De exacte omvang per pagina wordt hierboven met `full`, `links` en `img` onderbouwd.

### Vergelijking per paginatype

| Routegroep           | Aantal |    Gemiddeld | Maximaal |     Totaal |
| -------------------- | -----: | -----------: | -------: | ---------: |
| spells               |    644 |      100.398 |  142.008 | 64.656.387 |
| faq                  |    403 |      102.779 |  147.282 | 41.419.939 |
| classes              |    207 |      158.608 |  420.007 | 32.831.917 |
| rules                |    127 |      120.677 |  145.227 | 15.326.032 |
| equipment            |     52 |      102.579 |  141.747 |  5.334.108 |
| homebrew             |     15 |      108.257 |  128.313 |  1.623.861 |
| overige routegroepen |     51 | circa 100 kB |  148.893 | circa 5 MB |

Classes zijn dus duidelijk de uitschieters. Spells en FAQ’s veroorzaken samen de meeste totale HTML door hun aantallen, niet door uitzonderlijk grote individuele pagina’s.

## Rendering en HTML-duplicatie

`src/lib/svelte/components/Link.svelte` gebruikt standaard `popup="full"`. Bij iedere dergelijke link wordt de volledige popup al tijdens SSR in de HTML gezet; CSS/JS maakt hem alleen zichtbaar bij hover/focus. De popup bevat opnieuw afbeelding, alt-tekst, titel, subtitel, beschrijving, URL-label en een tweede link. Daardoor betalen pagina’s ook voor popups die de bezoeker nooit opent.

De build bevat 80.691 volledige popup-markers. Dat is een directe, meetbare ondergrens voor herhaalde popupstructuur; de bytebijdrage is niet exact gelijk aan marker-count maal een vaste factor, omdat tekst- en afbeeldingsmetadata per link verschillen. Op de grootste class-pagina’s zijn 111–169 volledige popups en 411–585 linkcontainers zichtbaar. De 48.124 description-popups zijn kleiner, maar bevatten nog steeds SSR-HTML per link.

Andere structurele herhaling:

- De layout wordt op iedere pagina opnieuw gerenderd: navbar, sidebar, breadcrumbs, analytics, footer en mobiele navigatie.
- Sidebar-items zijn route-onafhankelijk grotendeels dezelfde metadata en links op iedere HTML-pagina.
- Dezelfde linkmetadata (titel, subtitel, beschrijving, icon-href/alt en route) wordt in veel popupinstanties opnieuw als HTML-tekst/attribuut opgenomen.
- Dezelfde content kan bewust via twee routes bestaan voor Homebrew-navigatie. Die duale navigatie is functioneel en mag niet worden verwijderd; optimalisatie moet route-identiteit en breadcrumbs behouden.

## Data- en JavaScriptanalyse

De brondata is een centrale, geneste TypeScript-boom onder `src/lib/typescript/data/`, met aparte `core`, `internals` en `externals` exports. Paginaobjecten combineren route/linkmetadata met inhoud, afbeeldingen, tags, navigatie, SEO- en broninformatie. `getData()` resolveert dot-paths. `scripts/generate-runtime-metadata.mjs` maakt daarnaast een afgeplatte runtime-registry met linkmetadata en children-maps.

Dat is een bruikbare scheiding voor SSR, maar er zijn drie verschillende representaties van verwante informatie:

1. volledige TypeScript-data voor routes en content;
2. gegenereerde runtime-linkmetadata voor de client/layout/linkcomponenten;
3. een search index waarin voor veel records zowel `fieldText` per veld als samengevoegde `searchText` wordt bewaard.

De zoekindex wordt in `src/lib/typescript/pages/search.ts` opgebouwd uit centrale pagina’s, spells, equipment, NPC’s en FAQ-vragen. Voor veel entries worden titel, description, volledige content, tags, URL en metadata tegelijk bewaard, naast `searchText` waarin die velden opnieuw zijn samengevoegd. Dat is functioneel eenvoudig, maar meetbaar redundant. Vooral lange FAQ-/spellcontent kan daardoor in clientbundles terechtkomen wanneer het search-modulepad op de client wordt gebruikt.

De buildoutput ondersteunt dat risico: de client heeft een chunk van circa 3,78 MB minified en de server heeft grote chunks voor FAQ-, spell- en generated-data. Zonder browsercoverage is niet bewezen dat iedere bezoeker al deze chunks op elke route downloadt; wél is bewezen dat zulke grote clientchunks beschikbaar zijn en dat de zoekimplementatie synchrone volledige indexdata importeert.

### Huidige versus voorgestelde datastructuur

| Onderdeel           | Huidig                                                           | Voorgesteld, compatibel met static hosting                                                                                                                                    |
| ------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canonieke content   | Geneste TypeScript-objectboom                                    | Behouden als authoring-/SSR-bron                                                                                                                                              |
| Route metadata      | In contentboom plus generated runtime registry                   | Eén compacte route registry met id, href, title, label, icon en minimale SEO-velden                                                                                           |
| Popupinhoud         | SSR per `Link`-instantie                                         | Alleen trigger-HTML SSR; één client-side popup host of description-only trigger; full details op interactie                                                                   |
| Search              | Volledige index met `fieldText` én `searchText` in client import | Prebuild compacte zoekrecords: id, route, titel, categorie, tags en eventueel samengevatte zoekvelden; lange bodytekst apart laden of server-/buildtijdig per shard verwerken |
| Relaties/navigation | children maps plus contentpaden; dubbele Homebrew-context bewust | Expliciete route-id en context-id behouden; relaties verwijzen naar ids, niet naar gekopieerde objecten                                                                       |
| Externe links       | In dezelfde linkvorm met `external`-vlag                         | Behouden; alleen popup-/clientpayload minimaliseren                                                                                                                           |

Dit is een voorstel voor een migratierichting, geen bewijs dat elk veld veilig verwijderd kan worden. SEO, toegankelijkheid en Homebrew-duale routes moeten per stap opnieuw worden geverifieerd.

## Zoekfunctie en initiële laadtijd

`WikiSearch.svelte` importeert `searchIndex` en voert filtering/scoring in de browser uit. De index zoekt ook in lange gestructureerde content en gebruikt edit-distance voor suggesties. De zichtbare resultaten zijn wel gepagineerd op 30, maar de volledige index is vóór rendering beschikbaar.

Meetbaar: de clientbuild meldt een chunk van circa 3,78 MB minified / 791 kB gzip en de server meldt een FAQ-chunk van circa 1,71 MB. De broncode maakt aannemelijk dat de zoekindex een belangrijke bijdrage levert aan JS-parse-, compile- en geheugenwerk. Niet gemeten: welke routes exact welke clientchunk laden en de werkelijke mobiele transfer-/parse-tijd. Dat vereist een browsertrace met netwerkcache uit.

## Netwerkassets, afbeeldingen en JavaScript versus rendering

| Probleem                                             | Status                                                             | Bewijs                                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Te veel SSR-HTML door full popups                    | Gemeten                                                            | 80.691 full-popup markers; top class pages 111–169 per pagina                    |
| Grote class-pagina’s door content/links/afbeeldingen | Gemeten                                                            | 420.007 bytes en 285 `<img>` op Pugilist; vergelijkbare class-uitschieters       |
| Herhaalde sidebar/layout                             | Gemeten als structurele herhaling, byteaandeel nog niet geïsoleerd | dezelfde `+layout.svelte`-structuur op alle pagina’s                             |
| Grote client-JS                                      | Gemeten                                                            | chunk circa 3,78 MB minified / 791 kB gzip; Vite-waarschuwing                    |
| Zoekindex in initiële JS                             | Waarschijnlijk, implementatiegedreven                              | synchrone import van volledige `searchIndex`; exacte routecoverage nog te tracen |
| Afbeeldingstransfer/encoding                         | Niet volledig gemeten                                              | build bevat 9,17 MB WebP, 3,45 MB PNG, 0,99 MB SVG; geen Lighthouse/networktrace |
| CSS/SCSS                                             | Gemeten als artifact, oorzaak niet dominant bewezen                | 175 kB CSS totaal, layout-CSS circa 167 kB                                       |
| Externe analytics/third-party netwerk                | Niet vastgesteld                                                   | vereist browsertrace en response-timing                                          |

De renderingproblemen zijn dus primair HTML-volume en verborgen interactieve DOM. Netwerkproblemen zijn daarnaast plausibel door afbeeldingen en grote JavaScriptchunks, maar kunnen niet eerlijk tot een PageSpeed-score worden herleid zonder runtime-profiel.

## Testframeworks, CI en ontbrekende controles

Aanwezig:

- Vitest 5; momenteel één testbestand met 5 tests.
- `svelte-check` via `pnpm check`, inclusief runtime metadata-generatie.
- GitHub Actions `build.yml`: install, `pnpm check`, `pnpm check:tsgo`, static build en controle op `build/index.html`, daarna Pages artifact/deployment.
- GitHub Actions `test.yml`: `pnpm test:unit` op push/PR.
- Een pre-live audit-script bestaat (`scripts/audit-prelive.mjs`), inclusief crawlmodus, maar zit niet in de getoonde CI-workflows.

Ontbrekend of niet aangetoond:

- geen snapshot-/fixturetests voor HTML-grootte, popup-counts of routecategorieën;
- geen test dat full popups alleen op bedoelde componenten worden gebruikt;
- geen build-size regression check voor HTML, clientchunks, images of search index;
- geen automatische crawl in CI van de volledige statische output;
- geen browser-E2E/accessibility/performance trace in CI;
- geen route-diff-test die beide Homebrew-URL-contexten en exacte active-state/breadcrumbs afdekt;
- geen test die client-imports van de zoekindex per route meet.

## Prioriteiten en verwachte impact

Impact is kwalitatief totdat een herbuild en browsertrace na iedere wijziging is uitgevoerd.

| Prioriteit | Optimalisatie                                                                                                                   | Risico                                                              | Verwachte impact                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| P0         | Full hoverpopup niet meer per link SSR’en; gebruik een gedeelde interactieve popup of laad details pas bij focus/hover          | Middel: keyboard, focus, positioning en SEO moeten behouden blijven | Zeer hoog op class-HTML; vermindert DOM, HTML-transfer en SSR-werk                 |
| P0         | Voeg build-audit toe die HTML per route, full/description popups en top-N chunks rapporteert                                    | Laag                                                                | Geen runtimewinst op zichzelf; voorkomt regressies en maakt claims reproduceerbaar |
| P1         | Maak linkcomponentdefaults expliciet per context; gebruik `none`/description waar volledige preview niet nodig is               | Middel                                                              | Hoog; snel toepasbaar op sidebar, tabellen en lijsten                              |
| P1         | Split zoekmetadata: compacte clientindex voor titel/route/tags; lange content niet standaard naar client                        | Middel/hoog                                                         | Hoog voor search-route en client parse/geheugen; exacte winst eerst meten          |
| P1         | Beperk afbeeldingen in lange class-pagina’s tot noodzakelijke zichtbare/semantische beelden en controleer lazy loading/formaten | Middel: layout/SEO/alt-tekst                                        | Middel tot hoog op beeldrijke class-pages en netwerktransfer                       |
| P2         | Verklein runtime registry en voorkom parallelle representaties waar niet nodig                                                  | Middel                                                              | Middel op client/server JS; lager direct HTML-effect                               |
| P2         | Browsertrace met mobiel/desktop, cold cache en throttling toevoegen aan audit/CI                                                | Laag                                                                | Meetwinst; maakt asset-, JS- en renderingoorzaken kwantitatief                     |
| P2         | CSS/componenten per route verder code-splitten                                                                                  | Middel                                                              | Waarschijnlijk middel; CSS is kleiner dan HTML/JS, dus eerst meten                 |

Er worden bewust geen nieuwe harde performance-budgetten voorgesteld. Eerst moeten de huidige baseline en variantie per paginatype in CI worden vastgelegd; daarna kunnen budgets worden afgeleid uit bestaande waarden en gewenste regressiemarges.

## Migratieplan in kleine stappen

1. Leg de huidige buildinventaris vast met route, bytes, popup-count, image-count, clientchunks en gzip-grootte. Commit alleen het audit-/meetmechanisme als dat afzonderlijk wordt goedgekeurd.
2. Voeg regressietests toe voor HTML-output en voor beide Homebrew-routecontexten: URL, breadcrumb, canonical en sidebar active state.
3. Instrumenteer `Link`-gebruik per component/context en classificeer `full`, `description` en `none`; wijzig nog geen gedrag.
4. Implementeer een gedeelde popup-host voor één beperkte proefroute, met keyboard/focus, touchgedrag, `aria-describedby`, positionering en `data-nosnippet` expliciet getest.
5. Vergelijk de proefroute opnieuw met dezelfde build- en browsermetingen; pas daarna uitrollen naar sidebar, lijsten en content.
6. Maak een compacte search-indexrepresentatie en laad lange zoekvelden alleen in de zoekroute of via afzonderlijke statische shards; vergelijk zoekresultaten byte-for-byte/functioneel.
7. Audit afbeeldingen per paginatype: afmetingen, formaat, lazy loading, duplicaten en noodzakelijke alt-tekst; wijzig per componentgroep.
8. Voeg de pre-live crawl en compacte build-size audit toe aan CI; laat deployment alleen doorgaan na check, tests, build en crawl.
9. Herhaal de mobiele en desktop browsertrace en stel pas dan performance-budgetten vast.

## Conclusie

De eerste optimalisatiedoelstelling moet renderingarchitectuur zijn: de full-popup-DOM is aantoonbaar de grootste bron van onnodige HTML op de zwaarste pagina’s. Daarna volgen de client-side zoekindex en beeldrijke content. De huidige tests bewaken vooral typecorrectheid, een kleine set datacontracten en een succesvolle build; ze bewaken nog niet de performance-eigenschappen die bij 2.000+ statische pagina’s belangrijk zijn.
