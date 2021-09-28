import type {
  ArmourDataLocation,
  HitLocation,
  MonsterArmourKey,
  OwnCONFIG,
  StoppingKey,
} from "./types";

declare var CONFIG: OwnCONFIG;

const hitLocationNameIndex: Record<HitLocation, string> = {
  humanHead: "Head",
  humanTorso: "Torso",
  humanArmR: "R. Arm",
  humanArmL: "L. Arm",
  humanLegR: "R. Leg",
  humanLegL: "L. Leg",
  monsterHead: "Head",
  monsterTorso: "Torso",
  monsterLimbR: "R. Limb",
  monsterLimbL: "L. Limb",
  monsterSpecial: "Special (Tail or Wing)",
};

const hitLocationCreatureIndex: Record<HitLocation, "Human" | "Monster"> = {
  humanHead: "Human",
  humanTorso: "Human",
  humanArmR: "Human",
  humanArmL: "Human",
  humanLegR: "Human",
  humanLegL: "Human",
  monsterHead: "Monster",
  monsterTorso: "Monster",
  monsterLimbR: "Monster",
  monsterLimbL: "Monster",
  monsterSpecial: "Monster",
};

const stoppingPowerCols: [
  "humanHead",
  "humanTorso",
  "humanArmR",
  "humanArmL",
  "humanLegR",
  "humanLegL",
] = [
  "humanHead",
  "humanTorso",
  "humanArmR",
  "humanArmL",
  "humanLegR",
  "humanLegL",
];

const criticalNameIndex = {
  Simple: CONFIG.witcher.CritSimple,
  Complex: CONFIG.witcher.CritComplex,
  Difficult: CONFIG.witcher.CritDifficult,
  Deadly: CONFIG.witcher.CritDeadly,
};

const critWoundUnaimedThresholdIndex: Record<
  keyof typeof criticalNameIndex,
  Record<string, [number, number]>
> = {
  Simple: {
    SimpleCrackedJaw: [12, 12],
    SimpleDisfiguringScar: [11, 11],
    SimpleCrackedRibs: [9, 10],
    SimpleForeignObject: [6, 8],
    SimpleSprainedArm: [4, 5],
    SimpleSprainedLeg: [2, 3],
  },
  Complex: {
    ComplexMinorHeadWound: [12, 12],
    ComplexLostTeeth: [11, 11],
    ComplexRupturedSpleen: [9, 10],
    ComplexBrokenRibs: [6, 8],
    ComplexFracturedArm: [4, 5],
    ComplexFracturedLeg: [2, 3],
  },
  Difficult: {
    DifficultSkullFracture: [12, 12],
    DifficultConcussion: [11, 11],
    DifficultTornStomach: [9, 10],
    DifficultSuckingChestWound: [6, 8],
    DifficultCompoundArmFracture: [4, 5],
    DifficultCompoundLegFracture: [2, 3],
  },
  Deadly: {
    DeadlyDecapitated: [12, 12],
    DeadlyDamagedEye: [11, 11],
    DeadlyHearthDamage: [9, 10],
    DeadlySepticShock: [6, 8],
    DeadlyDismemberedArm: [4, 5],
    DeadlyDismemberedLeg: [2, 3],
  },
};

const hitLocationToSPIndex: Record<HitLocation, [StoppingKey, StoppingKey]> = {
  humanHead: ["headStopping", "headMaxStopping"],
  humanTorso: ["torsoStopping", "torsoMaxStopping"],
  humanArmR: ["rightArmStopping", "rightArmMaxStopping"],
  humanArmL: ["leftArmStopping", "leftArmMaxStopping"],
  humanLegR: ["rightLegStopping", "rightLegMaxStopping"],
  humanLegL: ["leftLegStopping", "leftLegMaxStopping"],
  // Unused
  monsterHead: ["headStopping", "headMaxStopping"],
  monsterTorso: ["torsoStopping", "torsoMaxStopping"],
  // // Limbs assumed to be arms
  monsterLimbR: ["rightArmStopping", "rightArmMaxStopping"],
  monsterLimbL: ["leftArmStopping", "leftArmMaxStopping"],
  // // No idea about this
  monsterSpecial: ["rightLegStopping", "rightLegStopping"],
};

const hitLocationToMonsterArmourIndex: Record<HitLocation, MonsterArmourKey> = {
  humanHead: "armorHead",
  humanTorso: "armorUpper",
  humanArmR: "armorUpper",
  humanArmL: "armorUpper",
  humanLegR: "armorLower",
  humanLegL: "armorLower",
  // Unused
  monsterHead: "armorHead",
  monsterTorso: "armorUpper",
  // // Limbs assumed to be arms
  monsterLimbR: "armorUpper",
  monsterLimbL: "armorUpper",
  // // No idea about this
  monsterSpecial: "armorLower",
};

const monsterArmourToHitLocations: Record<"human" | "monster", HitLocation[]> =
  {
    human: [
      "humanHead",
      "humanTorso",
      "humanArmR",
      "humanArmL",
      "humanLegR",
      "humanLegL",
    ],
    monster: [
      "monsterHead",
      "monsterTorso",
      "monsterLimbR",
      "monsterLimbL",
      "monsterSpecial",
    ],
  };

const monsterArmourKeys: MonsterArmourKey[] = [
  "armorHead",
  "armorLower",
  "armorUpper",
];
const monsterArmorNameIndex: Record<MonsterArmourKey, string> = {
  armorHead: "Head",
  armorUpper: "Upper",
  armorLower: "Lower",
};

const hitLocationCritWoundKeyIndex: Record<
  keyof typeof criticalNameIndex,
  Record<
    Exclude<
      HitLocation,
      "humanHead" | "humanTorso" | "monsterHead" | "monsterTorso"
    >,
    string
  > &
    Record<
      "humanHead" | "humanTorso" | "monsterHead" | "monsterTorso",
      { greater: string; lesser: string }
    >
> = {
  Simple: {
    humanHead: {
      greater: "SimpleCrackedJaw",
      lesser: "SimpleDisfiguringScar",
    },
    humanTorso: {
      greater: "SimpleCrackedRibs",
      lesser: "SimpleForeignObject",
    },
    humanArmR: "SimpleSprainedArm",
    humanArmL: "SimpleSprainedArm",
    humanLegR: "SimpleSprainedLeg",
    humanLegL: "SimpleSprainedLeg",
    monsterHead: {
      greater: "SimpleCrackedJaw",
      lesser: "SimpleDisfiguringScar",
    },
    monsterTorso: {
      greater: "SimpleCrackedRibs",
      lesser: "SimpleForeignObject",
    },
    monsterLimbR: "SimpleSprainedArm",
    monsterLimbL: "SimpleSprainedArm",
    monsterSpecial: "SimpleSprainedArm",
  },
  Complex: {
    humanHead: {
      greater: "ComplexMinorHeadWound",
      lesser: "ComplexLostTeeth",
    },
    humanTorso: {
      greater: "ComplexRupturedSpleen",
      lesser: "ComplexBrokenRibs",
    },
    humanArmR: "ComplexFracturedArm",
    humanArmL: "ComplexFracturedArm",
    humanLegR: "ComplexFracturedLeg",
    humanLegL: "ComplexFracturedLeg",
    monsterHead: {
      greater: "ComplexMinorHeadWound",
      lesser: "ComplexLostTeeth",
    },
    monsterTorso: {
      greater: "ComplexRupturedSpleen",
      lesser: "ComplexBrokenRibs",
    },
    monsterLimbR: "ComplexFracturedArm", // ??
    monsterLimbL: "ComplexFracturedArm",
    monsterSpecial: "ComplexFracturedArm",
  },
  Difficult: {
    humanHead: {
      greater: "DifficultSkullFracture",
      lesser: "DifficultConcussion",
    },
    humanTorso: {
      greater: "DifficultTornStomach",
      lesser: "DifficultSuckingChestWound",
    },
    humanArmR: "DifficultCompoundArmFracture",
    humanArmL: "DifficultCompoundArmFracture",
    humanLegR: "DifficultCompoundLegFracture",
    humanLegL: "DifficultCompoundLegFracture",
    monsterHead: {
      greater: "DifficultSkullFracture",
      lesser: "DifficultConcussion",
    },
    monsterTorso: {
      greater: "DifficultTornStomach",
      lesser: "DifficultSuckingChestWound",
    },
    monsterLimbR: "DifficultCompoundArmFracture",
    monsterLimbL: "DifficultCompoundArmFracture",
    monsterSpecial: "DifficultConcussion",
  },
  Deadly: {
    humanHead: {
      greater: "DeadlyDecapitated",
      lesser: "DeadlyDamagedEye",
    },
    humanTorso: {
      greater: "DeadlyHearthDamage",
      lesser: "DeadlySepticShock",
    },
    humanArmR: "DeadlyDismemberedArm",
    humanArmL: "DeadlyDismemberedArm",
    humanLegR: "DeadlyDismemberedLeg",
    humanLegL: "DeadlyDismemberedLeg",
    monsterHead: {
      greater: "DeadlyDecapitated",
      lesser: "DeadlyDamagedEye",
    },
    monsterTorso: {
      greater: "DeadlyHearthDamage",
      lesser: "DeadlySepticShock",
    },
    monsterLimbR: "DeadlyDismemberedArm",
    monsterLimbL: "DeadlyDismemberedArm",
    monsterSpecial: "DeadlyDismemberedArm",
  },
};

/**
 * @deprecated
 * Currently unused as attack already deducts hit location
 * penalty
 */
const hitLocationPenaltyIndex: Record<HitLocation, number> = {
  humanHead: 6,
  humanTorso: 1,
  humanArmR: 3,
  humanArmL: 3,
  humanLegR: 2,
  humanLegL: 2,
  monsterHead: 6,
  monsterTorso: 1,
  monsterLimbR: 3,
  monsterLimbL: 3,
  monsterSpecial: 2,
};
const hitLocationAimedDamageBonusIndex: Record<HitLocation, number> = {
  humanHead: 3,
  humanTorso: 1,
  humanArmR: 0.5,
  humanArmL: 0.5,
  humanLegR: 0.5,
  humanLegL: 0.5,
  monsterHead: 3,
  monsterTorso: 1,
  monsterLimbR: 0.5,
  monsterLimbL: 0.5,
  monsterSpecial: 0.5,
};

const hitLocationToArmorLocationIndex: Record<HitLocation, ArmourDataLocation> =
  {
    humanHead: "Head",
    humanTorso: "Torso",
    humanArmR: "Arm",
    humanArmL: "Arm",
    humanLegR: "Leg",
    humanLegL: "Leg",
    monsterHead: "Head",
    monsterTorso: "Torso",
    monsterLimbR: "Limb",
    monsterLimbL: "Limb",
    monsterSpecial: "Special",
  };

// pp. 155
const differencesInSP: [range: [min: number, max: number], bonus: number][] = [
  [[0, 4], 5],
  [[5, 8], 4],
  [[9, 14], 3],
  [[15, 20], 2],
];

export {
  hitLocationNameIndex,
  hitLocationCreatureIndex,
  hitLocationToSPIndex,
  stoppingPowerCols,
  monsterArmorNameIndex,
  criticalNameIndex,
  critWoundUnaimedThresholdIndex,
  hitLocationCritWoundKeyIndex,
  hitLocationPenaltyIndex,
  hitLocationToMonsterArmourIndex,
  monsterArmourToHitLocations,
  monsterArmourKeys,
  hitLocationAimedDamageBonusIndex,
  hitLocationToArmorLocationIndex,
  differencesInSP,
};
