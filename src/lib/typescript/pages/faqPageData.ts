import { faq, getFaqGroup, getFaqQuestion } from '#lib/typescript/data/internals/faq.js';
import type { FaqGroup, FaqQuestion } from '#lib/typescript/data/internals/faq.js';

export type FaqRelatedQuestion = Pick<FaqQuestion, 'slug' | 'question'> & {
    readonly shortAnswer?: FaqQuestion['shortAnswer'];
};

export type FaqPageGroup = Pick<FaqGroup, 'slug' | 'title' | 'sourcePage'> & {
    readonly questions: readonly FaqRelatedQuestion[];
};

export type FaqPageData = {
    readonly group: FaqPageGroup;
    readonly question: FaqQuestion | null;
};

export function getFaqPageEntries() {
    const groups = Object.values(faq) as readonly Record<string, { href: string }>[];

    return groups.flatMap((group) =>
        Object.values(group).map((page) => ({
            page: page.href.replace(/^\/faq\//, '').replace(/\/$/, ''),
        })),
    );
}

export function resolveFaqPageData(slug: string): FaqPageData | null {
    const segments = slug.split('/').filter(Boolean);
    const groupSlug = segments[0] ?? '';
    const group = getFaqGroup(groupSlug);

    if (!group || segments.length > 2) return null;

    const questionSlug = segments[1];
    const question = questionSlug ? getFaqQuestion(group.slug, questionSlug) : null;

    if (questionSlug && !question) return null;

    const questions = group.questions.map(({ slug, question, shortAnswer }) => ({
        slug,
        question,
        ...(questionSlug ? {} : { shortAnswer }),
    }));

    return {
        group: {
            slug: group.slug,
            title: group.title,
            sourcePage: group.sourcePage,
            questions,
        },
        question,
    };
}
