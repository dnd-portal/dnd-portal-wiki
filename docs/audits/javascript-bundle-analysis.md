# JavaScript bundle-analyse

Datum: 2026-11-21
Scope: productiebuild van de huidige checkout; audit-only, geen applicatiecode gewijzigd.

## Samenvatting

De grootste clientchunk is:

```text
build/_app/immutable/chunks/COwhGv4r.js
3777383 bytes (3.60 MiB), ongeveer 791.22 kB gzip
manifest name: _index_
```

Dit is geen PopupHost-chunk. De chunk bevat de canonical data-barrel en grote delen van de volledige interne contentregistratie. De belangrijkste importketen is:

```text
+layout.svelte
  -> currentPage.ts
    -> spell-data.ts
    -> data/_index_.ts
      -> data/internals/_index_.ts
        -> FAQ, projectdata, classes, subclasses en overige canonical records
```

De root layout importeert de `currentPage`-chunk. In de clientmanifest-grafiek importeert `gE5ykDF1.js` (`currentPage`) `_COwhGv4r.js`. Daardoor is de volledige canonical datachunk onderdeel van de initiële hydration-keten van normale pagina's, niet alleen van pagina's die de data zichtbaar nodig hebben.

Belangrijk onderscheid: de build bevat geen client-sourcemaps. Daarom kan de exacte minified/gzip-bytebijdrage per TypeScript-bestand niet eerlijk worden toegewezen. De tabel hieronder is een reproduceerbare source-graph met bronbytes, aangevuld met verificatie in de gegenereerde chunk. Dit is een meetbare bijdrage-/omvangproxy, geen claim dat elk bronbyte één-op-één in de chunk terechtkomt.

## Baseline

Uitgevoerd vanuit de repository-root met pnpm:

```text
pnpm check  -> geslaagd; svelte-check: 0 errors, 0 warnings
pnpm test   -> geslaagd; 1 testbestand, 5 tests
pnpm build  -> geslaagd; 1432 SSR-modules, 1519 client-modules
```

Gemeten buildresultaat:

| Onderdeel | Meting |
|---|---:|
| Grootste clientchunk | 3,777,383 bytes |
| Grootste clientchunk gzip | 791.22 kB |
| Tweede grote clientchunk (`gE5ykDF1.js`) | 713,666 bytes; 100.95 kB gzip |
| `DVU4C2_M.js` (`search`) | 7,586 bytes |
| `DMJx2w_d.js` (`canonicalPage`) | 77 bytes; het importeert de grote datachunk via routegrafiek |
| Clientmodules | 1,519 |
| SSR-modules | 1,432 |
| Vite-waarschuwing | chunks groter dan 1,000 kB |

De clientchunks in de build zijn samen circa 4,98 MB ongecomprimeerd. De 3,78 MB-chunk is daarmee ongeveer 75,8% van de gemeten clientchunkbytes.

## Exacte chunk- en afhankelijkheidsgrafiek

### Chunkidentiteit

De Vite-manifestkoppeling is:

```text
_COwhGv4r.js -> build/_app/immutable/chunks/COwhGv4r.js -> name: _index_
_gE5ykDF1.js -> name: currentPage -> imports _COwhGv4r.js
_DVU4C2_M.js -> name: search -> imports _COwhGv4r.js, _gE5ykDF1.js
```

De grote chunk begint met canonical metadata/objecten (`discord`, registries en records) en exporteert onder meer de interne/externe dataregistratie en `getData`. Literal-counts in de gegenereerde chunk bevestigen dat het geen alleenstaande routecomponent is: `internals` komt 2.910 keer voor, `externals` 30 keer, `Acid Splash` 457 keer en `Pugilist` 270 keer.

### Belangrijkste importketens

1. `src/routes/+layout.svelte` → `src/lib/typescript/pages/currentPage.ts` → `spell-data.ts` → canonical data/barrel-afhankelijkheden. Dit maakt de chunk gemeenschappelijk voor de root hydration-keten.
2. Routecomponenten die `canonicalPage.ts` gebruiken → `getCanonicalPageData()` → `getData()` → `src/lib/typescript/data/_index_.ts` → volledige canonical registry.
3. `src/lib/typescript/pages/search.ts` importeert de canonical data, spell-data, equipment-items, FAQ-data en Pugilist/NPC-data. De search-node is dus inhoudelijk breder dan zijn eigen 7,6 kB routechunk suggereert; de gedeelde chunks dragen het gewicht.
4. `Link.svelte` en `PopupHost.svelte` gebruiken runtime metadata uit `src/lib/typescript/data/runtime`. PopupHost importeert alleen `RuntimeLinkMetadata` als type en is dus niet de oorzaak van de 3,78 MB-chunk.

### Routes en initiële/lazy loading

De clientmanifest-grafiek bevat 63 client-nodes. `_COwhGv4r.js` zit in de transitieve import closure van 54 nodes. Node 0 is de root layout en importeert transitief `currentPage` en `_COwhGv4r.js`; daardoor is de chunk bij de eerste hydration van routes onder deze layout initieel nodig.

De overige route-specifieke chunks zijn wel lazy op node-niveau, maar dat helpt hier beperkt: een gemeenschappelijke root-layout dependency wordt niet uitgesteld tot hover, search-interactie of een specifieke canonical pagina. `search` heeft een eigen nodechunk, maar zijn zware data wordt via de gedeelde `_index_`/`currentPage`-keten aangehaakt.

## Top 20 bronmodules in de canonical data-grafiek

De volgende meting is gemaakt door de import/export-grafiek vanaf `src/lib/typescript/data/_index_.ts` te traverseren. Er zijn 1.105 bereikbare TypeScript-modules met samen 5,078,808 bronbytes. De tabel is aflopend op bronbestandsgrootte.

| # | Module | Bronbytes | Waarschijnlijke rol in de chunk |
|---:|---|---:|---|
| 1 | `src/lib/typescript/data/internals/faq.ts` | 64,292 | FAQ-content/registratie |
| 2 | `src/lib/typescript/data/internals/project.ts` | 60,151 | project-/sitecontent |
| 3 | `src/lib/typescript/data/internals/classes/pugilist/page.ts` | 60,054 | volledige klassepagina |
| 4 | `src/lib/typescript/data/internals/classes/pugilist/subclasses/bloodhound-bruisers/page.ts` | 58,094 | subclass-content |
| 5 | `src/lib/typescript/data/internals/classes/pugilist/subclasses/arena-royale/page.ts` | 58,085 | subclass-content |
| 6 | `src/lib/typescript/data/internals/classes/pugilist/subclasses/piss-and-vinegar/page.ts` | 58,083 | subclass-content |
| 7 | `src/lib/typescript/data/internals/classes/pugilist/subclasses/squared-circle/page.ts` | 58,082 | subclass-content |
| 8 | `src/lib/typescript/data/internals/classes/pugilist/subclasses/dog-and-hound/page.ts` | 58,080 | subclass-content |
| 9 | `src/lib/typescript/data/internals/classes/pugilist/subclasses/sweet-science/page.ts` | 58,079 | subclass-content |
| 10 | `src/lib/typescript/data/internals/classes/pugilist/progression.ts` | 57,891 | progression data |
| 11 | `src/lib/typescript/data/internals/classes/shinobi/page.ts` | 51,794 | volledige klassepagina |
| 12 | `src/lib/typescript/data/internals/classes/shinobi/subclasses/medical/page.ts` | 49,304 | subclass-content |
| 13 | `src/lib/typescript/data/internals/classes/shinobi/subclasses/elemental-ninjutsu/page.ts` | 49,302 | subclass-content |
| 14 | `src/lib/typescript/data/internals/classes/shinobi/subclasses/bloodline/page.ts` | 49,292 | subclass-content |
| 15 | `src/lib/typescript/data/internals/classes/shinobi/subclasses/paths/page.ts` | 49,286 | subclass-content |
| 16 | `src/lib/typescript/data/internals/classes/shinobi/subclasses/taijutsu/page.ts` | 49,280 | subclass-content |
| 17 | `src/lib/typescript/data/internals/classes/shinobi/subclasses/sealing/page.ts` | 49,279 | subclass-content |
| 18 | `src/lib/typescript/data/internals/classes/shinobi/subclasses/genjutsu/page.ts` | 49,275 | subclass-content |
| 19 | `src/lib/typescript/data/internals/classes/shinobi/subclasses/fortune/page.ts` | 49,270 | subclass-content |
| 20 | `src/lib/typescript/data/internals/classes/shinobi/progression.ts` | 49,131 | progression data |

Deze top 20 bestaat vooral uit inhoudelijke records. Dat is precies het probleem: een clientmodule die alleen route- of popupmetadata nodig heeft, trekt complete renderdata en class registries mee.

## Runtime metadata en PopupHost

De runtime-route `src/lib/typescript/data/runtime/index.ts` bouwt `runtimeLinks` uit `runtime/generated.ts` en exporteert beperkte metadata-/child-lookupfuncties. `PopupHost.svelte` importeert daarvan uitsluitend het type `RuntimeLinkMetadata`; er is geen value-import van de canonical `data/_index_` in PopupHost.

Daarmee is de hypothese “PopupHost importeert zelf alle wiki-data eager” niet bevestigd. De bevestigde eager oorzaak zit hogerop in gedeelde modules: `currentPage.ts` importeert `getSpellBySlug` als runtime value, en route-/page-code importeert `getData` uit de canonical barrel. De popuparchitectuur kan dus klein blijven als popupresolutie beperkt blijft tot runtime metadata of een lazy data request.

## Spell-, search- en registrydata

Gemeten bronbestanden:

| Bestand | Bronbytes | Bevinding |
|---|---:|---|
| `spell-data.ts` | 957,993 | zeer groot; via `currentPage.ts` gedeeld in de hydration-keten |
| `runtime/generated.ts` | 740,735 | grote gegenereerde runtime registry; functioneel nuttig voor links/navigation, maar moet niet automatisch gelijkstaan aan volledige page content |
| `search.ts` | 16,403 | orchestration/indexgebruik; niet de grootste bytes zelf |
| `faq.ts` | 64,292 | canonical FAQ-data; opgenomen in de canonical graph |
| `data/_index_.ts` | 1,274 | kleine barrel, maar re-exporteert grote value trees |

De meting bewijst dat `spell-data.ts` veel groter is dan de route-orchestratie zelf en dat de canonical barrel duizenden records bereikbaar maakt. Zonder sourcemap kan de exacte overlap tussen `runtime/generated.ts`, `spell-data.ts` en minified chunk niet per byte worden toegewezen. De importrelaties en de chunkliteral-verificatie bewijzen wel dat de browser een full registry krijgt voor een gedeelde route dependency.

## Duplicatie tussen HTML en JavaScript

Prerendering zet de uiteindelijke page content in HTML voor SEO, toegankelijkheid en JS-loze navigatie. De client bundle bevat daarnaast dezelfde canonical records opnieuw omdat de browser-side route/hydration code `getData()` en spell lookup beschikbaar maakt.

Dit is geen duplicatie van de oude full hoverpopup-HTML meer; die P0 is opgelost. Het is wel een tweede representatie van inhoudelijke data: HTML bevat gerenderde content, terwijl de client een brede bronregistratie downloadt om route state, breadcrumbs, search en lookups te hydrateren. De juiste oplossing is daarom niet HTML verwijderen, maar client-side value imports beperken tot metadata die werkelijk tijdens hydration nodig is.

## Aanbevolen optimalisaties

### P0 — verwijder full spell-data uit de gedeelde layoutketen

Vervang de value-import van `getSpellBySlug` in `currentPage.ts` door een kleine runtime breadcrumb/metadata lookup, of laad spell-data alleen in spellroutes. Verwachte impact: de 713,666-byte `currentPage`-chunk en een deel van de canonical closure wordt uit de normale initial payload gehaald. Exacte eindwinst moet na implementatie opnieuw worden gemeten.

Risico: spell breadcrumbs, deep links en hydration. Test bestaande spellroutes, onbekende slugs, JS uit en client navigatie.

### P0 — maak canonical page data server-/route-lokaal

Voorkom value imports van `data/_index_.ts` vanuit gedeelde clientmodules. Gebruik SvelteKit route-loaddata voor prerendering en serializeer alleen de data die de betreffende route/component nodig heeft. Houd de canonical registry server-side of route-specifiek.

Risico: hydration mismatch, SEO en dubbele Homebrew-routes. Test HTML-output, canonical metadata, breadcrumbs en exact URL-gebaseerde sidebar-active state.

### P1 — splits registries en barrels

Maak expliciete kleine browser-safe modules voor `title`, `href`, `type`, `variant` en popup summary metadata. Vermijd een barrel die full `externals` en `internals` als value exporteert wanneer een caller slechts één lookup nodig heeft.

Risico: exports die impliciet door tests of routes worden gebruikt. Voeg import-graph checks toe.

### P1 — laad search-indexen alleen op de search route

Houd search-indexdata route-lokaal en laad die dynamisch of als compacte statische JSON-shards. De search orchestrator moet niet via een gedeelde layoutmodule full spell/class/FAQ-content importeren.

Risico: eerste zoekinteractie en offline/JS-loze searchgedrag. Behoud server-side searchpagina en test een vertraagde/afgebroken lazy load.

### P2 — class/spell data route-specifiek code-splitten

Splits class pages, subclass progression en spell details naar route chunks. Dit heeft pas zin nadat de gedeelde `currentPage`/canonical imports zijn verwijderd; anders blijven ze via de root closure eager.

## Voorgestelde regressietests en budgets

Gebruik eerst de hier gemeten baseline; leg geen absolute budgetten op die niet uit productiegedrag volgen.

1. Manifesttest: root layout mag niet transitief `_COwhGv4r.js` importeren.
2. Manifesttest: normale contentroutes mogen geen full canonical datachunk in hun initial node dependency set hebben.
3. Popuptest: generated HTML bevat geen full popupstructuren; anchors blijven bruikbaar zonder JS.
4. Accessibilitytest: keyboard focus, `aria-describedby`/popuprelatie, touch en reduced motion.
5. Hydrationtest: browser console zonder hydration errors op representative routes; controleer mouse trigger → popup → popup-link overgang.
6. Functionaliteitstest: internal/external links, spell breadcrumb, search, Homebrew dual routes en canonical metadata.
7. Bundle-regressie: fail bij een stijging van meer dan 5% ten opzichte van de laatst vastgelegde baseline voor initial shared JS of een routechunk. Na elke geslaagde splitsing wordt de nieuwe gemeten baseline vastgelegd.
8. Hard invariant voor deze P0: `_COwhGv4r.js` mag niet in de initiële root-layout closure terugkomen. De absolute chunkgrootte wordt daarna opnieuw gemeten; een lagere target zonder meting is niet verantwoord.

## Conclusie

De 3,777,383-byte chunk wordt veroorzaakt door een brede canonical data-barrel die via gedeelde `currentPage`- en route-data imports in de client terechtkomt. PopupHost is in de huidige code niet de eager import van die dataset. De eerste concrete stap is daarom het losmaken van spell lookup en canonical `getData()` uit de root/shared client graph; daarna kunnen search- en route-specifieke registries afzonderlijk worden gesplitst. Dit behoudt statische hosting, SEO, accessibility en JS-loze links zolang de route data server-side/prerendered blijft en hydration dezelfde beperkte data ontvangt.

## Implementatie P0 — before/after

Deze sectie is toegevoegd na de P0-wijziging en bevat opnieuw gemeten productiebuilddata.

### Wijzigingen

- `currentPage.ts` importeert niet langer `spell-data.ts`; spell breadcrumbs gebruiken een build-time gegenereerde lichte runtime-index met alleen slug, naam, level-slug en level-label.
- De type-imports in `currentPage.ts` verwijzen rechtstreeks naar de type-only modules. `Data.ts` gebruikt een expliciete `import type`, zodat de canonical value-barrel niet via een type dependency in de clientgrafiek terechtkomt.
- Navbar-suggesties importeren de volledige search-index dynamisch bij een zoekterm van minimaal twee tekens. De normale root layout laadt search niet meer eager.
- De bestaande canonical data blijft beschikbaar voor SSR en de routes/components die de volledige content daadwerkelijk renderen. Er is geen API of externe runtime dependency toegevoegd.

### Gemeten vergelijking

| Meting | Voor P0 | Na P0 |
|---|---:|---:|
| Grootste clientchunk | 3,777,383 bytes; 791.22 kB gzip | 1,328,616 bytes; 219,798 bytes gzip |
| Tweede grote clientchunk | 713,666 bytes; 100.95 kB gzip | 1,184,334 bytes; 275,842 bytes gzip |
| Totale client-JS output | circa 4,982,834 bytes | 4,852,028 bytes |
| Totale gzip van clientchunks | niet eerder totaal gemeten | 1,012,919 bytes |
| Root layout transitieve JS | circa 4,98 MB closure door gedeelde data | 885,773 bytes |
| Client nodes met canonical data-chunks | 54 van 63 | 37 van 64 |
| HTML-bestanden/routes | 1,500 | 1,500 |
| Totale HTML-output | 165.6 MB in eerdere audit | 90,064,364 bytes |

De grootste chunk is daarmee 64.8% kleiner in minified bytes en 72.2% kleiner in gzip ten opzichte van de oorspronkelijke grootste chunk. De totale clientoutput daalde slechts circa 2.6%; dat is verwacht, omdat volledige data nog steeds nodig is op content- en searchroutes. De relevante winst is dat die data niet langer in de gedeelde root-layout initial dependency closure zit.

De actuele grote chunks zijn route-/registrygericht:

```text
Br4yLITJ.js  1,328,616 bytes  (_index_ route data)
CuVyoXwu.js  1,184,334 bytes  (faq route data)
GzbqIaku.js    788,232 bytes  (spell-data, route-lokaal)
D_aPLMlF.js    750,093 bytes  (currentPage/runtime-related)
```

De exacte Vite-manifestcontrole toont voor node 0 geen directe canonical chunk en de root closure bevat alleen de layout/shared chunks (885,773 bytes). De resterende canonical chains lopen via route-local `canonicalPage`, search, FAQ, class/page content en spell components. Zij zijn dus niet opgelost door de P0 en blijven bewust zichtbaar als resterende bottlenecks.

### Tests en browsercontrole

Uitgevoerd:

```text
pnpm check              -> geslaagd; 0 errors, 0 warnings
pnpm test               -> geslaagd; 2 testbestanden, 8 tests
pnpm build              -> geslaagd; 1432 SSR-modules, 1519 client-modules
pnpm audit:prelive:crawl -> geslaagd; alle pre-live checks PASS
```

De nieuwe boundary-tests controleren dat `currentPage` geen full `spell-data` importeert en dat de canonical `Data`-type-import type-only blijft.

In een echte browser op de production preview zijn gecontroleerd:

- homepage hydration en normale navigatie;
- directe deep-link naar `/spells/magic-missile/`;
- breadcrumbs `Spells → 1st Level → Magic Missile`;
- spellcontent en spell-level metadata;
- consolefouten: geen errors;
- gedeelde popup-host: één `#wiki-shared-popup`, nul `.popup--full` nodes in de initial DOM.

De static crawl controleerde daarnaast links, canonical URLs, titels, descriptions, H1's, duplicate IDs, `aria-describedby`, popup-interactiviteit, JSON-LD en trailing slashes.

### Resterende problemen

De P0 is geslaagd voor het doel “canonical data uit de shared client/layout bundle halen”, maar de website heeft nog steeds meerdere grote routechunks boven 1 MB. Search laadt nog altijd grote indexdata zodra de zoekmodule wordt gebruikt; FAQ- en canonical page-data blijven route-lokaal groot. Een volgende P1 moet deze routechunks verder sharden of als statische lazy data laden. Dat is bewust niet in deze P0 meegenomen.
