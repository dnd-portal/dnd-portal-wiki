import type { PsionOption } from './disciplines.js';

export type PsionTalent = PsionOption & { readonly discipline: string };

export const generalPsionicTalents: readonly PsionTalent[] = [
    {
        title: 'Astral Arms',
        discipline: 'General',
        text: 'As a bonus action, you can expend 1 psi point to create psionic constructions serving as additional appendages. These arms last for 10 minutes. You determine the arms’ appearance, and they vanish early if you are incapacitated or die. You can use the astral arms to make unarmed strikes. The unarmed strikes you make with the arms use your Intelligence modifier in place of your Strength modifier for the attack and damage rolls. If you hit with one of them, you deal force damage equal to 1d6 + your Intelligence modifier, instead of the bludgeoning damage normal for an unarmed strike. When you create them, or by spending 1 psi point as a bonus action while they are manifested, you can make a single unarmed strike with these arms as a bonus action. You can use Psionic Mastery points on this.',
    },
    {
        title: 'Aura Sight',
        discipline: 'General',
        text: 'As an action, you can spend 1 psi point to psionically see the aura of a creature of your choice within 30 feet. When you see the creature’s aura in this way, you can determine if there are any spells or magical effects affecting the creature, and you learn their schools of magic, if any. You can also determine if the creature is under the influence of psionics. A shapeshifter or creature that is transformed or disguised by magical or nonmagical means must make a Charisma (Deception) check against your Psionics save DC. On a failure, you can perceive their original form in their aura.',
    },
    {
        title: 'Awaken Mind',
        discipline: 'General',
        prerequisite: '9th-level Psion',
        text: 'You can cast awaken once without expending a spell slot or psi points. You can’t do so again until you finish a long rest.',
    },
    {
        title: 'Beam of Annihilation',
        discipline: 'General',
        prerequisite: '11th-level Psion; Elemental Mind subclass',
        text: 'You gain the ability to cast a beam of annihilation for 6 psi points. If you have a specialization of Psychokinesis, you can only select the related elemental damage type, but the beam’s damage ignores resistance to that damage type.',
    },
    {
        title: 'Controlled Power',
        discipline: 'General',
        text: 'You gain the ability to suppress the glow and somatic component of your psionic powers. You can expend 2 psi points to use a power without a visual sign or somatic component. Each time you use this talent, the cost of doing so doubles until you finish a short or long rest.',
    },
    {
        title: 'Divided Mind',
        discipline: 'General',
        prerequisite: '9th-level Psion',
        text: 'You learn the divide self spell, and can cast it by expending 5 psi points. When you gain access to the Innate Psionics feature, you may expend a use of Innate Psionics to cast divide self at the level of the use of Innate Psionics expended. You do not require the material components of the spell when you cast it by expending psi points or a use of Innate Psionics.',
    },
    {
        title: 'Dreamwalker',
        discipline: 'General',
        prerequisite: '9th-level Psion',
        text: 'You gain the ability to cast dream. You can cast the spell without expending a spell slot, but once cast, you can’t cast it again until you finish a long rest.',
    },
    {
        title: 'Elemental Penetration',
        discipline: 'General',
        prerequisite: 'Elemental Mind subclass',
        text: 'When you use a psionic power or spell that deals cold, fire, or lightning damage, you can expend 1 psi point to make the power ignore resistance to that elemental damage type. If you have a specialization of Psychokinesis, if the target has immunity to the damage type chosen, this instead turns immunity into resistance for that power. You can spend psi points granted by Psionic Mastery on this ability.',
    },
    {
        title: 'Empowered Strike',
        discipline: 'General',
        prerequisite: 'Psychokinesis or Telekinesis Discipline',
        text: 'Once per turn, as part of making a weapon attack as part of the Attack action, you can empower a melee weapon you are holding with psionic power. When you hit a creature with a weapon, you can apply Elemental Blast or Telekinetic Force modifiers (you can only select a power you know) to the attack (you can use Psionic Mastery on this). This doesn’t deal the base damage of the power, but any added damage causes the additional effects of the power to occur.',
    },
    {
        title: 'Life Wielder',
        discipline: 'General',
        prerequisite: 'Enhancement or Consumption',
        text: 'You learn the spell invest life. You can spend Psionic Mastery points to cast this spell.',
    },
    {
        title: 'Mind Devourer',
        discipline: 'General',
        prerequisite: '5th-level Psion',
        text: 'You gain the ability to cast psychic drain for 2 psi points. Additionally, whenever a creature within 10 feet of you with an Intelligence score of 6 or higher dies, you can expend your reaction to draw in its psionic power, regaining 1d4 hit points and 1 expended psi point.',
    },
    {
        title: 'Mind Rider',
        discipline: 'General',
        text: 'As an action, you can touch a willing creature to see through its eyes and hear what it hears for the next hour, gaining the benefits of any special senses that the creature has. During this time, you are deaf and blind with regard to your own senses. You can end this effect at any time. While this is active, the creature has advantage on Intelligence, Wisdom, and Charisma saving throws.',
    },
    {
        title: 'Perfect Focus',
        discipline: 'General',
        prerequisite: '10th-level Psion',
        text: 'You can enter a state of extreme focus. Your concentration is no longer interrupted by using a second ability that requires concentration, but your speed is reduced to 0 while concentrating on more than one effect; you have a −5 penalty to any Constitution saving throw to maintain concentration. If you move or fail a save to maintain concentration, one of the spells you are concentrating on ends. If you fail the saving throw to maintain concentration by 5 or more, you lose concentration on both spells.',
    },
    {
        title: 'Personal Truth',
        discipline: 'General',
        text: 'If you spend at least one minute convincing yourself of something—no matter how absurd—spells and effects to determine if you are telling the truth will register that you believe what you have convinced yourself of. Additionally, when you expend 1 psi point, you can conjure any Tiny object you can imagine that is worth 1 sp or less, change the color or taste of a Small or smaller object for 1 minute, or change the damage type a creature within 30 feet takes as a reaction.',
    },
    {
        title: 'Psionic Defenses',
        discipline: 'General',
        text: 'While you are not wearing any armor or carrying a shield, your AC equals 13 + your Intelligence modifier.',
    },
    {
        title: 'Potent Psionics',
        discipline: 'General',
        text: 'When a target passes the saving throw against a damaging Psionic Power granted by a psionic discipline, they still take half the damage, but suffer no other effects.',
    },
    {
        title: 'Psionic Weapon',
        discipline: 'General',
        text: 'As a bonus action, you can expend 1 psi point to imbue a weapon you are holding with psionic energy for 1 minute. Once per turn when you deal damage with that weapon, you can deal an extra 1d6 psychic damage. You can spend 2 psi points for 2d6 at 5th level, 3 psi points for 3d6 at 11th level, or 4 psi points for 4d6 at 17th level.',
    },
    {
        title: 'Projected Nightmares',
        discipline: 'General',
        prerequisite: 'Shaper’s Mind subclass',
        text: 'You gain an additional option for Boundless Imagination to apply to your Astral Construct: Horrifying Nightmare. Creatures of your choice that start their turn within 5 feet of your Astral Construct must make a Wisdom saving throw against your Psionics DC or become frightened of your Astral Construct until the start of their next turn. On a successful save, they are immune to the effect for the next 24 hours or until you summon a new Astral Construct.',
    },
    {
        title: 'Propelled Bound',
        discipline: 'General',
        prerequisite: 'Telekinesis or Psychokinesis',
        text: 'When you move on your turn, you can expend movement, up to your speed, in a single bounding leap, propelled by telekinetic power or psychokinetic force.',
    },
    {
        title: 'Schism',
        discipline: 'General',
        prerequisite: '5th-level Psion',
        text: 'You can spend 1 psi point to temporarily divide your mind to do two things at once until the end of your turn. While dividing your mind, if you use your action on a psionic power or spell granted by a Psionic Discipline, you can use your bonus action to use a psionic power that would normally take an action. The two powers share your per use psi point limit between them.',
    },
    {
        title: 'Tantrum',
        discipline: 'General',
        prerequisite: 'Unleashed Mind subclass',
        text: 'When you roll initiative, you can instantly increase your rampage die by one step. Additionally, if you take damage while your rampage die is a d6 or lower, your rampage die increases by one step.',
    },
];

export const telekineticWeapons = {
    name: 'Telekinetic Weapons',
    castingTime: '1 action',
    range: '30 feet',
    components: 'S',
    duration: 'Instantaneous',
    text: 'You telekinetically fling a weapon at a creature or object. Choose a weapon within 15 feet that isn’t being worn or carried, or choose a weapon under your control. Make a ranged spell attack. On hit the target takes damage equal to the weapon’s damage dice. The range of the attack decreases to 15 feet if the weapon has the heavy or special property, and increases to 60 feet if the weapon has the light property. You can use Psionic Mastery points on this power, and this power counts as a Discipline Power of the Telekinesis Discipline.',
    modifiers: [
        'Multiple (1+ psi points): For each additional psi point spent, you can fling an additional weapon, making a separate attack and damage roll for each weapon flung.',
        'Whirling (2+ psi points): You can replace one throwing of a weapon with casting cloud of daggers. It is cast at a level equal to the psi points spent.',
    ],
} as const;

export const psiCrystal = {
    name: 'Psi Crystal',
    text: 'You gain the ability to impart part of your mind into crystal. You can expend 2 psi points to cast the find familiar spell, but your familiar takes on the statistics of a psi crystal and the material component required is a crystal worth 10 gp instead of the normal material components. The Psi Crystal gains your Intelligence, Wisdom, and Charisma scores. You can use Psionic Disciplines with a range greater than self through your Psi Crystal as if you were standing in its location. If the psi crystal is destroyed, you gain its memories as your own. While you have a Psi Crystal active, as a bonus action, you can deactivate it to regain 2 expended psi points.',
    statblock: [
        'Tiny construct, unaligned',
        'Armor Class 20 (natural armor)',
        'Hit Points 2 (1d4)',
        'Speed 0 ft., fly 20 ft. (hover)',
        'STR 1 (−5) DEX 10 (+0) CON 10 (+0) INT 10 (+0) WIS 10 (+0) CHA 10 (+0)',
        'Skills Perception +4',
        'Damage Vulnerabilities bludgeoning',
        'Damage Resistances piercing, slashing',
        'Condition Immunities blinded, charmed, deafened, frightened, paralyzed, petrified, poisoned, stunned',
        'Senses blindsight 60 ft. (blind beyond this radius), passive Perception 14',
        'Languages understands the languages of its creator but can’t speak',
    ],
    options: [
        'Courage. When you make a saving throw against the frightened condition, you can use your reaction to shatter the crystal, releasing that emotion to gain advantage on the save.',
        'Cowardice. When your Psi Crystal is within 30 feet of you and a creature comes within 5 feet of you, you can use your reaction to shatter the crystal, releasing that emotion and immediately moving up to your speed away from the creature without taking any opportunity attacks.',
        'Cruelty. When your Psi Crystal is within 30 feet of a creature that takes damage, you can use your reaction to shatter the crystal, releasing that emotion and causing the creature to take additional damage equal to your psion level.',
        'Sympathy. When your Psi Crystal is within 30 feet of you and another creature, if that creature takes damage, you can use your reaction to shatter the crystal, releasing that emotion and granting the creature resistance to that damage. You take an equal amount of damage to the damage they take.',
    ],
} as const;
