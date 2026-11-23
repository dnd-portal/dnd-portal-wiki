import { spells } from '#lib/typescript/data/internals/rules/spellcasting/spells/spell-data.js';

export function entries() {
    return spells.map((spell) => ({ slug: spell.slug }));
}
