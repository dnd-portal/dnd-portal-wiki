import { getData, type PageData, type PagePath } from '#lib/typescript/data/_index_.js';
import { getBreadcrumbItems, getPageLabel } from '#lib/typescript/pages/currentPage.js';
import type { SeoMetadataInput } from '#lib/typescript/pages/seo.js';
import type {
    BreadcrumbMetadata,
    RoutePageData,
    RouteSeoMetadata,
} from '#lib/typescript/pages/metadata.js';

const migratedSlug = 'acid-splash-5e';
const migratedPath = 'internals.faq.acidSplash5e.page' as PagePath;

function createRoutePageData(page: PageData): RoutePageData {
    const identity = {
        path: migratedPath,
        href: page.href,
        canonicalHref: page.href,
    };
    const breadcrumbs: readonly BreadcrumbMetadata[] = getBreadcrumbItems(migratedPath).map(
        (item) => ({
            identity: {
                path: item.path ?? item.key,
                href: item.path ? (getData(item.path) as PageData).href : item.key,
                canonicalHref: item.path ? (getData(item.path) as PageData).href : item.key,
            },
            label: item.label,
        }),
    );
    const title = getPageLabel(migratedPath);
    const description = page.descriptions?.long ?? page.description;

    return {
        identity,
        page,
        breadcrumbs,
        header: {
            identity,
            title,
            subtitle: page.subTitle,
            description,
            images: page.images,
            sections: page.header?.sections,
            sourceMetadata: page.sourceMetadata,
        },
        seo: {
            identity,
            title: page.seoTitle ?? page.title,
            description: page.descriptions?.medium ?? page.descriptions?.short ?? page.description,
            canonicalUrl: new URL(page.href, 'https://dnd-portal.com').href,
            image: page.img,
            breadcrumbs,
        } satisfies RouteSeoMetadata,
    };
}

export function load({ params }: { params: { page?: string } }) {
    if (params.page !== migratedSlug) {
        return { routePageData: null };
    }

    const routePageData = createRoutePageData(getData(migratedPath) as PageData);

    return {
        routePageData,
        seo: routePageData.seo satisfies SeoMetadataInput,
    } satisfies { routePageData: RoutePageData; seo: SeoMetadataInput };
}
