import { psionDisciplines } from '#lib/typescript/data/internals/classes/psion/disciplines.js';

export const entries = () =>
    psionDisciplines.map(({ slug }) => ({ class: 'psion', discipline: slug }));
