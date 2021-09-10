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
  monsterSpecial: "Special",
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
              <h2>Actual Damage</h2>
            </td>
          </tr>
          <tr>
            <td>
              <label for="damage">Damage</label>
              <input min="0" name="damage" step="1" type="number" value="" />
            </td>
            <td>
              <div style="align-items:center;display:flex;">
                <label for="isSpecterOrElementa">Target is Specter or Elementa?</label>
                <input name="isSpecterOrElementa" type="checkbox" />
              </div>
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
        </tbody>
      </table>
    </div>
  `
    .replaceAll(/>([ \n\r]+)</gim, "><")
    .trim();
};

const renderAttackFlavor = ({ critFlavor, critLevel, total }) => {
  const title = (() => {
    if (total >= 7) {
      return `Critical (${critLevel})`;
    }
    if (total > 0) {
      return "Hit";
    }
    return "Missed";
  })();

  return `
    <div>
      <h1>Attack: ${title}</h1>
      <p>${critFlavor === "" ? "" : critFlavor}</p>
      ${critFlavor === "" ? "" : "<p></p>"}
    </div>
  `
    .replaceAll(/>([ \n\r]+)</gim, "><")
    .trim();
};

const renderDamageFlavor = ({ critLevel, total, vals }) => {
  const title = (() => {
    if (critLevel !== "") {
      return `Critical ((${critLevel}))`;
    }
    if (total > 0) {
      return "Wounded";
    }
    return "Stopped";
  })();
  const spReductionLocation = game.i18n.localize(
    hitLocationNameIndex[vals.hitLocation],
  );
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

new Dialog({
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
          : [terms.attack, new OperatorTerm({ operator: "-" }), terms.defense];
        const beatDefenseByRoll = Roll.fromTerms(beatDefenseByTerms).roll();

        /**
         * Always round down
         * See Basic Rules, p. 4
         */
        const beatDefenseByRollTotal = Math.floor(beatDefenseByRoll.total);

        const [critLevel, critFlavor, criticalBonusDamage] = getCritDamage(
          vals.isSpecterOrElementa,
          beatDefenseByRollTotal,
        );

        beatDefenseByRoll.toMessage(
          {
            speaker: ChatMessage.getSpeaker({ speaker: tokens[0].actor }),
            flavor: renderAttackFlavor({
              critFlavor,
              critLevel,
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
          ...(critLevel === ""
            ? []
            : [
                new OperatorTerm({ operator: "+" }),
                new NumericTerm({
                  number: criticalBonusDamage,
                  options: { flavor: `Critical (${critLevel}) Bonus Damage` },
                }),
              ]),
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
                critLevel,
                terms: damageRollTerms,
                // Always round down (Basic Rules, p. 4)
                total: Math.floor(damageRoll.total),
                vals,
              }),
            },
            { rollMode: CONST.DICE_ROLL_MODES.SELF },
          );
        }
      },
    },
  },
}).render(true);
