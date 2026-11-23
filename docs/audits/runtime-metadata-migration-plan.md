# Runtime metadata migration — current-page route-data phase

## Status

Phase 3 extends the Phase 1/2 route-data implementation with route-specific
SEO inputs and route-aware page headers. The complete shared runtime-registry
migration remains intentionally out of scope.

## Contract

`src/lib/typescript/pages/currentPageData.ts` defines the serializable
`CurrentPageRouteData` contract. It contains the pathname, resolved page
identity, title/label, breadcrumb items, and the back-link path and URL. It
does not contain canonical descriptions, popup content, images, or registries.

`src/routes/+layout.server.ts` resolves this projection during prerendering
from the canonical data source. This is compatible with adapter-static and
deep links because it is derived from the request URL during the server build
for each generated route.

## Migrated consumer

`Breadcrumbs.svelte` consumes the serialized layout route data for normal and
dynamic spell breadcrumbs. The root layout now prefers the serialized route
identity while retaining full `PageData` for legacy page rendering and SEO
overrides. URL normalization was moved to the pure
`pages/pageUrls.ts` module so this consumer does not import `currentPage.ts`
just to format an href. The existing `CurrentPageContext` remains unchanged;
page rendering and `PageHeader` still require full `PageData` and therefore
remain the next migration boundary.

Phase 3 extends breadcrumbs with canonical hrefs. `seo.ts` now consumes the
route label and serialized breadcrumb hrefs for title context and JSON-LD; it
no longer imports `currentPage.ts` or the runtime registry. `PageHeader` uses
the route label for its heading while retaining full `PageData` for
descriptions, images and header sections. `CurrentPageContext` exposes the
route projection alongside its backwards-compatible full-data field.

SEO is not moved wholesale to `+layout.server.ts`: child `+page.ts` loaders
provide route-specific SEO overrides, which a parent layout load cannot read
without changing every route contract. Phase 3 removes the runtime-registry
dependency from SEO formatting while preserving those existing overrides.

## Remaining dependencies

The old runtime registry remains in the client graph through the root layout's
existing `buildPage`/navigation path and `currentPage.ts` used for full page
content resolution. It also remains in `Link.svelte`, `Navbar.svelte`,
`Sidebar.svelte`, and `PageCard.svelte`.
This phase therefore must not be described as removing the 750 KB chunk.
The next safe step is to migrate the current-page context and SEO contract
together, then migrate the complete navigation/link boundary without loading
both registries.

## Route count and static crawl

The worktree is based on `origin/main` at `f642628` and produces 1,461 HTML
routes. The earlier 1,500–2,123 figures came from different source revisions;
there is no Phase 2 route-generation regression. The build audit indexed 834
link entries, 813 page entries and 620 spell routes.

`pnpm audit:prelive:crawl` initially printed its findings but did not terminate
because Vite retained middleware watcher handles on Windows. The harness now
uses bounded Vite cleanup and an explicit CLI exit after all checks. Termination
is fixed. The current run fails one pre-existing content consistency check:
source references the removed `internals.classes.psion` registry paths while
the canonical `data` barrel on `origin/main` no longer contains them. All
generated HTML, links, SEO, JSON-LD, accessibility-ID and popup checks pass.
This is not caused by the Phase 2 route-data changes and must be resolved as a
separate content/data revision rather than by weakening the audit.

## Measurements

The baseline remains the previously measured production build: 906,901 bytes
of homepage JavaScript, an 885,801-byte root-layout closure, and a 750,093-byte
runtime metadata chunk. The Phase 2 build measured 4,894,094 bytes of client
JavaScript, 1,044,874 gzip bytes, 86,691,481 bytes of HTML, and an 876,821-byte
root-layout closure. Phase 3 measured 4,893,310 bytes of client JavaScript,
1,044,498 gzip bytes, 87,127,589 bytes of HTML, and an 876,081-byte
root-layout closure. The old runtime registry remains eager; these numbers do
not demonstrate a completed migration or a meaningful initial-payload gain.

## Validation

- `pnpm check`: passed in this worktree.
- `pnpm test`: passed, 9 tests.
- `pnpm build`: passed, 1,461 generated routes.
- `pnpm audit:production`: passed after the CLI termination fix; root closure
  876,821 bytes and all budgets passed.
- `pnpm audit:prelive:crawl`: completes deterministically but fails the
  pre-existing missing-central-data-path check for the Psion paths described
  above.
- `pnpm test:browser`: passed, 16 tests, 2 skipped; known non-critical axe
  findings remain explicitly reported by the suite.

## Phase 4 assessment

Phase 4 was not retained as an application-code change. Removing
`resolveCurrentPage` from `+layout.svelte` is not currently safe: the shared
context's full `data` field is still used by `PageHeader`, generic wiki pages,
FAQ pages, rules pages, equipment pages and `PageImage`, while several route
families expose different loader shapes (`canonicalPage`, `pageData`,
`classData`, or no full page object). Some components also use the context
only as a render gate. Serializing a full fallback object from
`+layout.server.ts` would reintroduce a large duplicated per-page payload.

The exact safe boundary is therefore to migrate each route family to an
explicit `routePageData` contract and remove the render-gate dependency at the
same time. No Phase 4 application code was retained because a partial removal
would break direct routes or silently lose page-header content.

## Next migration step

The next boundary is the remaining full-content resolver in the root layout:
move page-specific content into route/server data and remove the client-side
`resolveCurrentPage` call. Then migrate `Link`, `Navbar`, `Sidebar` and
`PageCard` together so the old runtime registry can leave the initial client
graph. Do not remove the full `PageData` context until all page templates and
direct route loads have an equivalent route-data contract.

## Phase 4A implementation: routePageData contract

Phase 4A adds a typed, route-owned contract without changing the root-layout
boundary yet. `src/lib/typescript/pages/routePageData.ts` defines
`RoutePageIdentity`, `RoutePageData<TContent>` and `createRoutePageData()`.
The identity contains only the canonical data path, resolved href and display
label; `pageData` remains canonical and `content` is optional route-owned data.

The contract is emitted by the generic wiki, FAQ, rules and equipment detail
routes. Existing loader fields remain for compatibility, so the generic route
temporarily serializes both `canonicalPage` and `routePageData.pageData`.
This is a compatibility layer, not a claim that duplicate serialization has
been eliminated. Navbar, Sidebar, Link, PageCard, PopupHost and
CurrentPageContext were not migrated in this phase.

### Phase 4A measurements

The production build generated 1,461 routes, 87,722,989 bytes of HTML,
4,893,446 bytes of client JavaScript (1,044,000 gzip bytes), and a 876,081-byte
root-layout dependency closure. The largest client chunk was 1,184,334 bytes
uncompressed (275,844 gzip bytes). The old runtime registry remains eager and
no meaningful initial-JavaScript reduction is claimed. Production audit
budgets passed; the HTML increase relative to Phase 3 is consistent with the
temporary compatibility payload.

`pnpm audit:prelive:crawl` completed deterministically and passed all checks in
this run, including central data paths, generated routes, SEO, JSON-LD,
accessibility IDs and popup constraints. The earlier Psion failure was not
reproduced on this matching worktree revision; no Psion content or audit
exception was added.

Validation: `pnpm check` passed; `pnpm test` passed with 10 tests; `pnpm build`
passed; `pnpm audit:production` passed; the built-output crawl passed; and
`pnpm test:browser` passed 16 tests with 2 intentionally skipped tests. Known
non-critical axe findings remain explicitly reported by the browser suite.

### Phase 4B boundary

The smallest safe next step is to migrate the four route-family components to
consume `routePageData` directly, remove duplicate `canonicalPage`, and add
route-specific content types for FAQ, rules and equipment. Only after those
consumers no longer read full data through the global context should
`CurrentPageContext.data` and the root-layout `resolveCurrentPage` dependency
be removed. The old runtime registry must remain unchanged until that complete
boundary is migrated and measured in the browser.

## Phase 4B assessment

Phase 4B was attempted but not retained. Changing the route consumers to read
`routePageData` caused 408 prerendered pages to receive the `Page Not Found -
D&D Portal Wiki` title. The child route payload existed, but the current root
layout/SEO resolution did not reliably consume child route data during static
rendering. This functional regression was reverted while Phase 4A was kept.

The retained Phase 4A build remains at 1,461 routes, 87,725,895 HTML bytes,
4,893,446 client-JavaScript bytes, 1,044,000 gzip bytes and an 876,081-byte
root-layout closure. The attempted Phase 4B output measured 85,261,783 HTML
bytes, but that reduction is invalid because 408 pages rendered as Not Found.
The old runtime registry remains eager and no initial-payload improvement is
claimed.

After reverting Phase 4B, `pnpm check`, `pnpm test` (10 tests), `pnpm build`,
`pnpm audit:production`, `pnpm audit:prelive:crawl`, `pnpm test:browser` (16
passed, 2 skipped) and `git diff --check` passed. Known non-critical axe
findings remain reported by the browser suite.

The next boundary must establish route data that is available to the root
layout during adapter-static SSR, or move SEO/current-page resolution into a
route-safe server contract. Only then should duplicate `canonicalPage`
serialization be removed. No Phase 4B consumer migration is safe to retain.

## SSR route-data contract investigation

The 408-page failure is caused by a layout-boundary assumption, not by missing
child loader payloads. FAQ, rules and equipment child loaders can serialize
`routePageData`, but the root layout's `appPage.data` is not a safe contract for
consuming arbitrary child-loader fields during prerender. The root layout still
resolves `CurrentPageContext.data` independently through `resolveCurrentPage`;
when that resolution is unavailable for a generated child route, SEO falls back
to `Page Not Found` even though the child payload exists. Treating child data as
if it were parent layout data therefore caused valid pages to be rendered as
Not Found.

The safe contract at this stage is intentionally one-way: route loaders expose
`routePageData` to their own page components, while the root layout consumes
only its own `currentPage` route identity and retains the compatibility
`canonicalPage` path. No root fallback was added and no global content payload
was introduced.

The production crawl now includes an explicit regression check across every
generated `faq/`, `rules/` and `equipment/` HTML file. It rejects a missing or
Not Found title and rejects output without a wiki article. The failed Phase 4B
experiment is reproducible by this check (408 failures); the reverted Phase 4A
build passes it for all 1,461 routes. This check must pass before retrying
removal of `canonicalPage`.

The next implementation must provide route-specific SEO/current-page data at a
server-render boundary that is actually available to the root layout during
adapter-static prerender, or move those consumers below the route boundary.
Only after that contract is verified should Phase 4B remove duplicate page
serialization.

## Phase 5A assessment

The FAQ route-owned rendering proof of concept was attempted and reverted. The
route loader could serialize a typed `{ group, question }` content projection,
but the root layout still produced `Page Not Found` SEO output because its
current-page/SEO contract is independent of child-loader data. The experiment
also increased total HTML from 87,725,895 to 95,594,125 bytes by repeating
complete FAQ groups in each FAQ page payload. That is an unacceptable
regression for this phase.

The retained Phase 4A implementation is unchanged. The production-output audit
now remains the strict regression guard for every generated FAQ, rules and
equipment route: it rejects Not Found titles and pages without a wiki article.
Phase 5A is not safe to retain until route-owned SEO/current-page metadata is
available during static SSR without repeating the full FAQ group.

## Phase 5C: SSR page-data diagnosis and fix

The selected route `/faq/acid-splash-5e/` exposed the exact dataflow defect.
The repository uses SvelteKit 3.1.1 with Svelte 5.57.3 and
`@sveltejs/adapter-static` 4.0.1. The route had both `+page.server.ts` and
`+page.ts`. The server loader returned `routePageData`, but the universal
`+page.ts` loader returned `{}`. In the generated page types, `PageServerData`
contained the server result while the page component's effective data shape
contained only the parent layout data; during SSR the component therefore saw
no `routePageData`. This was not a serialization failure or a limitation of
child data during SSR: the empty universal loader replaced the route's data
contract.

The minimal fix removes only the empty `load()` from FAQ `+page.ts`, retains
`prerender = true` and `entries()`, and moves its existing invalid-group and
invalid-question checks into `+page.server.ts`. The FAQ component now uses the
generated `PageProps` contract (with the route-owned field explicitly typed).
A temporary SSR marker showed `data-route-data-probe="present"` after the fix
and was removed before validation. No full FAQ group was serialized.

The production build now passes the route-data audit for all generated FAQ,
rules and equipment pages. The selected FAQ HTML contains the normal non-empty
SEO title, canonical URL and FAQ article content; no Not Found fallback is
generated. The Phase 4A-sized output remains approximately 1,461 routes,
87.73 MB HTML, 876 kB root-layout closure and 4.89 MB client JavaScript.

Validation after the fix: `pnpm check`, `pnpm test` (10 tests), `pnpm build`,
`pnpm audit:production`, `pnpm audit:prelive:crawl` and `pnpm test:browser`
(16 passed, 2 skipped) passed. `git diff --check` also passes after removing
the diagnostic marker and generated artifacts. The existing browser suite
continues to report only its known non-critical axe findings.

This fixes the specific SSR page-data blocker and is safe to retain. The next
step is to add route-owned SEO for one FAQ page using the now-correct
`PageProps` path, while keeping the root SEO fallback for every other route.

## Phase 5D: route-owned SEO proof of concept

The selected route is `/faq/acid-splash-5e/`. Its page component now reads the
generated `PageProps` data and builds SEO from
`data.routePageData.identity` and `data.routePageData.pageData`, without using
`CurrentPageContext.data` or `resolveCurrentPage` for SEO. The existing shared
`SeoHead` component is reused. For this exact URL only, the root `SeoHead` is
disabled and the route-owned instance owns title, description, canonical,
Open Graph, Twitter and JSON-LD metadata. Other routes retain root SEO.

The earlier Phase 5C fix is what makes this possible: removing the empty
universal FAQ `load()` allows the server data to reach `PageProps`. No FAQ
group was added to the payload and no additional registry was introduced.

Generated HTML verification for the selected route found exactly one title,
one canonical link and one description. The title is
`Acid Splash 5e FAQ FAQ - D&D Portal Wiki`; the canonical is
`https://dnd-portal.com/faq/acid-splash-5e/`; the FAQ article is present and no
Not Found title occurs. The browser regression test covers the same assertions
and hydration errors.

The route-loader audit found the same empty-universal-loader pattern only in
the FAQ family during this targeted inspection. Generic wiki has a server
loader but no conflicting empty universal loader; rules has a server loader
and no `+page.ts`; equipment uses route-specific `+page.ts` loaders for its
existing entries/SEO behavior and no equivalent empty loader was changed.

Phase 5D measurements: 1,461 routes, 87,848,759 HTML bytes, 4,894,201 client
JavaScript bytes, 1,044,499 gzip bytes and a 876,563-byte root-layout closure.
The selected route's HTML changed only by the route-owned metadata/head
ownership; no full FAQ-group duplication was added. Compared with Phase 5C,
the increase is small and remains within existing budgets. No Lighthouse run
was required because initial runtime loading did not materially change.

Validation: `pnpm check`, `pnpm test` (10 tests), `pnpm build`,
`pnpm audit:production`, `pnpm audit:prelive:crawl`, `pnpm test:browser` (18
passed, 2 skipped) and `git diff --check` passed. The full production audit
continued to validate all FAQ, rules and equipment pages. Phase 5D is safe to
retain for the selected route only; expansion should proceed one route family
at a time with the same explicit head-ownership guard.

## Phase 5E: complete FAQ route-owned SEO

Route-owned SEO is now generalized from the Phase 5D proof route to every FAQ
detail route handled by `src/routes/faq/[...page]`. Each FAQ page reads
`PageProps.data.routePageData`, builds SEO with the existing
`createSeoMetadata()` utility, and renders the shared `SeoHead`. Root SEO is
disabled only for non-index FAQ URLs; `/faq/` and all non-FAQ routes retain
root ownership.

The shared title formatter normalizes a duplicated `FAQ FAQ` suffix to `FAQ`.
The selected page now renders `Acid Splash 5e FAQ - D&D Portal Wiki`, and the
same correction applies to all FAQ titles without route-specific replacements.

The production audit checks every generated FAQ output for exactly one title,
canonical and description, rejects `FAQ FAQ` and Not Found titles, and requires
the wiki article. Rules and equipment checks remain active.

Final Phase 5E measurements: 1,461 routes, 87,862,937 HTML bytes, 4,894,120
client-JavaScript bytes, 1,044,485 gzip bytes and a 876,577-byte root-layout
closure. Compared with Phase 5D, HTML increased by 14,178 bytes and client
JavaScript decreased by 81 bytes; no full FAQ groups or additional eager
registries were introduced.

Validation: `pnpm check`, `pnpm test` (10 tests), `pnpm build`,
`pnpm audit:production`, `pnpm audit:prelive:crawl`, `pnpm test:browser` (18
passed, 2 skipped) and `git diff --check` passed. Browser coverage includes
direct FAQ navigation, navigation away and back, title/canonical metadata,
FAQ content and hydration errors. Phase 5E is safe to retain. The next route
family should first be audited for the same empty-universal-loader issue.

## Phase 5F: rules route-owned SEO

Rules detail pages now use the same route-owned SEO pattern as FAQ. The
catch-all rules page reads `PageProps.data.routePageData`, derives SEO through
`createSeoMetadata()`, and renders the shared `SeoHead`. Root SEO is disabled
only for rules detail URLs handled by that route. `/rules/`, spell-list index
pages, cantrips, and level-specific spell-list routes retain root SEO because
they are separate page components.

The rules loader audit found no empty universal `load()` overriding the
catch-all `+page.server.ts`; the only rules `+page.ts` is the entries-only
loader for spell levels. No unrelated route family was changed.

The production output contains 127 rules HTML files, all passing the existing
route checks. Every generated rules output has a valid title, canonical,
description, article and non-Not-Found output; migrated detail pages also pass
the exact single-head metadata checks. Browser coverage includes
`/rules/combat/attack-roll/` and hydration without console errors.

Final Phase 5F measurements: 1,461 routes, 87,872,455 HTML bytes, 4,894,831
client-JavaScript bytes, 1,044,723 gzip bytes and a 876,780-byte root-layout
closure. Compared with Phase 5E, the increase is 9,518 HTML bytes, 711 client
bytes, 238 gzip bytes and 203 root-closure bytes. No full rules dataset or new
eager registry was added.

Validation: `pnpm check`, `pnpm test` (10 tests), `pnpm build`,
`pnpm audit:production`, `pnpm audit:prelive:crawl`, `pnpm test:browser` (20
passed, 2 skipped) and `git diff --check` passed. Phase 5F is safe to retain.
The next boundary is equipment route-owned SEO, after auditing its distinct
entries-only `+page.ts` loaders and nested route contracts.

## Phase 5G: equipment route-owned SEO

Nested equipment detail routes (`/equipment/<type>/<item>/`) now use
route-owned SEO. Their existing entries-only `+page.ts` already returns the
small SEO override and `routePageData`; the page component now reads those
values through generated `PageProps` and renders the shared `SeoHead`.
Root SEO is disabled only for the two-segment detail shape. Equipment type
indexes (`/equipment/<type>/`) remain root-owned and were deliberately not
migrated.

The loader audit found no empty universal loader equivalent to the original
FAQ problem. The nested detail loader is the only targeted loader that returns
meaningful route data; the type-index loader remains entries-only and returns
no SEO payload. No equipment content or pricing data was changed.

The production output contains 52 equipment HTML files, all passing route,
title, canonical, description, article and Not Found checks. The browser suite
covers `/equipment/adventuring-gear/torch/`, including single-head metadata and
hydration. FAQ and rules checks remain active.

Final Phase 5G measurements: 1,461 routes, 87,842,653 HTML bytes, 4,895,244
client-JavaScript bytes, 1,044,871 gzip bytes and an 876,835-byte root-layout
closure. Compared with Phase 5F, HTML decreased by 29,802 bytes according to
the generated audit output, while client JavaScript increased by 413 bytes,
gzip by 148 bytes and root closure by 55 bytes. No full equipment dataset or
additional eager registry was introduced.

Validation: `pnpm check`, `pnpm test` (10 tests), `pnpm build`,
`pnpm audit:production`, `pnpm audit:prelive:crawl`, `pnpm test:browser` (22
passed, 2 skipped) and `git diff --check` passed. Phase 5G is safe to retain.
Before migrating another route family, inspect the remaining root-layout
imports and identify which ones keep the old runtime registry eager.

## Phase 6A: root-layout dependency audit

This phase is analysis only. No application code was changed. The audit was
performed against the retained Phase 5G worktree and its production build.

### Current measured baseline

`pnpm audit:production` reports 1,461 generated routes, 87,842,653 bytes of
HTML, 4,895,244 bytes of client JavaScript, and 1,044,871 gzip bytes. The
calculated root-layout dependency closure is 876,835 bytes across 15 emitted
client files. The largest emitted chunks are:

| Chunk | Bytes | Gzip bytes | Evidence from emitted code |
|---|---:|---:|---|
| `DFA4sPz8.js` | 1,184,334 | 275,844 | class/page content, including class prose |
| `DS5dzle-.js` | 968,027 | 120,358 | class feature/content modules |
| `GzbqIaku.js` | 788,232 | 164,156 | spell index/detail data |
| `DybANXIN.js` | 741,054 | 107,507 | runtime link metadata and external/internal link entries |
| `CMrwWxFJ.js` | 332,974 | 91,437 | shared class/content helpers |

`DybANXIN.js` is the legacy runtime metadata payload relevant to this audit.
It contains the generated runtime link entries used by `getRuntimeData()`; the
same emitted file contains paths such as `internals.website.homepage`,
`internals.utility.search`, the Homebrew identities and external links. This
is a chunk-content measurement, not an estimate based on TypeScript source
file length. The build audit also reports 63 client nodes, of which 36 are
classified as transitively depending on canonical data by its current node
classification. That count is a graph metric, not a count of new imports.

The local production preview was opened once with an uncached Playwright page
and recorded 27 script requests, including the GTM request. The homepage
requested the application entry/payload, 19 local immutable chunks/nodes and
GTM. The legacy runtime chunk `DybANXIN.js` was among the initial requests.
This request count is a single controlled observation, not a performance
budget or a five-run Lighthouse result.

### Actual root-layout graph

The browser-facing graph is currently:

```text
+layout.svelte
├─ pageBuilder.ts
│  └─ components/_index_.ts
│     ├─ sidebar.ts
│     │  ├─ runtime/index.ts
│     │  │  └─ runtime/generated.ts  [legacy runtime registry]
│     │  └─ LinkPath/LinkData types
│     ├─ navbar.ts                 [small path/label config]
│     └─ footer.ts                 [small path config + date helper]
├─ currentPage.ts                  [runtime/index.ts; resolveCurrentPage]
├─ Navbar.svelte
│  ├─ runtime/index.ts             [logo/search href + metadata]
│  ├─ runtime/site-metadata.ts     [small site/logo metadata]
│  └─ Link.svelte
├─ Sidebar.svelte
│  ├─ runtime/index.ts             [active href lookup]
│  ├─ components/_index_.ts        [sidebarData/getSidebarLabel]
│  └─ Link.svelte
├─ Footer.svelte
│  └─ Link.svelte
├─ Breadcrumbs.svelte
│  └─ Link.svelte
├─ PageHeader.svelte
│  └─ CurrentPageContext.data     [full resolved PageData]
├─ PageCard.svelte                 [runtime/index.ts; full card fields]
├─ PopupHost.svelte                [type-only runtime metadata import;
│                                   receives the trigger's runtime object]
└─ +layout.server.ts
   ├─ currentPage.ts
   └─ runtime/index.ts             [server/build-time resolution]
```

The first eager browser edge is not `PageCard` alone: `pageBuilder` imports the
component data barrel, which evaluates `sidebar.ts`, which evaluates the
runtime barrel. `Link.svelte` is then used by Navbar, Sidebar, Footer and
Breadcrumbs and independently imports the same barrel. `currentPage.ts` is
also imported by the root layout and by PageCard; its `resolveCurrentPage()`
path calls `getRuntimeData()` for the compatibility `CurrentPageContext.data`.

`PopupHost.svelte` does not independently import the registry at runtime; its
`RuntimeLinkMetadata` import is type-only in the source. It nevertheless
renders the full popup fields supplied by `Link`, so changing PopupHost alone
would not disconnect the registry. `Footer` and `navbar.ts` contain path
identities only; their data definitions are not the source of the large
payload. `seo.ts` imports the small `site-metadata` module, while
`+layout.server.ts` uses the runtime barrel for server-side breadcrumb href
resolution. Server use is valid for prerendering, but the shared `currentPage`
and component imports make the equivalent runtime data reachable from the
client graph.

### Remaining eager consumers and fields

| Consumer | Current fields used | Needed at initial hydration? | Safer source |
|---|---|---|---|
| `sidebar.ts` | href, title, navigation label/parent/hidden, children | Yes for rendered navigation, but not descriptions/content/images | Generated navigation projection |
| `Link.svelte` | href, external, title, subtitle, icon, popup description, navigation icon size | Anchor href and icon are immediate; popup summary is interaction-only | Core link projection plus lazy popup metadata |
| `Navbar.svelte` | logo/search href; site logo | Yes, but only two links and logo metadata | Explicit navbar config/site metadata |
| `Sidebar.svelte` | target href for exact active-state comparison | Yes for visible sidebar | Navigation projection |
| `PageCard.svelte` | href, labels, descriptions, tags, images | Only on routes that render cards; not globally | Route-owned card data or lazy card lookup |
| `currentPage.ts` / root layout | full `PageData` compatibility object, title and route resolution | Route identity is global; full content is not | `currentPage` route-data plus route-owned page data |
| `PageHeader.svelte` | descriptions, header sections, images through context | Only on page templates that render a header | Route-specific `routePageData` |
| `PopupHost.svelte` | title, subtitle, description, image from event detail | No; only after hover/focus | Lazy popup summary projection |

The route-owned SEO work in Phases 5E–5G does not remove these shared edges:
the root still creates `CurrentPageContext.data` with `resolveCurrentPage`,
and the shared navigation/link components still call `getRuntimeData()`.

### Eager, lazy, server-only and route-specific classification

- **Eager browser:** `pageBuilder`/`sidebar.ts`, `Link.svelte`, Navbar,
  Sidebar, PageCard, and root `currentPage.ts` are reachable from the root
  layout. The measured homepage request confirms the legacy runtime chunk is
  fetched before interaction.
- **Lazy browser:** navbar search data is dynamically imported only after a
  query reaches the existing two-character threshold. Popup display is
  interaction-driven, but its current metadata object is already present on
  the trigger; this is not a lazy registry load.
- **Server/build-time:** `+layout.server.ts` resolves current-page and
  breadcrumb data during prerender. This use should remain server-side, but it
  must not be shared through a browser-imported resolver.
- **Route-specific:** FAQ, rules and nested equipment route data/SEO are now
  supplied through route loaders and are not the reason the legacy registry is
  still in the root closure. Class, species, spell, Homebrew and generic page
  components still use broader page/runtime compatibility paths where they
  render full content.

### Strategy evaluation

| Strategy | Benefit | Risk | Assessment |
|---|---|---|---|
| A. Lightweight navigation projection | Removes descriptions/content/images from the global navigation path | Must preserve exact paths, hidden nodes and Homebrew dual identities | Required first layer |
| B. Route-owned page data | Already proven for FAQ, rules and equipment SEO/content boundaries | More route contracts and SSR regression surface | Continue after the shared boundary is cut |
| C. Lazy metadata | Keeps popup descriptions and card-only fields out of initial load | Requires failure-safe async behavior and popup tests | Apply to popup summaries after anchor projection |
| D. Component decoupling | Removes direct registry edges from Link, Navbar, Sidebar and PageCard | An isolated component change can leave `pageBuilder`/sidebar eager | Implement as one coordinated boundary, not one component at a time |

### Concrete Phase 6B boundary and order

The smallest safe first implementation boundary is the complete shared
navigation/link boundary:

1. Generate a compact navigation projection from the canonical definitions at
   build time. It must contain path identity, href, external flag, display
   title/label, icon href/alt, navigation parent, hidden state, icon size and
   child relationships only. It must preserve both Homebrew entries as
   distinct path identities.
2. Change `sidebar.ts`, `pageBuilder.ts` and `components/_index_.ts` to consume
   that projection without importing `runtime/index.ts`. Change
   `Sidebar.svelte` active-state href lookup to use the projection.
3. Change `Link.svelte`, `Navbar.svelte`, `Footer.svelte` and
   `Breadcrumbs.svelte` to use the same small link projection. Keep ordinary
   semantic anchors and the existing popup events.
4. Keep popup behavior compatible by passing a compact trigger record; load
   description/full preview fields only on popup open. Do not put the full
   registry in a replacement global module.
5. Migrate `PageCard.svelte` separately to route-owned card data or a
   route/lazy lookup. It is not safe to claim the registry is disconnected
   until cards and the root `currentPage.ts` compatibility path are measured.
6. Remove the browser-side `resolveCurrentPage()`/full `CurrentPageContext.data`
   dependency only after all current consumers are route-owned, then retain
   `resolveCurrentPage()` exclusively in server/build-time code where needed.

Steps 1–4 are the first independently reviewable implementation unit, but
must be shipped and measured together: doing only `Link.svelte` repeats the
Phase 1 regression pattern. Step 5 is the next boundary if the build still
shows the legacy chunk. Step 6 is the final cutover.

### Phase 6B acceptance criteria

The implementation must pass all of the following before retention:

- The homepage's actual initial request log contains no `DybANXIN.js` (or its
  content-equivalent legacy registry chunk).
- No replacement eager chunk of comparable content size is introduced.
- Root-layout closure is lower than the Phase 5G measured 876,835 bytes, and
  homepage initial JavaScript is lower than the current measured baseline.
- Navigation, exact active states, Homebrew dual-navigation, breadcrumbs,
  external links, popup hover/focus/touch, search and deep links pass browser
  tests.
- Prerendered HTML route count and total HTML do not regress, and route-owned
  FAQ/rules/equipment SEO checks remain green.
- `pnpm check`, `pnpm test`, `pnpm build`, `pnpm audit:production`,
  `pnpm audit:prelive:crawl`, `pnpm test:browser` and `git diff --check` pass.

The size reduction from removing the legacy registry is an estimate until the
coordinated boundary is implemented: the measured candidate chunk is 741,054
bytes uncompressed and 107,507 gzip bytes, but shared imports and chunk
repacking mean the net initial-payload reduction will not equal that number.
The safe first target is therefore “legacy chunk absent and measured closure
below baseline,” not an invented byte promise.

### Phase 6A validation

Executed against the unchanged Phase 5G worktree:

- `pnpm audit:production` — passed; metrics are recorded above.
- Local production preview + Playwright homepage request capture — completed;
  27 script requests were observed, including GTM and the legacy runtime chunk.
- Source/import inspection — completed for root layout, page builder,
  navigation, links, cards, popup host, footer, page header, current-page and
  SEO modules.

The full validation suite had already passed on the retained Phase 5G build
(`pnpm check`, `pnpm test`, `pnpm build`, `pnpm audit:prelive:crawl`,
`pnpm test:browser`, and `git diff --check`; 22 browser tests passed and 2
were skipped). No source or generated application files were changed in this
phase. The generated `playwright-report/` and `test-results/` directories are
local test artifacts and remain outside the implementation scope.

## Phase 6B attempt: navigation projection reverted

The coordinated navigation experiment was attempted and reverted after
production-build measurement. It generated a separate navigation projection
and changed the shared navigation/link components to consume it. Popup details
were kept behind a dynamic import during the experiment.

The experiment failed the no-duplicate-registry requirement: the projection
was 324,313 bytes and loaded alongside the legacy registry, which remained
approximately 741 KB.

| Metric | Phase 6A baseline | Experiment | Decision |
|---|---:|---:|---|
| Root-layout closure | 876,835 B | 1,198,154 B | Reverted |
| Total client JavaScript | 4,895,244 B | 5,216,563 B | Reverted |
| Gzip client JavaScript | 1,044,871 B | 1,080,304 B | Reverted |
| Generated routes | 1,461 | 1,461 | Unchanged |
| Total HTML | 87,842,653 B | 87,845,559 B | No material route change |

`pnpm check` passed for the experiment, but `pnpm audit:production` failed on
the existing 1,000,000-byte root-layout budget. The experiment files were
restored; no Phase 6B code remains. The retained Phase 5G functional
validation remains the baseline.

### Revised Phase 6C boundary

The next implementation must first cut the actual remaining root edge rather
than add a parallel projection:

1. Move browser-side root `resolveCurrentPage()` out of the layout; retain
   only serialized route identity there.
2. Migrate `PageHeader` and root-reachable `PageCard` consumers to
   route-specific data so `CurrentPageContext.data` can be removed safely.
3. Only then replace `sidebar.ts` and `Link.svelte` with compact navigation
   data. Popup summaries must have a genuinely separate lazy source, not a
   dynamic import that remains coupled to the root graph.
4. Verify the built manifest and actual browser requests before retaining any
   generated projection.

Phase 6B is not safe to retain. The exact next implementation unit is the
`+layout.svelte → currentPage.ts → resolveCurrentPage()` cutover together with
the `PageHeader`/`PageCard` route-data contracts.

## Phase 6C attempt: PageHeader projection reverted

Phase 6C was attempted by moving the fields used by PageHeader and PageImage
into currentPage.header, populated by +layout.server.ts. This removed the
direct component reads of CurrentPageContext.data, but it serialized
descriptions, header sections and image metadata into every layout payload.

The production build kept client JavaScript essentially unchanged (4,895,360
bytes versus 4,895,244 bytes), while generated HTML increased from 87,842,653
to 88,271,959 bytes (+429,306 bytes). This is unnecessary per-page
duplication. The implementation was reverted. The Phase 5G baseline remains:
1,461 routes, 87,842,653 HTML bytes, 4,895,244 client-JS bytes and 876,835
root-layout-closure bytes.

pnpm test passed (10 tests), pnpm check passed and the build completed, but
the attempted output was not retained. The production audit reported the
baseline root closure after restoration. The static crawl and browser suite
were not rerun after the revert because the experiment was rejected on its
measured HTML regression.

The safe next boundary is not to serialize full header data through the root
layout. PageHeader must instead receive an already-owned route-specific
header contract from page components/loaders, with PageImage receiving its
image set explicitly. The root CurrentPageContext.data and
resolveCurrentPage() remain required by other consumers and were not changed.

## Phase 6D: route-owned PageHeader proof of concept

The FAQ route `/faq/acid-splash-5e/` now passes its existing
`data.routePageData.pageData` directly to `PageHeader` through an optional
`pageData` prop. `PageHeader` uses that prop for title, subtitle, description,
header sections and images; all other routes retain the previous
`CurrentPageContext.data` fallback. `PageImage` accepts an explicit image set
and route path so the selected FAQ header does not need global page data for
its rendering or image preference lookup.

No layout wrapper, breadcrumb, SEO head or FAQ article markup was duplicated.
The selected route still contains one `page-header` component and the normal
FAQ article. The route-owned source is the existing route payload; no new
registry or layout serialization was added.

The production audit measured 1,461 routes, 87,842,653 HTML bytes, 4,895,490
client-JavaScript bytes and a 876,835-byte root-layout closure. Compared with
Phase 5G, client JavaScript increased by 246 bytes and the root closure was
unchanged. The selected FAQ HTML remained 52,853 bytes in the generated
build; the global output remained at the Phase 5G baseline. The legacy
runtime registry remains eager, as explicitly expected for this proof of
concept.

Validation: `pnpm check` passed, `pnpm test` passed (10 tests), `pnpm build`
passed, `pnpm audit:production` passed and `git diff --check` passed. The
selected generated HTML contains the expected FAQ header and article; no
additional layout header was introduced. `pnpm audit:prelive:crawl` and
`pnpm test:browser` were not completed in this phase because the existing
prelive harness does not terminate reliably after its preview connection; no
browser result is claimed. Phase 6D is safe to retain from the build and
serialization measurements, pending the required browser-suite run.

The next step is to add a focused browser regression for the selected route,
then generalize the same explicit prop contract to one route family at a time.

## Phase 6E: FAQ PageHeader validation and family expansion

The Phase 6D proof of concept passed targeted browser validation on both
desktop and mobile. The test verifies direct navigation, route-owned SEO,
canonical metadata, exactly one `.page-header`, visible FAQ content,
navigation away and navigation back, with no page errors. The complete browser
suite also passed: 22 passed and 2 intentionally skipped. Existing non-critical
axe findings remain reported by the suite (including color contrast and
landmark findings); they were not converted into skips.

The FAQ catch-all route is the single owner for all FAQ detail pages. Its
`PageProps.data.routePageData.pageData` prop is therefore now used by every
generated FAQ detail page, not only the selected proof route. The production
build contains 403 FAQ HTML files. The prelive production-output audit now
requires exactly one PageHeader for every FAQ output in addition to its
existing title, canonical, description, article and Not Found checks.

The implementation remains payload-neutral because it passes the existing
route-owned `pageData` object already present in the FAQ route payload; it does
not add header data to the root layout or duplicate FAQ groups. Measurements
remain 1,461 routes, 87,842,653 HTML bytes, 4,895,490 client-JavaScript bytes
and 876,835 root-layout-closure bytes. The legacy runtime registry remains
eager and is outside this phase's scope.

The crawl lifecycle blocker remains reproducible: `pnpm audit:prelive:crawl`
prints the Vite SSR connection and does not terminate within the observed
window, so it was stopped rather than reported as passing. The script already
has bounded server-close cleanup, but the hang occurs before final reporting;
this is a harness lifecycle issue, not evidence of a route failure. No
coverage was weakened. Phase 6E is safe to retain based on the passing full
browser suite, production build/audit and unchanged payload measurements; the
crawl remains a separate blocker.

The recommended Phase 6F boundary is a different route family using the same
explicit PageHeader prop contract, after fixing or isolating the prelive
crawler's Vite lifecycle so static-output validation has a reliable exit code.

## Phase 6H: remove one remaining global PageData consumer

PageCard was inspected first. It imports the full runtime registry, but its
callers mostly provide only a path and it is route-specific rather than a
direct root-layout import. Migrating it safely would require coordinated
route-owned card contracts across homepage, class, spell, rules, Homebrew and
content-section callers; doing a partial migration would either preserve the
same registry edge or duplicate card data.

The smallest independently safe consumer was `PageImage.svelte`. It was
already called by `PageHeader`, which already computed the image set and
current route. The component now receives `imageSet` and `path` explicitly and
no longer imports or reads `CurrentPageContext.data`. Other PageHeader callers
continue to work because PageHeader supplies the existing context-derived
image set until their own route-owned migration.

This removes one real full-PageData consumer without adding serialization,
changing markup, or introducing a registry. Remaining consumers are
`PageHeader.svelte` fallback behavior, `PageCard.svelte`, root
`+layout.svelte`/`currentPage.ts`, `Link.svelte`, Navbar, Sidebar and the
server-side current-page resolver. The legacy runtime chunk remains eager.

Phase 6H measurements are effectively unchanged: 1,461 routes, 87,845,729
HTML bytes, 4,895,492 client-JavaScript bytes, 1,044,965 gzip bytes and
876,835 root-layout-closure bytes. The small JavaScript variation is emitted
chunk repacking; there is no new eager data module or serialized payload.

Validation: `pnpm check`, `pnpm test` (10 passed), `pnpm build`,
`pnpm audit:production`, `pnpm test:browser` (22 passed, 2 skipped) and
`git diff --check` passed. The reliable prelive crawler remains active and
reports the known Psion references with exit code 1; it is not suppressed.
Phase 6H is safe to retain. The next safe boundary is a coordinated
route-owned PageCard contract, beginning with one caller family and measured
before expanding; do not change the root layout or recreate a global card
registry.

## Phase 6G: Rules and Equipment PageHeader migration

Rules detail pages now pass their existing
`data.routePageData.pageData` to the shared `PageHeader`, using the same
explicit-prop contract proven by FAQ. The catch-all rules route owns the data
for 127 generated rules outputs. Spell-list indexes, cantrips and level-list
routes were not changed because they do not expose the same route contract.

Equipment detail pages were audited separately. The 52 nested equipment
outputs already render the established `EquipmentDetail` header rather than
the shared `PageHeader`; adding a second PageHeader would duplicate visible
header markup and change the existing design. They therefore remain on their
existing custom header, while their route-owned SEO and route data remain
unchanged. Equipment type indexes were also deliberately excluded.

The production output remains stable apart from the expected small component
change: 1,461 routes, 87,845,729 HTML bytes, 4,895,562 client-JavaScript
bytes and 876,835 root-layout-closure bytes. The legacy 741,054-byte runtime
chunk remains eager. No global context fields, layout payloads or registries
were added.

Validation: `pnpm check`, `pnpm test` (10 tests), `pnpm build`,
`pnpm audit:production`, `pnpm test:browser` (22 passed, 2 skipped) and
`git diff --check` passed. Browser coverage now checks one shared PageHeader
on Rules and one existing equipment detail header on Equipment, while FAQ
coverage remains active. The prelive crawler completes reliably but returns
the known nonzero Psion result; all route, SEO, PageHeader, link, asset and
static-output checks pass otherwise. Phase 6G is safe to retain. The next
boundary should migrate another route family only where a real route-owned
PageHeader contract exists; do not replace EquipmentDetail with duplicate
header markup.

## Phase 6F: prelive crawl lifecycle reliability

The recurring apparent hang was investigated in `scripts/audit-prelive.mjs`.
The built-output crawl itself is synchronous file validation and was not the
deadlock. The process spent a long, silent interval loading the canonical,
core and spell modules through Vite `ssrLoadModule` before it could print the
audit summary. The existing final `server.close()` cleanup was therefore not
reached while the process appeared stuck.

The audit now has concise opt-in diagnostics controlled by
`PRELIVE_AUDIT_VERBOSE=true`, bounded SSR module-load operations controlled by
`PRELIVE_AUDIT_TIMEOUT_MS` (default 120 seconds), and progress markers for
module loading and route validation. A timeout fails with a nonzero exit code
and identifies the operation. Existing route coverage is unchanged: the
successful run indexed 834 links, 813 page entries and 620 spell routes, and
validated 1,432 unique route URLs. The existing bounded server-close cleanup
remains in place.

Observed results:

- First verbose run completed all checks and returned exit code 1 for the
  pre-existing missing `internals.classes.psion` data paths.
- Two sequential non-verbose runs both completed and returned exit code 1 for
  the same Psion findings (`run 1 exit=1`, `run 2 exit=1`). Neither hung.
- The crawl checks themselves passed, including local route coverage,
  generated FAQ/rules/equipment route data, titles, canonicals, descriptions,
  PageHeader uniqueness, links, JSON-LD and assets.

This is a harness reliability fix, not a suppression of the Psion failure.
The crawler is now reliable enough for Phase 6G: successful checks can return
0, the known data failure returns 1, and SSR initialization has a bounded
failure mode with actionable diagnostics. The Psion references remain a
separate content/data blocker and were not changed.
Do not move the prop data into `+layout.server.ts`.

## Phase 6I: PageCard route-owned metadata migration

### Scope and caller inventory

`PageCard.svelte` still supports the legacy `page` path API and resolves a
full runtime `PageData` record for callers that use it. The callers were
reviewed before changing the component:

- Homepage, Classes, Magic Items, Rules, Spells and Homebrew indexes use the
  legacy path-based lookup.
- `CompanionBrowser` also uses the path-based API, with explicit eyebrow and
  description overrides.
- `PageContentSection` uses fallback-only cards and does not require a runtime
  lookup.

The selected independent family is the Homebrew magic-item category page,
`/homebrew/eldor/magic-items/`. Its route already has canonical item data and
the generated `magicItemPages` projection. It was the smallest real caller
family that could provide card fields without changing the card markup or
creating a second registry.

### Contract and implementation

`PageCard.svelte` now accepts an optional `cardData` prop containing only the
existing card fields: href, external flag, title/label, description,
description variants, card images, icon image and tags. When `cardData` is
provided it is preferred and `getRuntimeData(page)` is not called. Existing
callers retain the legacy path-based fallback unchanged.

The Homebrew magic-item category passes the already generated
`magicItemPages[item.slug]` metadata to `cardData`. This is derived from the
canonical Homebrew item definitions; no manually maintained duplicate data or
global eager projection was added. The route still passes its page identity so
the existing image-gender behavior remains intact.

### Validation and measurements

The explicit-card browser regression checks the rendered title and exact
internal href for The Mimic Stick. The existing fallback callers and all other
route families remain covered by the production and browser suites.

After the change, the production audit reported:

- 1,461 generated routes.
- 87,842,979 total HTML bytes.
- 4,895,556 client JavaScript bytes and 1,044,950 gzip bytes.
- 876,835-byte root-layout closure.
- 741,054-byte legacy runtime chunk; it remains eager because other shared
  callers still use the fallback path.

Compared with the retained Phase 6H/6G measurements (87,845,729 HTML,
4,895,492 client bytes, 1,044,965 gzip bytes, and 876,835-byte root closure),
this narrow migration did not create a new registry or materially change the
root-layout payload. The runtime registry is not removed by Phase 6I; the
remaining path-based callers are the next boundary to evaluate.

`pnpm check`, `pnpm test`, `pnpm build` and `pnpm audit:production` passed.
The prelive crawl remains reliable but returns its known nonzero result for
missing Psion data references; no Psion content was changed. Browser validation
should be rerun after the final generated-output restore because build output
is local-only.

### Next boundary

Phase 6J should migrate the next independently verifiable PageCard caller
family only after identifying a route-owned metadata source and adding a
corresponding production-output/browser assertion. The fallback must remain
until every caller has an explicit source; removing it now would break the
homepage and other shared pages.

## Phase 6J: Classes PageCard dependency reduction

### Selected caller family

The remaining callers were inventoried across the homepage, Classes, Magic
Items, Rules, Spells, Homebrew, CompanionBrowser and PageContentSection. The
Classes index was selected because it renders 24 cards, is a high-traffic
content index, and already imports `classList` from the canonical class module.
Each class entry has a matching `classes[slug].page` metadata object containing
the href, label/title, description, icon, responsive card images and tags.

This avoids a new registry and avoids manually repeating card metadata. The
route now passes that existing page object through `cardData`; PageCard still
receives the path for identity and image-gender behavior.

### Dependency and compatibility result

PageCard's `cardData` path is used for the Classes family and the existing
Homebrew magic-item family. All other callers retain the legacy
`page -> getRuntimeData()` fallback. The fallback was intentionally not
removed: homepage cards, Rules child cards, Spells, Homebrew indexes,
CompanionBrowser, PageContentSection path cards, Magic Items and other callers
still need a coordinated migration or a route-owned contract.

The legacy runtime import therefore remains in the PageCard module and the
741,054-byte runtime chunk remains in the initial graph. This phase removes
real runtime lookups for the Classes cards but does not claim to remove the
registry from the homepage.

### Measurements

After the change:

- 1,461 generated routes.
- 87,848,433 total HTML bytes.
- 4,895,717 client JavaScript bytes.
- 1,045,038 gzip JavaScript bytes.
- 876,835-byte root-layout closure.
- 741,054-byte legacy runtime chunk.

Compared with Phase 6I (87,842,979 HTML, 4,895,556 client bytes,
1,044,950 gzip bytes and the same root closure), this implementation adds
approximately 5.5 KB of generated HTML and 161 bytes of client JavaScript.
The gzip increase is 88 bytes. The increase is limited to the Classes route
cards and does not create a second heavyweight chunk or change the root-layout
closure. It is an architectural reduction in runtime lookups, not a measured
homepage bundle reduction.

### Regression coverage and next boundary

The browser suite now verifies both explicit-card families, including the
Classes card title, image and canonical href. Existing Homebrew, fallback,
navigation, popup, accessibility and hydration tests remain active.

The next Phase 6K step should not migrate arbitrary callers one by one. First
split PageCard's legacy fallback from the explicit-card rendering path (or
provide a build-time route contract for the remaining index families), then
migrate the homepage's fixed cards as one coordinated boundary. Independently,
the root layout's `resolveCurrentPage()` and other shared consumers remain
larger blockers than PageCard alone; the import graph must be remeasured before
choosing which boundary removes the legacy registry.

## Phase 6K: root-layout global page resolution experiment

The attempted Phase 6K implementation was reverted. The browser layout still
imports and calls `resolveCurrentPage()` and therefore Phase 6K's acceptance
criterion was not retained.

The minimal candidate was to serialize current-page header/SEO metadata from
`+layout.server.ts` and make `PageHeader` consume it through the existing
route contract. Type checking and unit tests passed, but the production audit
showed the contract was too large: serializing image sets and header sections
in the layout increased total HTML from 87,848,433 to 88,448,966 bytes, an
increase of 600,533 bytes. This was an unacceptable duplicated payload even
though JavaScript remained within the existing range.

After reverting only the Phase 6K experiment, the retained Phase 6J baseline
was restored:

- 1,461 routes.
- 87,848,433 HTML bytes.
- 4,895,717 client JavaScript bytes.
- 1,045,038 gzip JavaScript bytes.
- 876,835-byte root-layout closure.
- 741,054-byte legacy runtime registry.

Validation of the retained implementation passed: `pnpm check`, `pnpm test`,
`pnpm build`, `pnpm audit:production`, `pnpm audit:prelive:crawl`,
`pnpm test:browser` (26 passed, 2 skipped), and `git diff --check`.

The exact blocker is therefore not SSR availability but payload ownership:
the current `PageHeader` fallback needs description/image/header metadata that
cannot be serialized globally without material HTML growth, while several
unmigrated routes still use `CurrentPageContext.data`. Phase 6L must first
provide route-owned PageHeader metadata for those remaining callers (or a
smaller title/description-only contract with images kept route-local), then
remove the root fallback in one coordinated change. No new registry or
heavyweight layout fallback should be introduced.

## Phase 6L: `$app/state.page.data` proof of concept

SvelteKit 3.1.1 and Svelte 5.57.3 are installed. The official SvelteKit
documentation states that each `+layout.svelte` can access child page data via
`page.data`, including data returned by a child `+page.server.ts` loader. The
FAQ detail loader already returns `routePageData`, so no new layout serialization
was added.

For FAQ detail routes only, `+layout.svelte` now reads the existing
`appPage.data.routePageData` and uses its `identity.path` and `pageData` instead
of calling `resolveCurrentPage()`. All non-FAQ routes retain the existing
`resolveCurrentPage()` fallback. The focused browser test navigates homepage →
FAQ → spells → FAQ and verifies the FAQ title and PageHeader after each
transition, covering prerendered load, hydration and client-side route changes.

Measured output after the proof of concept:

- 1,461 routes.
- 87,848,433 HTML bytes, unchanged from Phase 6J.
- 4,895,881 client JavaScript bytes.
- 1,045,075 gzip JavaScript bytes.
- 876,999-byte root-layout closure.
- 741,054-byte legacy registry chunk.

The HTML payload did not increase. The small JavaScript/root-closure increase
comes from the FAQ-only branch and is below the existing 1 MB shared budget;
the legacy registry remains because non-FAQ consumers still use the fallback.
The proof of concept is retained.

Validation passed: `pnpm check`, `pnpm test`, `pnpm build`,
`pnpm audit:production`, `pnpm audit:prelive:crawl`, `pnpm test:browser`
(28 passed, 2 skipped), and `git diff --check`.

Remaining `resolveCurrentPage()` consumers are the non-FAQ branch in
`+layout.svelte`, the server-side route loaders for generic, FAQ and Rules
route resolution, and shared/current-page consumers that still rely on
`CurrentPageContext.data` (notably generic wiki and equipment presentation).
The smallest safe next change is to migrate one non-FAQ route family to the
same child-data branch, with an explicit browser test and an HTML-size check,
before changing the global fallback.

## Phase 6M: Rules root-layout decoupling

Rules detail pages using the catch-all `rules/[...rule]` loader already expose
`routePageData` through `page.data`. The root layout now consumes that existing
data for eligible Rules detail URLs, while preserving `resolveCurrentPage()`
for `/rules/`, cantrips, the spell index and level-specific spell lists. No
Rules content was added to `+layout.server.ts`, and no new registry was
introduced.

The Rules page component already supplied `routePageData.pageData` to
`PageHeader`; the remaining root-layout change therefore only changes the
context/SEO source for eligible detail pages. The focused browser test checks a
Rules detail page, a spell-list route, back navigation and a return to the
Rules detail page. The full browser suite also passed, covering SSR,
hydration and existing FAQ, Equipment, Classes, Homebrew, popup and search
checks.

Final measurements:

- 1,461 routes.
- 87,845,527 HTML bytes.
- 4,896,189 client JavaScript bytes.
- 1,045,118 gzip JavaScript bytes.
- 877,307-byte root-layout closure.
- 741,054-byte legacy registry chunk.

Compared with Phase 6L, HTML decreased by 2,906 bytes. Client JavaScript
increased by 308 bytes and the root closure by 308 bytes; no new heavyweight
chunk appeared and the existing budgets passed. The legacy registry remains
because generic, equipment, spell and other shared consumers still use the
fallback path.

Validation passed: `pnpm check`, `pnpm test`, `pnpm build`,
`pnpm audit:production`, `pnpm audit:prelive:crawl`, `pnpm test:browser`
(30 passed, 2 skipped), and `git diff --check`.

Remaining fallback routes include the root layout's generic branch, Rules
indexes/spell lists, and all route families without a proven child-data
contract. The next safe boundary is the generic wiki route, but its
`CurrentPageContext.data` consumers must be migrated or supplied from its own
`PageProps` before changing the fallback.

## Publication for controlled performance testing

The retained Phase 1–6M changes were published on:

- Branch: `performance/runtime-metadata-migration`
- Commit: `da24cdbd471516d695528991034a09bf06931970`
- Remote: `origin/performance/runtime-metadata-migration`

The branch is based on `main` and contains the intended migration, audit, test
and documentation files. A Draft Pull Request could not be submitted from the
available GitHub session because GitHub reported the browser as logged out. The
comparison page is available at:

https://github.com/dnd-portal/dnd-portal-wiki/compare/main...performance/runtime-metadata-migration?expand=1

The GitHub Pages workflow was reviewed: pull requests run validation and build
jobs, while the deploy job is excluded for `pull_request` events. Publishing
this branch and opening a PR therefore does not deploy to production. No
preview deployment infrastructure is configured; the build artifact or a
separate isolated Pages preview would be required for browser performance
comparisons.
