import { getClassOverviewEntries } from '#lib/typescript/data/internals/classes/_index_.js';
import type { EditionId } from '#lib/typescript/data/internals/editions.js';

export function entries() {
    const routeSlugs = new Set<string>(['', '5e', '4e', '3e', '2e', '1e', '3-5e']);
    for (const edition of ['5.5e', '5e', '4e', '3.5e', '3e', '2e', '1e'] as EditionId[]) {
        for (const entry of getClassOverviewEntries(edition)) {
            routeSlugs.add(entry.pagePath.replace(/^\/classes\//, '').replace(/\/$/, ''));
        }
    }
    return [...routeSlugs].filter(Boolean).map((classSlug) => ({ class: classSlug }));
}
