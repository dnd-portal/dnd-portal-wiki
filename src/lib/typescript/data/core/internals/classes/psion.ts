const logos = {
    simple: {
        href: '/icons/white/game/character.svg',
        alt: 'A stylized character icon representing the Psion class.',
    },
} as const;

export const psion = {
    name: { normal: 'Psion', slug: 'psion' },
    logos,
    subclasses: {
        awakenedMind: {
            name: { normal: 'Awakened Mind', short: 'Awakened Mind', slug: 'awakened-mind' },
            logos,
        },
        unleashedMind: {
            name: { normal: 'Unleashed Mind', short: 'Unleashed Mind', slug: 'unleashed-mind' },
            logos,
        },
        transcendedMind: {
            name: {
                normal: 'Transcended Mind',
                short: 'Transcended Mind',
                slug: 'transcended-mind',
            },
            logos,
        },
        shapersMind: {
            name: { normal: "Shaper's Mind", short: "Shaper's Mind", slug: 'shapers-mind' },
            logos,
        },
        wanderingMind: {
            name: { normal: 'Wandering Mind', short: 'Wandering Mind', slug: 'wandering-mind' },
            logos,
        },
        consumingMind: {
            name: { normal: 'Consuming Mind', short: 'Consuming Mind', slug: 'consuming-mind' },
            logos,
        },
    },
} as const;
