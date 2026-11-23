<script lang="ts">
    import { page } from '$app/state';
    import PageContentSection from '#lib/svelte/components/page/PageContentSection.svelte';
    import PageHeader from '#lib/svelte/components/page/PageHeader.svelte';
    import ContentAttribution from '#lib/svelte/components/ContentAttribution.svelte';
    import NotFound from '#lib/svelte/components/page/NotFound.svelte';
    import { psionDisciplinePages } from '#lib/typescript/data/internals/classes/psion/disciplines.js';

    let discipline = $derived(
        psionDisciplinePages[page.params.discipline ?? ''] as
            (typeof psionDisciplinePages)[string] | undefined,
    );
    let disciplineTitle = $derived(discipline?.label ?? discipline?.title ?? 'Psionic Discipline');
</script>

<svelte:head><title>{disciplineTitle} | D&amp;D Portal Wiki</title></svelte:head>

{#if discipline}
    <div class="page-layout">
        <article class="wiki-article page-layout__article">
            <PageHeader
                titleText={discipline.label ?? discipline.title}
                subtitleText={discipline.subTitle}
                descriptionText={discipline.description}
            />
            {#each discipline.content.featureSections as section}<PageContentSection
                    {section}
                />{/each}
            <ContentAttribution {...discipline.content.attribution} />
        </article>
    </div>
{:else}<NotFound />{/if}
