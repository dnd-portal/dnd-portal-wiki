# Mobile performance audit

## Executive summary

The live homepage is materially better than the historical pre-optimization
baseline, but the mobile result is still unstable. In five comparable
Lighthouse 13.6.0 runs against `https://dnd-portal.com/`, scores were 80, 75,
86, 82 and 82; the median was **82/100**. The local production preview scored
77, 77, 77, 78 and 78; the median was **77/100**.

The measured mobile bottleneck is not the homepage WebP download or navbar
search. The LCP node is the full homepage article, and its largest measured
delay is element rendering after the resource has loaded. Main-thread work is
dominated by script evaluation, style/layout and unattributed browser work.
Google Tag Manager is a meaningful secondary CPU cost. The shared runtime
metadata chunk is large, but the trace does not prove that it is the single
cause of the LCP delay.

The single highest-impact optimization to implement first is:

> Profile and reduce the homepage's post-hydration style/layout and rendering
> work, beginning with the full homepage article/card tree and its responsive
> CSS, while measuring the LCP article in a Chrome performance trace.

This is preferred over immediately rewriting runtime metadata because the
current trace directly attributes 232 ms to style/layout and 276 ms of the LCP
breakdown to element render delay, whereas the 750 kB runtime chunk is only
partially attributable in Lighthouse's CPU tables.

## Methodology and limitations

Measurements used Lighthouse 13.6.0, Chromium headless, simulated mobile or
desktop throttling, and the same command shape for each run. Mobile used
`--form-factor=mobile --screenEmulation.mobile=true`; desktop used
`--form-factor=desktop --screenEmulation.mobile=false`. Each run used a fresh
Lighthouse browser context. Raw JSON reports were saved in the local audit
worktree under `.audit-lh-live/` and `.audit-lh-local/`; they are generated
artifacts and are not source changes.

The supplied current PageSpeed values (desktop 99, mobile 73) are not directly
comparable to these Lighthouse runs because the PageSpeed environment,
network, browser build and throttling are not known. They are reported as
context, not replaced by the laboratory results below. Live scores also varied
substantially between runs, so a single score is not treated as a stable
production characteristic.

## Lighthouse measurements

### Live production, mobile

|        Run |  Score |        FCP |          LCP |        TBT |       CLS |  Speed Index |  Main thread |      Transfer | Requests |
| ---------: | -----: | ---------: | -----------: | ---------: | --------: | -----------: | -----------: | ------------: | -------: |
|          1 |     80 |   2,702 ms |     4,073 ms |     176 ms |     0.011 |     2,702 ms |     1,445 ms |     595,045 B |       62 |
|          2 |     75 |     976 ms |     4,660 ms |     371 ms |     0.000 |     1,585 ms |     1,913 ms |     594,732 B |       62 |
|          3 |     86 |     964 ms |     4,052 ms |     119 ms |     0.000 |     1,422 ms |     1,167 ms |     594,737 B |       62 |
|          4 |     82 |     932 ms |     4,771 ms |     116 ms |     0.000 |     1,418 ms |     1,205 ms |     595,180 B |       62 |
|          5 |     82 |   2,655 ms |     4,098 ms |      98 ms |     0.000 |     2,655 ms |     1,317 ms |     595,019 B |       62 |
| **Median** | **82** | **976 ms** | **4,098 ms** | **119 ms** | **0.000** | **1,585 ms** | **1,317 ms** | **594,737 B** |   **62** |

### Local production preview, mobile

|        Run |  Score |        FCP |          LCP |       TBT |       CLS |  Speed Index |  Main thread |      Transfer | Requests |
| ---------: | -----: | ---------: | -----------: | --------: | --------: | -----------: | -----------: | ------------: | -------: |
|          1 |     77 |     910 ms |     6,159 ms |     83 ms |     0.000 |     1,566 ms |     1,004 ms |     686,302 B |       62 |
|          2 |     77 |     907 ms |     6,080 ms |     98 ms |     0.000 |     1,595 ms |     1,229 ms |     686,299 B |       62 |
|          3 |     77 |     907 ms |     6,199 ms |    100 ms |     0.000 |     1,561 ms |     1,062 ms |     686,300 B |       62 |
|          4 |     78 |     907 ms |     6,127 ms |     76 ms |     0.000 |     1,543 ms |     1,037 ms |     686,312 B |       62 |
|          5 |     78 |     906 ms |     6,056 ms |     80 ms |     0.000 |     1,551 ms |     1,166 ms |     686,311 B |       62 |
| **Median** | **77** | **907 ms** | **6,127 ms** | **83 ms** | **0.000** | **1,561 ms** | **1,062 ms** | **686,302 B** |   **62** |

### Desktop comparison

| Environment   | Score |    FCP |      LCP |   TBT |   CLS | Speed Index | Main thread |  Transfer | Requests |
| ------------- | ----: | -----: | -------: | ----: | ----: | ----------: | ----------: | --------: | -------: |
| Live          |    77 | 906 ms | 3,906 ms | 67 ms | 0.000 |    1,456 ms |    1,055 ms | 594,668 B |       62 |
| Local preview |    73 | 906 ms | 6,132 ms | 70 ms | 0.012 |    1,546 ms |      987 ms | 686,299 B |       62 |

These controlled desktop runs did not reproduce the reported PageSpeed 99.
That discrepancy reinforces that the scores are environment-sensitive; the
resource and trace findings are more reliable than the absolute score.

## Deployment verification

The live homepage serves both optimized assets:

- `/backgrounds/homepage-wallpaper.webp`
- `/backgrounds/homepage-wallpaper-2.webp`

The live browser requested neither `/_data/navbar-search.json` nor the search
index during initial navigation. After filling the desktop navbar search with
`magic`, it requested the index once and displayed six suggestions without
console errors. This confirms that the lazy search change is deployed.

The live homepage requested 62 resources in the Lighthouse runs. The browser
trace observed 26 script resources, 29 images, one stylesheet, four other
resources and two third-party resources. No font request was observed.

## Actual LCP and breakdown

The mobile LCP element in the representative live run was:

```html
<article class="wiki-article wiki-home"></article>
```

It is the rendered homepage article, not either wallpaper image. Lighthouse's
LCP breakdown for the representative run was:

| Subpart                | Duration |
| ---------------------- | -------: |
| Time to first byte     |  52.6 ms |
| Resource load delay    |  83.2 ms |
| Resource load duration |   9.1 ms |
| Element render delay   | 276.4 ms |

The element is a 4,044 px-tall article containing the homepage navigation and
card tree. The wallpapers load quickly enough that they are not the dominant
LCP resource delay. The render delay and the variability of the full LCP value
point to main-thread scheduling, style/layout and presentation timing after
the document and initial scripts are available.

## Network waterfall

Largest live transfers in the representative mobile run were:

| Resource                       |  Transfer | Uncompressed / resource size | Finding                                 |
| ------------------------------ | --------: | ---------------------------: | --------------------------------------- |
| Google `gtag.js`               | 183,304 B |                    545,333 B | Third-party CPU and transfer cost       |
| `B0xy1BMz.js` runtime metadata | 111,000 B |                    742,551 B | Largest first-party JavaScript resource |
| `homepage-wallpaper-2.webp`    |  73,889 B |                     73,690 B | Expected hero background                |
| `homepage-wallpaper.webp`      |  49,521 B |                     49,256 B | Expected hero background                |
| `favicon.ico`                  |  27,370 B |                    111,682 B | Large for an icon request               |
| Homepage CSS                   |  25,733 B |                    162,975 B | Render-blocking stylesheet              |

The resource summary totals were 567,367 B for first-party/total resources
reported by the Lighthouse table plus 183,852 B of third-party resources,
consistent with approximately 595 kB total transfer after accounting for
Lighthouse's resource categorization. The CSS audit identified the homepage
stylesheet as render-blocking, with 25,733 B transferred and 151 ms of
render-blocking duration in the representative trace.

All inspected live responses returned `Cache-Control: max-age=600`, including
HTML, hashed JavaScript, CSS, WebP and the search index. This is only a
10-minute freshness window and is a likely repeat-visit/network efficiency
opportunity, although it does not explain the first-visit CPU bottleneck.
Responses varied on `Accept-Encoding`, but the header inspection did not show
a `Content-Encoding` value in the PowerShell response. This should be
confirmed with a raw `curl -I`/HAR capture before changing server configuration.

## JavaScript and main-thread analysis

The live representative run reported:

| Main-thread category |   Time |
| -------------------- | -----: |
| Other                | 473 ms |
| Script evaluation    | 342 ms |
| Style and layout     | 232 ms |
| Rendering            |  58 ms |
| Script parse/compile |  32 ms |
| HTML/CSS parsing     |  16 ms |
| Garbage collection   |  13 ms |

The largest identified CPU contributors were:

| Source/resource                   |                           CPU evidence |
| --------------------------------- | -------------------------------------: |
| Unattributable browser work       |  497 ms total, 99 ms script evaluation |
| Homepage document/layout work     |                           330 ms total |
| Google `gtag.js`                  | 159 ms total, 127 ms script evaluation |
| `BNypj-YI.js` shared client chunk |   81 ms total, 67 ms script evaluation |
| `nodes/0.JksXRDwu.js` root layout |   66 ms total, 44 ms script evaluation |

The five longest tasks exposed by Lighthouse were 115 ms unattributable work,
108 ms on the homepage document, 73 ms and 69 ms in GTM, and 62 ms in
`BNypj-YI.js`. Lighthouse exposed five long-task rows in this run, not ten;
claiming ten source-mapped tasks would be fabrication. A Chrome DevTools
performance trace with source maps is required for a fuller top-ten task list.

The runtime metadata chunk (`B0xy1BMz.js`) is 742,551 B uncompressed and about
111 kB transferred. It is in the initial root dependency closure and remains
the largest first-party JavaScript resource, but the Lighthouse bootup table
does not attribute it as the largest CPU task. It is therefore a confirmed
payload/parse opportunity and a plausible contributor to scheduling, not a
proven sole cause of mobile LCP.

## Mobile versus desktop

Mobile and desktop used the same 62-request shape and the same first-party
asset family. Mobile did not load a separate large search or registry chunk;
the search index remained lazy. The mobile-specific penalty is therefore
primarily CPU/render scheduling under mobile emulation, not an extra mobile
network dependency.

The mobile results show the largest instability in FCP and TBT: FCP ranged
from 932 ms to 2,702 ms and TBT from 98 ms to 371 ms on live runs. LCP stayed
between 4,052 ms and 4,771 ms. This is consistent with contention from
third-party script and browser/main-thread scheduling. The local preview had
stable FCP around 907 ms but consistently delayed LCP around 6.1 s, showing
that the LCP presentation path is also sensitive to the environment and not
just server transfer.

## Confirmed bottlenecks and recommendations

### P0 — Profile and reduce homepage render/layout work

Root cause: the LCP is the entire homepage article, and the trace attributes
276 ms of its LCP breakdown to element rendering plus 232 ms of total
style/layout work. The article contains a large card/navigation tree and
responsive styles.

Evidence: LCP element is `article.wiki-article.wiki-home`; render delay is
276.4 ms; style/layout is 232.4 ms; five-run LCP remains around 4.1–4.8 s on
live mobile.

Proposed change: use a source-mapped Chrome performance trace to isolate the
largest layout invalidations and responsive selectors, then reduce only the
verified invalidations or below-the-fold work. Preserve SSR, visible content,
SEO and accessibility.

Expected benefit: estimate only; potentially 0.2–1.0 s LCP improvement if
layout/render delay is confirmed as the dominant presentation gate.

Difficulty: medium. Risk: visual regressions, changed responsive behavior and
accessibility regressions. Tests: representative mobile/desktop screenshots,
Playwright hydration/navigation checks, axe checks and five-run Lighthouse
comparison.

### P1 — Split the 742 kB runtime metadata dependency

Root cause: `B0xy1BMz.js` is the largest first-party initial JavaScript
resource and is part of the shared root closure.

Evidence: 742,551 B resource size, 111,000 B transferred, initial request;
root-layout closure remains approximately 878 kB in the production audit.

Proposed change: split only metadata proven unnecessary for the homepage into
route-local or server-rendered data, keeping breadcrumbs, navigation, popups,
SEO and no-JavaScript links intact.

Expected benefit: estimate; reduced mobile parse/evaluation and potentially
less scheduling contention. The exact LCP benefit is unproven until a trace
maps the chunk's functions to tasks.

Difficulty: high. Risk: hydration mismatches, broken internal links, popup
metadata and SEO regressions. Tests: bundle-boundary tests, production-output
audits, deep-route hydration and browser search/popup tests.

### P1 — Measure GTM deferral as a product decision

Root cause: GTM contributed 159 ms total CPU and 127 ms script evaluation in
the representative run, with two 69–73 ms long tasks.

Evidence: Lighthouse bootup and long-task tables.

Proposed change: controlled experiment delaying analytics until after the
first meaningful render, only if analytics requirements permit it.

Expected benefit: estimate; up to roughly 100–160 ms main-thread work in this
trace, but not necessarily equivalent LCP improvement.

Difficulty: low to medium. Risk: delayed/lost analytics events and consent
behavior changes. Tests: analytics/consent tests, Lighthouse with GTM on/off,
and functional regression checks. Do not remove analytics based on this audit
alone.

### P2 — Improve immutable-asset cache policy

Root cause: even hashed assets and WebP responses advertise only
`max-age=600`.

Evidence: live HEAD requests for HTML, CSS, JavaScript, WebP and search JSON.

Proposed change: configure immutable hashed assets for long-lived caching and
keep HTML revalidation short. Verify GitHub Pages compatibility first.

Expected benefit: estimate; repeat visitors should avoid most asset transfer,
but first-visit Lighthouse will not improve materially.

Difficulty: low if hosting headers are controllable; otherwise unavailable on
static GitHub Pages. Risk: stale assets if filenames are not truly immutable.
Tests: deployment header checks and versioned-asset smoke tests.

### P2 — Audit favicon and CSS delivery

Root cause: the favicon resource is 111,682 B and transfers 27,370 B; the
homepage stylesheet is 162,975 B uncompressed and render-blocking.

Evidence: live network waterfall and render-blocking audit.

Proposed change: verify whether the favicon can use a smaller equivalent asset
and whether critical homepage CSS can be separated without duplicating CSS or
changing rendering.

Expected benefit: estimate; modest transfer/render-blocking improvement.

Difficulty: low to medium. Risk: visual regressions and changed icon behavior.

## Required regression coverage for the first optimization

- Five-run mobile and one desktop Lighthouse protocol with fixed browser and
  throttling settings.
- Chrome trace capture with source maps and a report of the top ten tasks when
  available.
- LCP element assertion for the homepage article and no hydration errors.
- No initial `navbar-search.json` request; one request after search input.
- WebP asset presence and visual/screenshot checks.
- Keyboard navigation, popup behavior, reduced-motion and axe checks.
- Production HTML, JavaScript, route-count and accessibility audits.

## Conclusion

The live deployment has the WebP and lazy-search fixes. The remaining mobile
gap is chiefly a rendering/CPU stability problem: full homepage article
rendering, style/layout work, the shared runtime metadata payload and GTM all
contribute. The first implementation should target the measured homepage
render/layout invalidations with a source-mapped trace. Runtime metadata
splitting is the next architectural change, but should not be selected as the
first fix without function-level profiling evidence.

## Rendering optimization experiment (2026-11-22)

The current homepage was reproduced locally through the production preview on
`localhost:4177`, using Lighthouse 13.6.0, a fresh headless Chromium run for
each measurement, mobile emulation and simulated throttling. The existing
mobile baseline in this report is five runs with median performance 77 and
median LCP 6,127 ms. The experiment tested disabling the homepage card
`backdrop-filter` only below 700 px, because the cards are the main repeated
visual effect in the first viewport. No content, markup, image or JavaScript
changes were made.

|        Run |  Score |        FCP |          LCP |        TBT |  Speed Index |  Main thread | Requests |
| ---------: | -----: | ---------: | -----------: | ---------: | -----------: | -----------: | -------: |
|          1 |     76 |     910 ms |     6,297 ms |     145 ms |     1,692 ms |     1,401 ms |       62 |
|          2 |     77 |     908 ms |     6,294 ms |     116 ms |     1,641 ms |     1,271 ms |       62 |
|          3 |     77 |     908 ms |     6,273 ms |     115 ms |     1,613 ms |     1,188 ms |       62 |
|          4 |     77 |     907 ms |     6,146 ms |      96 ms |     1,558 ms |     1,053 ms |       62 |
|          5 |     77 |     906 ms |     6,263 ms |     101 ms |     1,629 ms |     1,231 ms |       62 |
| **Median** | **77** | **908 ms** | **6,263 ms** | **115 ms** | **1,629 ms** | **1,231 ms** |   **62** |

The experiment did not improve the measured result: the median LCP remained
within normal Lighthouse noise of the existing 6.1 s local baseline and the
median main-thread time was not lower. Desktop was 68/100 with LCP 6,229 ms in
the same preview after the experiment, so the variant also provided no evidence
of a safe desktop-neutral win. The CSS change was therefore reverted and is
not part of the application. This is an explicit negative result, not an
assumption that backdrop filtering is free or expensive.

### Interpreting the LCP timing discrepancy

The approximately 421 ms LCP sub-breakdown previously recorded for the live
homepage (TTFB 52.6 ms, resource delay 83.2 ms, resource load 9.1 ms and
element render delay 276.4 ms) is not expected to sum to the absolute LCP
timestamp of approximately 4,098 ms. Those fields describe the critical LCP
element's request/render phases relative to its relevant navigation and
resource milestones; they are not a complete decomposition of every elapsed
millisecond before the final candidate is presented. Main-thread and
style/layout totals are aggregate trace work and also cannot be added directly
to LCP. The 4.1 s value is the timestamp at which the browser finally reports
the candidate; the 421 ms figure is the measured breakdown of the final
critical path. They must be taken from the same Lighthouse run and same LCP
candidate before being compared.

### Current conclusion and next implementation target

The tested CSS simplification is not supported by the A/B result and was not
retained. The highest-impact next step remains a source-mapped Chrome trace of
the homepage's article render and hydration, with particular attention to the
large shared runtime metadata module, aggregate style recalculation and the
GTM task. Any change should be selected only after its work can be mapped to a
specific source module or selector and then re-tested with the five-run
protocol above.

## Hydration and runtime profiling (2026-11-22)

### Reproducible protocol

The current production build was served with `vite preview` on a fresh port
(`localhost:4180`). Each Lighthouse run used Lighthouse 13.6.0, the same
installed headless Chromium, mobile emulation, simulated throttling and a new
browser context. The five enabled runs below all produced the expected static
homepage and 62 network requests. A controlled comparison blocked requests
matching `*googletagmanager.com*`; this was a local experiment only.

### Five-run mobile baseline

|        Run |  Score |        FCP |          LCP |        TBT |  Speed Index |  Main thread | Requests |
| ---------: | -----: | ---------: | -----------: | ---------: | -----------: | -----------: | -------: |
|          1 |     74 |     909 ms |     6,272 ms |     234 ms |     1,682 ms |     1,355 ms |       62 |
|          2 |     74 |     909 ms |     6,267 ms |     208 ms |     1,743 ms |     1,559 ms |       62 |
|          3 |     76 |     908 ms |     6,304 ms |     147 ms |     1,633 ms |     1,222 ms |       62 |
|          4 |     77 |     907 ms |     6,312 ms |     119 ms |     1,657 ms |     1,307 ms |       62 |
|          5 |     76 |     907 ms |     6,287 ms |     144 ms |     1,712 ms |     1,416 ms |       62 |
| **Median** | **76** | **908 ms** | **6,287 ms** | **147 ms** | **1,657 ms** | **1,307 ms** |   **62** |

This local median is consistent with the earlier local 77/100 result and is
not directly comparable to the live 82/100 result because local preview and
live hosting have different network timing, caching and third-party scheduling.

### Hydration and trace evidence

The homepage route is generated as client node `0.pOLzVSob.js`. That node
eagerly imports `D_aPLMlF.js`, the generated runtime metadata chunk, together
with the shared Svelte runtime. The build emits no client source maps
(`.svelte-kit/output/client` contains zero `.map` files). Chrome therefore
exposes generated node/chunk locations rather than reliable `+page.svelte`,
`PageCard` or `PopupHost` function names.

The trace confirms browser-side work, but does not provide a defensible exact
“Svelte hydration started at X and finished at Y” boundary. The observable
homepage node calls total only a few milliseconds individually; they are not
the whole hydration lifecycle. No explicit hydration marker is emitted by the
application. This is an evidence limit, not evidence that hydration is free.

In the representative enabled trace, aggregate main-thread work was:

| Category             |   Time |
| -------------------- | -----: |
| Other                | 582 ms |
| Script evaluation    | 421 ms |
| Style and layout     | 321 ms |
| Rendering            |  61 ms |
| Script parse/compile |  38 ms |
| Garbage collection   |  28 ms |
| HTML/CSS parsing     |  16 ms |

The largest recorded layout event was 63.6 ms with 620 dirty objects, and the
trace contains a 154 ms homepage task. These are confirmed costs, but the
trace does not prove that any one Svelte component caused the full event. No
reliable forced-layout attribution to a source component was available.

### Runtime metadata dependency analysis

`src/lib/typescript/data/runtime/generated.ts` is 777,368 bytes on disk and
the corresponding browser chunk `D_aPLMlF.js` is 750,093 bytes uncompressed.
The generated registry contains `runtimeLinkEntries`, `runtimeChildren` and
spell breadcrumb metadata. `src/lib/typescript/data/runtime/index.ts`
materializes the complete `runtimeLinks` object at module evaluation time.

The homepage client node imports that chunk through the shared layout/page
dependency graph. Direct source consumers include `Link.svelte`,
`PageCard.svelte`, `PopupHost.svelte`, `Sidebar.svelte`, `Breadcrumbs.svelte`,
`Navbar.svelte`, `currentPage.ts` and SEO helpers. The homepage visibly uses
only a small number of page-card links, navigation and popup metadata, but the
current module boundary loads the complete registry. This is a confirmed
dependency and transfer cost; the trace does not isolate its parse/evaluation
time from the rest of the shared runtime.

### GTM enabled versus blocked

| Condition            | Median score | Median LCP | Median TBT | Median main thread | Requests |
| -------------------- | -----------: | ---------: | ---------: | -----------------: | -------: |
| GTM enabled (5 runs) |           76 |   6,287 ms |     147 ms |           1,307 ms |       62 |
| GTM blocked (5 runs) |           83 |   4,610 ms |       9 ms |             970 ms |       61 |

The blocked experiment reduced median LCP by 1,677 ms, TBT by 138 ms and
aggregate main-thread work by 337 ms, while removing one request. In the
enabled trace Lighthouse attributed 189 ms total and 154 ms scripting to the
GTM script, with two 87 ms long tasks. The LCP difference is not equivalent
to GTM CPU time: scheduling, network timing and final candidate presentation
also vary. Analytics was not changed.

### Top three evidence-based recommendations

1. **Control GTM timing after critical render** — highest expected impact.
   The blocked A/B test is the strongest measured result. Defer or otherwise
   schedule analytics after the first meaningful render only after consent and
   measurement requirements are reviewed. Expected benefit is an estimate,
   not a guarantee of the full 1.7 s LCP difference. Risk: delayed or lost
   analytics and consent-event changes. Complexity: low to medium.

2. **Split runtime metadata by responsibility** — high transfer potential,
   unproven CPU/LCP impact. The 750 KB browser chunk is eagerly reachable from
   the homepage despite the homepage needing only a small subset. A safe
   design would preserve SSR/static SEO and load route-specific or popup-only
   metadata on demand. Risk: hydration mismatches, popup/navigation failures
   and duplicated registries. Complexity: high. This audit deliberately does
   not implement it.

3. **Capture a sourcemapped production profile before changing hydration or
   layout** — medium expected impact, necessary for safe targeting. The trace
   confirms 321 ms style/layout and a 154 ms homepage task, but cannot assign
   them to Svelte components because client sourcemaps are absent. Enable a
   profiling-only build with sourcemaps or add temporary trace markers, then
   re-measure `+layout`, `PageCard`, `Sidebar`, `PopupHost` and homepage card
   initialization. Risk: profiling artifacts or accidental source-map
   publication. Complexity: medium.

No metadata refactor, CSS change, analytics change or behavior change was
implemented in this audit. The requested source-mapped hydration cost could
not be obtained from the current production-equivalent build; missing
sourcemaps and absent hydration markers are the blockers.

## GTM deferral experiment (2026-11-22)

### Existing behavior

The site does not use a GTM container in the source. It loads Google Analytics
4 directly through `https://www.googletagmanager.com/gtag/js?id=G-6X1M5VW1SF`
in `src/app.html`. The inline bootstrap creates `window.dataLayer`, defines
`gtag`, queues `js` and `config` commands, and disables the vendor's automatic
pageview. `Analytics.svelte` queues a pageview after mount and after every
SvelteKit `afterNavigate`, using the current document title and pathname.

No consent-management implementation or consent default was found in the
repository. Consequently, this audit could verify queueing and observed
network events, but could not independently prove consent-mode behavior or
validate GTM/GA4 configuration inside the vendor dashboard.

### Experiment

The local experiment replaced the parser-discovered async script with a
runtime-injected script scheduled after the window `load` event and a browser
idle callback. The existing `dataLayer` queue and `Analytics.svelte` code were
left unchanged, so pageview commands were queued before the vendor loaded.
This was tested only in a fresh production preview; no detection logic or
fixed Lighthouse delay was used.

The experiment was reverted. Its results were not stable enough to satisfy the
decision criteria:

| Condition                                   | Median score | Median FCP | Median LCP | Median TBT | Median main thread | Requests |
| ------------------------------------------- | -----------: | ---------: | ---------: | ---------: | -----------------: | -------: |
| Existing GTM/GA4, prior controlled baseline |           76 |     908 ms |   6,287 ms |     147 ms |           1,307 ms |       62 |
| Deferred experiment, 5 runs                 |           79 |   1,559 ms |   5,342 ms |     132 ms |           1,384 ms |       62 |

Deferred runs were individually 82/4,636 ms, 79/5,440 ms, 83/4,619 ms,
76/6,258 ms and 79/5,342 ms (score/LCP). The apparent median LCP gain was
therefore dominated by run-to-run variance and came with later FCP in four of
five runs, no request-count reduction, and no consistent main-thread or TBT
improvement. A deferred desktop run measured 63/100, FCP 1,611 ms, LCP
6,305 ms, TBT 200 ms and 1,537 ms main-thread work; it is not evidence of a
desktop-neutral improvement.

### Analytics verification and limitations

In a Playwright production-preview check, the deferred variant loaded the
vendor script once after page load and retained the queued `js`, `config` and
`page_view` entries. A navigation also produced a pageview entry with the new
title and pathname. This verifies queue behavior and observed request order,
not delivery into the GA4 dashboard. Initial pageviews, client-side route
changes, conversions, consent-granted/denied behavior and duplicate-event
counts cannot be fully verified without the deployed analytics configuration
and a consent implementation. Because the repository contains no consent
logic, delaying the vendor could also change privacy behavior outside the
repository's observable surface.

### Decision

The deferred-loading optimization was reverted and no application file was
changed by this audit. The direct GA4 bootstrap remains unchanged. The
blocked-vendor A/B result still establishes that the third-party script is a
real performance contributor, but this experiment does not establish a safe
defer point. A future implementation should begin with an explicit consent
and analytics event contract, then test vendor delivery and route-pageview
completeness against that contract before considering another timing change.
