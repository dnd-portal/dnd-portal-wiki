import { getData, type PageData } from '#lib/typescript/data/_index_.js';
import { companionItems } from '#lib/typescript/data/internals/companions.js';
import { equipmentItems } from '#lib/typescript/data/internals/equipment-items.js';
import { pugilist } from '#lib/typescript/data/internals/classes/pugilist/_index_.js';
import { getFaqItems, type FaqItem } from '#lib/typescript/pages/faq.js';
import { resolveCurrentPage } from '#lib/typescript/pages/currentPage.js';

export function load({ url }: { url: URL }) {
    const path = resolveCurrentPage(url.pathname).path;

    return {
        canonicalPage: path ? (getData(path) as PageData) : null,
        faqItems: getFaqItems(path),
        equipmentItems,
        npcItems: pugilist.npcItems,
        companionItems,
    } satisfies {
        canonicalPage: PageData | null;
        faqItems: readonly FaqItem[];
        equipmentItems: typeof equipmentItems;
        npcItems: typeof pugilist.npcItems;
        companionItems: typeof companionItems;
    };
}
