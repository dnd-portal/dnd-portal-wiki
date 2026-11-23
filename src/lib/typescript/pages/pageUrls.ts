/* Pure URL helpers shared by route-aware client components. */

const homeHref = '/';
const fileExtensionPattern = /\.[A-Za-z0-9]+$/;

export function normalizeInternalHref(href: string, basePath = ''): string {
	const parsedHref = href.split(/[?#]/, 1)[0] || homeHref;
	const withoutBase =
		basePath &&
		parsedHref !== basePath &&
		parsedHref.startsWith(`${basePath}/`)
			? parsedHref.slice(basePath.length)
			: parsedHref;
	const normalized = withoutBase || homeHref;

	if (normalized.length > 1 && normalized.endsWith('/')) {
		return normalized.slice(0, -1);
	}

	return normalized;
}

export function getCanonicalInternalHref(href: string, basePath = ''): string {
	if (!href.startsWith('/') || href.startsWith('//')) {
		return href;
	}

	if (/[?#]/.test(href) || fileExtensionPattern.test(href)) {
		return `${basePath}${href}`;
	}

	const normalized = normalizeInternalHref(href, basePath);

	return normalized === homeHref
		? `${basePath}${homeHref}`
		: `${basePath}${normalized}/`;
}
