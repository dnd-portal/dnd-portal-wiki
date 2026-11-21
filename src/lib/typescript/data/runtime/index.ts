import {
	runtimeChildren,
	runtimeLinkEntries,
	runtimeSpellBreadcrumbEntries,
	type RuntimeLinkMetadata,
	type RuntimeSpellBreadcrumbMetadata
} from './generated';

export type { RuntimeLinkMetadata, RuntimeSpellBreadcrumbMetadata } from './generated';

const runtimeLinks: Readonly<Record<string, RuntimeLinkMetadata>> = Object.fromEntries(
	runtimeLinkEntries.map(([
		path,
		href,
		external,
		title,
		subTitle,
		description,
		img,
		label,
		seoTitle,
		descriptions,
		images,
		sourceMetadata,
		navigation
	]) => [
		path,
		{
			href,
			external,
			title,
			subTitle,
			description,
			img,
			...(label == null ? {} : { label }),
			...(seoTitle == null ? {} : { seoTitle }),
			...(descriptions == null ? {} : { descriptions }),
			...(images == null ? {} : { images }),
			...(sourceMetadata == null ? {} : { sourceMetadata }),
			...(navigation == null ? {} : { navigation })
		}
	])
);

export function getRuntimeData(path: string): RuntimeLinkMetadata {
	const value = runtimeLinks[path];

	if (!value) {
		throw new Error(`Runtime metadata path "${path}" does not exist.`);
	}

	return value;
}

export function getOptionalRuntimeData(path: string): RuntimeLinkMetadata | undefined {
	return runtimeLinks[path];
}

export function getRuntimeChildren(path: string): readonly string[] {
	return runtimeChildren[path] ?? [];
}

export function getRuntimeNavigationChildren(parentPath: string): readonly string[] {
	const pagePath = parentPath.endsWith('.page') ? parentPath : `${parentPath}.page`;

	return runtimeLinkEntries
		.filter(([, , , , , , , , , , , , navigation]) => navigation?.parent === pagePath)
		.map(([path]) => path);
}

const runtimeSpellBreadcrumbs: Readonly<Record<string, RuntimeSpellBreadcrumbMetadata>> =
	Object.fromEntries(
		runtimeSpellBreadcrumbEntries.map((entry) => [entry[0], entry])
	);

export function getRuntimeSpellBreadcrumbMetadata(
	slug: string
): RuntimeSpellBreadcrumbMetadata | undefined {
	return runtimeSpellBreadcrumbs[slug];
}

export { runtimeLinks };
