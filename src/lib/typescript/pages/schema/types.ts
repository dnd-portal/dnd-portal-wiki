export type SchemaPageKind =
    'collection' | 'article' | 'creativeWork' | 'about' | 'searchResults' | 'softwareApplication';

export type SchemaBreadcrumb = {
    readonly name: string;
    readonly url: string;
};

export type SchemaPageInput = {
    readonly canonicalUrl: string;
    readonly title: string;
    readonly description: string;
    readonly kind?: SchemaPageKind;
    readonly imageUrl?: string;
    readonly breadcrumbs?: readonly SchemaBreadcrumb[];
};

export type SchemaEntity = {
    readonly '@type': string | readonly string[];
    readonly '@id'?: string;
    readonly [key: string]: unknown;
};

export type SchemaGraph = {
    readonly '@context': 'https://schema.org';
    readonly '@graph': readonly SchemaEntity[];
};
