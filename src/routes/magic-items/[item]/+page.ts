import { getData } from '#lib/typescript/data/_index_.js';

export const prerender = true;

export function entries() {
	return [{ item: 'the-mimic-stick' }];
}

export function load() {
	return { path: 'internals.magicItems.mimicStick', pageData: getData('internals.magicItems.mimicStick') };
}
