# Testing D&D Portal Wiki

## Test categories

| Category                 | Location/command                                               | Purpose                                                       |
| ------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------- |
| Unit                     | `src/lib/tests/`, `pnpm test`                                  | Pure data, breadcrumb and SEO behavior                        |
| Architecture/boundary    | `scripts/*boundary*.test.mjs`, `pnpm test`                     | Import boundaries that protect shared client code             |
| Production output        | `scripts/audit-production-output.mjs`, `pnpm audit:production` | Real prerendered HTML, Vite manifest and bundle budgets       |
| Integration/static crawl | `scripts/audit-prelive.mjs`, `pnpm audit:prelive:crawl`        | Routes, links, SEO, IDs, ARIA references and generated assets |
| Browser/E2E              | `tests/e2e/`, `pnpm test:browser`                              | Production preview navigation, hydration and lazy behavior    |
| Accessibility            | Playwright tests with `axe-core`                               | Critical axe violations, focus and semantic relationships     |

There are currently 8 Vitest tests and 6 browser scenarios executed in two projects (desktop Chromium and a 390px mobile viewport). Desktop tests cover lazy navbar search loading; the mobile suite covers the actual mobile search route and searchbox.

## Local commands

```text
pnpm check
pnpm test
pnpm build
pnpm audit:production
pnpm audit:prelive:crawl
pnpm test:browser:install
pnpm test:browser
```

Build once, then run the output audit, crawl and browser suite against that same `build/` directory. `pnpm test:browser` starts `vite preview`; it does not test the development server.

## Current production budgets

The budgets are based on the measured P0 output:

| Budget                         | Current measurement |  Enforced limit |
| ------------------------------ | ------------------: | --------------: |
| Root-layout dependency closure |       885,773 bytes | 1,000,000 bytes |
| Any client route chunk         |     1,328,616 bytes | 1,500,000 bytes |
| Any prerendered HTML file      |       282,693 bytes |   500,000 bytes |

The route-chunk budget is separate from the initial shared budget. A route may be large because it owns content data, but it must remain below its own limit. The output audit also reports total HTML, total client JavaScript, gzip totals, top HTML pages and top chunks.

## Updating a baseline

Do not change a budget because a build failed. First inspect the JSON-like report printed by `pnpm audit:production`, identify the changed route/chunk and its import chain, and decide whether the change is intentional. If it is intentional, record the new measured value in the relevant audit report and update the limit with a reason. Keep the root-layout limit strict: canonical data must not become a shared layout dependency again.

## Adding coverage for new content types

1. Add pure lookup/relationship tests under `src/lib/tests/`.
2. Add a representative prerendered route to the production-output or crawl audit when it introduces a new route shape, metadata contract or HTML structure.
3. Add one desktop/mobile browser scenario only when the content type adds user interaction or a new accessibility pattern.
4. Verify both ordinary and Homebrew-context URLs when content appears in both navigation trees.
5. Run `pnpm check`, `pnpm test`, `pnpm build`, `pnpm audit:production`, `pnpm audit:prelive:crawl` and `pnpm test:browser` before handoff.

## Investigating failures

- A root-layout budget failure means a shared import changed. Inspect `.svelte-kit/output/client/.vite/manifest.json` and the root node closure first.
- A route-chunk failure means a lazy route or its data graph grew. Inspect the route node imports before reducing the budget.
- An HTML failure means inspect the top-20 page report and compare popup counts, repeated components and image/link counts.
- A crawl failure is usually a route, SEO, accessibility-reference or static-asset regression; use the named check from `audit-prelive.mjs`.
- Browser failures leave traces in `test-results/` and an HTML report in `playwright-report/`.
- Axe reports are intentionally run on representative templates. Existing non-critical contrast findings are printed explicitly by the browser tests and do not block the suite; critical violations and functional accessibility assertions do block it.
