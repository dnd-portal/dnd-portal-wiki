/*
	Location: src/routes/equipment/[type]/[item]/+page.ts
	Use: Static prerender entries for nested equipment detail pages.
*/
import {
	equipmentItems,
	getEquipmentItemBySlug,
	getEquipmentItemTypeSlug,
	getEquipmentItemPathKey
} from '#lib/typescript/data/internals/equipment-items.js';
import { createEquipmentSeoMetadata } from '#lib/typescript/pages/seo.js';
import { getData } from '#lib/typescript/data/_index_.js';
import { createRoutePageData } from '#lib/typescript/pages/routePageData.js';
import type { PageData, PagePath } from '#lib/typescript/data/_index_.js';

export function entries() {
	return equipmentItems.map((item) => ({
		type: getEquipmentItemTypeSlug(item),
		item: item.slug
	}));
}

export function load({ params }) {
	const item = getEquipmentItemBySlug(params.item);

	if (!item || getEquipmentItemTypeSlug(item) !== params.type) {
		return {};
	}

	return {
		seo: createEquipmentSeoMetadata(item),
		routePageData: createRoutePageData(
			`internals.equipment.${getEquipmentItemPathKey(item)}` as PagePath,
			getData(`internals.equipment.${getEquipmentItemPathKey(item)}` as PagePath) as PageData
		)
	};
}
