export type PsionFeat = {
    readonly title: string;
    readonly prerequisite?: string;
    readonly text: string;
};

export const psionFeats: readonly PsionFeat[] = [
    {
        title: 'Inner Power',
        prerequisite: 'At least 1 psi or ki point',
        text: 'Your body is powered by the inner powers that course through it. Your maximum psi or ki points (if you have both, your choice of which) increases by 1. At the end of your turn after expending one or more psi or ki points during your turn (not counting temporary or free points, such as those from Psionic Mastery), you heal for a number of hit points equal to the psi or ki points spent.',
    },
    {
        title: 'Psionic Adept',
        text: 'You develop a minor grasp of psionic power, either uncovering an innate potential within yourself, through contact with a psionic source, or through training. You gain one of the psionic disciplines of the Psion class, gaining the attached psionic feature and psionic power, but you do not gain use of any associated spells when you gain a Discipline from this feat. You gain 1 psi point that you can use to empower the Discipline. You regain use of this Psi Point when you finish a short or long rest.',
    },
    {
        title: 'Psionic Mind',
        prerequisite: 'The ability to use at least one psionic discipline',
        text: 'You tap deeper into your psionic potential drawing out a new talent. You can select a psionic talent from the Psion class psionic talent list. You can’t select a talent you already know, or one that requires a level restriction, even if you are already of that level.',
    },
    {
        title: 'War Psion',
        prerequisite: 'The ability to use at least one psionic discipline',
        text: 'You have mastered utilizing psionics in the midst of combat, learning techniques that grant you the following benefits:\n\n• You have advantage on Constitution saving throws that you make to maintain your concentration on a psionic ability when you take damage.\n• You can perform the somatic components of psionic abilities even when you have weapons or a shield in one or both hands.\n• When a hostile creature’s movement provokes an opportunity attack from you, you can use your reaction to use a psionic discipline power or spell targeting the creature, rather than making an opportunity attack. The spell must have a casting time of 1 action and must target only that creature.',
    },
    {
        title: 'Psionic Synthesis',
        prerequisite: '4th-level Psion, 2 or more psionic disciplines known',
        text: 'You gain the ability to meld your Psionic abilities together to produce potent new effects. When you select this feat, you can select one fusion talent for free. You can only select fusion talents when you have all the Disciplines in their prerequisite.',
    },
];

export const psionFusionTalents: readonly PsionFeat[] = [
    {
        title: 'Astral Rift',
        prerequisite:
            'Psionic Synthesis, Transposition Discipline, Projection Discipline, Astral Swap Talent',
        text: 'As a bonus action, you can Phase Rift to where your Astral Construct is; this movement counts as a Phase Rift, and you can apply modifiers to it as normal. Your Astral Construct is moved to where you started this movement along the Phase Rift; during the movement you can command your Astral Construct to attack a creature it passes with its action.',
    },
    {
        title: 'Elemental Phasing',
        prerequisite: 'Psionic Synthesis, Psychokinesis Discipline, Transposition Discipline',
        text: 'As you step between planes, you can tap into the Elemental Planes, bringing their power into the material with you. You can use Psychokinetic modifiers on Phase Rift (excluding Massive). Additionally, whenever you deal damage to an area with a Psychokinetics ability that would include yourself, you can phase yourself out of reality to take no damage from the effect.',
    },
    {
        title: 'Kinetic Mastery',
        prerequisite: 'Psionic Synthesis, Psychokinesis Discipline, Telekinesis Discipline',
        text: 'Your ability to manipulate energy becomes a single blended prowess, freely swapping between manipulating force and energy. You can apply Telekinetic Force modifiers to Kinetic Blast and Elemental Blast modifiers to Telekinetic Force (though to do not gain any benefits from from a Specialization while doing so).',
    },
    {
        title: 'Parasitic Nightmare',
        prerequisite: 'Psionic Synthesis, Consumption Discipline, Telepathy Discipline',
        text: 'You gain the ability to add Telepathic Intrusion modifiers to Mind Leech. Additionally, when you deal psychic damage to a creature that is frightened of you, you can render yourself invisible to that creature until the start of your next turn; you can immediately (no action required) roll an Intelligence (Stealth) check affecting only creatures you are invisible from as a result of this talent. If you are hidden from a creature that is frightened of you, when it moves, you can use your reaction to teleport to an unoccupied space within 5 feet of that creature (at the completion of their movement).',
    },
    {
        title: 'Phantom Blade Barrage',
        prerequisite: 'Psionic Synthesis, Projected Weaponry, Telekinetic Weapons',
        text: 'You can create a weapon with Projected Weapon as part of making an attack with it using Telekinetic Weapons, allowing you to project as many weapons in this manner as you make attacks (no additional action required). When you use weapons created by Projected Weaponry as the projectiles for your Telekinetic Weapons, the range you can fling the weapons is doubled. Additionally, if you expend 6 psi points on the Whirling modifier of Telekinetic Weapons, you can cast blade barrier instead of cloud of daggers, generating a much larger number of ethereal blades as part of the casting.',
    },
    {
        title: 'Physical Telekinesis',
        prerequisite: 'Psionic Synthesis, Enhancement Discipline, Telekinesis Discipline',
        text: 'When you use an Enhancing Surge to empower a creature, you can expend a psi point to augment it with your Telekinesis to further assist them, optionally granting one of the following benefits:\n\n• You can move the creature 10 feet (this movement doesn’t provoke opportunity attacks).\n• You can telekinetically deflect the first weapon attack against them before the start of your next turn, giving that attack disadvantage.\n• You can telekinetically boost their next Strength (Athletics) check or weapon attack before the start of your next turn, granting that check or attack advantage.\n\nAdditionally, while under the effect of Enhancing Surge, the amount you can lift, drag, or carry is doubled with assistance of your telekinesis, and you can apply Telekinetic Force modifiers to your weapon attacks.',
    },
    {
        title: 'Reality Warper',
        prerequisite: 'Psionic Synthesis, Matter Made Real, Mental Image',
        text: 'You can bring the illusions you make people see to life. When you are concentrating on an illusion spell, as a bonus action you can expend psi points during your turn to bring aspects of the illusion into reality. For each psi point spent you can bring a 5-foot-cube section of the illusion into reality until the start of your next turn, and it can have the following effects:\n\n• If the effect would do damage, each 5-foot cube can damage one target. That target must pass a Dexterity saving throw, or take damage equal to a number of d8 dice equal to the level of the spell.\n• If the effect would stop a creature, they can’t move through it. If the effect would restrain a creature, that creature must pass a Dexterity saving throw or become restrained until the start of your next turn.\n• Each 5-foot cube can affect only one creature that is either within it or adjacent to it. The GM may allow other effects at their discretion.',
    },
    {
        title: 'The Void',
        prerequisite: 'Consumption Discipline, Nullification Discipline',
        text: 'You devour all supernatural effects near you. Whenever a creature (including yourself) within 5 feet of you takes damage from a magical source, you can expend 1 or more psi points to use your reaction to reduce the damage taken by 1d8 per psi point spent. You can divide this amount between multiple creatures within range if they take damage at the same time. Additionally, whenever you successfully cast counterspell, dispel magic, or remove curse, you regain hit points equal to the level of spell stopped or ended.',
    },
];
