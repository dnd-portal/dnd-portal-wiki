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
		PageData
	} from '#lib/typescript/data/_index_.js';
	import type { Snippet } from 'svelte';

	import InlineContent from './InlineContent.svelte';
	import PageImage from './PageImage.svelte';

	const currentPage = getCurrentPageContext();

	function isParagraphs(
		content: InlineContentBlock
	): content is readonly InlineContentData[] {
		return Array.isArray(content[0]);
	}

	function getDescriptionParagraphs(
		content: InlineContentBlock | string | undefined,
		fallback: string
	): readonly InlineContentData[] {
		if (!content || typeof content === 'string') {
			return [
				[
					{
						type: 'text',
						text: content || fallback
					}
				]
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
		pageData,
		children
	}: {
		description?: 'short' | 'long';
		showHeaderSections?: boolean;
		descriptionText?: string;
		descriptionContent?: InlineContentBlock;
		titleText?: string;
		subtitleText?: string;
		headerMeta?: Snippet;
		pageData?: PageData;
		children?: Snippet;
	} = $props();
	let resolvedPageData = $derived(pageData ?? currentPage.data);
	let descriptionParagraphs = $derived(
		descriptionText || descriptionContent
			? getDescriptionParagraphs(descriptionContent ?? [{ type: 'text', text: descriptionText ?? '' }], '')
			: description === 'short'
			? getDescriptionParagraphs(
					resolvedPageData?.descriptions?.short,
					resolvedPageData?.description ?? ''
				  )
			: getDescriptionParagraphs(
					resolvedPageData?.descriptions?.long,
					resolvedPageData?.description ?? ''
				  )
	);
	let imageSet = $derived(
		resolvedPageData?.images?.header ?? resolvedPageData?.images?.card
	);
	let hasHeaderImage = $derived(Boolean(imageSet?.female ?? imageSet?.male));
</script>

	{#if (titleText && subtitleText) || resolvedPageData}
	<section
		class="page-header"
		id="class-overview"
		class:page-header--without-image={!hasHeaderImage}
	>
		<div class="page-header__content">
			<p class="page-header__subtitle">
				{subtitleText ?? resolvedPageData?.subTitle}
			</p>

				<h1>{titleText ?? (pageData ? pageData.label ?? pageData.title : currentPage.path ? getPageLabel(currentPage.path) : '')}</h1>

			{@render headerMeta?.()}

			<div class="page-header__description">
				{#each descriptionParagraphs as paragraph}
					<p>
						<InlineContent content={paragraph} />
					</p>
				{/each}
			</div>

				{#if showHeaderSections && resolvedPageData?.header?.sections?.length}
				<div class="page-header__sections">
					{#each resolvedPageData?.header?.sections ?? [] as section}
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
			imageSet={imageSet}
			path={currentPage.path}
		/>
	</section>
{/if}
