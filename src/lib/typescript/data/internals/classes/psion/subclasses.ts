import { createInternalPage } from '#lib/typescript/data/internals/_helpers_.js';
import { text } from '../_basic-class.js';

type Feature = { readonly title: string; readonly level: number; readonly text: string };
type Archetype = {
    readonly key: string;
    readonly name: string;
    readonly introduction: string;
    readonly features: readonly Feature[];
};

const archetypes: readonly Archetype[] = [
    {
        key: 'awakened-mind',
        name: 'Awakened Mind',
        introduction:
            'An Awakened Mind is a psion who had their psionic power awakened within them by an encounter, event, or circumstance. An awakening is often somewhat traumatic. Psions are not well understood and the first power they manifest - telepathy - is one of the most feared and shunned abilities.',
        features: [
            {
                title: 'Opened Mind',
                level: 1,
                text: 'At 1st level when you select this archetype, your mind awakens the ability to directly connect to the minds of other creatures, granting you the psionic discipline of Telepathy.',
            },
            {
                title: 'Mental Awareness',
                level: 1,
                text: 'Additionally, starting at 1st level, you can use Intelligence instead of Wisdom when making an Insight check against a creature with an Intelligence ability score of 6 or higher. Further, if you have telepathically communicated with a willing creature, you know their general location (direction and rough estimate of distance) for the next hour as long as you are on the same plane as them.',
            },
            {
                title: 'Mind Reader',
                level: 3,
                text: 'Starting at 3rd level, when you use Telepathic Intrusion, you can force the target to make an Intelligence saving throw instead of a Wisdom saving throw against the power (deciding when you use the ability). When a creature fails a saving throw against your Telepathic Intrusion, you gain a d4. Until the end of your next turn, if you make an attack roll against the creature or the creature makes a saving throw against one of your psionic powers other than Telepathic Intrusion, you can add or subtract the d4 from the roll (deciding to roll before you roll the attack or use the power).',
            },
            {
                title: 'Empowered Psionics',
                level: 6,
                text: 'Starting at 6th level, when you deal damage with a psionic discipline power you can add your Intelligence modifier to the damage dealt.',
            },
            {
                title: 'All Seeing Eye',
                level: 10,
                text: 'Starting at 10th level, you can see a creature by its mind. You gain a mindsight of 60 feet, allowing you to see creatures with an Intelligence of 6 or higher within range as if by blindsight. A creature you are unaware of can still be hidden from you, but you can use your Intelligence modifier instead of your Wisdom modifier when making Perception checks to detect creatures.',
            },
            {
                title: 'Full Awakening',
                level: 14,
                text: 'Starting at 14th level, you can briefly fully awaken your expanded mind to true comprehension. At the start of your turn, you can expend 2 psi points to gain advantage on all saving throws and attack rolls until the start of your next turn.',
            },
        ],
    },
    {
        key: 'unleashed-mind',
        name: 'Unleashed Mind',
        introduction:
            "An Unleashed Mind's power is most often an innate force they struggle to understand or control, a reflection of their state of mind and mood projected onto the world around them, often to devastating results.",
        features: [
            {
                title: 'Unshackled Power',
                level: 1,
                text: 'At 1st level when you select this archetype, you gain the ability to unleash your mind to physically interact with the world around you, granting you the psionic discipline of Telekinesis. Additionally at 1st level, you gain the ability to cast thaumaturgy with your psionic powers. When you cast it in this way, you can cause up to 10 pounds of loose objects within 10 feet of you to start floating for 1 minute, or force all targets within 5 feet to make a Strength saving throw or be pushed 5 feet away from you.',
            },
            {
                title: 'Rampaging Power',
                level: 3,
                text: 'Starting at 3rd level, you gain a d4 rampage die. Once on each of your turns when making a damage roll, you can add this rampage die. If you dealt damage during your last turn, your rampage die becomes a d6, increasing with each subsequent turn you deal damage by one step, up to a d12; if you did not deal damage during your last turn or become incapacitated, it becomes a d4 once more. If you maintain a continuous d12 rampage die for more than one minute, you gain one level of exhaustion.',
            },
            {
                title: 'Empowered Psionics',
                level: 6,
                text: 'Starting at 6th level, when you deal damage with a psionic discipline power you can add your Intelligence modifier to the damage dealt.',
            },
            {
                title: 'Uncontrollable Mind',
                level: 10,
                text: 'Starting at 10th level, you gain immunity to the charmed and frightened conditions, as well as effects that would control your mind while your rampage die is a d8 or more.',
            },
            {
                title: 'Unstoppable Rampage',
                level: 14,
                text: 'Starting at 14th level, when an attack reduces you to zero hit points, you can roll your rampage die. If your roll + your Constitution modifier is higher than the excess damage you took, you are instead reduced to one hit point. You can expend 2 psi points to roll an additional rampage die, adding it to the result.',
            },
        ],
    },
    {
        key: 'transcended-mind',
        name: 'Transcended Mind',
        introduction:
            'A Transcended psion is most often one that has found their path to psionic powers through a mental epiphany, realizing the place of their mind within the multiverse and how it ties to everything else.',
        features: [
            {
                title: 'Enlightened',
                level: 1,
                text: 'At 1st level when you select this archetype, you gain the ability to empower your body with the power of your mind, granting you the psionic discipline of Enhancement. Additionally, you can ignore the effects of extreme heat or cold, hold your breath twice as long as normal, and go twice as long without eating or sleeping before suffering exhaustion.',
            },
            {
                title: 'Balance of Power',
                level: 3,
                text: 'Starting at 3rd level, when you use a psionic ability (power or spell) to restore hit points or grant temporary hit points, you can add equivalent hit points granted to a stored pool. The maximum value is your psion level. The next time you make a damage roll, you can expend the pool to add damage equal to the stored value to one target affected by the damage roll. This stored damage is lost if not spent within 1 minute.',
            },
            {
                title: 'Perfected Enhancement',
                level: 6,
                text: 'Starting at 6th level, when you grant temporary hit points with a psionic power you can add your proficiency bonus to the temporary hit points gained by one creature.',
            },
            {
                title: 'Mental Control',
                level: 10,
                text: 'Starting at 10th level, when you make a Constitution saving throw to avoid losing concentration on an effect from a psionic discipline, you can add your Intelligence modifier.',
            },
            {
                title: 'Mind Over Matter',
                level: 14,
                text: 'Starting at 14th level, when you would roll a Strength, Dexterity, or Constitution saving throw, you can expend 2 psi points to roll an Intelligence saving throw instead. Additionally, when you roll a Death saving throw, you can expend 4 psi points before rolling to treat the roll as 20.',
            },
        ],
    },
    {
        key: 'shapers-mind',
        name: "Shaper's Mind",
        introduction:
            'A Shaper is a Psion that specializes in the materialization of their imagination, projecting it out into the world. A Shaper manifests things from nothing but their own mind, weaving creations into existence through raw psionic power and imagination.',
        features: [
            {
                title: "Creator's Mind",
                level: 1,
                text: 'At 1st level when you select this archetype, you gain the ability to will the contents of your mind into the world, granting you the psionic discipline of Projection.',
            },
            {
                title: 'Boundless Imagination',
                level: 1,
                text: 'Additionally at 1st level, when you conjure your Astral Construct, you can apply one of the following powers to it: Devastating Weapons, causing its damage to become 1d12; Psionic Conduit, allowing you to use your psionic powers, spells, and talents through it as if you were in its space; or Vivid Existence, causing it to fully materialize and automatically use Solidify at the start of your turn without requiring a command. You can change the benefit for the duration as a bonus action.',
            },
            {
                title: 'Astral Metastability',
                level: 3,
                text: 'Starting at 3rd level, when you use your psionic powers to create an Astral Construct, it does not require concentration to maintain and lasts until dismissed, but you cannot summon another while you have one summoned.',
            },
            {
                title: 'Empowered Construct',
                level: 6,
                text: 'Starting at 6th level, when you deal damage with an Astral Construct or a weapon created by Project Item, you can add your Intelligence modifier to the damage dealt.',
            },
            {
                title: 'Astral Guardian',
                level: 10,
                text: 'Starting at 10th level, when you would take damage while you have an Astral Construct within 30 feet, you can use your reaction to conjure it to you (sharing your space) and expend 1 psi point to Solidify it, transposing it between you and the source of damage. It takes the damage instead of you. If the attack deals more damage than it has hit points from Solidify, you take the remainder.',
            },
            {
                title: 'Imaginary Army',
                level: 14,
                text: 'Starting at 14th level, when you use Replicate, you can create one additional Astral Construct controlled with the same action. This additional construct lasts until the start of your next turn and cannot be sustained. Once you create an additional duplicate, you cannot do so again until you finish a short or long rest.',
            },
        ],
    },
    {
        key: 'wandering-mind',
        name: 'Wandering Mind',
        introduction:
            'A Wandering Mind is among the more mysterious incarnates of psions, not quite rooted in the same reality as everyone else, finding it more pliable and prone to jumping right through on occasion.',
        features: [
            {
                title: 'Spatial Manipulation',
                level: 1,
                text: 'At 1st level when you select this archetype, you gain a greater perspective on space and dimensions, granting you the psionic discipline of Transposition. You can use Dexterity in place of Intelligence when calculating the DC or attack roll modifier of Transpositional powers, alternate effects, or talents that require the Transpositional discipline.',
            },
            {
                title: "Nomad's Gear",
                level: 1,
                text: 'Additionally at 1st level, you gain proficiency with martial weapons and medium armor. Additionally, when you roll for the effect of flicker or blink, you can expend 1 psi point to reroll the result, selecting which result to use.',
            },
            {
                title: 'Curious Mind',
                level: 3,
                text: 'Starting at 3rd level, whenever you finish a long rest, you can select two skills you lack proficiency in. Until the end of your next long rest, you can add half your proficiency bonus, rounded down, to ability checks made with those skills.',
            },
            {
                title: 'Cunning Strikes',
                level: 3,
                text: 'Starting at 3rd level, you gain the Rift Strike talent. If you already have it, you can gain another Psionic Talent. Rift Strike does not count against talents known and cannot be switched out on leveling up.',
            },
            {
                title: 'Phase Dancer',
                level: 6,
                text: 'Starting at 6th level, once per turn, you automatically gain one illusory duplicate as per the blurring modifier when you use your Phase Rift power. Your first attack roll before the end of your turn after using Phase Rift gains advantage.',
            },
            {
                title: 'Flickering Presence',
                level: 10,
                text: 'Starting at 10th level, your unspent Psionic Mastery points are not lost until the start of your next turn, but can only be used to cast flicker.',
            },
            {
                title: 'Planeswalker',
                level: 14,
                text: 'Starting at 14th level, you gain the ability to cast plane shift and teleport. You can cast one of these spells per day once without expending a spell slot or use of Innate Psionics. Once you do so, you must finish a long rest before using them again, or use a 7th-level or higher use of Innate Psionics instead. Material components are still required for plane shift this way.',
            },
            {
                title: 'Winding Paths',
                level: 14,
                text: 'Additionally at 14th level, your Phase Rift no longer has to go in a straight line, though it can only pass through a creature’s space once.',
            },
        ],
    },
    {
        key: 'elemental-mind',
        name: 'Elemental Mind',
        introduction:
            'An Elemental Mind is a Psion that can manifest and control elements as an extension of their will.',
        features: [
            {
                title: 'Elemental Power',
                level: 1,
                text: 'At 1st level when you select this archetype, you gain a deep intrinsic tie to elemental power, granting you the ability to manipulate it. You gain the psionic discipline of Psychokinesis.',
            },
            {
                title: 'Primordial Aspect',
                level: 1,
                text: 'Additionally at 1st level, as an action or when you deal fire, cold, or lightning damage, you take on an aspect of that element until the end of your next turn or until you take a new aspect. Cold reduces nonmagical bludgeoning, piercing, or slashing damage taken by your proficiency bonus. Fire causes a creature within 5 feet that hits you with a melee attack to take fire damage equal to your proficiency bonus once per turn. Lightning increases your walking speed by 5 feet. You can spend 1 psi point to gain resistance to the element until the start of your next turn; if specialized in that element, this costs no psi points.',
            },
            {
                title: 'Living Power',
                level: 3,
                text: 'Starting at 3rd level, when you use a power or alternate effect of Psychokinetics, you can apply one modifier: Shaped Power lets you convert ranged spell attacks to melee spell attacks and melee spell attacks to ranged spell attacks against a target within 15 feet; Controlled Power lets you exclude a number of creatures equal to psi points spent from an area effect; or Raging Power lets you reroll a number of damage dice up to 1 plus psi points spent, using the new rolls.',
            },
            {
                title: 'Empowered Psionics',
                level: 6,
                text: 'Starting at 6th level, when you deal damage with a psionic discipline power you can add your Intelligence modifier to the damage dealt.',
            },
            {
                title: 'Full Manifestation',
                level: 10,
                text: 'Starting at 10th level, when you enter a primordial aspect, you can expend 1 psi point to fully manifest that element, replacing the primordial aspect with its stronger effect. If specialized in that element, it does not require a psi point. Cold sets your speed to 0 and grants resistance to all damage except fire and force. Fire fills a 10-foot radius and deals 1d4 + proficiency bonus fire damage to creatures entering or starting there. Lightning lets you teleport a distance up to your speed using movement. If not in an aspect, you can fully manifest a power as a bonus action for 2 psi points, or 1 if specialized.',
            },
            {
                title: 'Elemental Form',
                level: 14,
                text: 'Starting at 14th level, you can expend 5 psi points to cast shapechange and assume a Water Elemental, Fire Elemental, or Air Elemental. The spell has no verbal or material components. If specialized, the cost is 3 psi points and you can assume only the associated form. A Water Elemental assumed this way does not have Freeze. Once cast, you cannot do so until a short or long rest.',
            },
        ],
    },
    {
        key: 'consuming-mind',
        name: 'Consuming Mind',
        introduction:
            'A Consuming Mind is a master of a dangerous branch of psionics, born from the ability to sap energy from other creatures. This power can tear away thoughts, minds, and ultimately vitality for the psion’s own consumption.',
        features: [
            {
                title: 'Psionic Predator',
                level: 1,
                text: 'At 1st level when you select this archetype, you gain the ability to consume the psionic power of others. You gain the psionic discipline of Consumption.',
            },
            {
                title: 'Dark Lurker',
                level: 1,
                text: 'Additionally at 1st level, you gain proficiency in Stealth and Deception. If already proficient, you instead become proficient in a skill of your choice. When you use psionic abilities, you can make an Intelligence (Deception) check contested by a target’s Wisdom (Insight) to conceal your use of psionics. If you spend psi points on the ability, subtract the points spent from your Deception roll result.',
            },
            {
                title: 'Ravenous Powers',
                level: 3,
                text: 'Starting at 3rd level, you gain the Psionic Talent Mind Devourer; it ignores the normal level restriction, does not count against talents known, and cannot be switched out. You can also gain the benefit from a range of 30 feet when a creature is killed by one of your psionic powers.',
            },
            {
                title: 'Empowered Psionics',
                level: 6,
                text: 'Starting at 6th level, when you deal damage with a psionic discipline power you can add your Intelligence modifier to the damage dealt.',
            },
            {
                title: 'Mind Vampire',
                level: 10,
                text: 'Starting at 10th level, you can trigger Mind Devourer any time you deal psychic damage to a target within 30 feet, whether it kills the target or not. You can have additional psi points over your normal limit equal to half your Intelligence modifier, rounded down, when gaining psi points from Mind Devourer; additional points are lost at the end of a short or long rest. Mind Devourer still requires a reaction and all normal restrictions apply.',
            },
            {
                title: 'Shattered Husks',
                level: 14,
                text: 'Starting at 14th level, your Mind Leech ability always gains the Shredding modifier without costing a psi point. You can spend up to 2 additional psi points on that modifier to reduce the target’s next Intelligence, Wisdom, or Charisma saving throw by a total of 3d4. Once applied, you cannot spend additional psi points on the modifier against that creature until 1 hour has passed.',
            },
        ],
    },
];

const attribution = {
    creator: 'KibblesTasty',
    creatorUrl: 'https://www.kthomebrew.com/',
    source: 'Psion',
    sourceVersion: '1.5.3',
    sourceUrl: 'https://www.kthomebrew.com/psion',
    permissionsUrl: 'https://www.kthomebrew.com/permissions',
    license: 'Open Game License Version 1.0a; Copyright 2000, Wizards of the Coast, LLC.',
} as const;

export const psionSubclasses = Object.fromEntries(
    archetypes.map((archetype) => {
        const featureSections = archetype.features.map((feature) => ({
            id: feature.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, ''),
            title: feature.title,
            subtitle: `Level ${feature.level}`,
            blocks: [{ type: 'paragraph' as const, content: [text(feature.text)] }],
        }));
        const page = createInternalPage({
            href: `/classes/psion/${archetype.key}`,
            img: { href: '/icons/white/game/character.svg', alt: `Psion ${archetype.name} icon.` },
            label: archetype.name,
            title: `D&D Portal - ${archetype.name}`,
            subTitle: 'Psion subclass - Homebrew 5e (2014)',
            description: archetype.introduction,
            descriptions: { short: archetype.introduction, long: [[text(archetype.introduction)]] },
            navigation: { parent: 'internals.classes.psion.page' },
            tags: ['psion', 'subclass', 'homebrew', '2014'],
            sourceMetadata: [
                { label: 'Source', value: 'Psion 1.5.3' },
                { label: 'Edition', value: '5e (2014)' },
            ],
            content: {
                source: 'Psion 1.5.3',
                featureSections,
                tableOfContents: featureSections.map(({ id, title }) => ({ id, title })),
            },
        });
        const propertyKey = archetype.key.replace(/-([a-z])/g, (_, letter: string) =>
            letter.toUpperCase(),
        );
        return [propertyKey, { ...page, content: { ...page.content, attribution } }];
    }),
) as Record<string, ReturnType<typeof createInternalPage>>;
