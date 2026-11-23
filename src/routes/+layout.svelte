<!--  
    Location: src\routes\+layout.svelte
    use: 
-->
<script lang='ts'>
	import { page as appPage } from '$app/state';
	import type { Snippet } from 'svelte';
	import '#lib/scss/style.scss';

	import { buildPage } from '#lib/typescript/pages/pageBuilder.js';
	import { resolveCurrentPage } from '#lib/typescript/pages/currentPage.js';
	import {
		createSeoMetadata,
		type SeoMetadataInput
	} from '#lib/typescript/pages/seo.js';
	import { setCurrentPageContext } from '#lib/svelte/context/currentPage.js';
	import type { CurrentPageRouteData } from '#lib/typescript/pages/currentPageData.js';
	import type { PagePath } from '#lib/typescript/data/functions/Types/_index_.js';

	import Breadcrumbs from '#lib/svelte/components/page/Breadcrumbs.svelte';
	import Footer from '#lib/svelte/components/page/Footer.svelte';
	import Navbar from '#lib/svelte/components/page/Navbar.svelte';
	import Sidebar from '#lib/svelte/components/page/Sidebar.svelte';
	import MobileNavigation from '#lib/svelte/components/page/MobileNavigation.svelte';
	import Analytics from '#lib/svelte/components/Analytics.svelte';
	import PopupHost from '#lib/svelte/components/PopupHost.svelte';
	import SeoHead from '#lib/svelte/components/SeoHead.svelte';

	const appBase = '';

	const page = buildPage();
	let routeData = $derived(appPage.data as { path?: string; currentPage?: CurrentPageRouteData });
	let faqRouteData = $derived(
		(appPage.data as {
			routePageData?: { identity: { path: string }; pageData: import('#lib/typescript/data/functions/Types/PageData.js').PageData } | null;
		}).routePageData
	);
	let rulesRouteData = $derived(
		(appPage.data as {
			routePageData?: { identity: { path: string }; pageData: import('#lib/typescript/data/functions/Types/PageData.js').PageData } | null;
		}).routePageData
	);
	let isFaqDetail = $derived(
		appPage.url.pathname.startsWith('/faq/') && appPage.url.pathname !== '/faq/'
	);
	let isRulesDetail = $derived(
		appPage.url.pathname.startsWith('/rules/') &&
		appPage.url.pathname !== '/rules/spellcasting/cantrips/' &&
		appPage.url.pathname !== '/rules/spellcasting/spells/' &&
		!/^\/rules\/spellcasting\/spells\/[^/]+\/?$/.test(appPage.url.pathname) &&
		Boolean(rulesRouteData)
	);
	let resolvedPage = $derived(
		isFaqDetail || isRulesDetail
			? {
				path: ((isFaqDetail ? faqRouteData?.identity.path : rulesRouteData?.identity.path) as PagePath | undefined) ?? null,
				data: isFaqDetail ? faqRouteData?.pageData ?? null : rulesRouteData?.pageData ?? null
			}
			: resolveCurrentPage(appPage.url.pathname, appBase, routeData.path)
	);
	let currentPage = $derived({
		path: routeData.currentPage?.path ?? resolvedPage.path,
		data: resolvedPage.data
	});
	let routeSeo = $derived((appPage.data as { seo?: SeoMetadataInput }).seo);
	let seo = $derived(createSeoMetadata({
		path: currentPage.path,
		pageData: currentPage.data,
		routeSeo,
		routeLabel: routeData.currentPage?.label,
		breadcrumbs: routeData.currentPage?.breadcrumbs,
		pathname: appPage.url.pathname,
		basePath: appBase
	}));
	let routeOwnsSeo = $derived(
		(appPage.url.pathname.startsWith('/faq/') && appPage.url.pathname !== '/faq/') ||
		(appPage.url.pathname.startsWith('/rules/') &&
			appPage.url.pathname !== '/rules/spellcasting/cantrips/' &&
			appPage.url.pathname !== '/rules/spellcasting/spells/' &&
			!/^\/rules\/spellcasting\/spells\/[^/]+\/?$/.test(appPage.url.pathname)) ||
		/^\/equipment\/[^/]+\/[^/]+\/?$/.test(appPage.url.pathname)
	);
	setCurrentPageContext({
		get pathname() {
			return appPage.url.pathname;
		},
		get path() {
			return currentPage.path;
		},
		get data() {
			return currentPage.data;
		},
		get route() {
			return routeData.currentPage ?? null;
		}
	});

	let { children }: { children: Snippet } = $props();
</script>

<SeoHead {seo} enabled={!routeOwnsSeo} />

<div class='layout'>
	<Analytics />
	{#if page.navbar}
		<Navbar {...page.navbar} />
	{/if}

	<div class='layout__body'>
		{#if page.sidebar}
			<Sidebar {...page.sidebar} />
		{/if}

		<main class={`layout__content${currentPage.path === 'internals.website.homepage' ? ' layout__content--home' : ''}`}>
			<Breadcrumbs />
			{@render children()}
		</main>
	</div>

	{#if page.footer}
		<Footer {...page.footer} />
	{/if}
	<MobileNavigation />
	<PopupHost />
</div>
