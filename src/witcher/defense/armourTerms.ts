import { differencesInSP } from "./constants";

import type {
  ArmourData,
  EnhancementData,
  LayeredArmourDatum,
  OwnItemData,
  StoppingKey,
} from "./types";

const getArmourTerms = (options: {
  armours: OwnItemData<ArmourData>[];
  armourAttachments: {
    id: string | undefined;
    armourId: string;
  }[];
  armourHitLocationKey: StoppingKey;
  armourMaxHitLocationKey: StoppingKey;
  armourLayerNumbers: {
    id: string | undefined;
    layer: number;
  }[];
  enhancementItems: OwnItemData<EnhancementData>[];
}) => {
  const {
    armours,
    armourAttachments,
    armourHitLocationKey,
    armourMaxHitLocationKey,
    armourLayerNumbers,
    enhancementItems,
  } = options;
  const filteredArmours = armours
    .filter((armour) => {
      const spVal = armour.data[armourHitLocationKey];
      const armourLayerNumber =
        armourLayerNumbers.find((nr) => nr.id === armour._id)?.layer ?? 0;
      return typeof spVal === "number" && spVal > 0 && armourLayerNumber > 0;
    })
    .map((armour, i) => {
      armour.data.index = i;
      return armour;
    });
  filteredArmours.sort((a, b) => {
    const aNr = armourLayerNumbers.find((nr) => nr.id === a._id)?.layer ?? 0;
    const bNr = armourLayerNumbers.find((nr) => nr.id === b._id)?.layer ?? 0;
    if (aNr === bNr && a.data.index && b.data.index) {
      const aSP = a.data?.[armourHitLocationKey];
      const bSP = b.data?.[armourHitLocationKey];
      if (aSP && bSP && aSP !== bSP) {
        return aSP - bSP;
      }
      // If same SP, sort by table index
      return a.data.index - b.data.index;
    }
    return aNr - bNr;
  });
  const armourTerms: RollTerm[] = [];
  const armourTotals: number[] = [];
  let layeredArmourTerm: RollTerm | undefined;

  let layeredArmourMarkupData = {} as LayeredArmourDatum;
  const armourMarkupData: LayeredArmourDatum[] = [];

  filteredArmours.forEach((filteredArmour, armourIndex) => {
    const enhs = armourAttachments
      .filter((att) => att.armourId === filteredArmour._id)
      .map((att) => enhancementItems.find((item) => att.id === item._id));

    const baseArmourSP = filteredArmour.data[armourHitLocationKey];
    const baseArmourMaxSP = filteredArmour.data[armourMaxHitLocationKey];

    if (typeof baseArmourSP === "number") {
      const armourWithEnhancementTerms: RollTerm[] = [
        new NumericTerm({
          number: baseArmourSP,
          options: {
            flavor: "Base",
          },
        }),
      ];

      let enhancedArmourSP = baseArmourSP;
      if (enhs && enhs.length > 0) {
        enhs.forEach((enh) => {
          if (enh && enh._id) {
            const stoppingVal = enh.data.stopping;
            if (stoppingVal && !Number.isNaN(stoppingVal)) {
              enhancedArmourSP = enhancedArmourSP + stoppingVal;
              armourWithEnhancementTerms.push(
                new OperatorTerm({ operator: "+" }),
              );
              armourWithEnhancementTerms.push(
                new NumericTerm({
                  number: stoppingVal,
                  options: {
                    flavor: enh.name ?? enh._id,
                  },
                }),
              );
            }
          }
        });
      }

      const armourTerm =
        enhs && enhs.length > 0
          ? ParentheticalTerm.fromTerms(armourWithEnhancementTerms, {
              flavor: `${filteredArmour.name} SP`,
            })
          : new NumericTerm({
              number: baseArmourSP,
              options: {
                flavor: `${filteredArmour.name} SP`,
              },
            });

      armourTerms.push(armourTerm);

      if (armourIndex === 0) {
        layeredArmourMarkupData = {
          id: filteredArmour._id,
          img: filteredArmour.img,
          enhancements: enhs.map((enh) => {
            return {
              id: enh?._id ?? "-",
              name: enh?.name ?? "-",
              img: enh?.img ?? "#",
            };
          }),
          inner: undefined,
          name: [filteredArmour.name],
          isStrongerThanInner: true,
          sp: {
            base: baseArmourSP,
            max: baseArmourMaxSP ?? NaN,
            enhancements: enhs.reduce(
              (acc, enh) => ({
                ...acc,
                [enh?._id as string]: enh?.data.stopping ?? NaN,
              }),
              {} as Record<string, number>,
            ),
            total: enhancedArmourSP,
            difference: 0,
            bonus: 0,
            totalWithBonus: enhancedArmourSP,
          },
        };
        armourMarkupData.push(layeredArmourMarkupData);
        armourTotals.push(enhancedArmourSP);
        layeredArmourTerm = armourTerm;
      } else if (armourIndex >= 1) {
        const prevTotal = armourTotals[armourIndex - 1];
        const difference = Math.abs(enhancedArmourSP - prevTotal);
        const diffRow = differencesInSP.find(
          (val) => difference >= val[0][0] && difference <= val[0][1],
        );
        const bonusSP = diffRow?.[1] ?? 0;
        // See Layering Armor, p. 154
        const isStrongerThanInner = enhancedArmourSP > prevTotal;
        const greaterArmourSP = isStrongerThanInner
          ? enhancedArmourSP
          : prevTotal;
        const totalSPWithBonus = greaterArmourSP + bonusSP;

        const nextArmourDatum = {
          id: filteredArmour._id,
          img: filteredArmour.img,
          enhancements: enhs.map((enh) => {
            return {
              id: enh?._id ?? "-",
              name: enh?.name ?? "-",
              img: enh?.img ?? "#",
            };
          }),
          inner: { ...layeredArmourMarkupData },
          isStrongerThanInner,
          name: [
            [
              armourIndex === 1 ? "" : "(",
              ...(layeredArmourMarkupData.name ?? ["?"]).join(" + "),
              armourIndex === 1 ? "" : ")",
            ].join(""),
            filteredArmour.name,
          ] as [innerArmour: string, outerArmour: string],
          sp: {
            base: baseArmourSP,
            max: baseArmourMaxSP ?? NaN,
            enhancements: enhs.reduce(
              (acc, enh) => ({
                ...acc,
                [enh?._id as string]: enh?.data.stopping ?? NaN,
              }),
              {} as Record<string, number>,
            ),
            total: enhancedArmourSP,
            difference,
            bonus: bonusSP,
            totalWithBonus: totalSPWithBonus,
          },
        };
        layeredArmourMarkupData = nextArmourDatum;
        armourMarkupData.push(layeredArmourMarkupData);

        armourTotals.push(nextArmourDatum.sp.totalWithBonus);
        const nextLayeredArmourTerm = ParentheticalTerm.fromTerms(
          [
            ...(layeredArmourTerm
              ? [layeredArmourTerm, new OperatorTerm({ operator: "+" })]
              : []),
            new NumericTerm({
              number: bonusSP,
              options: {
                flavor: `Bonus Armor: SP Difference ${
                  isStrongerThanInner
                    ? `${nextArmourDatum.name[1]} (${nextArmourDatum.sp.total})`
                    : `${nextArmourDatum.name[0]} (${nextArmourDatum.inner.sp.total})`
                }`,
              },
            }),
          ],
          {},
        );
        layeredArmourTerm = nextLayeredArmourTerm;
      }
    }
  });
  return { layeredArmourTerm, layeredArmourMarkupData, armourMarkupData };
};

export { getArmourTerms };
