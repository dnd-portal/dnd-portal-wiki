# Coordinated Runtime Metadata Migration Plan

Date: 2026-11-22

Status: implementation-ready architecture plan. No application code was
modified for this plan.

## 1. Executive summary

The previous runtime-core experiment was correctly rolled back. Migrating
`Link.svelte` alone created a second eager registry because the root layout
still reached the original runtime facade through `currentPage.ts`, SEO and
other shared components.

The migration must therefore replace the complete root-layout metadata
boundary in one performance release. The target is a three-tier model:

1. A small eager navigation projection for visible anchors, route identity and
   the sidebar/menu structure.
2. Current-route metadata supplied through SvelteKit `load` data and static
   prerender payloads, not through a global browser registry.
3. Popup summaries loaded on interaction, with ordinary anchors and a useful
   no-JavaScript fallback preserved.

Search remains a separate lazy JSON feature. Canonical TypeScript remains the
only authoring source and is used by generators, prerendering and SEO at build
time.

The minimum complete root boundary is `+layout.svelte`, `currentPage.ts`,
`seo.ts`, `Breadcrumbs.svelte`, `Sidebar.svelte`, `Navbar.svelte`,
`PopupHost.svelte`, `PageCard.svelte`, `Link.svelte`, the shared page/sidebar
helpers, and the root route data contract. These consumers must switch as one
unit before the old runtime facade can be removed from homepage hydration.

## 2. Measured baseline and build evidence

Current baseline:

- Runtime metadata source: 777,368 bytes.
- Browser chunk `D_aPLMlF.js`: 750,093 bytes uncompressed.
- Homepage initial JavaScript: 906,901 bytes across 23 requests.
- Root-layout dependency closure: 885,801 bytes.
- Root shared budget: 1,000,000 bytes.
- Five-run local mobile median: 76/100, LCP 6,287 ms.

The rolled-back experiment produced a 413,370-byte core chunk in addition to
`D_aPLMlF.js`, increasing homepage initial JavaScript to 1,309,652 bytes and
the root closure to 1,288,288 bytes. This proves that source-level separation
is insufficient unless the old facade disappears from the initial graph.

The current production build's homepage node `0.pOLzVSob.js` directly imports
`D_aPLMlF.js`. That is actual Vite output evidence, not only a source scan.
The old chunk must be absent from both the node import list and the browser
network trace after migration.

## 3. Complete current dependency graph

```text
canonical data/_index_.ts and modular data
  └─ scripts/generate-runtime-metadata.mjs
      └─ data/runtime/generated.ts
          └─ data/runtime/index.ts
              ├─ runtimeLinks = Object.fromEntries(runtimeLinkEntries)
              ├─ getRuntimeData / getOptionalRuntimeData
              ├─ getRuntimeChildren
              ├─ getRuntimeNavigationChildren
              └─ getRuntimeSpellBreadcrumbMetadata

routes/+layout.svelte
  ├─ pages/currentPage.ts
  │   ├─ runtime/index.ts
  │   ├─ runtimeLinks
  │   └─ current route, breadcrumbs, labels and href canonicalization
  ├─ pages/seo.ts
  │   └─ runtime/index.ts + runtime/site-metadata.ts
  ├─ Navbar.svelte
  │   └─ runtime/index.ts and lazy navbar-search
  ├─ Sidebar.svelte
  │   └─ runtime/index.ts + sidebar helpers
  ├─ Breadcrumbs.svelte
  │   ├─ currentPage.ts
  │   └─ runtime/index.ts
  ├─ Link.svelte
  │   ├─ runtime/index.ts
  │   └─ currentPage.ts
  ├─ PageCard.svelte
  │   ├─ runtime/index.ts
  │   └─ currentPage.ts
  └─ PopupHost.svelte
      └─ runtime type/value paths through link event data

Other runtime facade consumers found by source scan:
  ClassesOverview.svelte
  WikiSearchResult.svelte
  tools/+page.svelte
  sitemap.xml/+server.ts
  class route components
  pages/seo.ts
  typescript/components/sidebar/sidebar.ts
```

The root-loaded set is not identical to every source consumer. Route-local
classes, tools and sitemap consumers can remain canonical/server-side or
route-local. The decisive root set is the set listed under `+layout.svelte`.

## 4. Consumer dependency matrix

| Consumer                                                 | Current dependency                     | Required fields                                              | Proposed source                                        | Eager/lazy                         | Migration risk                |
| -------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------- | ----------------------------- |
| `src/routes/+layout.svelte`                              | `currentPage.ts`, `seo.ts`, shared UI  | current path, route metadata, children                       | `data.currentPage` plus small navigation projection    | Eager shell, route data serialized | hydration mismatch            |
| `src/lib/typescript/pages/currentPage.ts`                | `runtime/index.ts`, `runtimeLinks`     | path↔href, title/label, parent, page identity                | pure route-data resolver + navigation index            | Eager small index                  | breadcrumbs/aliases           |
| `src/lib/typescript/pages/seo.ts`                        | `runtime/index.ts`, site metadata      | current title, description, canonical, image, JSON-LD inputs | `data.seo` generated in `+layout.server.ts`/route load | SSR/prerender; no browser registry | SEO loss or duplicate JSON-LD |
| `src/lib/svelte/components/Link.svelte`                  | runtime facade + currentPage           | href, external, title, image alt, popup key                  | rendered anchor props/current route link data          | Eager per rendered link            | popup event contract          |
| `src/lib/svelte/components/PageCard.svelte`              | runtime facade + currentPage           | href, title, subtitle, icon/image, short description         | page-provided card model or nav projection             | Eager rendered cards               | homepage/cards                |
| `src/lib/svelte/components/page/Breadcrumbs.svelte`      | currentPage + runtime facade           | ordered labels, paths, back href                             | `data.breadcrumbs` + small href lookup                 | Eager current route only           | deep links                    |
| `src/lib/svelte/components/page/Sidebar.svelte`          | runtime facade + sidebar data          | tree labels, hrefs, parents, hidden, active URL              | generated navigation projection + exact pathname       | Eager                              | Homebrew dual identity        |
| `src/lib/svelte/components/page/Navbar.svelte`           | runtime facade, lazy search            | menu labels/hrefs, external flags                            | generated navigation projection                        | Eager                              | mobile menu                   |
| `src/lib/svelte/components/PopupHost.svelte`             | runtime metadata type/event payload    | selected title, subtitle, image, description                 | lazy popup-summary loader keyed by path                | Lazy on hover/focus/touch          | latency/fallback              |
| `src/lib/svelte/context/currentPage.ts`                  | type-only current page context         | current path/data interface                                  | new `CurrentPageViewModel` type                        | Eager type only                    | public component contract     |
| `src/lib/typescript/components/sidebar/sidebar.ts`       | runtime navigation helpers             | section/node tree and paths                                  | generator output consumed by Sidebar                   | Eager small                        | tree completeness             |
| `src/lib/svelte/components/page/ClassesOverview.svelte`  | runtime + class data                   | current page labels, class card metadata                     | route load/class projection                            | Route-specific                     | class navigation              |
| `src/lib/svelte/components/page/WikiSearchResult.svelte` | currentPage href helper, site metadata | href only                                                    | shared pure URL helper                                 | Eager tiny                         | URL normalization             |
| `src/routes/tools/+page.svelte`                          | runtime facade                         | tool cards                                                   | route-local server/page data                           | Route-specific                     | direct route hydration        |
| `src/routes/sitemap.xml/+server.ts`                      | generated runtime entries              | all URLs                                                     | build/server generator input                           | Build-time only                    | sitemap completeness          |
| `src/lib/svelte/components/page/NotFound.svelte`         | currentPage URL helper/search          | canonical href and lazy search                               | pure URL helper + lazy search                          | Eager helper, lazy search          | 404 navigation                |

The old `RuntimeLinkMetadata` is too broad for the root contract. It combines
anchor, popup, navigation, SEO, images and source metadata. The migration must
replace it with explicit interfaces rather than preserving one broad facade
under a new filename.

## 5. Target architecture

```text
canonical TypeScript data
  ├─ build-time route/SEO generation -> prerendered HTML and SvelteKit payload
  ├─ generated navigation projection -> small eager browser module
  ├─ generated popup summaries -> static lazy JSON or dynamic import shard
  └─ generated search JSON -> existing lazy search path

root layout
  ├─ load data.currentPage / data.seo / data.breadcrumbs
  ├─ imports navigation projection only
  └─ renders ordinary semantic anchors and one PopupHost

PopupHost interaction
  └─ loadPopupSummary(path) -> summary or graceful unavailable state
```

### Proposed contracts

```ts
export type NavigationEntry = {
    path: string;
    href: string;
    title: string;
    label?: string;
    external: boolean;
    parent?: string;
    hidden?: boolean;
    iconSize?: 'default' | 'large';
};

export type CurrentPageViewModel = {
    path: string | null;
    href: string;
    title: string;
    label: string;
    description: string;
};

export type BreadcrumbViewModel = {
    key: string;
    path?: string;
    label: string;
    href?: string;
};

export type PopupSummary = {
    title: string;
    subTitle: string;
    description: string;
    image: { href: string; alt: string };
};
```

The exact generated field names may follow existing conventions, but these
contracts must remain separate. `PopupSummary` must never be imported by the
root layout as a complete map.

### Current-page data mechanism

Use a root `+layout.server.ts` or equivalent SvelteKit route `load` contract
that returns only the current route's serializable view model and SEO data.
Because adapter-static prerenders every route, this remains compatible with
GitHub Pages: the data is embedded in each generated page's SvelteKit payload,
not fetched from a backend. The loader may use canonical data at build time;
that value import must remain server/build-only and must not be reachable from
client modules.

### Navigation projection

Generate a compact navigation artifact containing only entries needed by the
visible Navbar/Sidebar/Breadcrumbs and exact route identity. Keep both URLs for
Homebrew content as separate entries. Do not collapse entries by canonical
content ID or slug. Active state continues to compare the exact normalized URL.

### Popup projection

Generate popup summaries keyed by stable internal path. Load one summary on
hover/focus/touch, cache it in PopupHost, and render an ordinary anchor before
and during loading. On failure, hide the popup but never prevent navigation.
Keyboard focus and `aria-describedby` must continue to reference the shared
host only while the host is available.

## 6. Coordinated migration stages

### Stage 0 — Guardrails and inventory

Files: architecture tests, production audit reporting, generator report.

Add an import-graph test that starts at the root layout and fails if the old
runtime facade, canonical barrel, spell registry, FAQ registry or a generated
projection over a measured threshold is reachable. Add a generated field-count
report and a browser request assertion for the old chunk.

Rollback: delete tests/reporting only; no runtime behavior changes.

### Stage 1 — Define route-data view models

Files: `src/routes/+layout.server.ts` (or route-equivalent load), current-page
types/context, `pages/seo.ts`, route data types.

Generate `CurrentPageViewModel`, `BreadcrumbViewModel` and SEO view models at
build time. Keep canonical value imports in server/build code only. Verify the
serialized payload contains only the current route's data.

Expected impact: no benefit until shared client consumers stop importing the
old facade; may temporarily be neutral if kept server-only.

Rollback: restore the current layout data contract and remove the new loader.

### Stage 2 — Migrate the complete root shell

Files: `+layout.svelte`, `currentPage.ts`, `seo.ts`, `Breadcrumbs.svelte`,
`Sidebar.svelte`, `Navbar.svelte`, `Link.svelte`, `PageCard.svelte`, sidebar
helpers and current-page context.

Replace broad runtime lookups with route data and the compact navigation
projection. Move URL normalization into a pure tiny module. Remove all value
imports of `runtime/index.ts` from these files in one change.

This is the minimum complete performance boundary. Do not publish an
intermediate deployment where both registries are eager.

Expected impact: the old 750,093-byte chunk should disappear from homepage
initial requests. Final size is a measurement, not a guarantee.

Rollback: revert the coordinated shell commit as one unit; retain generated
reports and tests to diagnose the failure.

### Stage 3 — Migrate PopupHost

Files: `PopupHost.svelte`, popup loader/generator, Link event contract and
popup styles/tests.

Load only the selected summary and cache it. Preserve full/description modes,
mouse/focus/touch behavior, reduced motion and navigation on failure.

Expected impact: remove popup descriptions/images from eager navigation data;
interaction may add one request.

Rollback: restore current in-memory popup metadata only if it does not re-enter
the root graph; otherwise disable popup preview gracefully while anchors work.

### Stage 4 — Move route-local consumers

Files: ClassesOverview, tools, WikiSearchResult, route components and sitemap
server generator.

Use route load data or build-only imports. Keep search JSON separate and lazy.

Expected impact: route chunks become smaller and less duplicated; homepage
impact should already have been achieved at Stage 2.

### Stage 5 — Remove compatibility facade

Delete `runtime/index.ts` and unused generated fields only after all import-graph
tests, static crawl, browser tests and production budgets pass. Regenerate and
compare route counts, HTML, SEO and navigation identities.

## 7. Minimum complete migration boundary

The following files must migrate together before the old runtime chunk can be
removed from homepage hydration:

1. `src/routes/+layout.svelte`
2. `src/lib/typescript/pages/currentPage.ts`
3. `src/lib/typescript/pages/seo.ts`
4. `src/lib/svelte/components/Link.svelte`
5. `src/lib/svelte/components/PageCard.svelte`
6. `src/lib/svelte/components/page/Breadcrumbs.svelte`
7. `src/lib/svelte/components/page/Sidebar.svelte`
8. `src/lib/svelte/components/page/Navbar.svelte`
9. `src/lib/svelte/components/PopupHost.svelte` (at least its runtime value
   boundary; full lazy popup behavior may be Stage 3)
10. `src/lib/typescript/components/sidebar/sidebar.ts`
11. `src/lib/svelte/context/currentPage.ts` and shared route-data types
12. the generator output and root route `load` data contract

The old facade may remain for route-local/server consumers during the same
release, but it must not be reachable from the root layout's client graph.

## 8. Performance requirements and targets

Use the measured baseline, not invented budgets:

| Metric                    |  Baseline |                                                     Release gate |
| ------------------------- | --------: | ---------------------------------------------------------------: |
| Homepage initial JS       | 906,901 B |                                          must be below 906,901 B |
| Root-layout closure       | 885,801 B |                        below 1,000,000 B; target below 885,801 B |
| Old `D_aPLMlF.js` request |   present |                                                 zero on homepage |
| Initial JS requests       |        23 |                  no increase unless bytes decrease and justified |
| Runtime projection        | 750,093 B | no single eager metadata artifact above 250,000 B without review |
| Mobile Lighthouse         | 76 median |          no regression; improvement reported only with five runs |

The 250 KB projection guard is a review threshold, not a claim of guaranteed
optimality. The build audit must fail if a new eager runtime artifact is within
the same order of magnitude as `D_aPLMlF.js`, or if the old chunk and a new
equivalent both appear in homepage requests.

## 9. Regression and validation strategy

Architecture:

- Build the actual Vite graph from root layout and inspect transitive imports.
- Assert no root client import of `runtime/index.ts`, canonical data barrels,
  spell data, FAQ registries or route-only content.
- Assert no generated eager runtime artifact exceeds the review threshold.
- Detect cycles in the root metadata graph.

Generated data:

- Compare generated navigation paths against canonical paths.
- Verify hrefs, aliases, external flags and image alt fields.
- Verify both ordinary and Homebrew-context paths remain separate.
- Verify missing metadata produces a controlled failure, not a broken anchor.

Production output:

- Run `pnpm build` and `pnpm audit:production`.
- Report route count, HTML bytes, initial JS requests/bytes/gzip, root closure,
  largest chunks and old runtime-chunk presence.
- Crawl canonical URLs, titles, descriptions, JSON-LD, H1s, links and static
  assets with `pnpm audit:prelive:crawl`.

Browser/accessibility:

- Homepage and deep spell/class routes.
- Breadcrumbs and back navigation.
- Sidebar active state for both `/magic-items/the-mimic-stick/` and
  `/homebrew/eldor/magic-items/the-mimic-stick/`, plus the equivalent
  organization paths.
- Navbar desktop/mobile behavior and lazy search.
- Popup mouse, keyboard, touch, reduced motion and failed-load fallback.
- No hydration/console errors and representative axe checks.
- JS disabled: anchors, SEO HTML and navigation remain usable.

Performance:

- Five mobile Lighthouse runs with one fixed build, browser, viewport,
  throttling and cache policy; report each run and median.
- One desktop comparison using the same build.
- Real browser network capture confirming absence of `D_aPLMlF.js`, actual
  transferred JS bytes and any popup/search lazy requests.

## 10. Rollback strategy and risks

Rollback the coordinated shell migration as one atomic change if any of these
occur: old chunk remains eager, initial bytes exceed baseline, breadcrumbs or
Homebrew active state changes, SEO output changes, popup navigation fails, or
hydration errors appear. Do not roll back unrelated uncommitted user files.

Main risks:

- SvelteKit static `load` serialization differs between SSR and hydration.
- URL aliases and trailing-slash normalization are changed accidentally.
- Homebrew duplicate navigation entries are collapsed.
- Popup lazy failure changes focus/ARIA behavior.
- SEO JSON-LD or canonical URLs are generated from incomplete route data.
- A “small” projection accidentally imports the canonical registry through a
  type/value barrel.
- JSON shards add request latency or stale-version behavior on GitHub Pages.

Unresolved decisions before implementation:

1. Whether current-route metadata should be in `+layout.server.ts` or each
   route's `+page.server.ts`; prefer layout data only for fields truly global
   to the shell.
2. Whether popup summaries should be static JSON or dynamic TS shards; choose
   from measured transfer and first-interaction latency.
3. Whether the navigation projection should be one compact module or a small
   set of tree shards; do not decide by filename alone—inspect Vite output.
4. Whether client source maps should be enabled only in profiling builds.

## 11. Exact implementation checklist

1. Confirm clean baseline numbers with `pnpm build` and `pnpm audit:production`.
2. Enumerate the root-layout Vite closure and assert `D_aPLMlF.js` is present
   before migration.
3. Add typed `CurrentPageViewModel`, `BreadcrumbViewModel`, `NavigationEntry`
   and `PopupSummary` contracts without importing canonical values.
4. Extend the generator to emit navigation-only data and a deterministic field
   report; keep canonical data as the only input.
5. Add a static route-data loader that returns current page, breadcrumbs and
   SEO inputs during prerendering.
6. Move URL normalization into a tiny browser-safe helper.
7. Migrate `currentPage.ts`, `seo.ts`, `Breadcrumbs.svelte`, `Sidebar.svelte`,
   `Navbar.svelte`, `Link.svelte`, `PageCard.svelte`, sidebar helpers and
   current-page context together.
8. Migrate the PopupHost value boundary; keep its existing shared host and
   anchor event behavior.
9. Run a production build and inspect both manifest closure and actual browser
   requests. Stop if old runtime and new projection are both eager.
10. Run unit, architecture, production-output, static-crawl, browser and axe
    tests before considering the migration complete.
11. Run five comparable mobile Lighthouse measurements and one desktop run.
12. Compare against 906,901 B homepage JS and 885,801 B root closure.
13. Only after all gates pass, migrate route-local consumers and remove the old
    runtime facade.
14. Keep `playwright-report/`, `test-results/` and Lighthouse temp directories
    ignored and uncommitted.
