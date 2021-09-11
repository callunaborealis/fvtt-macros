const tokens =
  canvas && canvas.tokens && canvas.tokens.controlled
    ? canvas.tokens.controlled
    : [];

if (!tokens[0] || !tokens[0].actor) {
  ui.notifications.info("Select a token on the map first.");
  return;
}

const uniqueId = Date.now();
const cl = (name) => `critWounds-${name}--${uniqueId}`;

const formTitle = "Attack & Damage";

const hitLocationNameIndex = {
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
const hitLocationCreatureIndex = {
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

const criticalNameIndex = {
  Simple: CONFIG.witcher.CritSimple,
  Complex: CONFIG.witcher.CritComplex,
  Difficult: CONFIG.witcher.CritDifficult,
  Deadly: CONFIG.witcher.CritDeadly,
};

const critWoundUnaimedThresholdIndex = {
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

const hitLocationCritWoundKeyIndex = {
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

const hitLocationPenaltyIndex = {
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
const hitLocationAimedDamageBonusIndex = {
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

const renderContent = () => {
  return `
    <div>
      <h1>${formTitle}</h1>
      <table id="${cl("form")}">
        <tbody>
          <tr>
            <td colspan="2">
              <h2>Beat Defense By...</h2>
            </td>
          </tr>
          <tr>
            <td>
              <label for="attack">Attack</label>
              <input min="0" name="attack" step="1" type="number" value="" />
            </td>
            <td>
              <label for="defense">Target Defense</label>
              <input min="0" name="defense" step="1" type="number" value="" />
            </td>
          </tr>
          <tr>
            <td>
              <div style="align-items:center;display:flex;">
                <label for="isAimed">Aimed at Hit Location?</label>
                <input name="isAimed" type="checkbox" />
              </div>
            </td>
            <td>
              <label for="hitLocation">Hit Location</label>
              <select name="hitLocation">
                ${Object.keys(hitLocationNameIndex).map((key) => {
                  return `
                    <option value="${key}">
                      ${hitLocationNameIndex[key]} (${hitLocationCreatureIndex[key]})
                    </option>
                  `
                    .replaceAll(/>([ \n\r]+)</gim, "><")
                    .trim();
                })}
              </select>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <p style="height:50px;overflow-y:scroll;">
                Aiming for a body part before attacking will give an attack penalty. See Hit Location at page 153.
                If there is a critical from beating defense, and if the body part selected has more than 1 possible type of critical wound
                (i.e. head or torso), an additional roll will occur on the roll to determine which type
                of critical for the aimed body part (i.e. lesser / critical). See Critical Wounds / Aimed Critical at page 158.
              </p>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <h2>Actual Damage</h2>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <label for="damage">Damage</label>
              <input min="0" name="damage" step="1" type="number" value="" />
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <div style="align-items:center;display:flex;">
                <label for="isAblating">Weapon is ablating?</label>
                <input name="isAblating" type="checkbox" />
              </div>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <p>The weapon will do an additional 1d6/2 damage to stopping power of armor if it penetrates. See page 72.</p>
            </td>
          </tr>
          <tr>
            <td>
              <label for="stoppingPower">Hit Location Stopping Power</label>
              <input min="0" name="stoppingPower" step="1" type="number" value="" />
            </td>
            <td>
              <label for="resistance">Resistance Multiplier</label>
              <select name="resistance">
                <option value="1">
                  N/A (1)
                </option>
                <option value="0.5">
                  Resistance (0.5)
                </option>
                <option value="2">
                  Vulnerable (2)
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <h2>Critical Damage (if any)</h2>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <div style="align-items:center;display:flex;">
                <label for="isSpecterOrElementa">Target is Specter or Elementa?</label>
                <input name="isSpecterOrElementa" type="checkbox" />
              </div>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <p>Specters and elementas have different critical damage bonuses, and are immune to any strike to the legs. See page 159.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
    .replaceAll(/>([ \n\r]+)</gim, "><")
    .trim();
};

const renderAttackFlavor = ({ total }) => {
  const title = (() => {
    if (total > 0) {
      return "Hit";
    }
    return "Missed";
  })();
  return `<h1>Attack: ${title}</h1>`;
};

const renderDamageFlavor = ({ total, vals }) => {
  const title = (() => {
    if (total > 0) {
      return "Wounded";
    }
    return "Stopped";
  })();
  const spReductionLocation = hitLocationNameIndex[vals.hitLocation];
  const totalDamageFlavor =
    total > 0
      ? `Target is wounded with ${total} damage.`
      : `The attack was stopped by the armor (or cover) at <b>${spReductionLocation}</b>.`;
  return `
    <div>
      <h1>Damage: ${title}</h1>
      <p>${totalDamageFlavor}</p>
      <p> If attack is melee or if there is no cover, reduce stopping power (SP) for the top layer armor at <b>${spReductionLocation}</b> by 1.</p>
    </div>
  `
    .replaceAll(/>([ \n\r]+)</gim, "><")
    .trim();
};

const getNumValue = (el) => {
  const rawDamageVal = parseInt(el.value);
  return Number.isNaN(rawDamageVal) ? 0 : rawDamageVal;
};

const getCritDamage = (isSpecterOrElementa, beatDefenseByRollTotal) => {
  const specterOrElementaTag = isSpecterOrElementa
    ? " (Specter or Elementa)"
    : "";
  if (beatDefenseByRollTotal >= 15) {
    return [
      "Deadly",
      `Defense beat by 15+${specterOrElementaTag}`,
      isSpecterOrElementa ? 20 : 10,
    ];
  }
  if (beatDefenseByRollTotal >= 13) {
    return [
      "Difficult",
      `Defense beat by 13+${specterOrElementaTag}`,
      isSpecterOrElementa ? 15 : 8,
    ];
  }
  if (beatDefenseByRollTotal >= 10) {
    return [
      "Complex",
      `Defense beat by 10+${specterOrElementaTag}`,
      isSpecterOrElementa ? 10 : 5,
    ];
  }
  if (beatDefenseByRollTotal >= 7) {
    return [
      "Simple",
      `Defense beat by 7+${specterOrElementaTag}`,
      isSpecterOrElementa ? 5 : 3,
    ];
  }
  return ["", "", 0];
};

new Dialog(
  {
    title: formTitle,
    content: renderContent(),
    buttons: {
      Roll: {
        label: "Attack/Defense",
        callback: () => {
          const els = {
            isAblating: document.querySelector(
              `table#${cl("form")} input[name="isAblating"]`,
            ),
            attack: document.querySelector(
              `table#${cl("form")} input[name="attack"]`,
            ),
            defense: document.querySelector(
              `table#${cl("form")} input[name="defense"]`,
            ),
            damage: document.querySelector(
              `table#${cl("form")} input[name="damage"]`,
            ),
            stoppingPower: document.querySelector(
              `table#${cl("form")} input[name="stoppingPower"]`,
            ),
            hitLocation: document.querySelector(
              `table#${cl("form")} select[name="hitLocation"]`,
            ),
            isAimed: document.querySelector(
              `table#${cl("form")} input[name="isAimed"]`,
            ),
            isSpecterOrElementa: document.querySelector(
              `table#${cl("form")} input[name="isSpecterOrElementa"]`,
            ),
            resistance: document.querySelector(
              `table#${cl("form")} select[name="resistance"]`,
            ),
          };

          const vals = {
            attack: getNumValue(els.attack),
            defense: getNumValue(els.defense),
            damage: getNumValue(els.damage),
            stoppingPower: getNumValue(els.stoppingPower),
            hitLocation: els.hitLocation.value,
            isAimed: els.isAimed.checked === true,
            isSpecterOrElementa: els.isSpecterOrElementa.checked === true,
            isAblating: els.isAblating.checked === true,
            resistance: parseFloat(els.resistance.value),
          };

          const terms = {
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
                terms.attack,
                new OperatorTerm({ operator: "-" }),
                terms.defense,
                new OperatorTerm({ operator: "-" }),
                terms.hitLocationAttackPenalty,
              ]
            : [
                terms.attack,
                new OperatorTerm({ operator: "-" }),
                terms.defense,
              ];
          const beatDefenseByRoll = Roll.fromTerms(beatDefenseByTerms).roll();

          /**
           * Always round down
           * See Basic Rules, p. 4
           */
          const beatDefenseByRollTotal = Math.floor(beatDefenseByRoll.total);

          beatDefenseByRoll.toMessage(
            {
              speaker: ChatMessage.getSpeaker({ speaker: tokens[0].actor }),
              flavor: renderAttackFlavor({
                total: beatDefenseByRollTotal,
              }),
            },
            { rollMode: CONST.DICE_ROLL_MODES.SELF },
          );

          const baseDamageTerms = [
            new NumericTerm({
              number: vals.damage,
              options: { flavor: "Rolled Damage" },
            }),
            new OperatorTerm({ operator: "-" }),
            new NumericTerm({
              number: vals.stoppingPower,
              options: { flavor: "Stopping Power" },
            }),
          ];
          const baseDamageTerm = ParentheticalTerm.fromTerms(baseDamageTerms, {
            // flavor: "Base Damage",
          });

          const damageAfterMultiplierTerms =
            vals.resistance === 1
              ? [
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
                ]
              : [
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
                  new OperatorTerm({ operator: "*" }),
                  new NumericTerm({
                    number: vals.resistance,
                    options: {
                      flavor: `${
                        vals.resistance === 0.5
                          ? "Has resistance"
                          : "Has vulnerability"
                      }`,
                    },
                  }),
                ];
          const damageAfterMultiplierPTerm = ParentheticalTerm.fromTerms(
            damageAfterMultiplierTerms,
            // { flavor: "Multiplied Damage" },
          );

          const ablatingWeaponTerms = [
            new Die({
              number: 1,
              faces: 6,
            }),
            new OperatorTerm({ operator: "/" }),
            new NumericTerm({
              number: 2,
            }),
          ];

          const damageRollTerms = [
            damageAfterMultiplierPTerm,
            ...(vals.isAblating
              ? [
                  new OperatorTerm({ operator: "+" }),
                  ParentheticalTerm.fromTerms(ablatingWeaponTerms, {
                    flavor: "Ablating Effect",
                  }),
                ]
              : []),
          ];
          const damageRoll = Roll.fromTerms(damageRollTerms).roll();

          if (beatDefenseByRollTotal > 0) {
            damageRoll.toMessage(
              {
                speaker: ChatMessage.getSpeaker({ speaker: tokens[0].actor }),
                flavor: renderDamageFlavor({
                  terms: damageRollTerms,
                  // Always round down (Basic Rules, p. 4)
                  total: Math.floor(damageRoll.total),
                  vals,
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
            const criticalDamageRoll =
              Roll.fromTerms(criticalDamageTerms).roll();
            criticalDamageRoll.toMessage(
              {
                speaker: ChatMessage.getSpeaker({ speaker: tokens[0].actor }),
                flavor: `
                <div>
                  <h1>${critWoundLevel} Critical Bonus Damage</h1>
                  <p>${critFlavor}</p>
                  <p>Deduct from target HP directly. Ignore SP, Resistance and Hit Location for this damage.</p>
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
                    flavor:
                      "Greater critical wound if above 4, lesser critical wound if 4 and below",
                  },
                }),
              ]).roll();

              const lesserOrGreater =
                lesserOrGreaterRoll.total > 4 ? "greater" : "lesser";

              const critWoundType =
                hitLocationCritWoundKeyIndex[critWoundLevel][vals.hitLocation];

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
                  speaker: ChatMessage.getSpeaker({ speaker: tokens[0].actor }),
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
                  speaker: ChatMessage.getSpeaker({ speaker: tokens[0].actor }),
                  flavor: `<div><h1>${critWoundLevel}: ${critWoundName}</h1><p>${critWoundDescription}</p><p>${critModWoundDescription}</p><p>See Page 158.</p></div>`,
                },
                { rollMode: CONST.DICE_ROLL_MODES.SELF },
              );
            }
          }
        },
      },
    },
  },
  { height: 500, resizable: true },
).render(true);
