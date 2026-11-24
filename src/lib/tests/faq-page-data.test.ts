import { describe, expect, it } from 'vitest';
import { getFaqPageEntries, resolveFaqPageData } from '#lib/typescript/pages/faqPageData.js';

describe('FAQ route page data', () => {
    it('resolves complete article content with related-question metadata', () => {
        const data = resolveFaqPageData('barbarian/what-is-barbarian-in-dnd');

        expect(data?.group.slug).toBe('barbarian');
        expect(data?.question?.slug).toBe('what-is-barbarian-in-dnd');
        expect(data?.question?.fullAnswer.introduction).toBeTruthy();
        expect(data?.question?.fullAnswer.sections.length).toBeGreaterThan(0);
        expect(data?.group.questions.every((question) => question.slug && question.question)).toBe(
            true,
        );
        expect(data?.group.questions.every((question) => question.shortAnswer === undefined)).toBe(
            true,
        );
    });

    it('returns group data for FAQ index routes', () => {
        const data = resolveFaqPageData('barbarian');

        expect(data?.question).toBeNull();
        expect(data?.group.questions.length).toBeGreaterThan(1);
        expect(data?.group.questions.every((question) => question.shortAnswer)).toBe(true);
    });

    it('rejects unknown or malformed routes', () => {
        expect(resolveFaqPageData('missing-group')).toBeNull();
        expect(resolveFaqPageData('barbarian/missing-question')).toBeNull();
        expect(resolveFaqPageData('barbarian/one/two')).toBeNull();
    });

    it('generates entries from the canonical FAQ registry', () => {
        expect(getFaqPageEntries().length).toBeGreaterThan(400);
    });
});
