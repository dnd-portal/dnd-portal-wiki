/* Typed route-owned page data. Canonical content remains the source of truth. */
import type { PageData, PagePath } from '#lib/typescript/data/functions/Types/_index_.js';

export type RoutePageIdentity = {
	readonly path: PagePath;
	readonly href: string;
	readonly label: string;
};

export type RoutePageData<TContent = unknown> = {
	readonly identity: RoutePageIdentity;
	readonly pageData: PageData;
	readonly content?: TContent;
};

export function createRoutePageData<TContent = never>(
	path: PagePath,
	pageData: PageData,
	content?: TContent
): RoutePageData<TContent> {
	return {
		identity: { path, href: pageData.href, label: pageData.label ?? pageData.navigation?.label ?? pageData.title },
		pageData,
		...(content === undefined ? {} : { content })
	};
}
