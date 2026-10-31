import { getData } from '#lib/typescript/data/_index_.js';
import { rotwoodSovereign } from '#lib/typescript/data/internals/monsters/rotwood-sovereign.js';
export function entries() { return [{ collection: 'eldor', monster: rotwoodSovereign.slug }]; }
export function load() {
	return {
		path: 'internals.homebrew.eldor.monsters.rotwoodSovereign' as const,
		pageData: getData('internals.monsters.rotwoodSovereign')
	};
}
