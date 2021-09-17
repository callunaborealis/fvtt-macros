import {
  hitLocationNameIndex,
  criticalNameIndex,
  critWoundUnaimedThresholdIndex,
  hitLocationCritWoundKeyIndex,
  hitLocationPenaltyIndex,
  hitLocationAimedDamageBonusIndex,
  differencesInSP,
  hitLocationToSPIndex,
} from "./constants";
import { cl, getCritDamage, renderAttackFlavor } from "./helper";
import renderArmoursTable from "./renderArmoursTable";
import renderBeatDefenseByTable from "./renderBeatDefenseByTable";
import renderContent from "./renderContent";
import renderDamageFlavor from "./renderDamageFlavour";
import renderEnhancementsTable from "./renderEnhancementsTable";

import type {
  ActorData,
  ArmourData,
  EnhancementData,
  HitLocation,
  LayeredArmourDatum,
  OwnCONFIG,
  OwnGame,
  OwnItemData,
} from "./types";

declare var game: OwnGame;
declare var CONFIG: OwnCONFIG;

const runMacro = () => {
  const tokens =
    canvas && canvas.tokens && canvas.tokens.controlled
      ? canvas.tokens.controlled
      : [];

  if (!tokens[0] || !tokens[0].actor) {
    if (ui.notifications) {
      ui.notifications.info("Select the token that is being attacked.");
    }
    return;
  }
  if (tokens.length !== 1) {
    if (ui.notifications) {
      ui.notifications.info(
        "More than 1 token was selected. Select only the token being attacked.",
      );
    }
    return;
  }

  const messages = game.messages;
  const actors = game.actors;

  if (!messages) {
    return;
  }
  if (!actors) {
    return;
  }

  const beatDefenseByTable = renderBeatDefenseByTable({ actors, messages });

  const defendingActor = tokens[0].actor;
  const defendingActorData = defendingActor.data.data as ActorData;

  const armours = defendingActor.items
    .filter((it) => it.data.type === "armor")
    .map((item) => item.data as OwnItemData<ArmourData>);
  const enhancementItems = defendingActor.items
    .filter((it) => it.data.type === "enhancement")
    .map((item) => item.data as OwnItemData<EnhancementData>);

  const formTitle = `Attack on ${defendingActor.name}`;

  const enhancementsTable = renderEnhancementsTable({
    armours,
    enhancementItems,
  });

  const getNumValue = (value: any) => {
    const rawDamageVal = parseInt(`${value}`);
    return Number.isNaN(rawDamageVal) ? 0 : rawDamageVal;
  };

  const armoursTable = renderArmoursTable({ armours });

  const attackDamagePopup = new Dialog(
    {
      title: formTitle,
      content: renderContent({
        formTitle,
        beatDefenseByTable,
        armoursTable,
        enhancementsTable,
      }),
      default: "",
      buttons: {
        Roll: {
          label: "Attack/Defense",
          callback: () => {
            const armourLayerNumbersEls: HTMLInputElement[] = [];
            const armourAttachedEls: HTMLSelectElement[] = [];
            document
              .querySelectorAll<HTMLInputElement>(
                `#${cl("form")} input[name="armourLayerNumber"]`,
              )
              .forEach((el) => {
                armourLayerNumbersEls.push(el);
              });
            document
              .querySelectorAll<HTMLSelectElement>(
                `#${cl("form")} select[name="armourAttached"]`,
              )
              .forEach((el) => {
                armourAttachedEls.push(el);
              });
            const els = {
              isAblating: document.querySelector<HTMLInputElement>(
                `#${cl("form")} input[name="isAblating"]`,
              ),
              attack: document.querySelector<HTMLInputElement>(
                `#${cl("form")} input[name="attack"]`,
              ),
              armourLayerNumbers: armourLayerNumbersEls,
              armourAttached: armourAttachedEls,
              defenseRolled: document.querySelector<HTMLSelectElement>(
                `#${cl("form")} select[name="defense.rolled"]`,
              ),
              defenseCustom: document.querySelector<HTMLInputElement>(
                `#${cl("form")} input[name="defense.custom"]`,
              ),
              damage: document.querySelector<HTMLInputElement>(
                `#${cl("form")} input[name="damage"]`,
              ),
              stoppingPowerCustom: document.querySelector<HTMLInputElement>(
                `#${cl("form")} input[name="stoppingPower.custom"]`,
              ),
              stoppingPowerCustomFlavor:
                document.querySelector<HTMLInputElement>(
                  `#${cl("form")} input[name="stoppingPower.custom.flavor"]`,
                ),
              hitLocation: document.querySelector<HTMLSelectElement>(
                `#${cl("form")} select[name="hitLocation"]`,
              ),
              isAimed: document.querySelector<HTMLInputElement>(
                `#${cl("form")} input[name="isAimed"]`,
              ),
              resistanceCustom: document.querySelector<HTMLInputElement>(
                `#${cl("form")} input[name="resistance.custom"]`,
              ),
              resistanceCustomFlavor: document.querySelector<HTMLInputElement>(
                `#${cl("form")} input[name="resistance.custom.flavor"]`,
              ),
              isSpecterOrElementa: document.querySelector<HTMLInputElement>(
                `#${cl("form")} input[name="isSpecterOrElementa"]`,
              ),
            };

            const vals = {
              attack: getNumValue(els.attack?.value),
              defense:
                els.defenseRolled?.value === "custom"
                  ? getNumValue(els.defenseCustom?.value)
                  : getNumValue(els.defenseRolled?.value),
              damage: getNumValue(els.damage?.value),
              armourLayerNumbers: els.armourLayerNumbers.map((el) => {
                return {
                  id: el.dataset.armourId,
                  layer: getNumValue(el?.value),
                };
              }),
              armourAttachments: els.armourAttached.map((el) => {
                return {
                  id: el.dataset.enhancementId,
                  armourId: el?.value,
                };
              }),
              stoppingPowerCustom: getNumValue(els.stoppingPowerCustom?.value),
              stoppingPowerCustomFlavor: els.stoppingPowerCustomFlavor?.value,
              hitLocation: els.hitLocation?.value as HitLocation,
              isAimed: els.isAimed?.checked === true,
              isSpecterOrElementa: els.isSpecterOrElementa?.checked === true,
              isAblating: els.isAblating?.checked === true,
              resistanceCustom: els.resistanceCustom?.value,
              resistanceCustomFlavor: els.resistanceCustomFlavor?.value,
            };

            const beatDefenseByTermsIndex = {
              attack: new NumericTerm({
                number: vals.attack,
                options: { flavor: "Attack" },
              }),
              defense: new NumericTerm({
                number: vals.defense,
                options: { flavor: "Defense" },
              }),
              hitLocationAttackPenalty: new NumericTerm({
                number: hitLocationPenaltyIndex[vals.hitLocation],
                options: {
                  flavor: `Hit Location Attack Penalty (${
                    hitLocationNameIndex[vals.hitLocation]
                  })`,
                },
              }),
            };

            const beatDefenseByTerms = vals.isAimed
              ? [
                  beatDefenseByTermsIndex.attack,
                  new OperatorTerm({ operator: "-" }),
                  beatDefenseByTermsIndex.defense,
                  new OperatorTerm({ operator: "-" }),
                  beatDefenseByTermsIndex.hitLocationAttackPenalty,
                ]
              : [
                  beatDefenseByTermsIndex.attack,
                  new OperatorTerm({ operator: "-" }),
                  beatDefenseByTermsIndex.defense,
                ];
            const beatDefenseByRoll = Roll.fromTerms(beatDefenseByTerms);
            beatDefenseByRoll.roll();

            /**
             * Always round down
             * See Basic Rules, p. 4
             */
            const beatDefenseByRollTotal = Math.floor(
              beatDefenseByRoll.total as number,
            );

            beatDefenseByRoll.toMessage(
              {
                speaker: ChatMessage.getSpeaker({
                  actor: defendingActor,
                }),
                flavor: renderAttackFlavor({
                  total: beatDefenseByRollTotal,
                }),
              },
              { rollMode: CONST.DICE_ROLL_MODES.SELF },
            );

            if (beatDefenseByRollTotal <= 0) {
              return;
            }

            const [armourHitLocationKey] =
              hitLocationToSPIndex[vals.hitLocation];

            // Armour terms

            const filteredArmours = armours
              .filter((armour) => {
                const spVal = armour.data[armourHitLocationKey];
                const armourLayerNumber =
                  vals.armourLayerNumbers.find((nr) => nr.id === armour._id)
                    ?.layer ?? 0;
                return (
                  typeof spVal === "number" &&
                  spVal > 0 &&
                  armourLayerNumber > 0
                );
              })
              .map((armour, i) => {
                armour.data.index = i;
                return armour;
              });
            filteredArmours.sort((a, b) => {
              const aNr =
                vals.armourLayerNumbers.find((nr) => nr.id === a._id)?.layer ??
                0;
              const bNr =
                vals.armourLayerNumbers.find((nr) => nr.id === b._id)?.layer ??
                0;
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

            filteredArmours.forEach((filteredArmour, armourIndex) => {
              const enhs = vals.armourAttachments
                .filter((att) => att.armourId === filteredArmour._id)
                .map((att) =>
                  enhancementItems.find((item) => att.id === item._id),
                );

              const baseArmourSP = filteredArmour.data[armourHitLocationKey];

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

                  armourTotals.push(nextArmourDatum.sp.totalWithBonus);
                  const nextLayeredArmourTerm = ParentheticalTerm.fromTerms(
                    [
                      ...(layeredArmourTerm
                        ? [
                            layeredArmourTerm,
                            new OperatorTerm({ operator: "+" }),
                          ]
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

            // End armor terms

            const stoppingPowerTerms = [
              ...(layeredArmourTerm ? [layeredArmourTerm] : []),
              ...(layeredArmourTerm && vals.stoppingPowerCustom > 0
                ? [new OperatorTerm({ operator: "+" })]
                : []),
              ...(vals.stoppingPowerCustom > 0
                ? [
                    new NumericTerm({
                      number: vals.stoppingPowerCustom,
                      options: {
                        flavor: vals.stoppingPowerCustomFlavor,
                      },
                    }),
                  ]
                : []),
            ];

            const baseDamageTerm = ParentheticalTerm.fromTerms(
              [
                new NumericTerm({
                  number: vals.damage,
                  options: { flavor: "Damage" },
                }),
                ...(stoppingPowerTerms.length > 0
                  ? [
                      new OperatorTerm({ operator: "-" }),
                      ParentheticalTerm.fromTerms(stoppingPowerTerms, {
                        flavor: "Stopping Power",
                      }),
                    ]
                  : []),
              ],
              {
                // flavor: "Base Damage",
              },
            );

            const baseDamageMultipliedByHitLocationBonusTerms: RollTerm[] = [
              baseDamageTerm,
              new OperatorTerm({ operator: "*" }),
              new NumericTerm({
                number: hitLocationAimedDamageBonusIndex[vals.hitLocation],
                options: {
                  flavor: `Hit Location Multiplier (${
                    hitLocationNameIndex[vals.hitLocation]
                  })`,
                },
              }),
            ];
            const resistanceCustomVal = parseFloat(`${vals.resistanceCustom}`);
            const resistanceMultiplierTerms: RollTerm[] = [
              ...(Number.isNaN(resistanceCustomVal) || resistanceCustomVal === 1
                ? []
                : [
                    new NumericTerm({
                      number: resistanceCustomVal,
                      options: {
                        flavor: vals.resistanceCustomFlavor,
                      },
                    }),
                  ]),
            ];

            const damageAfterMultiplierTerms: RollTerm[] = [
              ...baseDamageMultipliedByHitLocationBonusTerms,
              ...(resistanceMultiplierTerms.length > 0
                ? [
                    new OperatorTerm({ operator: "*" }),
                    ParentheticalTerm.fromTerms(resistanceMultiplierTerms, {
                      flavor: "Resistance",
                    }),
                  ]
                : []),
            ];
            const damageRollTerms = [
              ParentheticalTerm.fromTerms(
                damageAfterMultiplierTerms,
                // { flavor: "Multiplied Damage" },
              ),
              ...(vals.isAblating
                ? [
                    new OperatorTerm({ operator: "+" }),
                    ParentheticalTerm.fromTerms(
                      [
                        new Die({
                          number: 1,
                          faces: 6,
                        }),
                        new OperatorTerm({ operator: "/" }),
                        new NumericTerm({
                          number: 2,
                        }),
                      ],
                      {
                        flavor: "Ablating Effect",
                      },
                    ),
                  ]
                : []),
            ];
            const damageRoll = Roll.fromTerms(damageRollTerms);
            damageRoll.roll();

            if (beatDefenseByRollTotal > 0) {
              const damageRollTotal = damageRoll.total ?? NaN;
              damageRoll.toMessage(
                {
                  speaker: ChatMessage.getSpeaker({ actor: defendingActor }),
                  flavor: renderDamageFlavor({
                    layeredArmourMarkupData,
                    // Always round down (Basic Rules, p. 4)
                    total: Number.isNaN(damageRollTotal)
                      ? NaN
                      : Math.floor(damageRollTotal),
                    hitLocation: vals.hitLocation,
                  }),
                },
                { rollMode: CONST.DICE_ROLL_MODES.SELF },
              );
            }

            const [critWoundLevel, critFlavor, criticalBonusDamage] =
              getCritDamage(vals.isSpecterOrElementa, beatDefenseByRollTotal);

            const critDescription = CONFIG.witcher.CritDescription;
            const critModDescription = CONFIG.witcher.CritModDescription;

            if (critWoundLevel !== "") {
              const isHeadOrTorso =
                vals.hitLocation === "humanTorso" ||
                vals.hitLocation === "humanHead" ||
                vals.hitLocation === "monsterTorso" ||
                vals.hitLocation === "monsterHead";
              const criticalDamageTerms = [
                new NumericTerm({
                  number: criticalBonusDamage,
                  options: {
                    flavor: `Critical Damage (${critWoundLevel})`,
                  },
                }),
              ];
              const criticalDamageRoll = Roll.fromTerms(criticalDamageTerms);
              criticalDamageRoll.roll();

              const stunStat = defendingActorData.coreStats.stun.value;
              const baseHP = defendingActorData.derivedStats.hp.value;

              criticalDamageRoll.toMessage(
                {
                  speaker: ChatMessage.getSpeaker({ actor: defendingActor }),
                  flavor: `
                    <div>
                      <h1>${critWoundLevel} Critical Bonus Damage</h1>
                      <p>${critFlavor}</p>
                      <p>
                        <span>${defendingActor.name} should roll a</span>
                        <span>&nbsp;</span>
                        <a class="inline-roll roll" title="1d10" data-mode="roll" data-flavor="To succeed, you need to roll below ${stunStat}." data-formula="1d10[Stun Save]">
                          <i class="fas fa-dice-d20"></i>&nbsp;Stun Save
                        </a>.
                      </p>
                      <p>Subtract ${criticalDamageRoll.total} from ${defendingActor.name}'s HP directly. Ignore SP, Resistance and Hit Location for this damage.</p>
                      <p>${defendingActor.name}'s Current HP: ${baseHP}</p>
                      <p>See Critical Wounds Damage, Page 158.</p>
                    </div>
                  `
                    .replaceAll(/>([ \n\r]+)</gim, "><")
                    .trim(),
                },
                { rollMode: CONST.DICE_ROLL_MODES.SELF },
              );
              if (vals.isAimed) {
                const lesserOrGreaterRoll = Roll.fromTerms([
                  new Die({
                    number: 1,
                    faces: 6,
                    options: {
                      flavor: "Greater if above 4, lesser if 4 and below",
                    },
                  }),
                ]).roll();

                const lesserOrGreaterRollTotal =
                  lesserOrGreaterRoll.total as number;

                const lesserOrGreater =
                  lesserOrGreaterRollTotal > 4 ? "greater" : "lesser";

                const critWoundType =
                  hitLocationCritWoundKeyIndex[critWoundLevel][
                    vals.hitLocation
                  ];

                const critWoundKey = isHeadOrTorso
                  ? critWoundType[lesserOrGreater]
                  : critWoundType;

                const critWoundName = game.i18n.localize(
                  criticalNameIndex[critWoundLevel][critWoundKey],
                );

                const critWoundDescription = game.i18n.localize(
                  critDescription[critWoundKey],
                );
                const critModWoundDescription = game.i18n.localize(
                  critModDescription[critWoundKey].None,
                );
                lesserOrGreaterRoll.toMessage(
                  {
                    speaker: ChatMessage.getSpeaker({
                      actor: defendingActor,
                    }),
                    flavor: `<div><h1>${critWoundLevel}: ${critWoundName}</h1><p>${critWoundDescription}</p><p>${critModWoundDescription}</p><p>See Page 158.</p></div>`,
                  },
                  { rollMode: CONST.DICE_ROLL_MODES.SELF },
                );
              } else {
                // Roll 2d6 to determine location of critical wound
                const criticalWoundTypeRoll = Roll.fromTerms([
                  new Die({
                    number: 2,
                    faces: 6,
                    options: {
                      flavor: `${critWoundLevel} Critical Wound Type`,
                    },
                  }),
                ]).roll();
                let critWoundKey = "";
                const tableForCritLevel =
                  critWoundUnaimedThresholdIndex[critWoundLevel];
                Object.keys(tableForCritLevel).forEach((key) => {
                  const [min, max] = tableForCritLevel[key];
                  if (
                    criticalWoundTypeRoll.total &&
                    criticalWoundTypeRoll.total <= max &&
                    criticalWoundTypeRoll.total >= min
                  ) {
                    critWoundKey = key;
                  }
                });
                const critWoundName = game.i18n.localize(
                  criticalNameIndex[critWoundLevel][critWoundKey],
                );
                const critWoundDescription = game.i18n.localize(
                  critDescription[critWoundKey],
                );
                const critModWoundDescription = game.i18n.localize(
                  critModDescription[critWoundKey].None,
                );
                criticalWoundTypeRoll.toMessage(
                  {
                    speaker: ChatMessage.getSpeaker({
                      actor: defendingActor,
                    }),
                    flavor: `<div><h1>${critWoundLevel}: ${critWoundName}</h1><p>${critWoundDescription}</p><p>${critModWoundDescription}</p><p>See Page 158.</p></div>`,
                  },
                  { rollMode: CONST.DICE_ROLL_MODES.SELF },
                );
              }
              // End
            }
          },
        },
      },
    },
    { height: 500, width: 600, resizable: true },
  );

  attackDamagePopup.render(true);
};
runMacro();
