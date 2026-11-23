import type { PageServerLoad } from './$types';
import { getData } from '#lib/typescript/data/_index_.js';
import { resolveCurrentPage } from '#lib/typescript/pages/currentPage.js';
import { createRoutePageData } from '#lib/typescript/pages/routePageData.js';

export const load: PageServerLoad = ({ url }) => {
	const path = resolveCurrentPage(url.pathname).path;
	return { routePageData: path ? createRoutePageData(path, getData(path)) : null };
};
