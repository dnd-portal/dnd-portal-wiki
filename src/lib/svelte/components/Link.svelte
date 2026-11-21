<script lang="ts">
	import type { LinkPath } from '#lib/typescript/data/_index_.js';
	import { getRuntimeData } from '#lib/typescript/data/runtime/index.js';
	import { siteMetadata } from '#lib/typescript/data/runtime/site-metadata.js';
	import { getCanonicalInternalHref } from '#lib/typescript/pages/currentPage.js';

	const base: string = '';

	export type LinkPopupMode = 'full' | 'description' | 'none';

	let {
		placeholder,
		showIcon = false,
		popup = 'full',
		current = false,
		goto,
			onNavigate,
		query
	}: {
		placeholder?: string;
		showIcon?: boolean;
		popup?: LinkPopupMode;
		current?: boolean;
		goto: LinkPath;
		onNavigate?: (event: MouseEvent) => void;
			query?: string;
	} = $props();

	let link = $derived(getRuntimeData(goto));
	let iconSize = $derived(
		'navigation' in link && link.navigation && typeof link.navigation === 'object'
			? (link.navigation as { iconSize?: 'default' | 'large' }).iconSize
			: undefined
	);

	function getInternalHref(href: string): string {
		return getCanonicalInternalHref(href, base);
	}

	function getDisplayUrl(href: string): string {
		if (!href.startsWith('/')) {
			return href;
		}

		return new URL(getInternalHref(href), siteMetadata.baseUrl).href;
	}

	function withQuery(href: string): string {
		return query ? `${href}${query}` : href;
	}

	function popupEvent(name: 'dnd-portal:popup-open' | 'dnd-portal:popup-close', detail: unknown): void {
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent(name, { detail }));
		}
	}

	function openPopup(event: MouseEvent | FocusEvent): void {
		if (popup === 'none' || typeof window === 'undefined') return;
		const trigger = event.currentTarget;
		if (!(trigger instanceof HTMLElement)) return;
		popupEvent('dnd-portal:popup-open', {
			link,
			href: withQuery(getInternalHref(link.href)),
			displayHref: getDisplayUrl(link.href),
			mode: popup,
			trigger,
			id: 'wiki-shared-popup',
			source: event.type === 'focus' ? 'focus' : 'hover'
		});
	}

	function closePopup(event: FocusEvent | MouseEvent): void {
		popupEvent('dnd-portal:popup-close', { relatedTarget: event.relatedTarget });
	}
</script>

<span
	class={`link-container link-container--popup-${popup}`}
	role="presentation"
>
	<a
		class="link"
		href={withQuery(getInternalHref(link.href))}
		target={link.external ? '_blank' : undefined}
		rel={link.external ? 'noopener noreferrer' : undefined}
		aria-current={current ? 'page' : undefined}
		aria-describedby={popup !== 'none' ? 'wiki-shared-popup' : undefined}
		onclick={onNavigate}
		onmouseenter={openPopup}
		onmouseleave={closePopup}
		onfocus={openPopup}
		onblur={closePopup}
	>
		{#if showIcon}
			<span
				class="link-img"
				class:link-img--large={iconSize === 'large'}
				style={`--link-icon: url("${link.img.href}")`}
				aria-hidden="true"
			></span>
		{/if}
		{placeholder ?? link.title}
		{#if link.external}
			&#8599;
		{/if}
	</a>

</span>
