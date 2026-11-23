import type { SchemaEntity, SchemaGraph, SchemaPageInput } from './types.js';

const schemaContext = 'https://schema.org' as const;

function entityType(kind: SchemaPageInput['kind']): string | null {
    switch (kind) {
        case 'collection':
            return 'CollectionPage';
        case 'article':
            return 'Article';
        case 'creativeWork':
            return 'CreativeWork';
        case 'about':
            return 'AboutPage';
        case 'searchResults':
            return 'SearchResultsPage';
        case 'softwareApplication':
            return 'SoftwareApplication';
        default:
            return null;
    }
}

export function createSchemaGraph(input: SchemaPageInput): SchemaGraph {
    const webpageId = `${input.canonicalUrl}#webpage`;
    const breadcrumbId = `${input.canonicalUrl}#breadcrumb`;
    const pageType = entityType(input.kind);
    const graph: SchemaEntity[] = [
        {
            '@type': input.kind === 'collection' ? ['CollectionPage', 'WebPage'] : 'WebPage',
            '@id': webpageId,
            url: input.canonicalUrl,
            name: input.title,
            description: input.description,
            ...(input.imageUrl
                ? { primaryImageOfPage: { '@type': 'ImageObject', url: input.imageUrl } }
                : {}),
            ...(input.breadcrumbs?.length ? { breadcrumb: { '@id': breadcrumbId } } : {}),
        },
    ];

    if (input.canonicalUrl === new URL('/', input.canonicalUrl).href) {
        graph.unshift({
            '@type': 'WebSite',
            '@id': `${input.canonicalUrl}#website`,
            url: input.canonicalUrl,
            name: input.title,
            description: input.description,
        });
    }

    if (pageType && pageType !== 'WebPage' && pageType !== 'CollectionPage') {
        const entityId = `${input.canonicalUrl}#${input.kind}`;
        graph.push({
            '@type': pageType,
            '@id': entityId,
            name: input.title,
            description: input.description,
            ...(input.canonicalUrl !== `${input.canonicalUrl}#${input.kind}`
                ? { mainEntityOfPage: { '@id': webpageId } }
                : {}),
        });
    }

    if (input.breadcrumbs && input.breadcrumbs.length > 1) {
        graph.push({
            '@type': 'BreadcrumbList',
            '@id': breadcrumbId,
            itemListElement: input.breadcrumbs.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: item.url,
            })),
        });
    }

    return { '@context': schemaContext, '@graph': graph };
}

export function serializeSchemaGraph(graph: SchemaGraph): string {
    return JSON.stringify(graph).replace(/</g, '\\u003c');
}

export type { SchemaEntity, SchemaGraph, SchemaPageInput, SchemaPageKind } from './types.js';
