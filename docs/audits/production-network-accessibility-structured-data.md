# Production network, accessibility and structured-data audit

## Scope and evidence

This audit uses three sources of evidence:

- the supplied production HAR (`dnd-portal.com.har`),
- a fresh local static build and `pnpm audit:production`, and
- Lighthouse 13.6.0 against the local production preview.

The local worktree contains unrelated, uncommitted content changes. The build
therefore measures the current worktree, not a clean historical release. No
live content or deployment was changed by this audit.

## Production HAR baseline

The supplied HAR contains 71 requests and approximately 1.16 MiB transferred.
It contains 35 JavaScript requests. The largest five JavaScript responses are:

| Response      | Transfer | Uncompressed | Build identity / role                           |
| ------------- | -------: | -----------: | ----------------------------------------------- |
| `DFA4sPz8.js` |  279 KiB |  1,184,334 B | spell-data registry                             |
| `DoGUmbMH.js` |  215 KiB |  1,299,067 B | canonical data registry                         |
| `GzbqIaku.js` |  167 KiB |    788,232 B | spell-data registry in the current build naming |
| `B0xy1BMz.js` |  108 KiB |    742,551 B | current-page/runtime registry                   |
| `BBeAVfbe.js` |   48 KiB |    174,072 B | shared metadata/content helper                  |

The HAR names are content hashes and do not match the fresh local build hashes.
The module identities were verified against the local Vite manifest rather than
inferred from the names alone.

## Fresh local production build

Measured after `pnpm build` in the current worktree:

| Measure                              |       Result |
| ------------------------------------ | -----------: |
| Generated HTML files                 |        1,500 |
| Total HTML                           | 89,998,758 B |
| Total client JavaScript              |  5,023,704 B |
| Total client JavaScript gzip         |  1,081,177 B |
| Root-layout dependency closure       |    885,801 B |
| Client nodes with canonical data     |      42 / 64 |
| Homepage HTML-declared JS requests   |           23 |
| Homepage HTML-declared JS            |    913,917 B |
| Homepage HTML-declared resource tags |           43 |

The root closure still contains `D_aPLMlF.js` (`currentPage`, 750,093 B), which
is the dominant homepage-specific shared dependency. The full canonical,
FAQ and spell chunks are not in the homepage HTML preload list, but remain
available to route nodes that need them:

| Chunk         | Module identity                  |     Bytes |    Gzip |
| ------------- | -------------------------------- | --------: | ------: |
| `Br4yLITJ.js` | canonical `data/_index_`         | 1,328,616 | 219,798 |
| `CuVyoXwu.js` | `faq`                            | 1,184,334 | 275,842 |
| `GzbqIaku.js` | `spell-data`                     |   788,232 | 164,156 |
| `D_aPLMlF.js` | `currentPage` / runtime metadata |   750,093 | 109,396 |
| `CCA_3FkA.js` | canonical page data helper       |   179,392 |  50,433 |

### Dependency and loading classification

The current root chain is:

```text
+layout.svelte
  -> currentPage.ts
    -> data/runtime/generated.ts
  -> seo.ts
    -> currentPage.ts
```

`Navbar.svelte` uses `import('#lib/typescript/pages/search.js')` only after a
query reaches two characters. The search module is therefore a dynamic import
in source and is not a direct homepage preload. Route-specific chunks are
represented as node imports in the Vite manifest and are fetched when their
route is activated. The browser HAR is the authoritative evidence for what a
production run actually downloaded; an available dynamic import in a manifest
is not by itself proof of an initial request.

The supplied HAR's large app downloads and the fresh manifest agree on the
remaining bottleneck: shared runtime/current-page metadata is still too broad,
while FAQ and spell data are route-local but individually large. This is a
real dependency cost, not a popup-host regression.

## Lighthouse measurements

The earlier local before/after image measurements are recorded in
`docs/audits/lighthouse-performance.md`: WebP reduced the local homepage from
4,597 KiB to 477 KiB and from 57/76 to 100/100 in that controlled run. Those
results do not guarantee production results.

A fresh Lighthouse run against the current local preview produced the
following laboratory values:

| Metric           | Mobile emulation | Desktop emulation |
| ---------------- | ---------------: | ----------------: |
| FCP              |            0.9 s |             0.9 s |
| LCP              |            8.3 s |             8.3 s |
| TBT              |           910 ms |            830 ms |
| CLS              |                0 |                 0 |
| Speed Index      |            1.2 s |             1.2 s |
| Main-thread work |            2.1 s |             2.0 s |

These local results are materially worse than the earlier local WebP run and
must not be presented as production results. The current worktree includes
additional uncommitted content and the measured LCP was the homepage article,
not the wallpaper. The trace attributed approximately 176–184 ms to the
Google Tag Manager script and most remaining boot-up work to unattributed
script evaluation. This supports measuring the deployed build and the clean
homepage again before changing the shared runtime architecture.

## Accessibility audit

The production-output audit now scans all generated HTML, not just selected
templates. It verifies:

- every generated `img` has an `alt` attribute;
- empty interactive controls have visible text, an image alt name, or an
  explicit ARIA name; and
- the shared popup and semantic-anchor checks remain active.

Current result: 1,500 HTML files scanned, no images missing `alt`, and no
unnamed button or anchor controls. CSS background images are not treated as
content images; their accessibility depends on the surrounding semantic
content and is therefore not incorrectly “fixed” with meaningless alt text.

## Structured data audit

The existing centralized generator in `src/lib/typescript/pages/seo.ts` emits:

- `WebSite` on the homepage, and
- `BreadcrumbList` on pages with at least two breadcrumb items.

The production-output audit now parses every JSON-LD block, requires the
schema.org context and an `@graph` array, records the emitted types, and checks
that `@id` and `url` values are absolute HTTPS URLs. The fresh build emitted
only `WebSite` and `BreadcrumbList`; all generated JSON-LD blocks parsed
successfully. No `Organization` or generic `WebPage` node was added because
the current site metadata does not establish additional organization facts and
duplicating generic nodes across 1,500 pages would add markup without a
demonstrated rich-result or performance benefit.

## Changes made

Only `scripts/audit-production-output.mjs` was changed for this audit. It now
reports homepage JavaScript requests/bytes, scans all generated images and
interactive controls, validates JSON-LD structure and absolute URLs, and
enforces a measured 1,000,000-byte homepage initial-JavaScript ceiling. The
budget is above the measured 913,917-byte baseline and is intended to detect
regression, not to claim that the current payload is optimal.

No application rendering, data registry, analytics, image, SEO or route code
was changed. That restraint is deliberate: the current evidence supports a
future focused split of runtime metadata and a separate decision about
analytics deferral, but does not justify changing either while unrelated
uncommitted content is present.

## Remaining bottlenecks and next actions

1. Measure the exact deployed commit with a fresh HAR and Lighthouse trace.
2. Split `runtime/generated.ts` into a genuinely small route-resolution index
   and page-local metadata, preserving SSR and no-JavaScript links.
3. Profile the clean deployed homepage with and without the analytics request;
   defer it only if the product accepts delayed page-view collection.
4. Keep FAQ, spell and canonical registries route-local and verify that route
   navigation, search, popup content and hydration still work.
5. Retain the new production-output checks in CI and update the budget only
   after recording a reproducible measured baseline.

## Follow-up: homepage JavaScript execution and Lighthouse stability

### Reproducible method

The follow-up used the same freshly generated `build/`, the same Vite preview
(`127.0.0.1:4174`), Lighthouse 13.6.0, Chromium headless, mobile emulation,
simulated throttling, and a fresh browser context per run. Storage and cache
were not reused between runs. Five runs were performed with the production
HTML unchanged and five with requests matching `*googletagmanager.com*`
blocked by Lighthouse. Blocking GTM is a local experiment only; it is not an
implementation change.

### Individual mobile results

Times are milliseconds. Scores are Lighthouse performance scores.

| GTM | Run | Score | FCP |   LCP |   TBT | Speed Index | Main-thread | Script evaluation |
| --- | --: | ----: | --: | ----: | ----: | ----------: | ----------: | ----------------: |
| on  |   1 |    55 | 909 | 8,302 |   875 |       1,356 |       1,978 |               901 |
| on  |   2 |    56 | 907 | 8,295 |   831 |       1,221 |       2,086 |               836 |
| on  |   3 |    57 | 908 | 8,298 |   747 |       1,229 |       1,907 |               772 |
| on  |   4 |    57 | 908 | 8,296 |   733 |       1,301 |       1,743 |               770 |
| on  |   5 |    56 | 908 | 8,299 |   817 |       1,358 |       1,992 |               803 |
| off |   1 |    58 | 906 | 9,039 |   705 |       1,273 |       1,608 |               623 |
| off |   2 |    59 | 907 | 9,043 |   655 |       1,297 |       1,681 |               573 |
| off |   3 |    55 | 908 | 9,047 |   874 |       1,420 |       1,892 |               753 |
| off |   4 |    52 | 910 | 9,062 | 1,149 |       1,489 |       2,399 |               881 |
| off |   5 |    56 | 908 | 9,048 |   794 |       1,269 |       1,773 |               685 |

Medians:

| Condition   | Score |    FCP |      LCP |    TBT | Speed Index | Main-thread | Script evaluation |
| ----------- | ----: | -----: | -------: | -----: | ----------: | ----------: | ----------------: |
| GTM enabled |    56 | 908 ms | 8,298 ms | 817 ms |    1,301 ms |    1,978 ms |            803 ms |
| GTM blocked |    56 | 908 ms | 9,047 ms | 794 ms |    1,297 ms |    1,773 ms |            685 ms |

The experiment attributes roughly 118 ms median script-evaluation reduction
and 23 ms median TBT reduction to removing GTM from this run. It does not
improve LCP: the blocked median is about 749 ms worse. That is evidence that
GTM is a secondary execution cost, not the cause of the unstable LCP.

### Trace findings

The representative enabled trace reported:

- LCP element: `article.wiki-article.wiki-home`, not a wallpaper image;
- LCP breakdown: about 7 ms TTFB, 92 ms resource-load delay, 17 ms resource
  load, and 303 ms element-render delay in the Lighthouse insight (the
  remaining wall-clock time is delayed presentation/trace scheduling);
- long tasks: unattributable tasks of about 656 ms and 132 ms, a local-page
  task of 128 ms, and GTM tasks of 98 ms and 61 ms;
- main-thread categories: 772 ms script evaluation, 700 ms other work,
  278 ms style/layout, 50 ms rendering, 49 ms garbage collection, 35 ms
  parse/compile, and 21 ms HTML/CSS parsing;
- resource summary: 72 requests, 36 scripts, 1,376,593 bytes transferred,
  including 1,162,193 bytes of script and 183,851 bytes of third-party
  resources.

The variability is therefore dominated by long unattributed browser/main-page
tasks and presentation timing, rather than by transfer or parse/compile alone.
The five-run spread confirms this: enabled TBT ranges from 733–875 ms and
blocked TBT from 655–1,149 ms, while FCP is stable around 0.91 s and CLS is
zero. LCP remains around 8.3–9.1 s even though FCP is stable, which points to
homepage content rendering/layout and trace scheduling rather than late image
download.

### Source-module mapping

The Lighthouse script treemap and Vite manifest map the homepage's large
resources as follows:

| Resource                    | Source/module                                   | Homepage status                                  |
| --------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| `D_aPLMlF.js` (750,093 B)   | `currentPage.ts` and generated runtime metadata | in root closure and homepage preload             |
| `Br4yLITJ.js` (1,328,616 B) | canonical `data/_index_`                        | fetched in the captured browser trace            |
| `GzbqIaku.js` (788,232 B)   | `spell-data`                                    | fetched in the captured browser trace            |
| `CuVyoXwu.js` (1,184,334 B) | FAQ registry                                    | fetched in the captured browser trace            |
| `CCA_3FkA.js` (179,392 B)   | canonical page helper                           | fetched through search/lazy dependency graph     |
| GTM                         | external `gtag.js`                              | third-party, 545,333 resource bytes in the trace |

The first row is proven eager by the root closure. The other registry rows are
not in the static homepage HTML preload list, but Lighthouse's actual browser
trace recorded them as downloaded. This is the concrete evidence that the
runtime/search dependency graph is still causing unnecessary homepage work;
the earlier static manifest-only classification understated browser loading.
The exact Vite import boundary is the `Navbar.svelte` dynamic search import,
which compiles to a preload map containing `search`, canonical, spell and FAQ
dependencies. That should be split before considering a larger data rewrite.

### Implementation and decision

No application optimization was implemented in this follow-up. GTM was not
removed or deferred because the controlled experiment did not show an LCP
benefit, and changing the search/runtime graph requires a focused code change
with navigation, search, popup and hydration regression coverage. The
production audit and its 1,000,000-byte homepage initial-JavaScript budget
remain unchanged and continue to pass.

The highest-confidence next optimization is to make the navbar search import
load a small search-specific index without importing FAQ, spell-data and the
canonical barrel. This is preferable to suppressing analytics or accessibility
features. After that change, repeat the same ten-run protocol and compare
resource requests, script evaluation, long tasks and LCP—not only the score.

## Follow-up: navbar preload removal

The follow-up browser trace identified a second import path that the static
manifest did not make obvious. The global `+error.svelte` node imported
`NotFound.svelte`, which imported `search.ts` synchronously. SvelteKit loads
the error node as a client fallback, so that one import caused the canonical,
spell-data and FAQ registries to be requested on the homepage through the
error-node dependency chain:

`+error.svelte → NotFound.svelte → search.ts → canonical/spell-data/FAQ`

The navbar had already been changed to use a lazy `navbar-search.ts` module.
This change applies the same boundary to NotFound: it imports only the type at
compile time and dynamically loads the lightweight generated index after mount
when the not-found query is at least two characters. The generated index is
`static/_data/navbar-search.json` (360,147 bytes, 42,483 bytes gzip). The
homepage does not request it until search is used.

### Browser verification

In a fresh production preview, the pre-change targeted test recorded these
initial registry chunks: runtime metadata 750,093 bytes, spell-data 788,232
bytes, FAQ 1,184,334 bytes and canonical data 1,328,608 bytes. After the
change, only the runtime metadata chunk remained in the initial browser
requests; the targeted Playwright test passed and confirmed that
`navbar-search.json` is absent before input and requested after input.

The production-output audit after the change measured 2,123 routes,
90,421,079 bytes of HTML, 5,017,968 bytes of client JavaScript, and a
homepage initial JavaScript set of 23 requests / 906,901 bytes. The root
layout dependency closure is 885,537 bytes. The audit reports 38 of 68 client
nodes with canonical-data markers; this is a static graph measure, not a count
of initial browser requests.

Five comparable mobile Lighthouse 13.6.0 runs against the same local
production preview produced:

| Run | Score |      FCP |      LCP |   TBT | Speed Index | Requests | Total bytes |
| --: | ----: | -------: | -------: | ----: | ----------: | -------: | ----------: |
|   1 |    82 | 1,545 ms | 4,949 ms | 44 ms |    1,545 ms |       62 |     688,452 |
|   2 |    88 | 1,548 ms | 3,857 ms | 43 ms |    1,548 ms |       62 |     688,452 |
|   3 |    88 | 1,549 ms | 3,851 ms | 40 ms |    1,549 ms |       62 |     688,461 |
|   4 |    88 | 1,549 ms | 3,851 ms | 41 ms |    1,549 ms |       62 |     688,452 |
|   5 |    82 | 1,547 ms | 4,866 ms | 40 ms |    1,547 ms |       62 |     688,452 |

Median: score 88, FCP 1,548 ms, LCP 3,857 ms, TBT 41 ms, Speed Index
1,548 ms. A comparable desktop run scored 70 with FCP 1,547 ms, LCP 5,387
ms, TBT 35 ms, Speed Index 1,547 ms, 62 requests and 688,452 bytes.

These are local laboratory results, not a claim about live production. The
remaining measured bottleneck is the 750,093-byte runtime metadata chunk in the
root layout. It still supports breadcrumbs, navigation, link metadata and
popup behavior. Splitting it further requires a separate route-metadata design
and was not folded into this focused change. The remaining Lighthouse LCP
spread also warrants a separate trace investigation; transfer and TBT improved
substantially, but LCP is still variable under simulated throttling.
