<div align="center">

<img
	src="./static/branding/dnd-portal-logo-wide.svg"
	alt="D&D Portal Wiki logo"
	width="180"
/>

# D&D Portal Wiki

Campaign rules, reference pages, class content, spells, and project information for D&D Portal.

[Visit the Wiki](https://dnd-portal.com/) |
[Report a Problem](https://github.com/toon-van-berkel/dnd-wiki/issues/new/choose) |
[View Changelog](https://dnd-portal.com/changelog/)

![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)
![SvelteKit](https://img.shields.io/badge/SvelteKit-3-FF3E00?logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![SCSS](https://img.shields.io/badge/Styles-SCSS-CC6699?logo=sass&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222222?logo=github)

</div>

## About

D&D Portal Wiki is an unofficial fan-created reference website for tabletop campaign material. It contains rules references, class and subclass pages, spell pages, species, monsters, locations, project notices, and supporting resource pages.

The site is built as a static SvelteKit application and is published to GitHub Pages at the root custom domain `https://dnd-portal.com/`.

## Project Structure

```text
src/
  lib/
    svelte/
      components/           Reusable layout, navigation, browser, and detail components
    scss/
      components/           Component and page-area SCSS
      ...                   Global tokens, layout, and shared styles
    typescript/
      data/
        core/               Shared/core content data and reusable content definitions
        internals/          Wiki pages, Homebrew collections, links, and runtime data
        runtime/            Generated runtime link and navigation indexes
      pages/                Route resolution, SEO, breadcrumbs, and page helpers
      components/           Shared TypeScript helpers, including sidebar construction
  routes/
    [page]/                 Generic data-driven Wiki page route
    classes/                Class overview and detail routes
    spells/                 Spell overview and detail routes
    companions/             Companion overview and detail routes
    locations/              Location and shopping routes
    magic-items/            Wiki-context magic item routes
    monsters/               Wiki-context monster routes
    organizations/          Wiki-context organization routes
    homebrew/[collection]/  Homebrew collection routes and context-specific aliases
    tools/                  Tools overview and individual tool routes
    ...                     Other Wiki, FAQ, project, and utility routes
static/
  images/                   Public artwork grouped by content and Homebrew collection
  icons/                    Shared white, color, entity, game, and Homebrew icons
  branding/                 D&D Portal logos and branding assets
scripts/                    Runtime generation, validation, and pre-live audit scripts
docs/                       Repository architecture and deployment documentation
.github/                    GitHub Actions, issue templates, and PR template
```

Content is kept separate from presentation. A single content entry may be exposed
through more than one navigation context, such as Wiki Pages and Homebrew → Eldor.
Those contexts use distinct routes and breadcrumbs while rendering the same
underlying content. Sidebar active states are matched against the current route,
not against a shared content identifier.

More detail is available in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Requirements

- Node.js `25.9.0`
- pnpm `11.10.0`

The current framework and build-tool versions are declared in `package.json` and
locked in `pnpm-lock.yaml`:

| Package                       | Version                          |
| ----------------------------- | -------------------------------- |
| SvelteKit                     | `3.1.1`                          |
| Svelte                        | `5.57.3`                         |
| `@sveltejs/adapter-static`    | `4.0.1`                          |
| Vite                          | `8.3.5`                          |
| TypeScript (standard tooling) | `6.0.3`                          |
| TypeScript (native checker)   | `7.0.2` via `@typescript/native` |

The package manager is declared in `package.json`:

```json
"packageManager": "pnpm@11.10.0"
```

The repository also contains Volta and pnpm runtime settings. Do not replace pnpm commands with npm commands unless the project configuration is intentionally changed first.

## Local Development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm install` is sufficient when intentionally updating dependencies. Use the
frozen form for reproducible local and CI installs.

### TypeScript checks

`pnpm check` uses TypeScript 6 because the current Svelte tooling still needs
its compiler API. TypeScript 7 is also installed under `@typescript/native`:

```bash
pnpm check
pnpm check:tsgo
pnpm check:tsgo:watch
```

The latter two commands use TypeScript 7 through `svelte-check --tsgo`. This is
a temporary compatibility arrangement; the goal is to move fully to TypeScript 7. A new Svelte version or changed peer dependency alone is not proof that
`svelte-check` and the relevant SvelteKit integration no longer need TypeScript 6. We are waiting for official support. See the [svelte-check README](https://github.com/sveltejs/language-tools/blob/master/packages/svelte-check/README.md),
[issue #3063](https://github.com/sveltejs/language-tools/issues/3063), and
[PR #3111](https://github.com/sveltejs/language-tools/pull/3111). PR #3111 is
focused on editor/content-mapper support and does not prove a complete
`svelte-check` migration; no release date is assumed.

When stable releases support the required APIs without TypeScript 6, remove
the TS6 dependency and compatibility scripts, regenerate the lockfile, and
reverify editor support, watch mode, type checks, tests, build, and crawl.

The local dev server normally runs at:

```text
http://localhost:5173/
```

## Validation

Run these before opening or merging changes:

```bash
pnpm check
pnpm test
pnpm build
pnpm audit:prelive:crawl
```

`pnpm check` runs Svelte and TypeScript diagnostics. `pnpm test` runs the unit
tests. `pnpm audit:prelive` checks source data, route shapes, assets, and
placeholder markers without inspecting generated HTML; `pnpm audit:prelive:crawl`
expects a fresh build and additionally checks the generated static pages, links,
SEO metadata, redirects, and accessibility invariants.

The Vite configuration is [vite.config.js](vite.config.js). It is the single
Vite configuration and contains the SvelteKit 3 plugin, `adapter-static` with
the `404.html` fallback, Svelte runes compiler settings, CSS browser targets,
and the `chunkSizeWarningLimit` of `1000`. There is no `vite.config.ts`.

## Deployment

The live website is deployed through GitHub Pages from the `build/` directory generated by `pnpm build`.

This project intentionally uses:

- `@sveltejs/adapter-static`
- `prerender = true`
- `trailingSlash = 'always'`
- no repository base path, because the site is served from `https://dnd-portal.com/`
- `actions/upload-pages-artifact` and `actions/deploy-pages` in the GitHub Actions workflow

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) before touching deployment settings.

## Contributing

Issues and pull requests are welcome when they improve correctness, maintainability, accessibility, performance, or clarity.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting larger changes.

## Legal and Usage

D&D Portal is an unofficial fan-created project.

The repository currently does not grant a general open-source license for all source code, written content, data, artwork, icons, or other assets. Unless explicitly stated otherwise, no permission to redistribute or reuse repository material is granted.

Third-party names, trademarks, rules material, artwork, icons, and other assets remain subject to the rights and licenses of their respective owners.

See the [D&D Portal Legal Notice](https://dnd-portal.com/legal/) and [Contribution Terms](https://dnd-portal.com/contribution-terms/) for additional information.
