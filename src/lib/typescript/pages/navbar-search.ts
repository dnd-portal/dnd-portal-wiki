export type NavbarSearchResult = {
	readonly id: string;
	readonly href: string;
	readonly title: string;
	readonly subtitle: string;
	readonly category: string;
};

type NavbarSearchEntry = NavbarSearchResult & {
	readonly searchText: string;
};

let indexPromise: Promise<readonly NavbarSearchEntry[]> | undefined;

function normalize(value: string): string {
	return value
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}

function getTokens(query: string): readonly string[] {
	return normalize(query).split(/\s+/).filter((token) => token.length >= 2);
}

function loadIndex(): Promise<readonly NavbarSearchEntry[]> {
	indexPromise ??= fetch('/_data/navbar-search.json')
		.then((response) => {
			if (!response.ok) throw new Error(`Navbar search index request failed: ${response.status}`);
			return response.json() as Promise<readonly NavbarSearchEntry[]>;
		});

	return indexPromise;
}

function score(entry: NavbarSearchEntry, tokens: readonly string[]): number {
	return tokens.reduce((total, token) => {
		const title = normalize(entry.title);
		const subtitle = normalize(entry.subtitle);
		const text = entry.searchText;

		if (title === token) return total + 72;
		if (title.startsWith(token)) return total + 48;
		if (title.includes(token)) return total + 24;
		if (subtitle.includes(token)) return total + 12;
		if (text.includes(token)) return total + 4;
		return total;
	}, 0);
}

export async function searchNavbar(query: string, limit = 6): Promise<readonly NavbarSearchResult[]> {
	const tokens = getTokens(query);
	if (tokens.length === 0) return [];

	const entries = await loadIndex();
	return entries
		.map((entry) => ({ entry, score: score(entry, tokens) }))
		.filter(({ score: value }) => value > 0)
		.sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title))
		.slice(0, limit)
		.map(({ entry }) => ({
			id: entry.id,
			href: entry.href,
			title: entry.title,
			subtitle: entry.subtitle,
			category: entry.category
		}));
}
