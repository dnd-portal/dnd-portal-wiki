import { describe, expect, it } from 'vitest';
import { createSchemaGraph, serializeSchemaGraph } from '#lib/typescript/pages/schema/index.js';

describe('Schema.org structured data', () => {
    it('creates one connected homepage graph without an invented publisher', () => {
        const graph = createSchemaGraph({
            canonicalUrl: 'https://dnd-portal.com/',
            title: 'D&D Portal Wiki',
            description: 'A D&D reference site.',
        });

        expect(graph['@graph'].map((item) => item['@type'])).toEqual(['WebSite', 'WebPage']);
        expect(graph['@graph'].some((item) => 'publisher' in item)).toBe(false);
        expect(serializeSchemaGraph(graph)).not.toContain('</script>');
    });

    it('creates stable article and breadcrumb identifiers from the canonical URL', () => {
        const graph = createSchemaGraph({
            canonicalUrl: 'https://dnd-portal.com/classes/wizard/',
            title: 'Wizard Class - D&D Portal Wiki',
            description: 'Wizard class reference.',
            kind: 'article',
            breadcrumbs: [
                { name: 'Home', url: 'https://dnd-portal.com/' },
                { name: 'Classes', url: 'https://dnd-portal.com/classes/' },
                { name: 'Wizard', url: 'https://dnd-portal.com/classes/wizard/' },
            ],
        });

        expect(graph['@graph']).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    '@type': 'Article',
                    '@id': 'https://dnd-portal.com/classes/wizard/#article',
                    mainEntityOfPage: { '@id': 'https://dnd-portal.com/classes/wizard/#webpage' },
                }),
                expect.objectContaining({
                    '@type': 'BreadcrumbList',
                    '@id': 'https://dnd-portal.com/classes/wizard/#breadcrumb',
                }),
            ]),
        );
    });

    it('models collections as a WebPage subtype without a duplicate WebPage entity', () => {
        const graph = createSchemaGraph({
            canonicalUrl: 'https://dnd-portal.com/classes/',
            title: 'Classes - D&D Portal Wiki',
            description: 'D&D classes.',
            kind: 'collection',
        });

        expect(graph['@graph']).toHaveLength(1);
        expect(graph['@graph'][0]['@type']).toEqual(['CollectionPage', 'WebPage']);
    });

    it('adds the dynamic spell hierarchy when the canonical page has no registry path', () => {
        const graph = createSchemaGraph({
            canonicalUrl: 'https://dnd-portal.com/spells/magic-missile/',
            title: 'Magic Missile - D&D Portal Wiki',
            description: 'Magic Missile spell reference.',
            kind: 'creativeWork',
            breadcrumbs: [
                { name: 'Spells', url: 'https://dnd-portal.com/spells/' },
                { name: '1st Level', url: 'https://dnd-portal.com/spells/1st-level/' },
                {
                    name: 'Magic Missile',
                    url: 'https://dnd-portal.com/spells/magic-missile/',
                },
            ],
        });

        expect(graph['@graph']).toEqual(
            expect.arrayContaining([expect.objectContaining({ '@type': 'BreadcrumbList' })]),
        );
    });

    it('does not emit a page-specific entity when no page kind is supplied', () => {
        const graph = createSchemaGraph({
            canonicalUrl: 'https://dnd-portal.com/faq/',
            title: 'FAQ - D&D Portal Wiki',
            description: 'Frequently asked questions.',
        });

        expect(graph['@graph'].map((item) => item['@type'])).toEqual(['WebPage']);
    });
});
