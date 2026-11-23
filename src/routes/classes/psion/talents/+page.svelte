<script lang="ts">
    import PageHeader from '#lib/svelte/components/page/PageHeader.svelte';
    import ContentAttribution from '#lib/svelte/components/ContentAttribution.svelte';
    import { psionDisciplines } from '#lib/typescript/data/internals/classes/psion/disciplines.js';
    import {
        generalPsionicTalents,
        psiCrystal,
        telekineticWeapons,
    } from '#lib/typescript/data/internals/classes/psion/talents.js';
    import {
        psionFeats,
        psionFusionTalents,
    } from '#lib/typescript/data/internals/classes/psion/feats.js';
    import InlineContent from '#lib/svelte/components/page/InlineContent.svelte';

    let query = $state('');
    let talents = $derived([
        ...generalPsionicTalents,
        ...psionDisciplines.flatMap((discipline) =>
            discipline.talents.map((talent) => ({ ...talent, discipline: discipline.name })),
        ),
    ]);
    let filtered = $derived(
        talents.filter((talent) =>
            `${talent.title} ${talent.prerequisite ?? ''} ${talent.discipline}`
                .toLowerCase()
                .includes(query.trim().toLowerCase()),
        ),
    );
    let filteredFeats = $derived(
        psionFeats.filter((feat) =>
            `${feat.title} ${feat.prerequisite ?? ''} ${feat.text}`
                .toLowerCase()
                .includes(query.trim().toLowerCase()),
        ),
    );
    let filteredFusion = $derived(
        psionFusionTalents.filter((talent) =>
            `${talent.title} ${talent.prerequisite ?? ''} ${talent.text}`
                .toLowerCase()
                .includes(query.trim().toLowerCase()),
        ),
    );
    const spellLinks = [
        { marker: 'invest life', path: '/spells/invest-life' },
        { marker: 'mutate', path: '/spells/mutate' },
        { marker: 'psychic drain', path: '/spells/psychic-drain' },
    ];
    function linkedText(value: string) {
        const match = spellLinks
            .map((spell) => ({ ...spell, index: value.toLowerCase().indexOf(spell.marker) }))
            .filter((spell) => spell.index >= 0)[0];
        if (!match) return [{ type: 'text' as const, text: value }];
        return [
            { type: 'text' as const, text: value.slice(0, match.index) },
            { type: 'link' as const, path: `${match.path}/`, label: match.marker },
            { type: 'text' as const, text: value.slice(match.index + match.marker.length) },
        ];
    }
</script>

<svelte:head><title>Psionic Talents | D&amp;D Portal Wiki</title></svelte:head>

<article class="wiki-article page-layout__article">
    <PageHeader
        titleText="Psionic Talents"
        subtitleText="Psion options - Homebrew 5e (2014)"
        descriptionText="Psionic talents collected from Psion 1.5.3, with their discipline and prerequisites shown."
    />
    <label>
        <span>Search talents</span><input
            id="psion-talent-search"
            name="q"
            type="search"
            bind:value={query}
            placeholder="Search by talent, discipline, or prerequisite..."
        />
    </label>
    <section class="wiki-article__section" aria-labelledby="talents-title">
        <h2 id="talents-title">Talents</h2>
        <div class="wiki-article__cards">
            {#each filtered as talent}<article class="class-trait-card">
                    <h3>{talent.title}</h3>
                    <p>{talent.discipline}</p>
                    {#if talent.prerequisite}<p>
                            <strong>Prerequisite:</strong>
                            {talent.prerequisite}
                        </p>{/if}
                    <p><InlineContent content={linkedText(talent.text)} /></p>
                </article>{/each}
        </div>
    </section>
    <section class="wiki-article__section" aria-labelledby="feats-title">
        <h2 id="feats-title">Psion Feats</h2>
        <div class="wiki-article__cards">
            {#each filteredFeats as feat}<article class="class-trait-card">
                    <h3>{feat.title}</h3>
                    {#if feat.prerequisite}<p>
                            <strong>Prerequisite:</strong>
                            {feat.prerequisite}
                        </p>{/if}
                    <p>{feat.text}</p>
                </article>{/each}
        </div>
    </section>
    <section class="wiki-article__section" aria-labelledby="fusion-talents-title">
        <h2 id="fusion-talents-title">Fusion Talents</h2>
        <p>
            Fusion Talents become available through Psionic Synthesis when all disciplines in a
            talent’s prerequisite are known.
        </p>
        <div class="wiki-article__cards">
            {#each filteredFusion as talent}<article class="class-trait-card">
                    <h3>{talent.title}</h3>
                    {#if talent.prerequisite}<p>
                            <strong>Prerequisite:</strong>
                            {talent.prerequisite}
                        </p>{/if}
                    <p>{talent.text}</p>
                </article>{/each}
        </div>
    </section>
    <section class="wiki-article__section" aria-labelledby="special-powers-title">
        <h2 id="special-powers-title">Special Psionic Powers</h2>
        <article class="class-trait-card">
            <h3>{telekineticWeapons.name}</h3>
            <p>{telekineticWeapons.text}</p>
            {#each telekineticWeapons.modifiers as modifier}<p>{modifier}</p>{/each}
        </article>
    </section>
    <section class="wiki-article__section" aria-labelledby="psi-crystal-title">
        <h2 id="psi-crystal-title">Psi Crystal</h2>
        <article class="class-trait-card">
            <h3>Psi Crystal</h3>
            <p>{psiCrystal.text}</p>
            <h4>Stat Block</h4>
            {#each psiCrystal.statblock as line}<p>{line}</p>{/each}
            <h4>Personality Options</h4>
            {#each psiCrystal.options as option}<p>{option}</p>{/each}
        </article>
    </section>
    <ContentAttribution
        creator="KibblesTasty"
        creatorUrl="https://www.kthomebrew.com/"
        source="Psion"
        sourceVersion="1.5.3"
        sourceUrl="https://www.kthomebrew.com/psion"
        permissionsUrl="https://www.kthomebrew.com/permissions"
        license="Open Game License Version 1.0a; Copyright 2000, Wizards of the Coast, LLC."
    />
</article>
