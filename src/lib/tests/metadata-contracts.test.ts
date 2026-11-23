import { describe, expect, it } from 'vitest';
import type {
    BreadcrumbMetadata,
    CardMetadata,
    NavigationMetadata,
    PageHeaderMetadata,
    RouteIdentity,
    RouteSeoMetadata,
    RoutePageData,
} from '#lib/typescript/pages/metadata.js';

const identity: RouteIdentity = {
    path: 'internals.website.homepage',
    href: '/',
    canonicalHref: '/',
};

describe('runtime metadata contracts', () => {
    it('keeps the contract categories independently constructible', () => {
        const navigation: NavigationMetadata = { identity, label: 'Home' };
        const breadcrumb: BreadcrumbMetadata = { identity, label: 'Home' };
        const card: CardMetadata = { identity, title: 'Home', description: 'Homepage' };
        const header: PageHeaderMetadata = {
            identity,
            title: 'Home',
            subtitle: 'D&D Portal Wiki',
            description: 'Homepage',
        };
        const seo: RouteSeoMetadata = {
            identity,
            title: 'Home',
            description: 'Homepage',
            canonicalUrl: 'https://dnd-portal.com/',
            breadcrumbs: [breadcrumb],
        };

        expect({ navigation, breadcrumb, card, header, seo }).toMatchObject({
            navigation: { label: 'Home' },
            breadcrumb: { label: 'Home' },
            card: { title: 'Home' },
            header: { subtitle: 'D&D Portal Wiki' },
            seo: { canonicalUrl: 'https://dnd-portal.com/' },
        });
    });

    it('does not require full page content for navigation or card metadata', () => {
        const navigation: NavigationMetadata = { identity, label: 'Home' };
        const card: CardMetadata = { identity, title: 'Home', description: 'Homepage' };

        expect(navigation).not.toHaveProperty('campaignNotes');
        expect(card).not.toHaveProperty('header');
        expect(card).not.toHaveProperty('sourceMetadata');
    });

    it('supports a route-owned page-data boundary', () => {
        const faqIdentity: RouteIdentity = {
            path: 'internals.faq.acidSplash5e.page',
            href: '/faq/acid-splash-5e/',
            canonicalHref: '/faq/acid-splash-5e/',
        };
        const routeData: RoutePageData = {
            identity: faqIdentity,
            page: {
                external: false,
                href: '/faq/acid-splash-5e/',
                img: { href: '/icons/faq.svg', alt: 'FAQ' },
                title: 'Acid Splash 5e FAQ',
                subTitle: 'FAQ',
                description: 'Frequently asked questions.',
            },
            header: {
                identity: faqIdentity,
                title: 'Acid Splash 5e FAQ',
                subtitle: 'FAQ',
                description: 'Frequently asked questions.',
            },
            seo: {
                identity: faqIdentity,
                title: 'Acid Splash 5e FAQ',
                description: 'Frequently asked questions.',
                canonicalUrl: 'https://dnd-portal.com/faq/acid-splash-5e/',
                breadcrumbs: [],
            },
            breadcrumbs: [],
        };

        expect(routeData.identity.href).toBe('/faq/acid-splash-5e/');
        expect(routeData.header.title).toBe(routeData.seo.title);
    });
});
