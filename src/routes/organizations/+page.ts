import { getData } from '#lib/typescript/data/_index_.js';

export function load() {
	return { path: 'internals.organizations.page', pageData: getData('internals.organizations.page') };
}
