import type { SeoMetadataInput } from '#lib/typescript/pages/seo.js';

export function load() {
    return {
        seo: { schemaKind: 'collection' as const },
    } satisfies { seo: { schemaKind: SeoMetadataInput['schemaKind'] } };
}
