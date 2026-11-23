import type { PageServerLoad } from './$types';
import { getData } from '#lib/typescript/data/_index_.js';
import { getFaqGroup, getFaqQuestion } from '#lib/typescript/data/internals/faq.js';
import { resolveCurrentPage } from '#lib/typescript/pages/currentPage.js';
import { createRoutePageData } from '#lib/typescript/pages/routePageData.js';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = ({ url }) => {
	const segments = url.pathname.split('/').filter(Boolean).slice(1);
	const group = getFaqGroup(segments[0] ?? '');
	if (!group) throw error(404, 'FAQ group not found');
	if (segments[1] && !getFaqQuestion(group.slug, segments[1])) {
		throw error(404, 'FAQ question not found');
	}
	const path = resolveCurrentPage(url.pathname).path;
	return { routePageData: path ? createRoutePageData(path, getData(path)) : null };
};
