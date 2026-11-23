import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

const ASSETS = 'https://assets.dnd-portal.com/data/content/species';
const availableSpecies = ['human', 'elf'] as const;

type SpeciesIndex = {
    id: string;
    slug: string;
    name: string;
    summary: string;
    editions: string[];
    defaultEdition: string;
};

export const load: PageLoad = async ({ fetch }) => {
    const species = await Promise.all(
        availableSpecies.map(async (slug): Promise<SpeciesIndex> => {
            const response = await fetch(`${ASSETS}/${slug}/index.json`);
            if (!response.ok)
                error(502, `Unable to load ${slug} species metadata from D&D Portal Assets`);
            return (await response.json()) as SpeciesIndex;
        }),
    );
    return { species };
};
