/*
	Location: src/lib/typescript/pages/currentPageData.ts
	Use: Serializable route-data contracts for the current page.
*/

import type { PagePath } from '#lib/typescript/data/functions/Types/_index_.js';

export type CurrentPageBreadcrumb = {
	readonly key: string;
	readonly path?: PagePath;
	readonly href?: string;
	readonly label: string;
};

export type CurrentPageRouteData = {
	readonly pathname: string;
	readonly path: PagePath | null;
	readonly title: string | null;
	readonly label: string | null;
	readonly breadcrumbs: readonly CurrentPageBreadcrumb[];
	readonly breadcrumbBackPath: PagePath | null;
	readonly breadcrumbBackHref: string | null;
};
