<!--
	Location: src/routes/classes/+page.svelte
	Use: Class index page backed by the central class content pack.
-->
<script lang="ts">
	import { classList, classes } from '#lib/typescript/data/internals/classes/_index_.js';

	import PageCard from '#lib/svelte/components/PageCard.svelte';
	import PageHeader from '#lib/svelte/components/page/PageHeader.svelte';

	function getClassCardData(slug: string) {
		const entry = classes[slug as keyof typeof classes];
		return entry && 'page' in entry ? entry.page : undefined;
	}
</script>

<article class="wiki-article">
	<PageHeader />

	<section
		class="wiki-article__section"
		id="classes"
		aria-labelledby="classes-title"
	>
		<h2 id="classes-title">Classes</h2>

		<div class="wiki-article__image-cards">
			{#each classList as classItem}
				<PageCard
					page={classItem.path}
					cardData={getClassCardData(classItem.slug)}
					variant="image"
				/>
			{/each}
		</div>
	</section>
</article>
