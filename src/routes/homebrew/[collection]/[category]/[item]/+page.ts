import type { EntryGenerator } from './$types';
import { homebrewMagicItemEntries } from '#lib/typescript/data/internals/homebrew/_index_.js';

export const prerender = homebrewMagicItemEntries.length > 0;

export const entries: EntryGenerator = () =>
	homebrewMagicItemEntries;
