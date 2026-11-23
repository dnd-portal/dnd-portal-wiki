import type { PageServerLoad } from './$types';
import { getBreadcrumbItems, getPageLabel } from '#lib/typescript/pages/currentPage.js';
import { getData, type PageData, type PagePath } from '#lib/typescript/data/_index_.js';
import type { RoutePageData } from '#lib/typescript/pages/metadata.js';

const classLoaders = {
    artificer: () =>
        import('#lib/typescript/data/internals/classes/artificer/_index_.js').then(
            (module) => module.artificer,
        ),
    barbarian: () =>
        import('#lib/typescript/data/internals/classes/barbarian/_index_.js').then(
            (module) => module.barbarian,
        ),
    bard: () =>
        import('#lib/typescript/data/internals/classes/bard/_index_.js').then(
            (module) => module.bard,
        ),
    cleric: () =>
        import('#lib/typescript/data/internals/classes/cleric/_index_.js').then(
            (module) => module.cleric,
        ),
    druid: () =>
        import('#lib/typescript/data/internals/classes/druid/_index_.js').then(
            (module) => module.druid,
        ),
    fighter: () =>
        import('#lib/typescript/data/internals/classes/fighter/_index_.js').then(
            (module) => module.fighter,
        ),
    monk: () =>
        import('#lib/typescript/data/internals/classes/monk/_index_.js').then(
            (module) => module.monk,
        ),
    paladin: () =>
        import('#lib/typescript/data/internals/classes/paladin/_index_.js').then(
            (module) => module.paladin,
        ),
    ranger: () =>
        import('#lib/typescript/data/internals/classes/ranger/_index_.js').then(
            (module) => module.ranger,
        ),
    rogue: () =>
        import('#lib/typescript/data/internals/classes/rogue/_index_.js').then(
            (module) => module.rogue,
        ),
    sorcerer: () =>
        import('#lib/typescript/data/internals/classes/sorcerer/_index_.js').then(
            (module) => module.sorcerer,
        ),
    warlock: () =>
        import('#lib/typescript/data/internals/classes/warlock/_index_.js').then(
            (module) => module.warlock,
        ),
    wizard: () =>
        import('#lib/typescript/data/internals/classes/wizard/_index_.js').then(
            (module) => module.wizard,
        ),
    psion: () =>
        import('#lib/typescript/data/internals/classes/psion/_index_.js').then(
            (module) => module.psion,
        ),
    'blood-hunter': () =>
        import('#lib/typescript/data/internals/classes/blood-hunter/_index_.js').then(
            (module) => module.bloodHunter,
        ),
    captain: () =>
        import('#lib/typescript/data/internals/classes/captain/_index_.js').then(
            (module) => module.captain,
        ),
    champion: () =>
        import('#lib/typescript/data/internals/classes/champion/_index_.js').then(
            (module) => module.champion,
        ),
    gunslinger: () =>
        import('#lib/typescript/data/internals/classes/gunslinger/_index_.js').then(
            (module) => module.gunslinger,
        ),
    illrigger: () =>
        import('#lib/typescript/data/internals/classes/illrigger/_index_.js').then(
            (module) => module.illrigger,
        ),
    messenger: () =>
        import('#lib/typescript/data/internals/classes/messenger/_index_.js').then(
            (module) => module.messenger,
        ),
    'monster-hunter': () =>
        import('#lib/typescript/data/internals/classes/monster-hunter/_index_.js').then(
            (module) => module.monsterHunter,
        ),
    mournbound: () =>
        import('#lib/typescript/data/internals/classes/mournbound/_index_.js').then(
            (module) => module.mournbound,
        ),
    pugilist: () =>
        import('#lib/typescript/data/internals/classes/pugilist/_index_.js').then(
            (module) => module.pugilist,
        ),
    scholar: () =>
        import('#lib/typescript/data/internals/classes/scholar/_index_.js').then(
            (module) => module.scholar,
        ),
    shinobi: () =>
        import('#lib/typescript/data/internals/classes/shinobi/_index_.js').then(
            (module) => module.shinobi,
        ),
    'treasure-hunter': () =>
        import('#lib/typescript/data/internals/classes/treasure-hunter/_index_.js').then(
            (module) => module.treasureHunter,
        ),
    vampyr: () =>
        import('#lib/typescript/data/internals/classes/vampyr/_index_.js').then(
            (module) => module.vampyr,
        ),
    vanguard: () =>
        import('#lib/typescript/data/internals/classes/vanguard/_index_.js').then(
            (module) => module.vanguard,
        ),
    warden: () =>
        import('#lib/typescript/data/internals/classes/warden/_index_.js').then(
            (module) => module.warden,
        ),
} as const;

const classSlugs = new Set(Object.keys(classLoaders));
const editionSuffixes = [
    ['3-5e', '3.5e'],
    ['5e', '5e'],
    ['4e', '4e'],
    ['3e', '3e'],
    ['2e', '2e'],
    ['1e', '1e'],
] as const;

export const load: PageServerLoad = async ({ params }) => {
    const routeSlug = params.class ?? '';
    const overviewEdition = editionSuffixes.find(([suffix]) => routeSlug === suffix)?.[1] ?? null;
    if (overviewEdition)
        return {
            classData: null,
            pageContent: null,
            resolvedRoute: null,
            overviewEdition,
        };
    const loader = classLoaders[routeSlug as keyof typeof classLoaders];

    if (loader) {
        const classData = await loader();
        const defaultEdition =
            'availableEditions' in classData && !classData.availableEditions.includes('5.5e')
                ? classData.availableEditions[0]
                : ('5.5e' as const);
        const pageContent =
            routeSlug === 'barbarian'
                ? (
                      await import('#lib/typescript/data/internals/classes/edition-content.js')
                  ).createCurrentBarbarianContent()
                : classData.content;
        const routePageData =
            routeSlug === 'wizard'
                ? createClassRoutePageData(classData.page as PageData)
                : undefined;
        return {
            classData,
            pageContent,
            resolvedRoute: { baseClassSlug: routeSlug, edition: defaultEdition },
            canonicalClassRoute: true,
            ...(routePageData ? { routePageData } : {}),
        };
    }

    const editionMatch = editionSuffixes.find(([suffix]) => routeSlug.endsWith(`-${suffix}`));
    const baseClassSlug = editionMatch
        ? routeSlug.slice(0, -(editionMatch[0].length + 1))
        : routeSlug;
    if (!editionMatch || !classSlugs.has(baseClassSlug)) {
        return { classData: null, pageContent: null, resolvedRoute: null };
    }

    const classData = await classLoaders[baseClassSlug as keyof typeof classLoaders]?.();
    const editionData = (
        await import('#lib/typescript/data/internals/classes/edition-data.js')
    ).getClassEditionData(baseClassSlug, editionMatch[1]);
    const pageContent = editionData
        ? (
              await import('#lib/typescript/data/internals/classes/edition-content.js')
          ).createClassEditionContent(editionData)
        : (classData?.content ?? null);

    return {
        classData,
        pageContent,
        resolvedRoute: { baseClassSlug, edition: editionMatch[1] },
        editionData,
    };
};

function createClassRoutePageData(page: PageData): RoutePageData {
    const path = 'internals.classes.wizard.page' as PagePath;
    const identity = { path, href: page.href, canonicalHref: page.href };
    const breadcrumbs = getBreadcrumbItems(path).map((item) => ({
        identity: {
            path: item.path ?? item.key,
            href: item.path ? (getData(item.path) as PageData).href : item.key,
            canonicalHref: item.path ? (getData(item.path) as PageData).href : item.key,
        },
        label: item.label,
    }));
    const title = getPageLabel(path);
    const description = page.descriptions?.long ?? page.description;
    const seoDescription =
        page.descriptions?.medium ?? page.descriptions?.short ?? page.description;
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
            description: seoDescription,
            canonicalUrl: new URL(page.href, 'https://dnd-portal.com').href,
            image: page.img,
            breadcrumbs,
        },
    };
}
