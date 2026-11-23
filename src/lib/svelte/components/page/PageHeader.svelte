<!--
	Location: src/lib/svelte/components/page/PageHeader.svelte
	Use: Renders the current page header from centralized metadata.
-->
<script lang="ts">
    import { getCurrentPageContext } from '#lib/svelte/context/currentPage.js';
    import { getPageLabel } from '#lib/typescript/pages/currentPage.js';
    import type {
        InlineContent as InlineContentData,
        InlineContentBlock,
    } from '#lib/typescript/data/_index_.js';
    import type { Snippet } from 'svelte';
    import type { PageData } from '#lib/typescript/data/_index_.js';
    import type { PageHeaderMetadata } from '#lib/typescript/pages/metadata.js';

    import InlineContent from './InlineContent.svelte';
    import PageImage from './PageImage.svelte';

    const currentPage = getCurrentPageContext();

    function isParagraphs(content: InlineContentBlock): content is readonly InlineContentData[] {
        return Array.isArray(content[0]);
    }

    function getDescriptionParagraphs(
        content: InlineContentBlock | string | undefined,
        fallback: string,
    ): readonly InlineContentData[] {
        if (!content || typeof content === 'string') {
            return [
                [
                    {
                        type: 'text',
                        text: content || fallback,
                    },
                ],
            ];
        }

        return isParagraphs(content) ? content : [content];
    }

    let {
        description = 'long',
        showHeaderSections = true,
        descriptionText,
        descriptionContent,
        titleText,
        subtitleText,
        headerMeta,
        children,
        metadata,
    }: {
        description?: 'short' | 'long';
        showHeaderSections?: boolean;
        descriptionText?: string;
        descriptionContent?: InlineContentBlock;
        titleText?: string;
        subtitleText?: string;
        headerMeta?: Snippet;
        children?: Snippet;
        metadata?: PageHeaderMetadata;
    } = $props();
    let descriptionParagraphs = $derived(
        descriptionText || descriptionContent
            ? getDescriptionParagraphs(
                  descriptionContent ?? [{ type: 'text', text: descriptionText ?? '' }],
                  '',
              )
            : description === 'short'
              ? getDescriptionParagraphs(
                    metadata?.description ?? currentPage.data?.descriptions?.short,
                    currentPage.data?.description ?? '',
                )
              : getDescriptionParagraphs(
                    metadata?.description ?? currentPage.data?.descriptions?.long,
                    currentPage.data?.description ?? '',
                ),
    );
    let imageSet = $derived(
        metadata?.images?.header ??
            metadata?.images?.card ??
            currentPage.data?.images?.header ??
            currentPage.data?.images?.card,
    );
    let hasHeaderImage = $derived(Boolean(imageSet?.female ?? imageSet?.male));
</script>

{#if (titleText && subtitleText) || metadata || (currentPage.path && currentPage.data)}
    <section
        class="page-header"
        id="class-overview"
        class:page-header--without-image={!hasHeaderImage}
    >
        <div class="page-header__content">
            <p class="page-header__subtitle">
                {subtitleText ?? metadata?.subtitle ?? currentPage.data?.subTitle}
            </p>

            <h1>
                {titleText ??
                    metadata?.title ??
                    (currentPage.path ? getPageLabel(currentPage.path) : '')}
            </h1>

            {@render headerMeta?.()}

            <div class="page-header__description">
                {#each descriptionParagraphs as paragraph}
                    <p>
                        <InlineContent content={paragraph} />
                    </p>
                {/each}
            </div>

            {#if showHeaderSections && (metadata?.sections ?? currentPage.data?.header?.sections)?.length}
                <div class="page-header__sections">
                    {#each metadata?.sections ?? currentPage.data?.header?.sections ?? [] as section}
                        <section
                            class="page-header__section"
                            id={section.id}
                            aria-labelledby={`${section.id}-title`}
                        >
                            <h2 id={`${section.id}-title`}>{section.title}</h2>

                            {#each getDescriptionParagraphs(section.content, '') as paragraph}
                                <p>
                                    <InlineContent content={paragraph} />
                                </p>
                            {/each}
                        </section>
                    {/each}
                </div>
            {/if}

            {@render children?.()}
        </div>

        <PageImage
            presentation={description === 'short' ? 'class-header' : 'default'}
            images={metadata?.images}
            routePath={metadata?.identity.path}
        />
    </section>
{/if}
