/*
	Location: src/routes/spells/[page]/+page.ts
	Use: Static prerender entries for spell list and spell detail routes.
*/
import {
    spells,
    spellLevels,
} from '#lib/typescript/data/internals/rules/spellcasting/spells/spell-data.js';
import { createSpellSeoMetadata } from '#lib/typescript/pages/seo.js';
import type { RoutePageMetadata } from '#lib/typescript/pages/metadata.js';
import { redirect } from '@sveltejs/kit';

export function entries() {
    return [
        { page: 'spellcasting' },
        ...spellLevels.map((level) => ({ page: level.slug })),
        ...spells.map((spell) => ({ page: spell.slug })),
    ];
}

export function load({ params, url }) {
    if (params.page === 'acid-splash') {
        const edition = url.searchParams.get('edition');
        const destination =
            edition && ['1e', '2e', '3e', '3-5e', '4e', '5e'].includes(edition)
                ? `/spells/acid-splash/${edition}/`
                : '/spells/acid-splash/';
        throw redirect(308, destination);
    }
    const spell = spells.find((item) => item.slug === params.page);

    if (!spell) {
        return {};
    }

    const seo = { ...createSpellSeoMetadata(spell), schemaKind: 'creativeWork' as const };
    if (spell.slug !== 'fireball') return { seo };

    const href = `/spells/${spell.slug}/`;
    const identity = { path: href, href, canonicalHref: href };
    const routeMetadata: RoutePageMetadata = {
        identity,
        header: {
            identity,
            title: spell.name,
            subtitle: `${spell.levelLabel} ${spell.school}`,
            description: spell.description[0] ?? '',
        },
        seo: {
            identity,
            title: seo.title ?? spell.name,
            description: seo.description ?? '',
            canonicalUrl: new URL(href, 'https://dnd-portal.com').href,
            breadcrumbs: [],
        },
        breadcrumbs: [],
    };

    return { seo, routeMetadata };
}
