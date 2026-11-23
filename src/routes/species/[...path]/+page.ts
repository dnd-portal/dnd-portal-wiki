import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

const ASSETS = 'https://assets.dnd-portal.com/data/content/species';
const knownSpecies = new Set(['human', 'elf']);

export type JsonContentBlock =
    | { type: 'paragraph'; text: string }
    | { type: 'list'; ordered?: boolean; items: string[] }
    | { type: 'table'; caption?: string; headers: string[]; rows: string[][] }
    | { type: 'callout'; title?: string; text: string };

export type JsonContentSection = {
    id: string;
    title: string;
    blocks: JsonContentBlock[];
};

export type SpeciesIndex = {
    id: string;
    slug: string;
    name: string;
    summary: string;
    editions: string[];
    defaultEdition: string;
    tags: string[];
};

export type SpeciesSource = {
    id: string;
    title: string;
    url: string;
    license: { id: string; url?: string; note?: string };
    attribution?: string;
};

export type SpeciesEdition = {
    id: string;
    contentId: string;
    edition: string;
    name: string;
    summary: string;
    article: { sections: JsonContentSection[] };
    sources: SpeciesSource[];
};

export type SpeciesFaqIndex = {
    id: string;
    edition: string;
    contentId: string;
    items: { id: string; file: string; includeInGlobalFaq: boolean }[];
};

export type SpeciesFaq = {
    id: string;
    slug: string;
    edition: string;
    contentId: string;
    question: string;
    shortAnswer: string;
    introduction: string;
    sourceIds: string[];
    sections: JsonContentSection[];
};

// Explicitly enumerate static routes. The data and articles are loaded from Assets.
export const entries = () => [
    { path: 'human' },
    { path: 'human/5e' },
    { path: 'elf' },
    { path: 'elf/5e' },
];

async function readJson<T>(fetcher: typeof fetch, relativePath: string): Promise<T> {
    const response = await fetcher(`${ASSETS}/${relativePath}`);
    if (!response.ok) error(502, `Unable to load species JSON: ${relativePath}`);
    return (await response.json()) as T;
}

export const load: PageLoad = async ({ params, fetch }) => {
    const parts = params.path.split('/').filter(Boolean);
    const species = parts[0];
    const explicitEdition = parts[1];

    if (
        !species ||
        !knownSpecies.has(species) ||
        parts.length > 2 ||
        (explicitEdition !== undefined && explicitEdition !== '5e')
    ) {
        error(404, 'Species not found');
    }

    const base = species;
    const index = await readJson<SpeciesIndex>(fetch, `${base}/index.json`);
    const edition = explicitEdition ?? index.defaultEdition;
    if (!index.editions.includes(edition)) error(404, 'Species edition not found');

    const [editionData, faqIndex] = await Promise.all([
        readJson<SpeciesEdition>(fetch, `${base}/editions/${edition}.json`),
        readJson<SpeciesFaqIndex>(fetch, `${base}/faq/${edition}.json`),
    ]);

    if (editionData.contentId !== index.id || editionData.edition !== edition) {
        error(502, 'Species edition metadata mismatch');
    }
    if (faqIndex.contentId !== index.id || faqIndex.edition !== edition) {
        error(502, 'Species FAQ index mismatch');
    }

    const faqs = await Promise.all(
        faqIndex.items.map(async ({ id, file }) => {
            const expectedPrefix = `./${edition}/`;
            if (
                !file.startsWith(expectedPrefix) ||
                !/^\.\/[a-z0-9.-]+\/[a-z0-9-]+\.json$/.test(file)
            ) {
                error(502, `Invalid FAQ reference: ${file}`);
            }
            const faq = await readJson<SpeciesFaq>(fetch, `${base}/faq/${file.slice(2)}`);
            if (faq.id !== id || faq.edition !== edition || faq.contentId !== index.id) {
                error(502, `Species FAQ metadata mismatch: ${file}`);
            }
            return faq;
        }),
    );

    return {
        species,
        edition,
        index,
        editionData,
        faqs,
        seo: {
            title: `${index.name} Species — D&D ${edition}`,
            description: editionData.summary,
            type: 'article' as const,
        },
    };
};
