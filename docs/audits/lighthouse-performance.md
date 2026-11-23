# Lighthouse performance audit

Datum: 21 november 2026

## Meetmethode

Lighthouse 13.6.0 ran against the homepage (`/`) using a local production
preview and `https://dnd-portal.com/`. The mobile run used Lighthouse's default
mobile emulation; the desktop run used the `desktop` preset. These are
lab measurements and can vary between runs.

The live site returned HTTP 200 from GitHub Pages and already contains the
shared popup host (`wiki-shared-popup`) without full popup markup. The exact
deployed commit cannot be proven from the static response headers alone.

## Baseline before the change

| Target        | Score |   FCP |    LCP |    TBT | CLS | Speed Index |  Transfer | Requests |
| ------------- | ----: | ----: | -----: | -----: | --: | ----------: | --------: | -------: |
| Live mobile   |    51 | 2.7 s | 23.7 s | 710 ms |   0 |       4.6 s | 4,504 KiB |       71 |
| Live desktop  |    77 | 0.4 s |  4.1 s | 110 ms |   0 |       1.0 s | 4,505 KiB |       72 |
| Local mobile  |    57 | 0.9 s | 25.2 s | 750 ms |   0 |       2.2 s | 4,597 KiB |       72 |
| Local desktop |    76 | 0.2 s |  4.4 s | 120 ms |   0 |       0.6 s | 4,597 KiB |       73 |

The live scores differ from the user-reported scores because Lighthouse runs
are environment-sensitive. The measured bottleneck is nevertheless clear:
both homepage wallpaper PNGs were downloaded on every run, together about
3.34 MB before HTTP overhead. The largest JavaScript transfers were roughly
285 KB and 220 KB compressed, while the Google Tag Manager script transferred
about 183 KB.

The LCP discovery insight identifies the homepage navbar search form as the
LCP element (`form.navbar__search`). On the slow mobile baseline, its render
was delayed while the page downloaded and processed the large image and
JavaScript set. CLS was not a problem in these runs.

## Implemented change

The two 1672×941 wallpaper PNGs are now served through CSS `image-set()` with
WebP preferred and the original PNG retained as a fallback. The WebP files
preserve the same dimensions and visual composition:

| Asset                  |      PNG |  WebP |
| ---------------------- | -------: | ----: |
| `homepage-wallpaper`   | 1,569 KB | 49 KB |
| `homepage-wallpaper-2` | 1,773 KB | 74 KB |

This is an asset-format change, not a content removal or resolution reduction.

## Local result after the change

| Target        | Score |   FCP |   LCP |   TBT |   CLS | Speed Index | Transfer | Requests |
| ------------- | ----: | ----: | ----: | ----: | ----: | ----------: | -------: | -------: |
| Local mobile  |   100 | 0.8 s | 0.8 s | 10 ms |  0.02 |       0.8 s |  477 KiB |       37 |
| Local desktop |   100 | 0.2 s | 0.2 s |  0 ms | 0.013 |       0.2 s |  477 KiB |       37 |

The local improvement is large because the two wallpaper downloads disappeared
from the network waterfall and were replaced by the WebP versions. Live
post-change Lighthouse scores cannot be measured until this branch is deployed;
no deployment was performed for this task.

## Root causes ranked by measured impact

1. **Homepage wallpaper images — confirmed, highest impact.** Two PNGs caused
   approximately 3.34 MB of transfer and dominated the mobile LCP run.
2. **Client JavaScript — confirmed.** The production output remains about
   5.02 MB uncompressed overall; the largest chunks are about 1.33 MB and
   1.18 MB minified. This contributes to mobile TBT, although the local
   homepage measurement shows the image transfer was the first-order issue.
3. **Third-party analytics — confirmed.** Google Tag Manager transferred about
   183 KB in the Lighthouse run. It is external and was not changed here.
4. **CSS — measured but not first-order.** The layout stylesheet transferred
   about 26 KB compressed. Lighthouse did not identify a significant
   render-blocking CSS opportunity after the image fix.
5. **CLS and fonts — not observed as bottlenecks.** CLS was effectively zero
   before the change. No large webfont transfer appeared in the measured
   request list.

## Regression protection and validation

The existing production-output audit continues to enforce the HTML and shared
JavaScript budgets. Existing browser and accessibility tests remain unchanged.
The homepage still renders the same two background layers, and the original
PNGs remain available as browser fallbacks.

Validation after the implementation:

- `pnpm check` — passed
- `pnpm test` — passed
- `pnpm build` — passed
- `pnpm audit:production` — passed
- `pnpm audit:prelive:crawl` — passed
- `pnpm test:browser` — passed

## Remaining bottlenecks

The local result reaches 100 in this Lighthouse environment, but this should
not be treated as a guarantee for real users. Remaining measured cost is the
shared JavaScript graph, especially the largest route/client chunks, and the
third-party analytics request. Further work should profile route-specific
initial graphs before changing them; the existing bundle audit reports the
root-layout closure as 885,801 bytes and keeps canonical data out of it.

The next safe investigations are reducing route-specific JavaScript execution,
deferring analytics until it cannot affect initial interaction, and measuring
representative content pages rather than optimizing only the homepage.
