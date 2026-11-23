<!--
	Location: src/routes/equipment/[type]/[item]/+page.svelte
	Use: Nested equipment detail pages.
-->
<script lang="ts">
	import { page } from '$app/state';
	import {
		getEquipmentItemBySlug,
		getEquipmentItemTypeSlug
	} from '#lib/typescript/data/internals/equipment-items.js';

	import EquipmentDetail from '#lib/svelte/components/page/EquipmentDetail.svelte';
	import NotFound from '#lib/svelte/components/page/NotFound.svelte';
	import type { PageProps } from './$types';
	import type { PageData } from '#lib/typescript/data/_index_.js';
	import type { RoutePageData } from '#lib/typescript/pages/routePageData.js';
	import { createSeoMetadata, type SeoMetadataInput } from '#lib/typescript/pages/seo.js';
	import SeoHead from '#lib/svelte/components/SeoHead.svelte';

	let { data }: PageProps & { data: PageProps['data'] & {
		seo?: SeoMetadataInput;
		routePageData?: RoutePageData<PageData> | null;
	} } = $props();
	let routeSeo = $derived(data.routePageData
		? createSeoMetadata({
				path: data.routePageData.identity.path,
				pageData: data.routePageData.pageData,
				routeSeo: data.seo,
				routeLabel: data.routePageData.identity.label,
				pathname: page.url.pathname
			})
		: null);

	const item = $derived(getEquipmentItemBySlug(page.params.item ?? ''));
	const isMatchingType = $derived(
		item ? getEquipmentItemTypeSlug(item) === page.params.type : false
	);
</script>

{#if routeSeo}
	<SeoHead seo={routeSeo} />
{/if}

{#if item && isMatchingType}
	<EquipmentDetail {item} />
{:else}
	<NotFound />
{/if}
