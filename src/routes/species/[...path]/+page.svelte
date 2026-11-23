<!--
  JSON-backed species article preview. All article/FAQ copy comes from assets.dnd-portal.com;
  existing components provide the page structure, formatting, links and edition selector.
-->
<script lang="ts">
    import type { PageData } from './$types';
    import type {
        InlineContentNode,
        PageContentBlock,
        PageContentSection as WikiSection,
        PageContentTableRow,
    } from '#lib/typescript/data/_index_.js';
    import { resolveLinkPath } from '#lib/typescript/pages/currentPage.js';
    import PageHeader from '#lib/svelte/components/page/PageHeader.svelte';
    import PageContentSection from '#lib/svelte/components/page/PageContentSection.svelte';
    import EditionSelector from '#lib/svelte/components/page/EditionSelector.svelte';
    import type { JsonContentBlock, JsonContentSection } from './+page.js';
    import type { RoutePageMetadata } from '#lib/typescript/pages/metadata.js';

    let { data }: { data: PageData & { routeMetadata: RoutePageMetadata } } = $props();

    const referencePattern =
        /\[\[([a-z][a-z0-9-]*):([a-z0-9]+(?:-[a-z0-9]+)*)(?:@([1-5](?:\.5)?e))?(?:\|([^\]]+))?\]\]/g;

    function inlineContent(text: string): InlineContentNode[] {
        const nodes: InlineContentNode[] = [];
        let end = 0;
        for (const match of text.matchAll(referencePattern)) {
            const index = match.index ?? 0;
            if (index > end) nodes.push({ type: 'text', text: text.slice(end, index) });
            const [, kind, slug, , customLabel] = match;
            const label =
                customLabel ?? slug.replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            let path: string | null = null;
            if (kind === 'class') {
                const candidate = `internals.classes.${slug}.page`;
                if (resolveLinkPath(candidate)) path = candidate;
            } else if (kind === 'species' && (slug === 'human' || slug === 'elf')) {
                path = `/species/${slug}/`;
            }
            nodes.push(
                path
                    ? { type: 'link', path, label, showIcon: false }
                    : { type: 'text', text: label },
            );
            end = index + match[0].length;
        }
        if (end < text.length) nodes.push({ type: 'text', text: text.slice(end) });
        return nodes;
    }

    function blockToWiki(block: JsonContentBlock): PageContentBlock {
        if (block.type === 'paragraph')
            return { type: 'paragraph', content: inlineContent(block.text) };
        if (block.type === 'callout')
            return { type: 'callout', title: block.title, content: inlineContent(block.text) };
        if (block.type === 'list') {
            return {
                type: block.ordered ? 'ordered-list' : 'list',
                items: block.items.map(inlineContent),
            };
        }
        const columns = block.headers.map((label, index) => ({ key: `column${index}`, label }));
        const rows: PageContentTableRow[] = block.rows.map((cells) => {
            const row: Record<string, InlineContentNode[]> = {};
            for (let index = 0; index < columns.length; index++) {
                row[columns[index].key] = inlineContent(cells[index] ?? '');
            }
            return row;
        });
        return {
            type: 'table',
            caption: block.caption ?? '',
            columns,
            rows,
            showCaption: Boolean(block.caption),
            responsiveCards: true,
        };
    }

    function sectionToWiki(section: JsonContentSection, prefix = ''): WikiSection {
        return {
            id: prefix ? `${prefix}-${section.id}` : section.id,
            title: section.title,
            blocks: section.blocks.map(blockToWiki),
        };
    }

    let articleSections = $derived(
        data.editionData.article.sections.map((section) => sectionToWiki(section)),
    );
    let editionOptions = $derived(
        data.index.editions.map((id: string) => ({
            id,
            label: `D&D ${id}`,
            href:
                id === data.index.defaultEdition
                    ? `/species/${data.species}/`
                    : `/species/${data.species}/${id}/`,
        })),
    );
</script>

<div class="page-layout species-json-page">
    <article class="wiki-article page-layout__article">
        <PageHeader metadata={data.routeMetadata.header}>
            {#snippet headerMeta()}
                <EditionSelector current={data.edition} options={editionOptions} />
            {/snippet}
        </PageHeader>

        <nav class="species-json-page__quick-nav" aria-label="Species article navigation">
            {#each articleSections as section (section.id)}
                <a href={`#${section.id}`}>{section.title}</a>
            {/each}
            <a href="#faq">FAQ</a>
            <a href="#species-json-licenses">Licenses</a>
        </nav>

        {#each articleSections as section (section.id)}
            <PageContentSection {section} />
        {/each}

        <section class="faq" id="faq" aria-labelledby="species-faq-title">
            <h2 id="species-faq-title">Frequently asked questions</h2>
            <p>Complete {data.edition} answers from the D&D Portal JSON content library.</p>
            <div class="faq__list">
                {#each data.faqs as faq (faq.id)}
                    <details class="faq__item">
                        <summary>
                            <span class="faq__question">{faq.question}</span>
                            <span class="faq__chevron" aria-hidden="true"></span>
                        </summary>
                        <div class="faq__answer species-json-page__faq-content">
                            <p><strong>{faq.shortAnswer}</strong></p>
                            {#if faq.introduction}<p>{faq.introduction}</p>{/if}
                            {#each faq.sections as section (section.id)}
                                <PageContentSection
                                    section={sectionToWiki(section, faq.id)}
                                    headingLevel="subsection"
                                />
                            {/each}
                        </div>
                    </details>
                {/each}
            </div>
        </section>

        <section
            class="content-section species-json-page__licensing"
            id="species-json-licenses"
            aria-labelledby="species-json-license-title"
        >
            <h2 id="species-json-license-title">Sources &amp; licensing</h2>
            <p>
                This reference includes independently written explanations based on official rules.
                Source credits and applicable licenses are provided below.
            </p>
            {#each data.editionData.sources as source (source.id)}
                <div class="species-json-page__source">
                    <p>
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                            {source.title}
                        </a>
                        <span>
                            — {source.license.id === 'CC-BY-4.0' ? 'CC BY 4.0' : 'Reference only'}
                        </span>
                    </p>
                    {#if source.attribution}
                        <p>{source.attribution}</p>
                    {/if}
                    {#if source.license.url}
                        <p>
                            <a href={source.license.url} target="_blank" rel="noopener noreferrer">
                                View applicable license
                            </a>
                        </p>
                    {/if}
                </div>
            {/each}
            <p>
                <a
                    href="https://github.com/dnd-portal/dnd-portal-assets/blob/main/data/LICENSING.md"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    D&D Portal content licensing information
                </a>
            </p>
        </section>
    </article>

    <aside class="page-layout__toc" aria-label="On this page">
        <nav class="species-json-page__toc">
            <strong>On this page</strong>
            {#each articleSections as section (section.id)}
                <a href={`#${section.id}`}>{section.title}</a>
            {/each}
            <a href="#faq">FAQ</a>
            <a href="#species-json-licenses">Licenses</a>
        </nav>
    </aside>
</div>

<style lang="scss">
    .species-json-page__quick-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 0.7rem 1.1rem;
        padding: 1rem 0;
        margin-bottom: 1.4rem;
        border-bottom: 1px solid rgba(160, 174, 195, 0.16);
        font-size: 0.9rem;
    }
    .species-json-page__quick-nav a {
        text-decoration: none;
    }
    .species-json-page__quick-nav a:hover,
    .species-json-page__quick-nav a:focus-visible {
        text-decoration: underline;
    }
    .species-json-page__faq-content {
        padding-block: 0.75rem;
    }
    .species-json-page__faq-content :global(.content-section) {
        margin-top: 1.5rem;
    }
    .species-json-page__licensing {
        margin-top: 2.5rem;
    }
    .species-json-page__source {
        padding-block: 0.75rem;
        border-bottom: 1px solid rgba(160, 174, 195, 0.14);
        overflow-wrap: anywhere;
    }
    .species-json-page__source p {
        margin: 0.5rem 0;
    }
    .species-json-page__toc {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    .species-json-page__toc a {
        text-decoration: none;
    }
    .species-json-page__toc a:hover,
    .species-json-page__toc a:focus-visible {
        text-decoration: underline;
    }
    @media (min-width: 1000px) {
        .species-json-page__quick-nav {
            display: none;
        }
    }
</style>
