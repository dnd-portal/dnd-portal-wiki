import { faq } from '#lib/typescript/data/internals/faq.js';

export const prerender = true;

export function entries() {
	const groups = Object.values(faq) as readonly Record<string, { href: string }>[];

	return groups.flatMap((group) =>
		Object.values(group).map((page) => ({
			page: page.href.replace(/^\/faq\//, '').replace(/\/$/, '')
		}))
	);
}
