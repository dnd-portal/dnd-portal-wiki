import * as core from '../core/_index_';
import { createInternalPage } from './_helpers_';
import type {
    InlineContent,
    InlineContentNode,
    PageContentBlock,
    PageContentSection,
} from '#lib/typescript/pages/content-types.js';

const website = core.internals.website;
const current = core.internals.legal;

const text = (value: string): InlineContentNode => ({
    type: 'text',
    text: value,
});

const link = (path: string, label: string): InlineContentNode => ({
    type: 'link',
    path,
    label,
});

const paragraph = (content: InlineContent): PageContentBlock => ({
    type: 'paragraph',
    content,
});

const textParagraph = (value: string): PageContentBlock => paragraph([text(value)]);

const list = (items: readonly string[]): PageContentBlock => ({
    type: 'list',
    items: items.map((item) => [text(item)]),
});

const content = (sections: readonly PageContentSection[]) => ({
    sections,
    tableOfContents: sections.map((section) => ({
        id: section.id,
        title: section.title,
    })),
});

export const legal = {
    notice: createInternalPage({
        href: current.notice.href,
        title: `${website.name.short} - ${current.notice.name.normal}`,
        subTitle: 'Legal information',
        description:
            'Read about the independent status of D&D Portal Wiki, content ownership, licences, and reporting intellectual property concerns.',
        descriptions: {
            long: [
                [
                    text(
                        'D&D Portal Wiki is an independent personal project created and maintained by Toon van Berkel.',
                    ),
                ],
                [
                    text(
                        'It is an unofficial fan resource and is not operated, sponsored, endorsed, or approved by Wizards of the Coast.',
                    ),
                ],
                [
                    text(
                        'This notice explains content ownership, the ongoing content review, and how to report concerns.',
                    ),
                ],
            ],
        },
        content: content([
            {
                id: 'important-notice',
                title: 'Important Notice',
                blocks: [
                    textParagraph(
                        'This website is provided as an informational and organisational fan resource.',
                    ),
                    textParagraph(
                        'Nothing in this notice overrides applicable law, third-party licences, intellectual property rights, or mandatory legal protections.',
                    ),
                    textParagraph(
                        'The personal nature of the project, free access, attribution, and the absence of an intention to infringe do not themselves authorise the use of protected material.',
                    ),
                ],
            },
            {
                id: 'website-operator',
                title: 'Website Operator',
                blocks: [
                    textParagraph(
                        'D&D Portal Wiki is independently created and maintained by Toon van Berkel. It began as a personal project supporting tabletop role-playing games and has grown beyond its original scope.',
                    ),
                    paragraph([
                        text(
                            'Questions about the website, attribution, permissions, or intellectual property can be sent by ',
                        ),
                        link('externals.mail.main', 'email'),
                        text('.'),
                    ]),
                ],
            },
            {
                id: 'unofficial-fan-content',
                title: 'Unofficial Status',
                blocks: [
                    textParagraph(
                        'D&D Portal Wiki is an unofficial fan project. No affiliation with, sponsorship by, or approval from Wizards of the Coast or another publisher is claimed unless expressly stated and authorised.',
                    ),
                    textParagraph(
                        'Dungeons & Dragons, D&D, Wizards of the Coast, and associated names, marks, and materials remain subject to the rights of their respective owners.',
                    ),
                    paragraph([
                        text(
                            'The applicable conditions for Wizards fan content are explained in the ',
                        ),
                        link(
                            'externals.wizards.fanContentPolicy',
                            'Wizards of the Coast Fan Content Policy',
                        ),
                        text(
                            '. This policy is not a general licence to reproduce published rules, books, or other protected material.',
                        ),
                    ]),
                ],
            },
            {
                id: 'purpose-of-website',
                title: 'Purpose of the Website',
                blocks: [
                    textParagraph(
                        'D&D Portal Wiki provides tabletop role-playing references, explanations, campaign documentation, homebrew material, and related tools.',
                    ),
                    textParagraph(
                        'The project is intended to support play and help visitors find relevant information and original sources.',
                    ),
                    textParagraph(
                        'Describing material as a reference, summary, adaptation, or homebrew does not determine whether its publication is legally permitted.',
                    ),
                ],
            },
            {
                id: 'ownership-and-permissions',
                title: 'Ownership, Licences, and Attribution',
                blocks: [
                    textParagraph(
                        'Third-party text, artwork, rules descriptions, maps, code, and other material remain subject to the rights and applicable licences of their respective owners.',
                    ),
                    textParagraph(
                        'The project does not claim ownership of third-party material merely because it is displayed, reformatted, edited, translated, or incorporated into the website.',
                    ),
                    textParagraph(
                        'Publication of third-party material requires an applicable licence, permission, or another valid legal basis. Public availability and attribution alone do not provide that permission.',
                    ),
                    textParagraph(
                        'Where material is used under an open licence, including a Creative Commons licence covering a relevant System Reference Document, the conditions of that specific licence continue to apply.',
                    ),
                    textParagraph(
                        'Source references and attribution notices identify relevant creators, publications, versions, and licences where applicable. They do not imply endorsement or extend the permissions granted by a rights holder.',
                    ),
                    textParagraph(
                        'This notice does not grant visitors any additional rights to reuse third-party material.',
                    ),
                ],
            },
            {
                id: 'ongoing-content-review',
                title: 'Ongoing Content Review',
                blocks: [
                    textParagraph(
                        'The operator is working with another contributor to review existing content, its sources, attribution, permissions, and suitability for publication.',
                    ),
                    textParagraph(
                        'This work includes checking licences, improving source information, obtaining permission where needed, developing original explanations, and replacing or removing material where appropriate.',
                    ),
                    textParagraph(
                        'Editing, expanding, translating, or rewriting material does not automatically remove third-party rights or make an adaptation independently publishable.',
                    ),
                    textParagraph(
                        'The review is ongoing and does not represent a guarantee that every existing page has been legally cleared. An ongoing review does not authorise continued publication of material that requires permission the project does not have.',
                    ),
                    textParagraph(
                        'Material may be temporarily hidden while its publication rights are checked. Where no valid basis for publication can be established, it should be removed or replaced with material that can lawfully be published.',
                    ),
                ],
            },
            {
                id: 'non-commercial-operation',
                title: 'Free Access and Optional Donations',
                blocks: [
                    textParagraph(
                        'Public Wiki pages are available free of charge. Reading them does not require a payment or subscription.',
                    ),
                    textParagraph(
                        'Optional donations, if offered, support hosting, maintenance, and development. They do not purchase ownership of content, rights over third-party material, or authority over project decisions.',
                    ),
                    textParagraph(
                        'Free access and donations do not change the permissions required to publish protected material.',
                    ),
                ],
            },
            {
                id: 'no-protected-publications',
                title: 'Protected Publications',
                blocks: [
                    textParagraph(
                        'Commercial publications and other protected material must not be reproduced or distributed through the project without an applicable licence, permission, or another valid legal basis.',
                    ),
                    textParagraph(
                        'This applies to individual protected passages, illustrations, and other material as well as complete publications. Dividing material across separate pages does not itself authorise its publication.',
                    ),
                ],
            },
            {
                id: 'reporting-concerns',
                title: 'Reporting Copyright and Other Concerns',
                blocks: [
                    paragraph([
                        text(
                            'If you believe material infringes your rights or requires correction, please contact the operator by ',
                        ),
                        link('externals.mail.main', 'email'),
                        text(' with the relevant page URL and a brief explanation.'),
                    ]),
                    paragraph([
                        text('The '),
                        link(current.contentRemoval.href, 'content review and removal page'),
                        text(' explains what information helps and how reports are handled.'),
                    ]),
                    textParagraph(
                        'Where possible, please contact the operator directly so there is an opportunity to investigate and resolve the concern. This is a request for cooperation, not a requirement to contact the operator before exercising legal rights.',
                    ),
                    textParagraph(
                        'Removing or correcting material does not itself determine liability or extinguish any existing legal claim.',
                    ),
                ],
            },
            {
                id: 'accuracy-liability',
                title: 'Accuracy, Availability, and Liability',
                blocks: [
                    textParagraph(
                        'Pages may contain mistakes, outdated information, incomplete sections, or campaign-specific rulings. Visitors should check relevant official sources and distinguish published rules from homebrew.',
                    ),
                    textParagraph(
                        'Content and functionality may be corrected, reorganised, restricted, or removed for legal, technical, or maintenance reasons.',
                    ),
                    textParagraph(
                        'This notice does not exclude liability where exclusion is prohibited by applicable law.',
                    ),
                ],
            },
        ]),
    }),

    privacy: createInternalPage({
        href: current.privacy.href,

        title: `${website.name.short} - ${current.privacy.name.normal}`,
        subTitle: 'Privacy information',
        description: `Read how visitor information and personal data are
			handled, stored, protected, and used by the website.`,
        descriptions: {
            long: [
                [
                    text(
                        'The public Wiki is designed to provide reference information without requiring visitors to identify themselves.',
                    ),
                ],
                [
                    text(
                        'Browser preferences are stored locally where possible and are intended to control interface behaviour, not to profile visitors.',
                    ),
                ],
                [
                    text(
                        'The separate Player Portal may process different campaign or account information and should provide its own privacy details.',
                    ),
                ],
            ],
        },
        content: content([
            {
                id: 'about-this-notice',
                title: 'About This Notice',
                blocks: [
                    textParagraph(
                        'This Privacy Notice explains how personal data may be processed when you visit or contact the public D&D Portal Wiki.',
                    ),
                    textParagraph(
                        'The notice applies to the Wiki, not automatically to the separate D&D Player Portal.',
                    ),
                ],
            },
            {
                id: 'data-not-collected',
                title: 'Information the Wiki Does Not Intentionally Collect',
                blocks: [
                    list([
                        'User accounts or public profiles.',
                        'Login or registration forms.',
                        'Comment sections.',
                        'Direct file uploads.',
                        'Advertising networks or behavioural advertising.',
                        'Visitor profiling or sale of personal data.',
                    ]),
                    textParagraph(
                        'Simply reading a public Wiki page does not intentionally require you to provide your name, email address, party membership, character details, or other directly identifying information.',
                    ),
                ],
            },
            {
                id: 'browser-preferences',
                title: 'Local Browser Preferences',
                blocks: [
                    textParagraph(
                        'The Wiki may use local browser storage to remember display choices such as preferred class-card image gender or campaign preference context.',
                    ),
                    textParagraph(
                        'These preferences remain in the visitor browser until changed, removed by the site, or deleted through browser settings.',
                    ),
                ],
            },
            {
                id: 'data-controller',
                title: 'Data Controller',
                blocks: [
                    textParagraph(
                        'The person responsible for personal data connected to the public Wiki is Toon van Berkel.',
                    ),
                    paragraph([
                        text('Privacy questions can be sent through '),
                        link('externals.mail.main', 'email'),
                        text('.'),
                    ]),
                ],
            },
            {
                id: 'hosting-logs',
                title: 'Hosting and Technical Logs',
                blocks: [
                    textParagraph(
                        'Like most websites, hosting infrastructure may process technical request information such as IP address, requested URL, user agent, timestamps, and error details.',
                    ),
                    textParagraph(
                        'These logs are used for security, debugging, abuse prevention, and basic operation of the website rather than behavioural advertising.',
                    ),
                ],
            },
            {
                id: 'search-url-state',
                title: 'Search URL State',
                blocks: [
                    textParagraph(
                        'Temporary search state can be stored in the search page URL. Search URLs may include query text, selected filters, tags, and page number.',
                    ),
                    textParagraph(
                        'Those URL parameters can appear in browser history, copied links, and hosting request logs.',
                    ),
                ],
            },
            {
                id: 'privacy-rights',
                title: 'Privacy Rights and Contact',
                blocks: [
                    textParagraph(
                        'Depending on applicable law, visitors may have rights to request access, correction, deletion, restriction, or objection relating to personal data.',
                    ),
                    textParagraph(
                        'Because the public Wiki intentionally avoids accounts and visitor profiles, many requests may involve technical logs or direct contact messages rather than account records.',
                    ),
                ],
            },
        ]),
    }),

    cookies: createInternalPage({
        href: current.cookies.href,

        title: `${website.name.short} - ${current.cookies.name.normal}`,
        subTitle: 'Cookie information',
        description: `Read which cookies and similar technologies may be
			used by the D&D Portal Wiki and why they are required.`,
        descriptions: {
            long: [
                [
                    text(
                        'The public D&D Portal Wiki does not currently use HTTP cookies for advertising, behavioural tracking, analytics, login sessions, or account authentication.',
                    ),
                ],
                [
                    text(
                        'The Wiki does use local browser storage for functional preferences, which is documented here because it is a related browser-storage technology.',
                    ),
                ],
                [
                    text(
                        'The separate Player Portal may use different technologies and should provide its own cookie information.',
                    ),
                ],
            ],
        },
        content: content([
            {
                id: 'current-cookie-status',
                title: 'Current Cookie Status',
                blocks: [
                    textParagraph(
                        'No HTTP cookies are currently intentionally set by the public Wiki.',
                    ),
                    textParagraph(
                        'A cookie banner is therefore not currently displayed for optional analytics or marketing cookies.',
                    ),
                ],
            },
            {
                id: 'what-are-cookies',
                title: 'What Are Cookies?',
                blocks: [
                    textParagraph(
                        'Cookies are small pieces of information that a website can store in a visitor browser and receive again during later requests.',
                    ),
                    list([
                        'Keeping a visitor signed in.',
                        'Remembering interface preferences.',
                        'Maintaining a form session.',
                        'Measuring website usage.',
                        'Personalising content.',
                        'Advertising or behavioural tracking.',
                    ]),
                ],
            },
            {
                id: 'local-storage',
                title: 'Local Browser Storage',
                blocks: [
                    textParagraph(
                        'D&D Portal currently uses local storage for functional preferences such as image gender and Wiki preference context.',
                    ),
                    textParagraph(
                        'Search filter state is stored in the page URL so filtered search results can be shared.',
                    ),
                ],
            },
            {
                id: 'similar-technologies',
                title: 'Similar Browser Technologies',
                blocks: [
                    textParagraph(
                        'Websites can store information through technologies that are not traditional HTTP cookies, including local storage, session storage, cache, and URL parameters.',
                    ),
                    textParagraph(
                        'D&D Portal currently documents local storage because it is used for functional interface preferences.',
                    ),
                ],
            },
            {
                id: 'search-urls',
                title: 'Search URLs',
                blocks: [
                    textParagraph(
                        'Search filters and search terms can be included in the URL so filtered views can be copied and shared.',
                    ),
                    textParagraph(
                        'This is useful, but copied URLs and browser history may reveal the search terms or filters that were active.',
                    ),
                ],
            },
            {
                id: 'removing-preferences',
                title: 'Removing Saved Preferences',
                blocks: [
                    textParagraph(
                        'Browser storage can be viewed and removed through the privacy or website-data settings of the browser.',
                    ),
                    textParagraph(
                        'Removing saved preferences resets display choices for that browser and device.',
                    ),
                ],
            },
        ]),
    }),

    contributionTerms: createInternalPage({
        href: current.contributionTerms.href,

        title: `${website.name.short} - ${current.contributionTerms.name.normal}`,
        subTitle: 'Contributor conditions',
        description: `Read the conditions applying to submitted content,
			code, artwork, corrections, and other contributions.`,
        descriptions: {
            long: [
                [
                    text(
                        'These terms apply when someone deliberately submits code, written content, artwork, corrections, or other material for possible use in the D&D Portal Wiki.',
                    ),
                ],
                [
                    text(
                        'Reading or using the public Wiki does not make someone a contributor and does not require acceptance of these contribution terms.',
                    ),
                ],
                [
                    text(
                        'Contributors keep ownership of original material they legally own while granting the project permission to review, adapt, and publish accepted contributions.',
                    ),
                ],
            ],
        },
        content: content([
            {
                id: 'important-notice',
                title: 'Important Notice',
                blocks: [
                    textParagraph(
                        'These terms apply only when you voluntarily submit material for inclusion in the D&D Portal Wiki.',
                    ),
                    textParagraph(
                        'A contribution may be submitted through GitHub, email, another agreed communication method, or directly to the project owner.',
                    ),
                ],
            },
            {
                id: 'what-counts',
                title: 'What Counts as a Contribution',
                blocks: [
                    list([
                        'Source code, components, styles, scripts, and configuration.',
                        'Bug fixes and technical improvements.',
                        'Rules explanations and reference text.',
                        'Homebrew classes, subclasses, species, feats, spells, and items.',
                        'Campaign descriptions, setting material, characters, locations, and lore.',
                        'Images, icons, diagrams, maps, alternative text, and accessibility improvements.',
                    ]),
                    textParagraph(
                        'General feedback or an idea that has not been incorporated into the project may not qualify as a protected contribution by itself.',
                    ),
                ],
            },
            {
                id: 'contributor-responsibility',
                title: 'Contributor Responsibility',
                blocks: [
                    textParagraph(
                        'Contributors should only submit material they are legally allowed to submit.',
                    ),
                    textParagraph(
                        'Do not submit confidential employer, school, client, campaign, or third-party information without permission.',
                    ),
                ],
            },
            {
                id: 'ownership',
                title: 'Ownership of Original Contributions',
                blocks: [
                    textParagraph(
                        'Contributors retain copyright in original parts of their contribution that they legally own.',
                    ),
                    textParagraph(
                        'Submitting content does not transfer ownership of original work to Toon van Berkel or D&D Portal Wiki unless a separate written agreement says so.',
                    ),
                ],
            },
            {
                id: 'licence-to-use',
                title: 'Licence to Use Contributions',
                blocks: [
                    textParagraph(
                        'By submitting a contribution for inclusion, the contributor gives the project permission to review, edit, adapt, publish, reproduce, and maintain the contribution as part of the Wiki.',
                    ),
                    textParagraph(
                        'Accepted contributions may be modified to match the website structure, writing style, accessibility requirements, technical standards, and campaign rules.',
                    ),
                ],
            },
            {
                id: 'third-party-material',
                title: 'Third-Party Material',
                blocks: [
                    textParagraph(
                        'Contributors should not submit third-party material unless they have permission or the material can lawfully be used by the project.',
                    ),
                    textParagraph(
                        'This includes text, artwork, maps, icons, datasets, code, screenshots, documents, campaign notes, and private communications.',
                    ),
                ],
            },
            {
                id: 'review-and-removal',
                title: 'Review, Refusal, and Removal',
                blocks: [
                    textParagraph(
                        'Submitting a contribution does not guarantee that it will be accepted, published, kept unchanged, or kept permanently available.',
                    ),
                    textParagraph(
                        'The project may refuse, edit, replace, restrict, or remove contributions for quality, accuracy, legal, safety, campaign, or maintenance reasons.',
                    ),
                ],
            },
        ]),
    }),

    contentRemoval: createInternalPage({
        href: current.contentRemoval.href,
        title: `${website.name.short} - ${current.contentRemoval.name.normal}`,
        subTitle: 'Content concerns and removal requests',
        description:
            'Report copyright, attribution, privacy, or other concerns and request review, correction, restriction, or removal of Wiki content.',
        descriptions: {
            long: [
                [
                    text(
                        'Please contact the operator if you believe material on D&D Portal Wiki infringes your rights or should be reviewed.',
                    ),
                ],
                [
                    text(
                        'Reports may concern copyright, licences, attribution, privacy, confidential information, security, or other legal concerns.',
                    ),
                ],
                [
                    text(
                        'Reports are reviewed according to their circumstances and urgency. Material may be temporarily hidden during investigation.',
                    ),
                ],
            ],
        },
        content: content([
            {
                id: 'purpose',
                title: 'Report a Concern',
                blocks: [
                    paragraph([
                        text('Send your report by '),
                        link('externals.mail.main', 'email'),
                        text(
                            '. Please identify the relevant page and explain the concern as clearly as possible.',
                        ),
                    ]),
                    textParagraph(
                        'You do not need a lawyer or a particular legal format to bring a concern to the attention of the operator. Incomplete reports will still be considered, although further information may be needed.',
                    ),
                ],
            },
            {
                id: 'when-to-submit',
                title: 'What You Can Report',
                blocks: [
                    list([
                        'Material published without an applicable licence, permission, or other valid legal basis.',
                        'Missing or incorrect attribution, source information, or licence notices.',
                        'An adaptation that may exceed the permission granted by the original rights holder.',
                        'Personal or confidential information that should not be public.',
                        'Exposed credentials or other credible security concerns.',
                        'Other material that may be unlawful or require correction.',
                    ]),
                ],
            },
            {
                id: 'request-information',
                title: 'Helpful Information',
                blocks: [
                    list([
                        'The URL of each affected page.',
                        'The specific text, image, file, or other material concerned.',
                        'The original work or an authorised source link, where available.',
                        'An explanation of the concern and any relevant permission or licence conditions.',
                        'Your relationship to the material, such as creator, rights holder, authorised representative, or concerned visitor.',
                        'The action you are requesting.',
                        'A contact address for follow-up questions.',
                    ]),
                    textParagraph(
                        'Provide only information reasonably needed to explain the concern. Do not send passwords, identity documents, or unrelated sensitive information.',
                    ),
                    textParagraph(
                        'Anyone may report a concern. If a request depends on exercising authority on behalf of a particular rights holder, reasonable confirmation of that authority may be requested.',
                    ),
                ],
            },
            {
                id: 'review-process',
                title: 'How Reports Are Reviewed',
                blocks: [
                    textParagraph(
                        'The operator aims to acknowledge reports promptly and review them without unnecessary delay. This is a personal project without a continuously staffed support service; response times may vary. Any applicable legal deadlines remain unaffected.',
                    ),
                    list([
                        'Identify the reported material and assess the urgency.',
                        'Temporarily hide or restrict material where appropriate while investigating.',
                        'Check available sources, licences, permissions, and relevant information.',
                        'Request clarification where needed.',
                        'Take appropriate action and communicate the outcome where contact details are available.',
                    ]),
                    textParagraph(
                        'The reporting process does not require material to remain available until an investigation is complete.',
                    ),
                ],
            },
            {
                id: 'correction-instead-removal',
                title: 'Possible Outcomes',
                blocks: [
                    list([
                        'Removing the affected material.',
                        'Correcting inaccurate information or attribution.',
                        'Adding a required licence or source notice where the underlying use is permitted.',
                        'Replacing material with an independently created or properly licensed alternative.',
                        'Keeping material unavailable while permission is sought or checked.',
                        'Restoring or retaining material where a valid basis for publication is established.',
                    ]),
                    textParagraph(
                        'Adding credit, changing wording, or restricting access is not automatically sufficient to resolve an infringement. The action taken must address the underlying concern.',
                    ),
                    textParagraph(
                        'The outcome may differ from the requested action where the available information supports another appropriate resolution.',
                    ),
                ],
            },
            {
                id: 'urgent-issues',
                title: 'Urgent or Sensitive Reports',
                blocks: [
                    textParagraph(
                        'Clearly mark urgent reports involving exposed credentials, sensitive personal information, or credible safety risks.',
                    ),
                    textParagraph(
                        'Use email rather than a public GitHub issue when publishing the report would disclose protected material or make the problem worse.',
                    ),
                ],
            },
            {
                id: 'legal-rights',
                title: 'Your Legal Rights',
                blocks: [
                    textParagraph(
                        'Direct contact is encouraged so concerns can be investigated and resolved. Using this process is not a prerequisite to exercising legal rights.',
                    ),
                    textParagraph(
                        'Submitting a report does not waive any rights, and this process does not postpone applicable legal deadlines.',
                    ),
                    textParagraph(
                        'Removal, correction, or temporary restriction does not by itself constitute an admission of liability or settle any existing claim.',
                    ),
                ],
            },
        ]),
    }),
} as const;
