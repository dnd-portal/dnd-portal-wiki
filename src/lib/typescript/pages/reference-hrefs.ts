export function getEquipmentReferenceHref(item: { readonly type: string; readonly slug: string }): string {
	const typeSlug = item.type
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/\+(\d+)/g, 'plus-$1')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

	return `/equipment/${typeSlug}/${item.slug}`;
}

export function getNpcReferenceHref(item: { readonly name: string }): string {
	const slug = item.name
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

	return `/npcs/${slug}`;
}
