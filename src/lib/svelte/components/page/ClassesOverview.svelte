<script lang="ts">
    import EditionSelector from './EditionSelector.svelte';
    import PageHeader from './PageHeader.svelte';
    import { editions, type EditionId } from '#lib/typescript/data/internals/editions.js';
    import { getClassOverviewEntries } from '#lib/typescript/data/internals/classes/_index_.js';
    import { getRuntimeData } from '#lib/typescript/data/runtime/index.js';
    import type { PageData } from '#lib/typescript/data/_index_.js';

    let { edition }: { edition: EditionId } = $props();
    let entries = $derived(getClassOverviewEntries(edition));
    let official = $derived(entries.filter((entry) => entry.category === 'official'));
    let homebrew = $derived(entries.filter((entry) => entry.category === 'homebrew'));
    let hiddenHomebrew = $derived(
        getClassOverviewEntries(edition, true).filter(
            (entry) => entry.category === 'homebrew' && !entry.availableEditions.includes(edition),
        ),
    );
    let otherHomebrewEditions = $derived([
        ...new Set(
            hiddenHomebrew
                .flatMap((entry) => entry.availableEditions)
                .filter((id) => id !== edition),
        ),
    ]);
    let editionOptions = $derived(
        Object.values(editions).map((item) => ({
            id: item.id,
            label: item.current ? `${item.shortName} - Current` : item.shortName,
            href: item.routeSuffix ? `/classes/${item.routeSuffix}/` : '/classes/',
        })),
    );
    const editionLabel = $derived(editions[edition].shortName);
</script>

<svelte:head>
    <title>Classes - {editionLabel} | D&amp;D Portal Wiki</title>
</svelte:head>

<article class="wiki-article">
    <PageHeader
        titleText="Classes"
        subtitleText="Character classes"
        descriptionText="Explore official and homebrew classes by edition."
    />
    <div class="page-header__metadata">
        <EditionSelector current={edition} options={editionOptions} />
    </div>

    {#each [{ title: 'Official Classes', items: official }, { title: 'Homebrew Classes', items: homebrew }] as section}
        <section
            class="wiki-article__section"
            aria-labelledby={section.title.toLowerCase().replaceAll(' ', '-')}
        >
            <h2 id={section.title.toLowerCase().replaceAll(' ', '-')}>{section.title}</h2>
            {#if section.items.length}
                <div class="wiki-article__image-cards">
                    {#each section.items as classItem}
                        {@const pageData = getRuntimeData(classItem.runtimePath) as PageData}
                        {@const cardImage =
                            pageData.images?.card?.female ?? pageData.images?.card?.male}
                        <a
                            class="pagecard pagecard--image"
                            class:pagecard--no-image={!cardImage}
                            href={classItem.pagePath}
                        >
                            {#if cardImage}<img
                                    class="pagecard__background"
                                    src={cardImage.sources.m}
                                    srcset={`${cardImage.sources.s} 314w, ${cardImage.sources.m} 941w, ${cardImage.sources.l} 1254w`}
                                    sizes="(max-width: 700px) calc(100vw - 40px), 360px"
                                    alt=""
                                    style={`object-position: ${cardImage.position ?? 'center'}`}
                                    loading="lazy"
                                    onerror={(event) => {
                                        (event.currentTarget as HTMLImageElement).style.display =
                                            'none';
                                        (
                                            event.currentTarget.parentElement as HTMLElement
                                        )?.classList.add(
                                            'pagecard--no-image',
                                            'classes-overview__fallback',
                                        );
                                    }}
                                />{/if}
                            <span class="pagecard__chevron" aria-hidden="true"></span>
                            <article class="pagecard__content">
                                <p class="pagecard__eyebrow">{editionLabel}</p>
                                <h3>{classItem.name}</h3>
                                <p>{pageData.descriptions?.short ?? pageData.description}</p>
                                {#if classItem.creator}<p>Creator: {classItem.creator}</p>{/if}
                            </article>
                        </a>
                    {/each}
                </div>
            {:else}<p role="status">
                    No {section.title.toLowerCase()} are available for {editionLabel}.
                </p>{/if}
            {#if section.title === 'Homebrew Classes' && otherHomebrewEditions.length}
                <div
                    class="classes-overview__other-editions"
                    aria-labelledby="more-homebrew-classes"
                >
                    <h3 id="more-homebrew-classes">More homebrew classes</h3>
                    <p>Explore homebrew classes available for other editions.</p>
                    <div class="classes-overview__edition-links">
                        {#each otherHomebrewEditions as otherEdition}
                            <a
                                class="metadata-pill classes-overview__edition-link"
                                href={editions[otherEdition].routeSuffix
                                    ? `/classes/${editions[otherEdition].routeSuffix}/`
                                    : '/classes/'}
                            >
                                View {editions[otherEdition].shortName} classes
                                <span aria-hidden="true">→</span>
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}
        </section>
    {/each}
</article>

<style>
    :global(.classes-overview__fallback) {
        aspect-ratio: auto;
        min-height: 0;
    }

    :global(.classes-overview__fallback .pagecard__content) {
        height: auto;
    }

    :global(.classes-overview__other-editions) {
        margin-top: 2rem;
        padding: 1rem;
        background: var(--color-background-secondary, transparent);
        border: 1px solid var(--color-border-subtle, currentColor);
        border-radius: 0.75rem;
    }

    :global(.classes-overview__other-editions h3) {
        margin: 0;
    }

    :global(.classes-overview__other-editions p) {
        margin: 0.35rem 0 0;
    }

    :global(.classes-overview__edition-links) {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.85rem;
    }

    :global(.classes-overview__edition-link) {
        color: inherit;
        text-decoration: none;
        transition:
            color 180ms ease,
            background-color 180ms ease,
            border-color 180ms ease;
    }

    :global(.classes-overview__edition-link:hover),
    :global(.classes-overview__edition-link:focus-visible) {
        color: var(--color-text-primary, currentColor);
        background: var(--color-background-tertiary, transparent);
        border-color: var(--color-border-interactive, currentColor);
    }
</style>
