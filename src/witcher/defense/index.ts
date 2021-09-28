import { getArmourTerms } from "./armourTerms";
import { getBeatDefenseByTerms } from "./beatDefenseByTerms";
import {
  hitLocationNameIndex,
  criticalNameIndex,
  critWoundUnaimedThresholdIndex,
  hitLocationCritWoundKeyIndex,
  hitLocationAimedDamageBonusIndex,
  hitLocationToSPIndex,
} from "./constants";
import { cl, getCritDamage, getNumValue, renderAttackFlavor } from "./helper";
import renderArmoursTable from "./renderArmoursTable";
import renderBeatDefenseByTable from "./renderBeatDefenseByTable";
import renderContent from "./renderContent";
import renderDamageFlavor from "./renderDamageFlavour";
import renderEnhancementsTable from "./renderEnhancementsTable";
import {
  getMonsterArmourTerms,
  renderMonsterArmoursTable,
} from "./monsterArmours";

import type {
  ArmourData,
  EnhancementData,
  HitLocation,
  MonsterActorData,
  OwnCONFIG,
  OwnGame,
  OwnItemData,
  PlayerActorData,
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
  const monsterCategory = (defendingActor.data.data as MonsterActorData)
    .category;
  /**
   * Bestiary can be people too.
   * See p. 267
   */
  const actorIsMonster = typeof monsterCategory === "string";
  const defendingActorData = actorIsMonster
    ? (defendingActor.data.data as MonsterActorData)
    : (defendingActor.data.data as PlayerActorData);

  const armours = defendingActor.items
    .filter((it) => it.data.type === "armor")
    .map((item) => item.data as OwnItemData<ArmourData>);
  const enhancementItems = defendingActor.items
    .filter((it) => it.data.type === "enhancement")
    .map((item) => item.data as OwnItemData<EnhancementData>);

  const formTitle = `Attack on ${defendingActor.name}`;

  const enhancementsTable = actorIsMonster
    ? ""
    : renderEnhancementsTable({
        armours,
        enhancementItems,
      });

  const armoursTable = actorIsMonster ? "" : renderArmoursTable({ armours });
  const monsterArmoursTable = actorIsMonster
    ? renderMonsterArmoursTable({
        data: defendingActorData as MonsterActorData,
      })
    : "";

  const attackDamagePopup = new Dialog(
    {
      title: formTitle,
      content: renderContent({
        formTitle,
        beatDefenseByTable,
        armoursTable,
        monsterArmoursTable,
        enhancementsTable,
        monsterCategory,
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
              attackRolled: document.querySelector<HTMLInputElement>(
                `#${cl("form")} select[name="attack.rolled"]`,
              ),
              attackCustom: document.querySelector<HTMLSelectElement>(
                `#${cl("form")} input[name="attack.custom"]`,
              ),
              attackCritical: document.querySelector<HTMLInputElement>(
                `#${cl("form")} input[name="attack.critical"]`,
              ),
              armourLayerNumbers: armourLayerNumbersEls,
              armourAttached: armourAttachedEls,
              defenseRolled: document.querySelector<HTMLSelectElement>(
                `#${cl("form")} select[name="defense.rolled"]`,
              ),
              defenseCustom: document.querySelector<HTMLInputElement>(
                `#${cl("form")} input[name="defense.custom"]`,
              ),
              defenseCritical: document.querySelector<HTMLInputElement>(
                `#${cl("form")} input[name="defense.critical"]`,
              ),
              damageRolled: document.querySelector<HTMLSelectElement>(
                `#${cl("form")} select[name="damage.rolled"]`,
              ),
              damageCustom: document.querySelector<HTMLInputElement>(
                `#${cl("form")} input[name="damage.custom"]`,
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
              attack:
                els.attackRolled?.value === "custom"
                  ? getNumValue(els.attackCustom?.value)
                  : getNumValue(els.attackRolled?.value),
              attackCritical: getNumValue(els.attackCritical?.value),
              defense:
                els.defenseRolled?.value === "custom"
                  ? getNumValue(els.defenseCustom?.value)
                  : getNumValue(els.defenseRolled?.value),
              defenseCritical: getNumValue(els.defenseCritical?.value),
              damage:
                els.damageRolled?.value === "custom"
                  ? getNumValue(els.damageCustom?.value)
                  : getNumValue(els.damageRolled?.value),
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

            const beatDefenseByRoll = Roll.fromTerms(
              getBeatDefenseByTerms({
                attack: vals.attack,
                attackCritical: vals.attackCritical,
                defense: vals.defense,
                defenseCritical: vals.defenseCritical,
              }),
            );
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

            const { layeredArmourTerm, layeredArmourMarkupData } =
              actorIsMonster
                ? // Monsters do not have equipped armour
                  {
                    layeredArmourTerm: undefined,
                    layeredArmourMarkupData: undefined,
                  }
                : getArmourTerms({
                    armours,
                    armourAttachments: vals.armourAttachments,
                    armourHitLocationKey,
                    armourLayerNumbers: vals.armourLayerNumbers,
                    enhancementItems,
                  });

            const monsterArmourTerms = actorIsMonster
              ? getMonsterArmourTerms({
                  data: defendingActorData as MonsterActorData,
                  selectedHitLocation: vals.hitLocation,
                })
              : [];

            const stoppingPowerTerms = [
              ...(layeredArmourTerm ? [layeredArmourTerm] : []),
              ...(layeredArmourTerm && monsterArmourTerms.length > 0
                ? [new OperatorTerm({ operator: "+" })]
                : []),
              ...(actorIsMonster && monsterArmourTerms.length > 0
                ? monsterArmourTerms
                : []),
              ...(monsterArmourTerms.length > 0 && vals.stoppingPowerCustom > 0
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
