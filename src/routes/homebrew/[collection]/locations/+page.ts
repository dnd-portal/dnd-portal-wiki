import { getData } from '#lib/typescript/data/_index_.js';

export function entries() {
	return [{ collection: 'eldor' }];
}

export function load() {
	return { path: 'internals.homebrew.eldor.locations.page', pageData: getData('internals.homebrew.eldor.locations.page') };
}
