import type { LayoutServerLoad } from './$types';
import {
	getBreadcrumbBackPath,
	getBreadcrumbItems,
	getDynamicSpellBreadcrumbItems,
	getPageLabel,
	resolveCurrentPage
} from '#lib/typescript/pages/currentPage.js';
import { getRuntimeData } from '#lib/typescript/data/runtime/index.js';
import type { CurrentPageRouteData } from '#lib/typescript/pages/currentPageData.js';

const dynamicSpellPath = (pathname: string): string | null => {
	const parts = pathname.split('/').filter(Boolean);
	if (parts[0] !== 'spells' || !parts[1] || ['spellcasting', 'cantrips', 'level-1'].includes(parts[1])) {
		return null;
	}
	return parts[1];
};

export const load: LayoutServerLoad = ({ url }) => {
	const resolved = resolveCurrentPage(url.pathname);
	const spellSlug = dynamicSpellPath(url.pathname);
	const breadcrumbs = spellSlug
		? getDynamicSpellBreadcrumbItems(spellSlug)
		: getBreadcrumbItems(resolved.path);
	const routeBreadcrumbs = breadcrumbs.map((item) => ({
		...item,
		href: item.path
			? getRuntimeData(item.path).href
			: item.key.startsWith('/')
				? `${item.key}/`
				: undefined
	}));
	const breadcrumbBackPath = getBreadcrumbBackPath(breadcrumbs);
	const currentPage: CurrentPageRouteData = {
		pathname: url.pathname,
		path: resolved.path,
		title: resolved.data?.title ?? null,
		label: resolved.path ? getPageLabel(resolved.path) : null,
		breadcrumbs: routeBreadcrumbs,
		breadcrumbBackPath,
		breadcrumbBackHref: breadcrumbBackPath ? getRuntimeData(breadcrumbBackPath).href : null
	};

	return { currentPage };
};
