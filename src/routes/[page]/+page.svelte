<!--
	Location: src/routes/[page]/+page.svelte
	Use: Generic top-level page route for central project pages.
-->
<script lang="ts">
    import type {
        PageContentSection as PageContentSectionData,
        PageTableOfContentsSection,
        PageData,
    } from '#lib/typescript/data/_index_.js';
    import type { Companion } from '#lib/typescript/data/internals/companions.js';
    import type { EquipmentItem } from '#lib/typescript/data/internals/equipment-items.js';
    import type { PugilistNpc } from '#lib/typescript/data/internals/classes/pugilist/_index_.js';
    import type { FaqItem } from '#lib/typescript/pages/faq.js';
    import { getCurrentPageContext } from '#lib/svelte/context/currentPage.js';

    import EquipmentBrowser from '#lib/svelte/components/page/EquipmentBrowser.svelte';
    import Faq from '#lib/svelte/components/page/Faq.svelte';
    import NpcBrowser from '#lib/svelte/components/page/NpcBrowser.svelte';
    import CompanionBrowser from '#lib/svelte/components/page/CompanionBrowser.svelte';
    import NotFound from '#lib/svelte/components/page/NotFound.svelte';
    import PageContentSection from '#lib/svelte/components/page/PageContentSection.svelte';
    import PageHeader from '#lib/svelte/components/page/PageHeader.svelte';
    import TableOfContents from '#lib/svelte/components/page/TableOfContents.svelte';

    type TopLevelPageContent = {
        readonly sections: readonly PageContentSectionData[];
        readonly tableOfContents: readonly PageTableOfContentsSection[];
    };

    function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }

    function getTopLevelPageContent(value: unknown): TopLevelPageContent | null {
        if (!isRecord(value) || !isRecord(value.content)) {
            return null;
        }

        return Array.isArray(value.content.sections) && Array.isArray(value.content.tableOfContents)
            ? {
                  sections: value.content.sections as readonly PageContentSectionData[],
                  tableOfContents: value.content
                      .tableOfContents as readonly PageTableOfContentsSection[],
              }
            : null;
    }

    const currentPage = getCurrentPageContext();
    let {
        data,
    }: {
        data: {
            canonicalPage: PageData | null;
            faqItems: readonly FaqItem[];
            equipmentItems: readonly EquipmentItem[];
            npcItems: readonly PugilistNpc[];
            companionItems: readonly Companion[];
        };
    } = $props();
    let canonicalPage = $derived(data.canonicalPage);
    let content = $derived(getTopLevelPageContent(canonicalPage));
    let isEquipmentPage = $derived(currentPage.path === 'internals.equipment.page');
    let isNpcsPage = $derived(currentPage.path === 'internals.npcs.page');
    let isCompanionsPage = $derived(currentPage.path === 'internals.companions.page');
    let faqItems = $derived(data.faqItems);
</script>

{#if currentPage.data}
    <div class="page-layout">
        <article class="wiki-article page-layout__article">
            <PageHeader />

            {#if isCompanionsPage}
                <CompanionBrowser items={data.companionItems} />
            {/if}

            {#if content}
                {#each content.sections as section}
                    <PageContentSection {section} />
                {/each}
            {/if}

            {#if isEquipmentPage}
                <EquipmentBrowser items={data.equipmentItems} />
            {/if}

            {#if isNpcsPage}
                <NpcBrowser items={data.npcItems} />
            {/if}
            {#if faqItems.length}
                <Faq items={faqItems} />
            {/if}
        </article>

        {#if content?.tableOfContents.length}
            <aside class="page-layout__toc">
                <TableOfContents sections={content.tableOfContents} />
            </aside>
        {/if}
    </div>
{:else}
    <NotFound />
{/if}
