import * as core from '#lib/typescript/data/core/_index_.js';
import { createBasicClass, text } from '../_basic-class.js';
import type { PageContentSection, ProgressionData } from '#lib/typescript/pages/content-types.js';
import { psionSubclasses } from './subclasses.js';
import { psionDisciplines } from './disciplines.js';
import { psionSpellListGroups } from './spell-list.js';

const feature = (title: string, level: number, description: string): PageContentSection => ({
    id: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    title,
    subtitle: `Level ${level}`,
    blocks: [{ type: 'paragraph', content: [text(description)] }],
});

const features = [
    feature(
        'Psionic Archetype',
        1,
        "At 1st level, you pick the archetype of psion you embody, choosing from Awakened Mind, Unleashed Mind, Transcended Mind, Shaper's Mind, Wandering Mind, Elemental Mind, or Consuming Mind. Your choice grants you features at 1st level, and again at 3rd, 6th, 10th, and 14th level.",
    ),
    feature(
        'Psionics',
        1,
        'You are granted access to a psionic discipline by your chosen archetype. A discipline comes with a passive feature, an active psionic power that can be modified and empowered with psi points, and applications that recreate certain spells listed with the discipline. At 3rd level you can select a second discipline, and at 18th level you can select a third discipline. Psionic powers are suppressed by antimagic fields and can be dispelled with dispel magic, but are only affected by counterspell if recreating the effect of a spell. Checks to dispel magic, counterspell, or identify a spell being cast with psionics are made with disadvantage unless the caster also has the Psionics feature. Detect magic detects the usage of psionics, but not its nature. When recreating a spell through a psionic effect, the spell has no material or verbal components; using any psionic ability requires somatic components and causes the psion to vibrantly glow with otherworldly psionic energies.',
    ),
    feature(
        'Psi Points',
        1,
        'Starting at 1st level, you gain access to psi points used to fuel psionic discipline powers and effects. You have a number of psi points equal to your psion level, and you regain all spent points when you finish a short or long rest. You can spend a number of psi points equal to half your psion level, rounded up, at a time.',
    ),
    feature(
        'Psionic Ability',
        1,
        'Psionic powers, Psionic Talents, and spells gained through this class use your psionic ability. Psionic ability save DC = 8 + your proficiency bonus + your Intelligence modifier. Psionic ability attack modifier = your proficiency bonus + your Intelligence modifier.',
    ),
    feature(
        'Psionic Talents',
        2,
        'Starting at 2nd level, you gain access to a psionic talent allowing you to further specialize. Pick two talents from the list of psionic talents presented at the end of the class description. You can pick a new psionic talent at 5th, 7th, 9th, 12th, 15th, and 18th level. When you level up, you can replace a psionic talent you have previously selected with a different one.',
    ),
    feature(
        'Secondary Discipline',
        3,
        'When you reach 3rd level, you can select a second psionic discipline from the list of psionic disciplines. You cannot select a Discipline you already know. You gain all features of a psionic discipline when selecting it.',
    ),
    feature(
        'Ability Score Improvement',
        4,
        'When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you cannot increase an ability score above 20 using this feature.',
    ),
    feature(
        'Psionic Mastery',
        5,
        'When you reach 5th level, you gain mastery of your psionic powers. At the start of your turn you get 1 free psi point. This can be spent to empower psionic disciplines, but not to recreate spells or fuel Psionic Talents. If you have any unspent free psi points granted by this feature left at the end of your turn, they are lost. At 11th level this increases to 2 free psi points, and at 17th level to 3. Points can be split between different abilities.',
    ),
    feature(
        'Innate Psionics',
        11,
        'At 11th level, choose one 6th-level spell from the Psion Spell List as an innate ability. You can use this innate ability to cast that spell once, and must finish a long rest before you can do so again. At 13th, 15th, and 17th level, you gain one 7th-, 8th-, and 9th-level spell respectively. You regain all uses of Innate Psionics when you finish a long rest. These abilities are not restricted by your disciplines and require any component the spell requires. The complete list and its level restrictions appear in the Psion Spell List section below.',
    ),
    feature(
        'Third Discipline',
        18,
        'When you reach 18th level, you can select a third psionic discipline from the list of psionic disciplines. You cannot select a discipline you already know. You gain all features of a psionic discipline when selecting it.',
    ),
    feature(
        'Ascension',
        20,
        'Starting at 20th level, if you die you can choose to become an incorporeal entity on the Border Ethereal at the spot you died in the Material Plane at the start of your next turn. This entity has the physical ability scores and abilities of a ghost, but has your mental ability scores and your psion class abilities. When you take this form your current and maximum hit points become that of the ghost. If you have less than 10 psi points when you would assume this form, you have 10 psi points. While in this form you cannot rest to regain spent abilities. If you exhaust all psi points or the ghost is destroyed, you die as a normal creature would.',
    ),
] as const;

const progression: ProgressionData<string> = {
    title: 'The Psion',
    heading: 'The Psion',
    columns: [
        { key: 'level', label: 'Level', format: 'ordinal' },
        { key: 'proficiencyBonus', label: 'Proficiency Bonus', shortLabel: 'PB', format: 'signed' },
        { key: 'psiPoints', label: 'Psi Points' },
        { key: 'psiLimit', label: 'Psi Limit' },
        { key: 'features', label: 'Features' },
        { key: 'talentsKnown', label: 'Psionic Talents' },
    ],
    rows: (
        [
            [1, 2, 1, 1, ['Psionic Archetype', 'Psionics'], 0],
            [2, 2, 2, 1, ['Psionic Talents'], 2],
            [3, 2, 3, 2, ['Secondary Discipline', 'Psionic Archetype feature'], 2],
            [4, 2, 4, 2, ['Ability Score Improvement'], 2],
            [5, 3, 5, 3, ['Psionic Mastery'], 3],
            [6, 3, 6, 3, ['Psionic Archetype feature'], 3],
            [7, 3, 7, 4, [], 4],
            [8, 3, 8, 4, ['Ability Score Improvement'], 4],
            [9, 4, 9, 5, [], 5],
            [10, 4, 10, 5, ['Psionic Archetype feature'], 5],
            [11, 4, 11, 6, ['Innate Psionic Ability (6th level)'], 5],
            [12, 4, 12, 6, ['Ability Score Improvement'], 6],
            [13, 5, 13, 7, ['Innate Psionic Ability (7th level)'], 6],
            [14, 5, 14, 7, ['Psionic Archetype feature'], 6],
            [15, 5, 15, 8, ['Innate Psionic Ability (8th level)'], 7],
            [16, 5, 16, 8, ['Ability Score Improvement'], 7],
            [17, 6, 17, 9, ['Innate Psionic Ability (9th level)'], 7],
            [18, 6, 18, 9, ['Third Discipline'], 8],
            [19, 6, 19, 10, ['Ability Score Improvement'], 8],
            [20, 6, 20, 10, ['Ascension'], 8],
        ] as readonly [number, number, number, number, readonly string[], number][]
    ).map(([level, pb, psiPoints, psiLimit, labels, talentsKnown]) => ({
        level,
        proficiencyBonus: pb,
        features: labels.map((label) => ({
            label,
            sectionId: features.find((item) => item.title === label)?.id,
        })),
        values: { psiPoints, psiLimit, talentsKnown },
    })),
};

const base = createBasicClass({
    name: 'Psion',
    slug: 'psion',
    role: 'Homebrew class - 5e (2014)',
    source: 'Homebrew - Psion 1.5.3',
    primaryAbility: [text('Intelligence')],
    multiclassing: [text('Intelligence 13 or higher')],
    hitDie: '1d6',
    armor: [text('Light armor')],
    weapons: [text('Simple weapons')],
    tools: [text('None')],
    savingThrows: [text('Intelligence, Wisdom')],
    skills: [
        text(
            'Psionics; choose two from Deception, History, Insight, Intimidation, Investigation, Medicine, Perception, or Religion.',
        ),
    ],
    description:
        'A homebrew psionic class for D&D 5e (2014), using Intelligence to shape disciplines, psi points, and mental powers.',
    longDescription: [
        [
            text(
                'Psions are those who have tapped into a special otherworldly force, with the ability to actualize the power of their mind to accomplish impossible feats.',
            ),
        ],
        [
            text(
                'The Psion is a homebrew class for D&D 5e (2014). The base class page links to the implemented archetypes, disciplines, talents, feats, fusion talents, and Psion Spell List.',
            ),
        ],
    ],
    startingEquipment: [
        {
            label: 'Weapons',
            instruction: 'Choose one',
            choices: [
                [text('a quarterstaff')],
                [text('a dagger')],
                [text('a martial weapon, if proficient')],
            ],
        },
        {
            label: 'Armor',
            instruction: 'Choose one',
            choices: [[text('leather armor')], [text('scale mail, if proficient')]],
        },
        {
            label: 'Pack',
            instruction: 'Choose one',
            choices: [[text('a scholar’s pack')], [text('an explorer’s pack')]],
        },
    ],
    features: features.map((item) => ({
        level: Number(item.subtitle?.replace('Level ', '')),
        title: item.title,
        description: item.blocks[0].type === 'paragraph' ? item.blocks[0].content : [text('')],
    })),
    tags: ['homebrew', '2014', 'psionics'],
    hasImages: false,
});

export const edition = '5e' as const;
export const availableEditions = ['5e'] as const;

const subclasses: PageContentSection = {
    id: 'subclasses',
    title: 'Psionic Archetypes and Disciplines',
    blocks: [
        {
            type: 'paragraph',
            content: [
                text('At 1st level, choose one Psionic Archetype: '),
                ...[
                    'awakenedMind',
                    'unleashedMind',
                    'transcendedMind',
                    'shapersMind',
                    'wanderingMind',
                    'elementalMind',
                    'consumingMind',
                ].flatMap((key, index) => {
                    const names = [
                        'Awakened Mind',
                        'Unleashed Mind',
                        'Transcended Mind',
                        'Shaper’s Mind',
                        'Wandering Mind',
                        'Elemental Mind',
                        'Consuming Mind',
                    ];
                    return [
                        {
                            type: 'link' as const,
                            path: `internals.classes.psion.subclasses.${key}`,
                            label: names[index],
                        },
                        ...(index < 6 ? [text(', ')] : []),
                    ];
                }),
                text('. Their detailed features are available on the linked subclass pages.'),
            ],
        },
        {
            type: 'paragraph',
            content: [
                text(
                    'Psionic disciplines listed in the source are Enhancement, Projection, Telekinesis, Telepathy, Transposition, Psychokinesis, Precognition, Nullification, and Consumption. Their detailed features, alternate effects, talents, and spell lists are available on the linked discipline pages.',
                ),
            ],
        },
    ],
};

const psionSpellList: PageContentSection = {
    id: 'psion-spell-list',
    title: 'Psion Spell List',
    blocks: [
        {
            type: 'paragraph',
            content: [
                text(
                    'The Psion Spell List is the source for the Innate Psionics choices at 11th, 13th, 15th, and 17th level. It is not a list of spells every Psion automatically knows or can use. Access granted by a discipline, talent, subclass, or another feature remains separate.',
                ),
            ],
        },
        ...psionSpellListGroups.map(({ level, entries }) => ({
            type: 'list' as const,
            items: entries.map(({ name, fixedLevel, spell }) => [
                spell
                    ? { type: 'link' as const, path: `/spells/${spell.slug}/`, label: name }
                    : { type: 'text' as const, text: name },
                {
                    type: 'text' as const,
                    text: `${spell?.sourceBook === 'Psion 1.5.3' ? ' — Homebrew' : spell ? ' — Official' : ' — page not yet available'}${fixedLevel ? ' (cast at the listed level only)' : ''}`,
                },
            ]),
        })),
    ],
};

export const psion = {
    edition,
    availableEditions,
    page: base.page,
    content: {
        ...base.content,
        progression,
        sections: {
            ...base.content.sections,
            featureSections: features,
            subclasses,
            referenceSections: [psionSpellList],
        },
        disciplineLinks: psionDisciplines.map(({ name, slug }) => ({
            label: name,
            href: `/classes/psion/disciplines/${slug}/`,
        })),
        attribution: {
            creator: 'KibblesTasty',
            creatorUrl: 'https://www.kthomebrew.com/',
            source: 'Psion',
            sourceVersion: '1.5.3',
            sourceUrl: 'https://www.kthomebrew.com/psion',
            permissionsUrl: 'https://www.kthomebrew.com/permissions',
            license: 'Open Game License Version 1.0a; Copyright 2000, Wizards of the Coast, LLC.',
        },
    },
    subclasses: psionSubclasses,
} as const;

export default psion;
