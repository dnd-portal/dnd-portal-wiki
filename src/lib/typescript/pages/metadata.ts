import type {
    ImageGender,
    PageData,
    ResponsiveImageData,
} from '#lib/typescript/data/functions/Types/_index_.js';
import type { InlineContentBlock } from './content-types.js';
import type { SchemaPageKind } from './schema/types.js';

export type RouteIdentity = {
    readonly path: string;
    readonly href: string;
    readonly canonicalHref: string;
    readonly kind?: string;
};

export type NavigationMetadata = {
    readonly identity: RouteIdentity;
    readonly label: string;
    readonly parentPath?: string;
    readonly childPaths?: readonly string[];
    readonly hidden?: boolean;
    readonly iconSize?: 'default' | 'large';
    readonly image?: Pick<PageData['img'], 'href' | 'alt'>;
};

export type BreadcrumbMetadata = {
    readonly identity: RouteIdentity;
    readonly label: string;
};

export type CardMetadata = {
    readonly identity: RouteIdentity;
    readonly title: string;
    readonly description: string;
    readonly image?: Partial<Record<ImageGender, ResponsiveImageData>>;
    readonly tags?: readonly string[];
};

export type PageHeaderMetadata = {
    readonly identity: RouteIdentity;
    readonly title: string;
    readonly subtitle: string;
    readonly description: string | InlineContentBlock;
    readonly images?: PageData['images'];
    readonly sections?: PageData['header'] extends infer Header
        ? Header extends { sections?: infer Sections }
            ? Sections
            : never
        : never;
    readonly sourceMetadata?: PageData['sourceMetadata'];
};

export type RouteSeoMetadata = {
    readonly identity: RouteIdentity;
    readonly title: string;
    readonly description: string;
    readonly canonicalUrl: string;
    readonly image?: Pick<PageData['img'], 'href' | 'alt'>;
    readonly schemaKind?: SchemaPageKind;
    readonly breadcrumbs: readonly BreadcrumbMetadata[];
};

export type RoutePageData = {
    readonly identity: RouteIdentity;
    readonly page: PageData;
    readonly header: PageHeaderMetadata;
    readonly seo: RouteSeoMetadata;
    readonly breadcrumbs: readonly BreadcrumbMetadata[];
};

export type RoutePageMetadata = Omit<RoutePageData, 'page'>;
