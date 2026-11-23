<script lang="ts">
    import type { PageContentSection } from '#lib/typescript/data/_index_.js';
    import { psionSpellListGroups } from '#lib/typescript/data/internals/classes/psion/spell-list.js';
    import InlineContent from './InlineContent.svelte';

    let {
        disciplineLinks,
        spellSection,
    }: {
        disciplineLinks: readonly { readonly label: string; readonly href: string }[];
        spellSection: PageContentSection;
    } = $props();
</script>

<section
    class="psion-reference-section wiki-article__section"
    aria-labelledby="psionic-disciplines-title"
>
    <h2 id="psionic-disciplines-title">Psionic Disciplines</h2>
    <nav class="psion-discipline-grid" aria-label="Psionic Disciplines">
        {#each disciplineLinks as discipline}
            <a class="psion-discipline-card" href={discipline.href}>
                <span>{discipline.label}</span>
                <span class="psion-discipline-card__chevron" aria-hidden="true">›</span>
            </a>
        {/each}
    </nav>
</section>

<section
    class="psion-reference-section wiki-article__section"
    id={spellSection.id}
    aria-labelledby="psion-spell-list-title"
>
    <h2 id="psion-spell-list-title">{spellSection.title}</h2>
    <div class="psion-spell-list__intro">
        {#if spellSection.blocks[0]?.type === 'paragraph'}
            <p><InlineContent content={spellSection.blocks[0].content} /></p>
        {/if}
        <p class="psion-spell-list__legend">
            <span class="psion-spell-list__badge">Homebrew</span> marks Psion source spells. Unmarked
            spells are Official.
        </p>
    </div>
    <div class="psion-spell-groups">
        {#each psionSpellListGroups as group}
            <section class="psion-spell-group" aria-labelledby={`psion-spell-level-${group.level}`}>
                <h3 id={`psion-spell-level-${group.level}`}>{group.level}th-level spells</h3>
                <ul>
                    {#each group.entries as entry}
                        <li>
                            {#if entry.spell}
                                <a class="psion-spell-link" href={`/spells/${entry.spell.slug}/`}>
                                    <span>{entry.name}</span>
                                    {#if entry.spell.sourceBook === 'Psion 1.5.3'}<span
                                            class="psion-spell-list__badge"
                                        >
                                            Homebrew
                                        </span>{/if}
                                </a>
                                {#if entry.fixedLevel}<sup>
                                        <a
                                            class="psion-spell-list__note-marker"
                                            href="#psion-spell-list-footnote"
                                            aria-label={`${entry.name}: see level restriction note`}
                                        >
                                            1
                                        </a>
                                    </sup>{/if}
                            {:else}
                                <span>{entry.name}</span>
                            {/if}
                        </li>
                    {/each}
                </ul>
            </section>
        {/each}
    </div>
    <p id="psion-spell-list-footnote" class="psion-spell-list__footnote">
        <sup>1</sup> This spell is cast at the listed level only.
    </p>
</section>

<style lang="scss">
    .psion-reference-section {
        margin-top: sizes.get(spacing, xl);
    }

    .psion-discipline-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: sizes.get(spacing, sm);
    }

    .psion-discipline-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: sizes.get(spacing, sm);
        min-height: 3rem;
        padding: sizes.get(spacing, sm) sizes.get(spacing, md);
        color: colors.get-dark(text, primary);
        background: colors.get-dark(background, secondary);
        border: 1px solid colors.get-dark(border, subtle);
        border-radius: sizes.get(radius, sm);
        font-weight: 700;
        text-decoration: none;
        transition:
            border-color sizes.get(transition, fast) ease,
            background-color sizes.get(transition, fast) ease,
            color sizes.get(transition, fast) ease;

        &:hover,
        &:focus-visible {
            color: colors.get-dark(text, primary);
            background: colors.get-dark(background, tertiary);
            border-color: colors.get-dark(border, interactive);
        }
    }

    .psion-discipline-card__chevron {
        color: colors.get-dark(text, eyebrow);
        font-size: 1.35rem;
        line-height: 1;
    }

    .psion-spell-list__intro {
        display: grid;
        gap: sizes.get(spacing, sm);
    }

    .psion-spell-list__intro p,
    .psion-spell-list__footnote {
        margin: 0;
    }

    .psion-spell-list__legend {
        color: colors.get-dark(text, eyebrow);
        font-size: 0.88rem;
    }

    .psion-spell-list__badge {
        display: inline-block;
        padding: 0.15rem 0.45rem;
        color: colors.get-dark(badge, optional-text);
        background: colors.get-dark(background, secondary);
        border: 1px solid colors.get-dark(badge, optional-border);
        border-radius: sizes.get(radius, pill);
        font-size: 0.68rem;
        font-weight: 700;
        line-height: 1.2;
        text-transform: uppercase;
        vertical-align: middle;
    }

    .psion-spell-groups {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: sizes.get(spacing, lg);
    }

    .psion-spell-group {
        padding: sizes.get(spacing, md);
        background: colors.get-dark(background, secondary);
        border: 1px solid colors.get-dark(border, subtle);
        border-radius: sizes.get(radius, sm);
    }

    .psion-spell-group h3 {
        margin: 0 0 sizes.get(spacing, sm);
        padding-bottom: sizes.get(spacing, sm);
        color: colors.get-dark(text, headings);
        font-size: 1rem;
        border-bottom: 1px solid colors.get-dark(border, subtle);
    }

    .psion-spell-group ul {
        display: grid;
        gap: 0.35rem;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .psion-spell-group li {
        padding: 0.35rem 0.5rem;
        display: flex;
        align-items: center;
    }

    .psion-spell-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex: 1;
        gap: sizes.get(spacing, sm);
        color: colors.get-dark(text, links);
        text-decoration: none;

        &:hover,
        &:focus-visible {
            color: colors.get-dark(text, links, hover);
            text-decoration: underline;
            text-underline-offset: 0.16em;
        }
    }

    .psion-spell-list__note-marker {
        margin-left: 0.2rem;
        color: inherit;
        text-decoration: none;
    }

    .psion-spell-list__footnote {
        font-size: 0.88rem;
        color: colors.get-dark(text, eyebrow);
    }

    @media (max-width: 760px) {
        .psion-spell-groups {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @media (max-width: 480px) {
        .psion-spell-groups {
            grid-template-columns: 1fr;
        }
    }
</style>
