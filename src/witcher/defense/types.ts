interface OwnCONFIG extends CONFIG {
  witcher: {
    CritSimple: Record<string, string>;
    CritComplex: Record<string, string>;
    CritDifficult: Record<string, string>;
    CritDeadly: Record<string, string>;
    CritDescription: Record<string, string>;
    CritModDescription: Record<
      string,
      Record<"None" | "Stabilized" | "Treated", string>
    >;
  };
}

interface OwnGame extends Game {}

type HitLocation =
  | "humanHead"
  | "humanTorso"
  | "humanArmR"
  | "humanArmL"
  | "humanLegR"
  | "humanLegL"
  | "monsterHead"
  | "monsterTorso"
  | "monsterLimbR"
  | "monsterLimbL"
  | "monsterSpecial";

type ArmourDataLocation = "Head" | "Torso" | "Arm" | "Leg" | "Limb" | "Special";

type StoppingKey =
  | "headStopping"
  | "headMaxStopping"
  | "torsoStopping"
  | "torsoMaxStopping"
  | "rightArmStopping"
  | "rightArmMaxStopping"
  | "leftArmStopping"
  | "leftArmMaxStopping"
  | "rightLegStopping"
  | "rightLegMaxStopping"
  | "leftLegStopping"
  | "leftLegMaxStopping";

interface ArmourData extends Partial<Record<StoppingKey, number>> {
  // "Poor"
  avail?: string;
  bludgeoning?: boolean;
  cost?: number;
  description?: string;
  effects: any[];
  encumb?: number;
  enhancementItems: any[];
  enhancements?: number;
  equiped?: "/" | false;
  // headMaxStopping?: number;
  // headStopping?: number;
  // leftArmMaxStopping?: number;
  // leftArmStopping?: number;
  // leftLegMaxStopping?: number;
  // leftLegStopping?: number;
  location?: ArmourDataLocation;
  percing?: number;
  quantity?: number;
  reliability?: number;
  reliabilityMax?: number;
  // rightArmMaxStopping?: number;
  // rightArmStopping?: number;
  // rightLegMaxStopping?: number;
  // rightLegStopping?: number;
  slashing: boolean;
  // torsoMaxStopping?: number;
  // torsoStopping?: number;
  weight?: number;
  /**
   * Added for table sort, generated on runtime
   */
  index?: number;
}

interface EnhancementData {
  cost?: number;
  equiped?: "/" | false;
  stopping?: number;
  bludgeoning?: number;
  percing?: number;
  slashing?: number;
}

interface OwnItemData<D> {
  name: string;
  _id: string;
  img: string;
  data: D;
}

type CoreStat = "enc" | "leap" | "rec" | "run" | "stun" | "woundThreshold";
interface CoreStatDetails {
  max: number;
  current: number;
  /**
   * WITCHER.Actor.CoreStat.Enc
   */
  label: string;
  isOpened: boolean;
  value: number;
  modifiers: {
    id: string;
    name: string;
    /** Stringified number */
    value: string;
  }[];
}

interface DerivedStatDetails {
  label: string;
  modifiers: {
    id: string;
    name: string;
    /** Stringified number */
    value: string;
  }[];
  value: number;
}

type CurrencyUnit =
  | "bizant"
  | "crown"
  | "ducat"
  | "falsecoin"
  | "floren"
  | "lintar"
  | "oren";

interface ActorData {
  coreStats: Record<CoreStat, CoreStatDetails>;
  currency: Record<CurrencyUnit, number>;
  deathStateApplied: boolean;
  derivedStats: {
    focus: DerivedStatDetails & { current: number; max: number };
    /**
     * HP Modifiers are for max HP, not HP
     */
    hp: DerivedStatDetails & { max: number };
    modifiersIsOpen: boolean & { max: number };
    resolve: DerivedStatDetails & { max: number };
    sta: DerivedStatDetails & { max: number };
    vigor: DerivedStatDetails;
  };
  pannels: {
    bodyIsOpen: boolean;
    dexIsOpen: boolean;
    intIsOpen: boolean;
    refIsOpen: boolean;
    willIsOpen: boolean;
  };
}

interface PlayerActorData extends ActorData {
  adrenaline: number;
  gender: string;
  improvementPoints: number;
}

type MonsterArmourKey = "armorHead" | "armorLower" | "armorUpper";

/**
 * See p. 267
 */
interface MonsterActorData extends ActorData, Record<MonsterArmourKey, number> {
  adrenaline: { current: number; label: string };
  category:
    | "Humanoid"
    | "Necrophage"
    | "Specter"
    | "Beast"
    | "CursedOne"
    | "Hybrid"
    | "Insectoid"
    | "Elementa"
    | "Relict"
    | "Ogroid"
    | "Draconid"
    | "Vampire";
  /**
   * e.g."10"
   */
  bounty: string | number;
  /**
   * Description
   */
  common: string;
  commonSkillValue: number;
  config: OwnCONFIG["witcher"];
  critWounds: unknown[];
  customStat: boolean;
  difficulty: "simple" | "complex" | "hard" | "";
  /**
   * Vulnerabilities
   */
  susceptibilities: string;
  threat: "easy" | "medium" | "hard" | "";
}

interface LayeredArmourDatum {
  id: string;
  img: string;
  enhancements: { id: string; img: string; name: string }[];
  name: [armourName: string] | [innerArmour: string, outerArmour: string];
  inner?: LayeredArmourDatum | undefined;
  isStrongerThanInner: boolean;
  sp: {
    base: number;
    enhancements: Record<string, number>;
    total: number;
    difference: number;
    bonus: number;
    totalWithBonus: number;
  };
}

export type {
  ActorData,
  PlayerActorData,
  MonsterActorData,
  MonsterArmourKey,
  OwnCONFIG,
  OwnGame,
  ArmourData,
  EnhancementData,
  OwnItemData,
  HitLocation,
  ArmourDataLocation,
  StoppingKey,
  LayeredArmourDatum,
};
