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

export type {
  OwnCONFIG,
  OwnGame,
  ArmourData,
  EnhancementData,
  OwnItemData,
  HitLocation,
  ArmourDataLocation,
  StoppingKey,
};
