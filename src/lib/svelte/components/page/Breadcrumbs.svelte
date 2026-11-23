<!--
	Location: src/lib/svelte/components/page/Breadcrumbs.svelte
	Use: Renders breadcrumbs from the current-page context.
-->
<script lang="ts">
	const base: string = '';
	import { page as appPage } from '$app/state';
	import { goto } from '$app/navigation';
	import { getCanonicalInternalHref } from '#lib/typescript/pages/pageUrls.js';
	import type { BreadcrumbItem } from '#lib/typescript/pages/currentPage.js';

	import Link from '#lib/svelte/components/Link.svelte';

	let { itemsOverride }: { itemsOverride?: readonly BreadcrumbItem[] } = $props();
	let routeData = $derived(appPage.data as { currentPage?: { path: string | null; breadcrumbs: readonly BreadcrumbItem[]; breadcrumbBackPath: string | null; breadcrumbBackHref: string | null } });
	let items = $derived(itemsOverride ?? routeData.currentPage?.breadcrumbs ?? []);
	let backHref = $derived(itemsOverride ? null : routeData.currentPage?.breadcrumbBackHref ?? null);
	let shouldRender = $derived(
		items.length > 0 && (itemsOverride || routeData.currentPage != null)
	);

	function getInternalUrl(href: string): string {
		return getCanonicalInternalHref(href, base);
	}

	function goBack(): void {
		if (!backHref) {
			return;
		}

		goto(getInternalUrl(backHref));
	}
</script>

{#if shouldRender}
	<div class="breadcrumbs">
		<button
			class="breadcrumbs__back"
			type="button"
			aria-label="Go back to the parent page"
			onclick={goBack}
		>
			Back
		</button>

		<nav class="breadcrumbs__nav" aria-label="Breadcrumb">
			<ol class="breadcrumbs__list">
				{#each items as item, index (item.key)}
					<li class="breadcrumbs__item">
						{#if index < items.length - 1}
							<Link
								goto={item.path!}
								placeholder={item.label}
								popup="full"
							/>

							<span class="breadcrumbs__separator" aria-hidden="true">
								/
							</span>
						{:else}
							<span class="breadcrumbs__current" aria-current="page">
								{item.label}
							</span>
						{/if}
					</li>
				{/each}
			</ol>
		</nav>
	</div>
{/if}
