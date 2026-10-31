import { getData } from '#lib/typescript/data/_index_.js';

export function entries() {
	return [{ location: 'brinehook-harbor' }, { location: 'gildersprout-reach' }];
}

export function load({ params }: { params: { location: string } }) {
	const path = params.location === 'gildersprout-reach' ? 'internals.locations.gildersproutReach.shopping' : 'internals.locations.brinehookHarbor.shopping';
	return { path, pageData: getData(path) };
}
