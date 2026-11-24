# Architecture

D&D Portal Wiki is a static SvelteKit site. Most page content is defined in TypeScript data modules and rendered through reusable Svelte components.

The current application uses SvelteKit `3.1.1` with Svelte `5.57.3`, Vite
`8.3.5`, and TypeScript `6.0.3`. Node.js `25.9.0` and pnpm `11.10.0` are the
repository runtime requirements. The versions are declared in `package.json`
and resolved in `pnpm-lock.yaml`.

### TypeScript compatibility

The standard `pnpm check` path uses TypeScript `6.0.3`, which remains
temporarily necessary for the compiler API used by the current Svelte tooling.
TypeScript `7.0.2` is installed as `@typescript/native`; `pnpm check:tsgo`
uses it through `svelte-check --tsgo`, and `pnpm check:tsgo:watch` provides the
corresponding watch mode. Neither path weakens diagnostics.

The intended end state is TypeScript 7 only. We are waiting for official
support in `svelte-check` and the relevant SvelteKit integration. A new Svelte
version or changed peer dependency alone is insufficient evidence. See the
[svelte-check documentation](https://github.com/sveltejs/language-tools/blob/master/packages/svelte-check/README.md),
[issue #3063](https://github.com/sveltejs/language-tools/issues/3063), and
[PR #3111](https://github.com/sveltejs/language-tools/pull/3111). PR #3111 is
focused on editor/content-mapper support, not proof of a full `svelte-check`
migration, and no release date is promised. When stable support arrives,
remove TS6 dependencies and scripts, regenerate the lockfile, then reverify
editor support, watch mode, checks, tests, build, and crawl.

## SvelteKit and build configuration

The single Vite entry point is `vite.config.js`. It configures the SvelteKit 3
Vite plugin with `@sveltejs/adapter-static`, the `404.html` fallback, and the
project's Svelte runes compiler setting. It also retains the CSS browser targets
(`chrome87`, `edge88`, `firefox78`, and `safari14`) and a
`chunkSizeWarningLimit` of `1000`. `vite.config.ts` is not part of the project.

TypeScript extends SvelteKit's generated configuration through
`tsconfig.json` and `$app/tsconfig`. The `#lib` and `#lib/*` aliases are defined
by the package import map and resolve to `src/lib` and its subpaths. Keep these
aliases and the generated SvelteKit configuration in sync when changing build
or import conventions. Browser-only UI checks currently use SvelteKit's
`$app/env` `browser` export where needed; this is a runtime import and is
separate from the `$app/tsconfig` TypeScript configuration extension.

## Main Areas

```text
src/lib/typescript/data/
```

Central source for internal pages, external links, social links, class data, spell data, rules pages, project pages, legal pages, route metadata, images, and tags.

Canonical content data is the single source of truth. It contains the complete
page bodies and rules data used by route rendering, prerendering, static
generation, search generation, and other build-time/content consumers.

Shared browser UI must not import the complete canonical internal registry.
Instead, the build-time generator
`scripts/generate-runtime-metadata.mjs` derives a lightweight projection into:

```text
src/lib/typescript/data/runtime/generated.ts
src/lib/typescript/data/runtime/index.ts
```

The resulting flow is:

```text
canonical data
    -> runtime metadata generator
    -> lightweight runtime metadata
    -> Link / Breadcrumbs / Sidebar / currentPage
```

Runtime metadata contains only the fields currently needed by browser-side
navigation and link UI: canonical data paths, hrefs, titles/labels, short
descriptions and subtitles, icons/images used by the UI, popup metadata, and
navigation relationships. It deliberately excludes full spell and equipment
rules, FAQ bodies, class features, NPC stat blocks, structured Homebrew
content, and other page-body data.

Runtime metadata is generated automatically by the normal `dev`, `check`,
`test`, and `build` scripts. The generated file is not manually maintained.

```text
src/lib/typescript/pages/
```

Page-building helpers, current-page resolution, SEO metadata generation, and content types.

```text
src/lib/svelte/components/
```

Reusable Svelte components for links, page headers, content blocks, cards, tables, changelog entries, search, spell browsing, navigation, breadcrumbs, sidebars, and footer UI.

```text
src/lib/scss/
```

Global styling, tokens, layout styling, and component-specific SCSS partials.

```text
src/routes/
```

SvelteKit route entry points. Dynamic routes resolve pages from the central data system where possible.

```text
static/
```

Public static assets copied directly into the production build.

## Content Model

The project prefers structured page data over route-local page markup. A page should normally define:

- `href`
- `title`
- `subTitle`
- `description`
- optional `descriptions.long`
- image metadata
- content sections
- table-of-contents entries
- cards or child navigation where needed

Inline text that contains links should use the existing inline-content model instead of hand-written HTML.

## Links

Internal Wiki links should use central data paths and the existing Link or InlineContent components.

The canonical data remains the source of truth for those paths. Browser-side
resolution in `Link.svelte` uses the generated runtime metadata projection,
which preserves hrefs, labels, icons, popup content, and accessibility without
pulling the full canonical registry into shared client code.

Avoid:

- hard-coded internal hrefs
- duplicated route strings
- plain internal `<a>` elements when a component exists
- invented routes for pages that do not exist

External links are also represented centrally where possible.

`Breadcrumbs.svelte`, `Sidebar.svelte`, and `src/lib/typescript/pages/currentPage.ts`
use the same lightweight runtime metadata for labels, hierarchy, current-page
resolution, and navigation. Full content data remains available to the routes
that need it.

## Homebrew architecture

Homebrew collections are data-driven and use generic routes:

```text
/homebrew/
/homebrew/[collection]/
/homebrew/[collection]/[category]/
/homebrew/[collection]/[category]/[item]/
```

Eldor is currently the first collection. Collection metadata and available
categories live in the central Homebrew data system; adding another collection
should not require a collection-specific renderer or item route folder.

`src/routes/homebrew/[collection]/+layout.svelte` renders
`HomebrewCollectionInfo.svelte` for pages inside a collection. Setting,
creator, copyright, and collection-level ownership information therefore stays
in the collection layout rather than being duplicated in item content.

Homebrew magic items reuse the generic `EquipmentItem` and `EquipmentDetail`
infrastructure. Structured item rules use the generic PageContentSection and
content-block model. Individual item pages are resolved by the generic
collection/category/item route.

Homebrew content intentionally has two navigation contexts. A page such as
GlueCo or The Mimic Stick can be reached through the ordinary Wiki category and
through `/homebrew/eldor/`. These are distinct URLs with route-specific
breadcrumbs and canonical URLs, while rendering the same underlying content.
Sidebar active state is an exact URL match, so exactly one context is active.
Context-specific SEO titles distinguish the two pages; both routes remain
available to search and sitemap generation.

## FAQ architecture

FAQ content is structured TypeScript data aggregated by
`src/lib/typescript/data/internals/faq.ts`. Every group has a canonical slug,
question modules, and `/faq/<slug>/` routes. The FAQ route entry points are
`src/routes/faq/+page.svelte` and `src/routes/faq/[...page]/+page.ts`.

There are two supported ownership modes:

- **Attached FAQ:** the group has a `sourcePage` pointing to a real runtime
  page. Source-page lookup can attach the group to that page, while routes,
  Search, Related FAQ, and prerendering remain generic.
- **Ownerless FAQ:** the group has no ordinary page owner and omits
  `sourcePage`. It still has normal FAQ routes, Search, Related FAQ, and
  prerendering, but is deliberately excluded from source-page attachment.

The ownerless groups are `human`, `elf`, `astral-elf`, and `fighting`. Their
canonical storage is:

```text
src/lib/typescript/data/internals/faq-groups/<slug>/
```

Do not invent a runtime page or route solely to house an FAQ. Attached groups
live beside their genuine owners: classes and subclasses under
`src/lib/typescript/data/internals/classes/`, Rules pages under
`src/lib/typescript/data/internals/rules/`, Species under
`src/lib/typescript/data/internals/species/`, and analogous owner folders for
Monsters, Spells, and Equipment.

The final registry contains 60 modular groups and 300 structured questions.
There are no Markdown-derived FAQ groups in production.

## Data ownership and validation

- Classes use modular owner folders under
  `src/lib/typescript/data/internals/classes/`. Standard classes expose
  `_index_.ts`, `page.ts`, `progression.ts`, and `features.ts` where the data
  warrants that split. The compact BasicClass family uses `_index_.ts` plus
  `data.ts`; a `faq/` folder exists only for groups with canonical FAQ data.
- Rules data lives under `src/lib/typescript/data/internals/rules/`, including
  the standalone `movement.ts` owner and its `movement/faq/` attachment.
- Species data lives under `src/lib/typescript/data/internals/species/`.
  The current Species runtime owner is the index page; the four ownerless FAQ
  topics do not imply Species child pages.
- FAQ Search is assembled by
  `src/lib/typescript/pages/search.ts`, which indexes structured FAQ questions
  generically and categorizes ownerless groups as project FAQ content.
- FAQ rendering uses `src/lib/svelte/components/page/Faq.svelte` and the
  generic FAQ routes above. Related questions are resolved from the central
  group/question registry.
- The maintained static-site audit is `scripts/audit-prelive.mjs`; the
  project validation commands can be run from the repository root:

```bash
pnpm check
pnpm test
pnpm build
pnpm audit:prelive:crawl
```

## Routing

The site is statically generated. Dynamic routes that need static output must provide prerender entries when SvelteKit cannot infer all pages automatically.

Current examples include:

- spell detail pages
- level-specific spellcasting pages
- central Wiki page routes
- class and subclass routes

The generic class/subclass route provides explicit static entries for subclass
pages derived from canonical class data when SvelteKit cannot infer the dynamic
paths itself.

## SEO

SEO metadata is generated centrally through `src/lib/typescript/pages/seo.ts`.

The layout emits:

- page title
- meta description
- canonical URL
- robots metadata
- Open Graph metadata
- Twitter card metadata
- icon and Apple touch icon links

Page-specific route data may override SEO values where needed, such as individual spell pages.

Legacy Acid Splash URLs are prerendered redirect-only pages for static GitHub
Pages hosting. They point directly to the current spell route. The pre-live
crawl recognizes these pages as redirects, verifies that the target exists, and
fails on missing targets, redirect chains, or loops; it does not skip checking
the redirect destination.

## Styling

The SCSS structure should remain component-oriented. Large page-level styles should be split into focused partials rather than being added back into one large file.

## Validation

Use:

```bash
pnpm check
pnpm test
pnpm build
pnpm audit:prelive:crawl
```

The pre-live audit checks central data paths, route shapes, static assets, spell
slugs, placeholder markers, and built static output. The crawl variant also
checks trailing-slash links, canonical URLs, unique titles, descriptions, H1s,
JSON-LD, duplicate IDs, ARIA references, tooltip content, and redirect-only
pages. Run it only after `pnpm build`.
