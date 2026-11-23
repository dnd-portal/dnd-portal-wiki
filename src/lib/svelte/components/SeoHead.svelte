<script lang="ts">
	import type { SeoMetadata } from '#lib/typescript/pages/seo.js';
	let { seo, enabled = true }: { seo: SeoMetadata; enabled?: boolean } = $props();
</script>
<svelte:head>
	{#if enabled}
	<link rel="icon" href={seo.faviconHref} sizes="any" />
	<link rel="icon" type="image/svg+xml" href={seo.iconSvgHref} />
	<link rel="icon" type="image/png" sizes="96x96" href={seo.icon96Href} />
	<link rel="icon" type="image/png" sizes="192x192" href={seo.icon192Href} />
	<link rel="icon" type="image/png" sizes="512x512" href={seo.icon512Href} />
	<link rel="apple-touch-icon" sizes="180x180" href={seo.appleTouchIconHref} />
	<link rel="manifest" href={seo.manifestHref} />
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<link rel="canonical" href={seo.canonicalUrl} />
	<meta name="robots" content="index, follow" />
	<meta name="theme-color" content="#0b0d0c" />
	<meta property="og:site_name" content="D&D Portal Wiki" />
	<meta property="og:type" content={seo.type} />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:url" content={seo.canonicalUrl} />
	<meta property="og:image" content={seo.imageUrl} />
	<meta property="og:image:alt" content={seo.imageAlt} />
	<meta property="og:image:width" content={seo.imageWidth == null ? undefined : String(seo.imageWidth)} />
	<meta property="og:image:height" content={seo.imageHeight == null ? undefined : String(seo.imageHeight)} />
	<meta name="twitter:card" content={seo.twitterCard} />
	<meta name="twitter:title" content={seo.title} />
	<meta name="twitter:description" content={seo.description} />
	<meta name="twitter:image" content={seo.imageUrl} />
	<meta name="twitter:image:alt" content={seo.imageAlt} />
	{#if seo.structuredDataJson}{@html `<script type="application/ld+json">${seo.structuredDataJson}</script>`}{/if}
	{/if}
</svelte:head>
