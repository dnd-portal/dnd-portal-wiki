import { spells } from '#lib/typescript/data/internals/rules/spellcasting/spells/spell-data.js';

export type PsionSpellListEntry = {
    readonly name: string;
    readonly level: 6 | 7 | 8 | 9;
    readonly fixedLevel?: boolean;
};

export const psionSpellList: readonly PsionSpellListEntry[] = [
    { name: 'Blade Barrier', level: 6 },
    { name: 'Chain Lightning', level: 6 },
    { name: 'Disintegrate', level: 6 },
    { name: 'Find the Path', level: 6 },
    { name: 'Eyebite', level: 6 },
    { name: 'Harm', level: 6 },
    { name: 'Mass Suggestion', level: 6 },
    { name: 'Mind Blast', level: 6, fixedLevel: true },
    { name: 'Etherealness', level: 7 },
    { name: 'Geas', level: 7, fixedLevel: true },
    { name: 'Plane Shift', level: 7 },
    { name: 'Regenerate', level: 7 },
    { name: 'Reverse Gravity', level: 7 },
    { name: 'Teleport', level: 7 },
    { name: 'Antimagic Field', level: 8 },
    { name: 'Demiplane', level: 8 },
    { name: 'Dominate Monster', level: 8 },
    { name: 'Earthquake', level: 8 },
    { name: 'Feeblemind', level: 8 },
    { name: 'Inner World', level: 8, fixedLevel: true },
    { name: 'Mind Blank', level: 8 },
    { name: 'Power Word Stun', level: 8 },
    { name: 'Astral Projection', level: 9 },
    { name: 'Foresight', level: 9 },
    { name: 'Gate', level: 9 },
    { name: 'Power Word Kill', level: 9 },
    { name: 'Time Stop', level: 9 },
];

const spellKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
const spellByName = new Map(spells.map((spell) => [spellKey(spell.name), spell]));

export const psionSpellListGroups = ([6, 7, 8, 9] as const).map((level) => ({
    level,
    entries: psionSpellList
        .filter((entry) => entry.level === level)
        .map((entry) => ({
            ...entry,
            spell: spellByName.get(spellKey(entry.name)),
        })),
}));
