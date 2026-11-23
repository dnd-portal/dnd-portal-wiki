import { createInternalPage } from '#lib/typescript/data/internals/_helpers_.js';
import { link, text } from '../_basic-class.js';

export type PsionOption = {
    readonly title: string;
    readonly prerequisite?: string;
    readonly text: string;
};
export type PsionDiscipline = {
    readonly slug: string;
    readonly name: string;
    readonly introduction: string;
    readonly passiveProperties?: readonly { readonly title: string; readonly text: string }[];
    readonly power: {
        readonly name: string;
        readonly castingTime: string;
        readonly range: string;
        readonly components: string;
        readonly duration: string;
        readonly text: string;
    };
    readonly alternateEffects: readonly string[];
    readonly talents: readonly PsionOption[];
};

const power = (
    name: string,
    textValue: string,
    castingTime = '1 action',
    range = '60 feet',
    components = 'S',
    duration = 'Instantaneous',
) => ({ name, castingTime, range, components, duration, text: textValue });
const discipline = (
    slug: string,
    name: string,
    introduction: string,
    powerData: ReturnType<typeof power>,
    alternateEffects: readonly string[],
    talents: readonly PsionOption[] = [],
    passiveProperties?: readonly { readonly title: string; readonly text: string }[],
): PsionDiscipline => ({
    slug,
    name,
    introduction,
    power: powerData,
    alternateEffects,
    talents,
    passiveProperties,
});

export const psionDisciplines: readonly PsionDiscipline[] = [
    discipline(
        'enhancement',
        'Enhancement',
        'Enhancement is the ability to interact with a creature’s nature and abilities with your psionic power.',
        power(
            'Enhancing Surge',
            'You empower the body of a target creature you can see with your psionics. The target gains 1d6 temporary hit points and the next time the target deals damage, it deals 1d6 additional damage to one target of that damage roll. Any remaining temporary hit points from this power fade when you use it again.\n\nYou can spend psi points up to your per use limit to add the following modifiers to Enhancing Surge (you can add multiple modifiers). The points must be spent when choosing the target of the power.\n\nFortifying (1+ psi points): The target gains an extra 1d6 temporary hit points for each point spent.\n\nResilient (3 psi points): The target gains resistance to all damage until the start of your next turn.\n\nSavage (1+ psi points): The target’s next weapon attack deals 1d6 additional damage for each point spent.\n\nSwift (2 psi points): The target gains an additional action. That action can be used only to take the Attack (one weapon attack only), Dash, Disengage, Hide, or Use an Object action.',
        ),
        [
            '1: heroism, longstrider, unlocked potential',
            '2: alter self, enlarge/reduce, lesser restoration',
            '3: haste, protection from energy',
            '4: freedom of movement, stoneskin',
            '5: greater restoration, invested competency',
            'If a spell can be cast at a higher level, you can spend additional psi points to cast it at a level equal to the psi points spent.',
        ],
        [
            {
                title: 'Enhancing Skill',
                text: 'You can focus your psionics to enhance your abilities. Whenever you make an ability check using Strength or Dexterity, you can add 1d4 to the result.',
            },
            {
                title: 'Body Control',
                prerequisite: '5th-level Psion',
                text: 'You can cast alter self at will, without expending a spell slot or psi points. Additionally, when you cast enlarge/reduce on yourself, you may expend 1 psi point instead of 2.',
            },
            {
                title: 'Enhanced Regrowth',
                text: 'You gain the cure wounds spell, and can cast it as a 1st-level spell by expending 1 psi point. You can cast it at a higher level by spending an additional psi point for each level above first. When you cast cure wounds on a creature, you can use Enhancing Surge on that creature as a bonus action.',
            },
            {
                title: 'Metamorphosis',
                prerequisite: 'Body Control',
                text: 'The mutate spell and polymorph spells are added to your Enhancement Alternate Effects list. You can only target yourself when casting polymorph this way.',
            },
            {
                title: 'Physical Surge',
                text: 'When you use Enhancing Surge targeting yourself, you can choose to make your Strength or Dexterity ability score equal to your Intelligence ability score until the start of your next turn.',
            },
            {
                title: 'Surging Power',
                text: 'When you target only yourself with Enhancing Surge, you can use the power as a bonus action instead of an action, but the damage and temporary hit points the base power grants are reduced to 1d4 when using the power this way.',
            },
            {
                title: 'Transcendent Life',
                prerequisite: '9th-level Psion',
                text: 'The mass cure wounds and reincarnate spells are added to your Enhancement Alternate Effects list. Reincarnate requires its normal material components when cast this way.',
            },
        ],
    ),
    discipline(
        'projection',
        'Projection',
        'Projection is the ability to project what is in your mind to the outside world with your psionic power.',
        power(
            'Astral Construct',
            'You project an ethereal creation from your mind at a space you can see within range, taking the shape of a Medium or smaller creature, weapon, or other object. This creation is clearly ethereal in nature. When you create it, and on subsequent turns using your action to mentally control it, you can move it up to 30 feet in any direction and attack, so long as it doesn’t move beyond the range of the power. To attack with it, make a melee spell attack. On a hit, the target takes 1d8 force damage. If the Astral Construct moves out of range of the spell, it fades away into nothing, ending the spell.\n\nWhile the Astral Construct is active, you can spend psi points up to your per use limit to issue commands that affect and empower your construct. Commands require no action, but you can’t exceed your psi point limit in total commands issued, and each command can only be issued once per turn.\n\nGrab (1 psi point): Can only be used while your construct is Solidified. A target creature within 5 feet of your construct that is no more than one size larger than the construct must make a Strength saving throw or become restrained by the construct. At the end of each of the restrained creature’s turns it can repeat the saving throw. The condition ends if the construct becomes ethereal again, or becomes more than one size smaller than the target.\n\nGrow (1 psi point): Your construct increases by one size, and its number of damage dice increases by one. It returns to its normal size at the start of your next turn. It can only gain one additional die (for example, up to 2d8).\n\nRelocate (1 psi point): The construct disappears and reappears anywhere within 60 feet of you.\n\nReplicate (3 psi points): You use Relocate, but the original doesn’t disappear. Until the end of your turn, you have another construct and control both with the same action (commands only affect one of your choice). Pick one construct to fade at the start of your next turn or use Sustain.\n\nSolidify (1 psi point): Your construct becomes solid, blocking its space until the start of your next turn. You can only use this command if it is in an unoccupied space. It has an armor class of 16 and hit points equal to your Intelligence modifier + your psion level. The construct becomes ethereal again if it drops to zero hit points.\n\nStrike (2 psi points): The construct makes an attack (even if it has already attacked).\n\nSustain (1+ psi points): At the start of your turn, you can sustain the effect of a Solidify, Grow or Replicate command for an additional round. An effect that has been replicated can be sustained across all replicated constructs with a single use, but each effect can only be sustained once per turn (for example, you can never sustain more than one replicated construct). This costs 1 psi point for each effect sustained. Sustaining Solidify refreshes the construct’s hit points to its maximum.',
            '1 action',
            '60 feet',
            'S',
            'Concentration, up to 1 minute',
        ),
        [
            '1: floating disk, unseen servant',
            '2: mirror image',
            '3: phantom steed',
            '4: arcane eye',
            '5: creation',
            'If a spell can be cast at a higher level, you can spend additional psi points to cast it at a level equal to the psi points spent.',
        ],
        [
            {
                title: 'Animated Projections',
                prerequisite: '10th-level Psion',
                text: 'You learn to project a swarm of ethereal objects. As an action, you can expend 5 psi points to cast animate objects. When cast in this way, the spell creates new ethereal objects rather than animating existing ones.',
            },
            {
                title: 'Astral Swap',
                text: 'As a bonus action, you can expend 1 psi point to swap places with your Astral Construct.',
            },
            {
                title: 'Life Link',
                text: 'When a solidified construct takes damage, you can choose to take that damage instead of the construct (no action required). You have resistance to the damage taken.',
            },
            {
                title: 'Matter Made Real',
                prerequisite: '9th-level Psion',
                text: 'You gain the ability to solidify some of your projections into real objects. You can cast fabricate and wall of stone by expending psi points equal to the spell level.',
            },
            {
                title: 'Projected Weaponry',
                text: 'When you project a weapon with your Project Item feature, it gains the following benefits:\n\n• You can project it as a bonus action and you can project up to 3 weapons or pieces of ammunition at the same time.\n• You are proficient with any projected weapon.\n• It is no longer restricted to a maximum of 3 feet when it takes the form of a weapon (for a Medium-sized creature).\n• You can use your Intelligence modifier in place of your Strength or Dexterity modifier for attack and damage rolls with it.\n• If it has the thrown property, its throwing range is doubled. If it doesn’t have the thrown property, it gains the thrown (10/30) property.\n• You can apply the Astral Construct modifiers Grow and Sustain to Projected Weaponry. Grow adds 1d8 to the weapon’s damage dice. You can expend Psionic Mastery on these modifiers.',
            },
            {
                title: 'Unlimited Imagination',
                prerequisite: 'Shaper’s Mind',
                text: 'When you manifest a construct, you can select two options from Boundless Imagination.',
            },
        ],
        [
            {
                title: 'Project Item',
                text: 'As an action, you can use your powers to project an inanimate object you imagine into your hands. It can’t be larger than 3 feet on any side or weigh more than 10 pounds, and is clearly ethereal in nature. The item behaves as a solid object. Weapons created with this feature deal force damage. Projected items fade after 1 minute, and you can have no more than 3 projected items at a time.',
            },
        ],
    ),
    discipline(
        'telekinesis',
        'Telekinesis',
        'Telekinesis is the ability to interact with physical objects and energy with your psionic powers.',
        power(
            'Telekinetic Force',
            'You smash a target creature or object you can see with your mental power. The target must succeed on a Strength saving throw or take 1d10 bludgeoning damage, and either be shoved 5 feet in a direction of your choosing or be knocked prone.\n\nYou can spend psi points up to your per use limit to add the following modifiers to Telekinetic Force (you can add multiple modifiers). The points must be spent when choosing the target of the power.\n\nCrushing (2 psi points): The target is restrained until the end of its next turn if it fails its saving throw.\n\nHammering (1+ psi points): The target takes 1d10 bludgeoning damage for each point spent if it fails its saving throw.\n\nHurling (1–3 psi points): The target is shoved 10 feet in a direction of your choosing for each point spent if it fails its saving throw.\n\nZone of (1–3 psi points): You can target all creatures in a 5-foot radius of a point within range. The radius doubles for each point spent (5 feet, 10 feet, 20 feet).',
        ),
        [
            '1: jump, launch object, thunderwave',
            '2: fling, levitate, shatter',
            '3: fly, vortex blast',
            '4: orbital stones, resilient sphere',
            '5: telekinesis, wall of force, shockwave',
            'If a spell can be cast at a higher level, you can spend additional psi points to cast it at a level equal to the psi points spent.',
        ],
        [
            {
                title: 'Kinetic Slam',
                text: 'When you use the Telekinetic Force power, you can unleash it as a blast of kinetic power. You can use your power as a ranged spell attack (applying damage and effects on hit) instead of requiring a Strength saving throw. You can only select the Hammering modifier when you use it in this way.',
            },
            {
                title: 'Mental Might',
                prerequisite: '5th-level Psion',
                text: 'You learn to focus your mental grip. You can use your Intelligence modifier instead of other ability modifiers when you make an Athletics check. Additionally, you may attempt to grapple or shove a creature within 30 feet, using your mind. When grappling a creature in this way, you can’t move them. Maintaining a grapple at a range greater than your natural reach requires concentration, as if concentrating on a spell, and the grapple ends if concentration is lost.',
            },
            {
                title: 'Precise Power',
                prerequisite: '9th-level Psion; incompatible with Unchecked Power',
                text: 'The animate objects spell is added to your Telekinesis Alternate Effects list, which you can cast expending 5 psi points. Additionally, as a reaction to a ranged weapon attack you can see being made against a target within 60 feet of you, you can expend 1 psi point to add or subtract 2d4 to or from that attack roll. You can do this after the attack is rolled, but before you know the outcome of the roll.',
            },
            {
                title: 'Telekinetic Movement',
                text: 'You can expend 1 psi point to gain 10 additional feet of movement and the effect of spider climb, feather fall, or levitate until the start of your next turn (no action required). At the start of your next turn, you can expend 1 psi point to maintain the effect before it would end.',
            },
            {
                title: 'Telekinetic Weapons',
                text: 'You gain the Telekinetic Weapons psionic power as part of your Telekinetic Discipline (in addition to your other psionic powers), giving you the ability to fling weapons as per the power.',
            },
            {
                title: 'Telekinetic Barrier',
                text: 'You focus your telekinetic power, spreading it thin to create a large barrier. As an action you can expend 2 psi points to create a wall of weak telekinetic force 15 feet high and up to 40 feet long, or as a 15 radius around you. This barrier is visible as small objects hover and float within it. If you create it around yourself, it moves with you when you move. Ranged attacks that pass through this barrier are made with disadvantage as their trajectory is deflected. You can maintain this barrier by concentrating, as if concentrating on a spell, for up to 1 minute after creating it.',
            },
            {
                title: 'Unchecked Power',
                prerequisite: '9th-level Psion; incompatible with Precise Power',
                text: 'The fissure spell is added to your Telekinesis Alternate Effects list. Additionally, as a reaction to a melee attack being made against you, you can expend 1 psi point to shove the creature away. The creature must make a Strength saving throw, or be knocked 10 feet backwards. If this puts the attack out of reach, the attack automatically misses.',
            },
        ],
        [
            {
                title: 'Telekinetic Hands',
                text: 'When you gain this feature, you can manipulate small objects within 30 feet with your mind as if using your hand to interact with it. You can use this power to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial. You can’t Attack, activate magical items, or carry more than 10 pounds in this manner. You can move an item you are controlling in this way up to 30 feet during your turn.\n\nYou can spend 1 or more psi points to increase how much you can move this way by 100 pounds per psi point spent for 1 turn.',
            },
        ],
    ),
    discipline(
        'telepathy',
        'Telepathy',
        'Telepathy is the ability to interact with the minds of other creatures using your psionic abilities.',
        power(
            'Telepathic Intrusion',
            'You assault the mind of a creature you can see directly. The target must succeed on a Wisdom saving throw, or take 1d8 psychic damage. If the target fails the saving throw, it has disadvantage on attacks made against you until the start of your next turn. You can choose to deal no damage to the creature when it fails its saving throw.\n\nYou can spend Psi Points up to your per use limit to add the following modifiers to Telepathic Intrusion (you can add multiple modifiers). The points must be spent when choosing the target of the power.\n\nMeddling (2 psi points): You make one creature invisible to the target creature or cause the creature to see something that is not there with the effect of minor illusion until the start of your next turn if it fails its saving throw.\n\nOverwhelming (3 psi points): The target is stunned until the end of its next turn if it fails its saving throw.\n\nRending (1+ psi points): The target takes 1d8 psychic damage for each additional point spent on a failed save.\n\nTerrifying (1 psi point): The target is frightened of you until the end of your next turn if it fails its saving throw.',
        ),
        [
            '1: compelled query, command, frighten',
            '2: detect thoughts, suggestion',
            '3: delve mind, fear',
            '4: dominate beast, compulsion, confusion',
            '5: dominate person, modify memory, telepathic bond',
            'If a spell can be cast at a higher level, you can spend additional psi points to cast it at a level equal to the psi points spent.',
        ],
        [
            {
                title: 'Attuned Argument',
                text: 'Your telepathic insight allows to adapt and tailor your influence on others. When you make a Charisma check, after you roll but before you know the outcome, you can choose to roll an additional d20 and take the higher result. You can do this a number of times equal to your proficiency bonus, regaining all uses on a long rest.',
            },
            {
                title: 'Empathy',
                text: 'You can psionically link yourself to other creatures. As a reaction to a creature you can see within 120 feet of you taking damage, you can grant them resistance to the damage taken, but you take psychic damage equal to the damage they take (after resistance). The damage you take can’t be reduced or prevented in any way. If the damage would inflict any further negative status effect on the target, you can choose for that effect to affect you instead. If you have any form of telepathic bond that allows long-distance telepathic communication affecting the creature taking this damage, the range is unlimited and you do not need to be able to see them.',
            },
            {
                title: 'Mental Image',
                text: 'You gain the ability to use your Telepathy to project images into the minds of creatures with perfect clarity, interposing it over their reality. The spells silent image, major image, hallucinatory terrain and seeming are added to your Telepathic Discipline Alternate Effects list costing psi points equal to their spell level.',
            },
            {
                title: 'Mental Influence',
                text: 'You specialize in the subtle touch, picking stray thoughts and soothing concerns without overtly intruding upon a mind. You gain expertise in the Persuasion skill, though you are reduced to normal proficiency against creatures that are immune to mental influence or charm (such a creature under the effect of mind blank).',
            },
            {
                title: 'Reflected Agony',
                text: 'When a creature within 120 feet that you can see deals damage to you, you can use your reaction to spend 1 or more psi points (up to your psi limit) to share the pain you experienced back at them, dealing 1d10 psychic damage per point spent. The damage this deals can’t exceed the damage taken from the attack.',
            },
            {
                title: 'Tactical Opening',
                prerequisite: '5th-level Psion',
                text: 'You can communicate the openings in a creature’s defenses to your allies. When a creature fails a saving throw against your Telepathic Intrusion, you can take the Help action targeting that creature as a bonus action, helping another creature that you can telepathically communicate with. When you take the Help action in this way, the range of it becomes 30 feet.',
            },
            {
                title: 'Telepathic Link',
                text: 'Your Telepathic Communication gains an unlimited range as long as you have communicated with the creature within the last day, and the target willingly maintains the link. However, it takes an action to focus to communicate over distance if you can’t see the target (or for the target to communicate with you if they can’t see you). You can maintain a link with a number of people equal to your Intelligence modifier in this way. You can convey as much in a turn as you could by speaking normally.',
            },
        ],
        [
            {
                title: 'Telepathic Communication',
                text: 'When you gain this feature, you can communicate telepathically with any creature you can see within 30 feet of you. You don’t need to share a language with the creature for it to understand your telepathic utterances, but the creature must be able to understand at least one language. Creatures you communicate with can reply in kind.',
            },
        ],
    ),
    discipline(
        'transposition',
        'Transposition',
        'Transposition is the ability to modify the properties of space and manipulate dimensional boundaries with your psionic powers.',
        power(
            'Phase Rift',
            'You step through space, traveling up to 10 feet in a straight line leaving a spatial tear behind. You can pass through creatures but can’t pass through objects, buildings or terrain more than 4 inches thick. Any creature in the path of this tear must make a Dexterity saving throw or take 1d8 force damage.\n\nYou can spend psi points up to your per use limit to add the following modifiers to Phase Rift (you can add multiple modifiers). The points must be spent when choosing the target of the power.\n\nBlurring (1–3 psi point): You gain an illusory duplicate, as per the mirror image spell. You gain 1 duplicate per psi point spent (up to a maximum of 3). One remaining image fades at the start of each of your turns.\n\nDisruptive (1+ psi points): Each target that fails their saving throw takes an extra 1d8 force damage for each point spent.\n\nEchoing (2 psi points): You immediately use Phase Rift again with the same action.\n\nEthereal (2 psi points): You can pass through solid objects, buildings, and terrain as long as you end your Phase Rift in a space you can occupy. If your Phase Rift would end inside a space you can’t occupy, the power fails.\n\nLong (1–3 psi points): You can travel an additional 10 feet for each point spent.',
            '1 action',
            'Self',
            'S',
            '1 round',
        ),
        [
            '1: expeditious retreat, flicker',
            '2: misty step, blur, pass without a trace',
            '3: blink, nondetection, turbulent warp',
            '4: banishment, dimension cutter, dimension door',
            '5: flickering strikes, spatial manipulation',
            'If a spell can be cast at a higher level, you can spend additional psi points to cast it at a level equal to the psi points spent.',
        ],
        [
            {
                title: 'Rift Strike',
                text: 'When you use your Phase Rift power as an action, you can make a single weapon attack as a bonus action.',
            },
            {
                title: 'Flickering Escape',
                prerequisite: '11th-level Psion',
                text: 'Whenever you roll a d4 for flicker, you can teleport 5 feet after the attack resolves.',
            },
            {
                title: 'Lingering Rifts',
                text: 'When you use Phase Rift you can choose to leave a 5 foot wide tear in reality behind, forming a line between your starting location and ending location until the start of your next turn. Any creature that enters this area for the first time or ends their turn in it must make a saving throw against the effect of Phase Rift as if it passed through them. If a creature is in the area of multiple lingering rifts, they are affected only once.',
            },
            {
                title: 'Phase Shot',
                prerequisite: 'Rift Strike',
                text: 'When you use your Phase Rift power, you can instead empower a piece of ammunition you touch, granting it the following special properties when you fire it:\n\n• It can be fired through all cover, including total cover, that is less than 4 inches thick.\n• It deals 1d8 additional force damage.\n\nAdditionally, applying Phase Rift modifiers grant special effects on this attack:\n• Disruptive: The attack deals an extra 1d8 force damage on hit.\n• Blurring: You can roll an additional attack roll per point spent, selecting the highest roll.\n• Long: The effective range of the attack is increased by 10 feet per point spent.\n• Echoing: A second projectile is created on firing, using a separate attack roll. (You may target any creature in range with this attack, including the same creature)\n• Ethereal: The attack can travel through up to 10 feet of cover.',
            },
            {
                title: 'Phase Slash',
                prerequisite: 'Rift Strike, 11th-level Psion',
                text: 'You can expend 1 psi point to make a single melee weapon attack against any targets you pass through with Phase Rift as part of the same action. You must spend 1 psi point per creature attacked this way. You can make this attack against a target once per turn. You can spend Psionic Mastery points on this talent.',
            },
            {
                title: 'Phase Shroud',
                text: 'After using Phase Rift, you gain temporary hit points equal to your proficiency bonus + the psi points spent on the power.',
            },
        ],
        [
            {
                title: 'Flicker Step',
                text: 'On your turn, you can replace your movement by teleporting 5 feet in any direction to a space you can see. You can pass through creatures but can’t pass through objects, buildings or terrain more than 4 inches thick. This distance increases by 5 feet at 5th level (to 10 feet), at 11th level (to 15 feet), and becomes equal to your speed at 17th level. This replaces all movement for your turn when used.',
            },
        ],
    ),
    discipline(
        'psychokinesis',
        'Psychokinesis',
        'Psychokinesis is the mental art of spontaneously creating and controlling energy; sapping energy to freeze or spontaneously creating bursts of fire or arcs of lightning. Dangerous and destructive, it provides devastating power.',
        power(
            'Elemental Blast',
            'You can use your mind to create a burst of elemental power, blasting a target you can see within range. Make a ranged spell attack against the target. On a hit, the target takes 1d8 cold, fire, force or lightning damage.\n\nFor each die of cold damage dealt, the creature’s speed is reduced by 5 feet until the end of their next turn. For each die of fire damage dealt by the original attack, the creature takes 1d4 fire damage at the start of its next turn. For each die of lightning damage dealt, an arc of lightning strikes another creature of your choice within 20 feet, dealing 1d4 lightning damage (multiple arcs may strike the same creature). Damage from these secondary effects doesn’t add any bonuses (such as Empowered Psionics).\n\nYou can spend psi points up to your per use limit to add the following modifiers to (you can add multiple modifiers). The points must be spent when choosing the target of the power.\n\nAmplified (1+ psi points): The target takes an extra 1d8 cold, fire, force or lightning damage on a hit for each additional point spent.\n\nLasting (1 psi point): Your Elemental Blast leaves a 5-foot-radius sphere of devastation behind where it strikes until the start of your next turn. Creatures that enter this zone for the first time or end their turn in it must make a Constitution saving throw or suffer the secondary effects (slow, burn, arc) of the blast as if they had been hit by it.\n\nMassive (1–3 psi points): You unleash a massive blast; rather than making an attack roll, all creatures within a 15-foot cone must make a Dexterity Saving throw. On failure, they take the effect as if hit by the Elemental Blast. The size of the cone is doubled for each point up to 3 spent (2 points for 30 feet, 3 points for 60 feet).\n\nOvercharged (0 psi points): You take 1d4 force damage and do not add your proficiency bonus from the attack or spell save DC for your Elemental Blast, but increase the damage it deals by twice your proficiency bonus.',
            '1 action',
            '30 feet',
            'S',
            '1 round',
        ),
        [
            '1: burning hands, lightning tendril',
            '2: flaming sphere, scorching ray',
            '3: aether lance, fireball',
            '4: jumping jolt, wall of fire',
            '5: aether storm, cone of cold',
            'If a spell can be cast at a higher level, you can spend additional psi points to cast it at a level equal to the psi points spent.',
        ],
        [
            {
                title: 'Elemental Aegis',
                text: 'As an action, you surround yourself with a swirling shield of fire, ice, or lightning. You gain temporary hit points equal to your psion level + your Intelligence modifier. Creatures that strike you while you have these temporary hit points take 1d4 damage of the shield type chosen. Once you use this talent, you can’t use it again until you finish a short or long rest.',
            },
            {
                title: 'Elemental Emotions',
                text: 'The powers you wield affect your state of mind, empowering you based on how you wield them. When you deal elemental damage, you gain the related mental property until the start of your next turn.\n\nCold: You can add 1d4 to Wisdom saving throws.\n\nFire: You can add 1d4 to Constitution saving throws.\n\nLightning: You can add 1d4 to Dexterity saving throws.\n\nIf you are specialized in an element, you can instead add 1d6 to the related saving throw.',
            },
            {
                title: 'Elemental Shield',
                prerequisite: '9th-level Psion',
                text: 'You gain the ability to cast fire shield without expending psi points. Once you cast it this way, you can’t cast it again until you finish a long rest, unless you spend 4 Psi Points to cast it again.',
            },
            {
                title: 'Manifested Emotions',
                prerequisite: 'Elemental Emotions',
                text: 'You can manifest your emotions into elemental powers that take physical shape. While you are in an elemental emotion, you can expend 2 psi points to manifest that emotion into the world as a bonus action; this takes the form of a mephit (ice mephit for cold, magma mephit for fire, and dust mephit for lightning). As your emotion, given form, it acts immediately after your initiative at your directive. If not destroyed, it lasts for up to 1 minute, after which it naturally fades away. You can’t manifest more than one emotion at a time, and if it is destroyed, you take 2d6 psychic damage from the backlash. This manifestation is not a sentient creature of its own, but simply a manifestation of your emotion.\n\nEmotional Actions\nThere are no mechanical limitations on the actions of the manifested emotion, but it is recommended you consider the emotion from which it is manifest when determining its actions. Magma mephits will act rashly and aggressively, dust mephits will be restless and easily distracted, and ice mephits will be cold and calculating.',
            },
        ],
        [
            {
                title: 'Energy Manipulation',
                text: 'When you gain this feature, you can manipulate energy in minor ways at will. As an action, you can cause a light that emits 30 feet of bright light and 30 feet of dim light, cause objects you touch to catch fire as if touched by a match, cause small arcs of electricity, or freeze or thaw up to 5-foot cube of water. Any ongoing effect you create lasts 1 minute. You can have a number of simultaneous effects active up your Intelligence modifier, after which creating another ends the oldest ongoing effect.',
            },
            {
                title: 'Specializations',
                text: 'When you take this Discipline, you may (but do not have to) select a specialization from the following list. You may only select a specialization at the time of gaining the Discipline, and can’t change or remove a specialization once selected.\n\nCryokinetic\nYou can only deal cold damage with Elemental Blast. When a creature is hit by an attack of your Elemental Blast or fails a saving throw against this power, it becomes frozen until the end of its next turn, giving it disadvantage on its next attack roll or Dexterity saving throw, and reducing its speed by an additional 5 feet (to a total of 10 feet). If the attack roll is a critical hit or the target fails their saving throw by 5 or more, the target becomes restrained while frozen.\n\nCryokinetic Alternate Effects: 1 arctic breath, entomb; 2 cold snap; 3 flash freeze, sleet storm; 4 ice storm, ice spike; 5 cone of cold.\n\nElectrokinetic\nYou can only deal lightning damage with Elemental Blast, but the size of the damage dice of lightning damage (both the initial damage and arc damage) is increased by one step (to 1d10 initial damage and 1d10 additional damage per point spent on Amplified, and 1d6 arc damage to a nearby target per die of initial damage).\n\nElectrokinetic Alternate Effects: 1 lightning tendril, thunder punch; 2 crackle, lightning charged; 3 electrocute, lightning bolt; 4 jumping jolt; 5 sky burst.\n\nPyrokinetic\nYou can only deal fire damage with Elemental Blast, but the size of the damage dice of fire damage (both the initial damage and burn damage) is increased by one step (to 1d10 initial damage and 1d10 additional damage per point spent on Amplified, and 1d6 burn damage at the start of their turn per die of initial damage).\n\nPyrokinetic Alternate Effects: 1 burning hands, hellish rebuke; 2 flaming sphere, scorching ray; 3 fireball, fire cyclone; 4 fire shield, wall of fire; 5 flame strike.',
            },
        ],
    ),
    discipline(
        'precognition',
        'Precognition',
        'Precognition is the ability to see what lies ahead, piercing the veil of the future. Seeing things that most people cannot, a Psion with Precognitive abilities can, to a limited extent, know the future; such a future is known by tracing its roots from the present, and grows more mysterious and cloudy as such roots grow distant. Such a future can be changed by the actions of the present, particularly by knowledge of said future and action to prevent or change it. This is the function most often leveraged by Precognitive Psions, peering into the future to steer around courses they seek to prevent or steer toward a possible outcome they seek.',
        power(
            'Seeing',
            'You concentrate and peer into the stream of future possibilities, gaining insight into what will happen next; you can select one of the following:\n\n• You can grant advantage to yourself or to a creature that can see or hear you on their next attack roll made before the start of your next turn; if an attack that gained advantage from this feature hits, it deals an extra 1d6 damage.\n• You can grant disadvantage on the next attack roll against yourself or a creature that can see or hear you before the start of your next turn; if that attack hits despite the disadvantage, the damaged creature rolls 1d6 and subtracts that from the damage dealt.\n• You can spend psi points up to your per use limit to add the following modifiers to Seeing (you can add multiple modifiers).\n\nOmniscient (1 psi point): The beneficiary of your Seeing is under the effect of bless and guidance until the start of your next turn.\n\nPiercing (1+ psi points): You see through the target’s defenses when granting advantage, increasing the damage of the attack benefiting from advantage by 1d8 per psi point spent if it hits.\n\nPositioning (1+ psi points): The beneficiary of your Seeing can immediately move 5 feet per psi point spent (up to their speed) without provoking opportunity attacks.\n\nThwarting (2 psi points): The beneficiary of your Seeing has advantage on the next saving throw they make before the start of your next turn.\n\nWithheld (0 psi points): Rather than granting advantage or disadvantage on the next attack, you can grant advantage or disadvantage as a reaction to an attack being made until the start of your next turn.',
            '1 action',
            'Self',
            'S',
            'Instantaneous',
        ),
        [
            '1: detect good and evil, future insight',
            '2: augury†, glimpse the future',
            '3: clairvoyance',
            '4: death ward†, divination',
            '5: scrying',
            '†augury has the same effect, but doesn’t consult a specific entity when cast in this way.',
            '†death ward has the same effect, but gives a forewarning to a creature allowing them to avoid death when cast in this way.',
        ],
        [
            {
                title: 'Glimpsed Future',
                text: 'When you use Seeing with yourself as the beneficiary, you can use it as a bonus action. When you use Seeing as a bonus action in this way, it doesn’t grant additional damage to the attack, or reduce damage taken when hit.',
            },
            {
                title: 'One Step Ahead',
                text: 'When you are subjected to a saving throw, you can expend 1 psi point and glimpse into the future. You know what the effect you are saving against is if it is a spell or psionic effect as if you passed an Intelligence (Arcana) or Intelligence (Psionics) check to identify it. Additionally you can add your Intelligence modifier to your saving throw against it regardless of its nature.',
            },
            {
                title: 'Precognitive Dreams',
                prerequisite: '11th-level Psion',
                text: 'When you finish a long rest, your dreams have prepared you for the day to come. Upon waking, you issue reassuring words and advice to your companions to help them survive the day, giving them temporary hit points equal to your Intelligence modifier. During the next 24 hours, you can’t be surprised.',
            },
        ],
        [
            {
                title: 'Prescience',
                text: 'Your eyes wander to events before they happen. You can add your proficiency to Perception and initiative rolls; if you already are able to add your proficiency to Perception, you can add twice your proficiency.\n\nIf you concentrate on keeping an eye on the future (as if concentrating on a spell), you can use your Intelligence modifier for Wisdom (Perception) checks (instead of Wisdom) and initiative rolls (instead of Dexterity), and you make Intelligence saving throws in place of Dexterity saving throws. You can initiate this concentration at any time.',
            },
        ],
    ),
    discipline(
        'nullification',
        'Nullification',
        'Nullification is the ability to interfere with the supernatural effects of the world, reverting reality back to its original state.',
        power(
            'Denial',
            'You release a burst of raw psionic nullification at a creature you can see within range. The creature must make a Charisma saving throw. On failure, it takes 1d4 force damage as its existence is disrupted.\n\nIf the target is an aberration, celestial, construct, elemental, fey, fiend, undead, or a creature with the ability to cast spells or use psionic powers, it takes an extra 1d4 force damage, and becomes disoriented; until the end of its next turn, it rolls a d4 and subtracts the number rolled from all its attack rolls and ability checks, as well as its Constitution saving throws to maintain concentration. A creature can choose to fail the saving throw.\n\nYou can spend psi points up to your per use limit to add the following modifiers to Denial modifying its functionality (you can add multiple modifiers). The points must be spent when choosing the target of the power.\n\nAura of (3 psi points): Instead of targeting a creature, the power becomes an effect around you with a radius of 20 feet until the start of your next turn; any creature of your choice that enters or starts its turn in the area of effect must make a saving throw against the power.\n\nExistential (1+ psi points): You deal an additional 1d4 initial and bonus (if applicable) force damage to the target creature on a failed save.\n\nFirm (2 psi points): The target creature has disadvantage on the saving throw against this ability.\n\nLingering (1+ psi points): You can apply the effect of Disruptive Touch to an affected creature.\n\nSupernatural (1+ psi points): A supernatural effect of or on the creature is ended; if the effect is a magical or psionic power, it is only ended if the psi points spent on this modifier equals or exceeds the spell level or psi points spent on the effect. If the property is an innate property of a creature (either of the target creature, or affecting the target of this power), it is only ended if the psi points exceed the CR (or class levels) of the target creature, and they return at the end of that creature’s next turn. The supernatural effect can’t be its existence, unless it has less than 10 hit points and it would otherwise qualify.',
        ),
        [
            '1: protection from evil and good',
            '2: nullify effect',
            '3: counterspell, dispel magic, remove curse',
            '4: banishment',
            '5: dispel evil and good',
            'If a spell can be cast at a higher level, you can spend an additional psi point to cast it at that higher level.',
        ],
        [
            {
                title: 'Deadspot',
                prerequisite: '15th-level Psion',
                text: 'You gain the ability to expend 8 psi points to cast antimagic field. Once you cast it this way, you can’t cast it again until you finish a long rest.',
            },
            {
                title: 'Iron Templar',
                text: 'You gain proficiency with medium armor and shields. If you already have proficiency with medium armor, you gain proficiency with heavy armor. You can perform somatic components for psionic powers with a hand carrying a weapon. Additionally, when you hit a creature with a melee weapon attack or with a spell attack with a range of touch, you can use your Denial power as a bonus action targeting that creature.',
            },
            {
                title: 'Magical Anathema',
                text: 'You gain resistance to damage dealt by spells or magical effects. The effect of all magical healing effects (including healing potions) on you is halved.',
            },
            {
                title: 'Magical Resistance',
                prerequisite: '9th-level Psion',
                text: 'You have advantage on saving throws against spells and other magical effects.',
            },
        ],
        [
            {
                title: 'Disruptive Touch',
                text: 'When you gain this feature, you can create an aura of interference, wreathing yourself in the disruptive power that asserts reality. You can end minor magical or psionic effects (such as the result of cantrips or zero point psionic powers) by touching them, and have resistance to illusions or magical damage from things you touch (gaining advantage on the saving throw against them, if applicable).\n\nIf you are grappling or otherwise touching a spellcasting or psionic creature, at the start of your turn you can expend 1 or more psi to interfere with their abilities until the start of your next turn. In order to cast a spell or use a psionic power, they must succeed on a saving throw of their spellcasting or psionic ability score against your psionics DC, unless they are casting a spell with a higher level or using a power with more psi points than the psi points spent on this feature.',
            },
        ],
    ),
    discipline(
        'consumption',
        'Consumption',
        'Your psychic powers are those of a predator, and your prey is the minds of others. Their thoughts, their feelings, and their vital psionic energies are your food.',
        power(
            'Mind Leech',
            'You assault the mind of a target you can see within range, rending and devouring its psionic energy. The target must succeed on a Charisma saving throw or take 1d6 psychic damage. If the target is frightened, charmed, stunned, restrained, grappled, or paralyzed, the psychic damage becomes 1d12 instead. On a failed save, you gain a psionic charge of consumed power until the end of your next turn. You can expend this charge when you deal damage to deal additional damage equal to your Intelligence modifier, or consume this charge at the end of your turn to gain temporary hit points equal to your Intelligence modifier. You can spend only one charge at a time.\n\nYou can target the corpse of a recently perished creature with this power, as long as the target has died within the last minute and not been previously leeched by this power.\n\nDevouring (2 psi points): The range of Mind Leech becomes a radius of 5 feet, centered on you.\n\nNourishing (1 psi point): On a failed saving throw, you gain an additional psionic charge.\n\nRending (1+ psi points): The target takes an additional die of damage (1d6 or 1d12 as applicable if they are under the effect of a listed condition) per psi point spent on a failed save.\n\nShredding (1 psi point): You leave the target’s mind and soul shredded, reducing their next saving throw before the end of your next turn by 1d4.\n\nStunning (3 psi points): On a failed saving throw, the target becomes stunned until the start of your next turn. If the power affects multiple targets, select one target for this effect.\n\nThieving (1 psi point): On a failed saving throw, you can draw a 5th level or lower spell the target can cast from its mind (from a Spellcasting or Psionics feature). You must be aware that it can cast that spell; the target retains the ability to cast the spell, but you gain the ability to cast the spell using your Psionics feature by spending psi points equal to the level of the spell (restricted by your psi point limit; you can’t use Psionic Mastery to cast this spell).',
            '1 action',
            '30 feet',
            'S',
            'Instantaneous',
        ),
        [
            '1: inflict wounds',
            '2: psychic drain',
            '3: vampiric touch',
            '4: blight',
            '5: devouring darkness',
            'If a spell can be cast at a higher level, you can spend an additional psi point to cast it at that higher level.',
        ],
        [
            {
                title: 'Consumed Strength',
                text: 'You can use your Intelligence modifier in place of Strength for Athletics checks while you have a psionic charge from Mind Leech. Additionally, targets you are grappling have disadvantage on the saving throw against your Mind Leech power.',
            },
            {
                title: 'Consuming Link',
                text: 'You can target a creature that is charmed by or frightened of you with Mind Leech as long as they are within 120 feet. You do not need to be able to see the target in this way and the target has disadvantage on the saving throw against Mind Leech.',
            },
            {
                title: 'Skill Thief',
                text: 'You can gain an additional number of skill, tool, or language proficiencies from Adaptive Hunter equal to half your proficiency bonus (rounded down) before losing the previously gained proficiency. If you would gain an additional proficiency from it beyond that, the first one you gained is lost.',
            },
            {
                title: 'Unlife Wielder',
                text: 'While you have a psionic charge, as an action you can invest it into a corpse, bringing it to a state of unlife, becoming a zombie or skeleton under your control. It acts on its own initiative immediately after your turn. Its unlife fades at the end of your next turn unless you expend a psionic charge or psi point on your next turn (no action required) to continue its animation for an additional round. You can spend Psionic Mastery points on this.',
            },
        ],
        [
            {
                title: 'Adaptive Hunter',
                text: 'After using your Mind Leech on a target, you can gain one skill, tool or language proficiency that creature has until the end of your next long rest. If you use this ability again, you lose the last proficiency or language to acquire the new one.',
            },
        ],
    ),
];

export const psionicTalents = psionDisciplines.flatMap(({ name, talents }) =>
    talents.map((talent) => ({ ...talent, discipline: name })),
);

const attribution = {
    creator: 'KibblesTasty',
    creatorUrl: 'https://www.kthomebrew.com/',
    source: 'Psion',
    sourceVersion: '1.5.3',
    sourceUrl: 'https://www.kthomebrew.com/psion',
    permissionsUrl: 'https://www.kthomebrew.com/permissions',
    license: 'Open Game License Version 1.0a; Copyright 2000, Wizards of the Coast, LLC.',
} as const;

export const psionDisciplinePages = Object.fromEntries(
    psionDisciplines.map((item) => {
        const alternateEffectContent = (value: string) => {
            const spellLinks = [
                { marker: 'aether lance', path: '/spells/aether-lance' },
                { marker: 'aether storm', path: '/spells/aether-storm' },
                { marker: 'arctic breath', path: '/spells/arctic-breath' },
                { marker: 'cold snap', path: '/spells/cold-snap' },
                { marker: 'compelled query', path: '/spells/compelled-query' },
                { marker: 'crackle', path: '/spells/crackle' },
                { marker: 'delve mind', path: '/spells/delve-mind' },
                { marker: 'devouring darkness', path: '/spells/devouring-darkness' },
                { marker: 'dimension cutter', path: '/spells/dimension-cutter' },
                { marker: 'divide self', path: '/spells/divide-self' },
                { marker: 'electrocute', path: '/spells/electrocute' },
                { marker: 'flickering strikes', path: '/spells/flickering-strikes' },
                { marker: 'flicker', path: '/spells/flicker' },
                { marker: 'fling', path: '/spells/fling' },
                { marker: 'frighten', path: '/spells/frighten' },
                { marker: 'future insight', path: '/spells/future-insight' },
                { marker: 'glimpse the future', path: '/spells/glimpse-the-future' },
                { marker: 'ice spike', path: '/spells/ice-spike' },
                { marker: 'invested competency', path: '/spells/invested-competency' },
                { marker: 'invest life', path: '/spells/invest-life' },
                { marker: 'jumping jolt', path: '/spells/jumping-jolt' },
                { marker: 'launch object', path: '/spells/launch-object' },
                { marker: 'lightning charged', path: '/spells/lightning-charged' },
                { marker: 'lightning tendril', path: '/spells/lightning-tendril' },
                { marker: 'mind blast', path: '/spells/mind-blast' },
                { marker: 'mutate', path: '/spells/mutate' },
                { marker: 'nullify effect', path: '/spells/nullify-effect' },
                { marker: 'orbital stones', path: '/spells/orbital-stones' },
                { marker: 'psychic drain', path: '/spells/psychic-drain' },
                { marker: 'shockwave', path: '/spells/shockwave' },
                { marker: 'sky burst', path: '/spells/sky-burst' },
                { marker: 'spatial manipulation', path: '/spells/spatial-manipulation' },
                { marker: 'terrifying visions', path: '/spells/terrifying-visions' },
                { marker: 'thunder punch', path: '/spells/thunder-punch' },
                { marker: 'turbulent warp', path: '/spells/turbulent-warp' },
                { marker: 'unburden', path: '/spells/unburden' },
                { marker: 'unlocked potential', path: '/spells/unlocked-potential' },
            ];
            const nodes = [];
            let remaining = value;
            while (remaining) {
                const match = spellLinks
                    .map((spell) => ({
                        ...spell,
                        index: remaining.toLowerCase().indexOf(spell.marker),
                    }))
                    .filter((spell) => spell.index >= 0)
                    .sort((left, right) => left.index - right.index)[0];
                if (!match) {
                    nodes.push(text(remaining));
                    break;
                }
                if (match.index > 0) nodes.push(text(remaining.slice(0, match.index)));
                nodes.push(link(`${match.path}/`, match.marker));
                remaining = remaining.slice(match.index + match.marker.length);
            }
            return nodes;
        };
        const featureSections = [
            {
                id: 'introduction',
                title: item.name,
                blocks: [{ type: 'paragraph' as const, content: [text(item.introduction)] }],
            },
            ...(item.passiveProperties ?? []).map((property) => ({
                id: property.title.toLowerCase().replaceAll(' ', '-'),
                title: property.title,
                blocks: [
                    { type: 'paragraph' as const, content: alternateEffectContent(property.text) },
                ],
            })),
            {
                id: 'power',
                title: item.power.name,
                blocks: [
                    {
                        type: 'field-list' as const,
                        items: [
                            { label: 'Casting Time', content: [text(item.power.castingTime)] },
                            { label: 'Range', content: [text(item.power.range)] },
                            { label: 'Components', content: [text(item.power.components)] },
                            { label: 'Duration', content: [text(item.power.duration)] },
                        ],
                    },
                    { type: 'paragraph' as const, content: [text(item.power.text)] },
                ],
            },
            {
                id: 'alternate-effects',
                title: 'Alternate Effects',
                blocks: [
                    {
                        type: 'list' as const,
                        items: item.alternateEffects.map(alternateEffectContent),
                    },
                ],
            },
            {
                id: 'talents',
                title: `${item.name} Talents`,
                blocks: [
                    {
                        type: 'list' as const,
                        items: item.talents.map((talent) => [
                            text(
                                `${talent.title}${talent.prerequisite ? ` (${talent.prerequisite})` : ''}: `,
                            ),
                            ...alternateEffectContent(talent.text),
                        ]),
                    },
                ],
            },
        ];
        const page = createInternalPage({
            href: `/classes/psion/disciplines/${item.slug}`,
            img: { href: '/icons/white/game/character.svg', alt: `${item.name} discipline icon.` },
            label: item.name,
            title: `D&D Portal - ${item.name} Discipline`,
            subTitle: 'Psionic Discipline - Homebrew 5e (2014)',
            description: item.introduction,
            navigation: { parent: 'internals.classes.psion.page' },
            tags: ['psion', 'discipline', 'homebrew', '2014'],
            sourceMetadata: [
                { label: 'Source', value: 'Psion 1.5.3' },
                { label: 'Edition', value: '5e (2014)' },
            ],
            content: {
                source: 'Psion 1.5.3',
                featureSections,
                tableOfContents: featureSections.map(({ id, title }) => ({ id, title })),
                attribution,
            },
        });
        return [item.slug, page];
    }),
);
