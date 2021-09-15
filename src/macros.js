const runMacro = () => {
  const tokens =
    canvas && canvas.tokens && canvas.tokens.controlled
      ? canvas.tokens.controlled
      : [];

  if (!tokens[0] || !tokens[0].actor) {
    ui.notifications.info("Select the token that is being attacked.");
    return;
  }
  if (tokens.length !== 1) {
    ui.notifications.info(
      "More than 1 token was selected. Select only the token being attacked.",
    );
    return;
  }

  const defendingActor = tokens[0].actor;
  const armours = defendingActor.items
    .filter((it) => it.data.type === "armor")
    .map((item) => item.data);

  /*
  avail: "Poor"
  bludgeoning: false
  cost: 175
  description: ""
  effects: []
  encumb: 0
  enhancementItems: [{…}]
  enhancements: 1
  equiped: "/" | false
  headMaxStopping: 5
  headStopping: 5
  leftArmMaxStopping: 0
  leftArmStopping: 0
  leftLegMaxStopping: 0
  leftLegStopping: 0
  location: "Head"
  percing: false
  quantity: 1
  reliability: 0
  reliabilityMax: 0
  rightArmMaxStopping: 0
  rightArmStopping: 0
  rightLegMaxStopping: 0
  rightLegStopping: 0
  slashing: false
  torsoMaxStopping: 0
  torsoStopping: 0
  weight: 1
  */
  const hitLocationToSPIndex = {
    humanHead: ["headStopping", "headMaxStopping"],
    humanTorso: ["torsoStopping", "torsoMaxStopping"],
    humanArmR: ["rightArmStopping", "rightArmMaxStopping"],
    humanArmL: ["leftArmStopping", "leftArmMaxStopping"],
    humanLegR: ["rightLegStopping", "rightLegMaxStopping"],
    humanLegL: ["leftLegStopping", "leftLegMaxStopping"],
  };

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
  // It is assumed that Full Cover / Shield will cover
  // all types
  const hitLocationToArmorLocationIndex = {
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

  const stoppingPowerCols = [
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

  const defenseRollsInChat = game.messages
    .map((message) => {
      const actor = game.actors.find(
        (a) => a.data.name === message.data.speaker.alias,
      );
      if (typeof message.data.flavor !== "string") {
        return {
          defenseType: undefined,
          roll: undefined,
          timestamp: message.data.timestamp,
          actor,
        };
      }
      const parts = message.data.flavor.split(/<h1>Defense: (\w+)<\/h1>/gim);
      if (parts.length === 3) {
        const defenseType = parts[1];
        return {
          defenseType,
          roll: JSON.parse(message.data.roll),
          timestamp: message.data.timestamp,
          actor,
        };
      }
      return {
        defenseType: undefined,
        roll: undefined,
        timestamp: message.data.timestamp,
        actor,
      };
    })
    .filter((message) => typeof message.defenseType === "string");

  // Sort by latest to earliest
  defenseRollsInChat.sort((a, b) => b.timestamp - a.timestamp);

  const beatDefenseByTable = `
    <table>
      <tbody>
        <tr>
          <td colspan="2">
            <h2>Beat Defense By...</h2>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <label for="attack">Attack</label>
            <input min="0" name="attack" step="1" type="number" value="" />
          </td>
        </tr>
        <tr>
          <td>
            <label for="defense.rolled">Defense (rolled)</label>
            <select name="defense.rolled" style="width:180px;text-overflow:ellipsis;">
              <option value="custom">
                Custom
              </option>
              ${defenseRollsInChat
                .map((defenseRoll) => {
                  return `
                    <option value="${defenseRoll.roll.total}">
                      <span>${defenseRoll.defenseType}</span>
                      <span>&nbsp;-&nbsp;</span>
                      <span>${defenseRoll.roll.total}</span>
                      <span>&nbsp;-&nbsp;</span>
                      <span>${defenseRoll.actor.data.name}</span>
                      <span>&nbsp;-&nbsp;</span>
                      <span>
                        ${new Date(defenseRoll.timestamp).toTimeString()}
                      </span>
                    </option>
                  `;
                })
                .join("")}
            </select>
          </td>
          <td>
            <label for="defense.custom">
              Defense (custom)
            </label>
            <input min="0" name="defense.custom" step="1" type="number" value="" />
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
              ${Object.keys(hitLocationNameIndex)
                .map((key) => {
                  return `
                  <option value="${key}">
                    ${hitLocationNameIndex[key]} (${hitLocationCreatureIndex[key]})
                  </option>
                `;
                })
                .join("")}
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
      </tbody>
    </table>
  `;

  const renderContent = () => {
    return `
      <div id="${cl("form")}">
        <h1>${formTitle}</h1>
        ${beatDefenseByTable}
        <h2>Stopping Power</h2>
        <p>The leftmost column is for armor layer order. The innermost armor is 1, outermost armor is 5. Numbers can be repeated, but the natural order will be taken.</p>
        <table>
          <thead>
            <tr>
              <th colspan="3" scope="colgroup">Armor</td>
              <th colspan="${
                stoppingPowerCols.length
              }" scope="colgroup">Stopping Power</th>
              <th colspan="1" scope="colgroup">&nbsp;</th>
              <th colspan="3" scope="colgroup">Resistance</th>
            </tr>
            <tr>
              <th><!--Armor Layer--></th>
              <th><!--Image--></th>
              <th>Name</th>
              <!--SP-->
              ${stoppingPowerCols
                .map((key) => `<th>${hitLocationNameIndex[key]}</th>`)
                .join("")}
              <th>Reliability</th>
              <th data-tooltip="Bludgeoning">B</th>
              <th data-tooltip="Piercing">P</th>
              <th data-tooltip="Slashing">S</th>
            </tr>
          </thead>
          <tbody>
            ${armours
              .map((armour, i) => {
                return `
                  <tr>
                    <td style="max-width:24px;">
                      <input
                        min="1"
                        name="armorLayerNumber"
                        step="1"
                        type="number"
                        value="${i + 1}"
                      />
                    </td>
                    <td style="min-width:24px;padding-right:2px;">
                      <img
                        src="${armour.img}"
                        style="height:24px;width:24px;"
                      />
                    </td>
                    <td>${armour.name}</td>
                    ${stoppingPowerCols
                      .map((key) => {
                        const [value, maxValue] = hitLocationToSPIndex[key];
                        return `
                        <td>
                          <input
                            min="0"
                            placeholder="SP"
                            name="stoppingPower"
                            step="1"
                            type="number"
                            value="${armour.data[value]}"
                            data-armour-id="${armour._id}"
                            data-sp-type="${key}"
                            disabled
                            readonly
                          />
                        </td>
                      `;
                      })
                      .join("")}
                    <td>
                      <input
                        min="0"
                        placeholder="SP"
                        name="reliability"
                        step="1"
                        type="number"
                        value="${armour.data.reliability}"
                        data-armour-id="${armour._id}"
                        disabled
                        readonly
                      />
                    </td>
                    <td>
                      <input name="resistance.bludgeoning" type="checkbox" disabled value="${
                        armour.data.bludgeoning
                      }"/>
                    </td>
                    <td>
                      <input name="resistance.piercing" type="checkbox" disabled value="${
                        armour.data.percing
                      }"/>
                    </td>
                    <td>
                      <input name="resistance.slashing" type="checkbox" disabled value="${
                        armour.data.slashing
                      }"/>
                    </td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <td>
                <label for="stoppingPower.custom">Additional Hit Location Stopping Power (Optional)</label>
                <input min="0" name="stoppingPower.custom" type="number" value="" />
              </td>
              <td>
                <label for="stoppingPower.custom.flavor">Flavor</label>
                <input name="stoppingPower.custom.flavor" placeholder="e.g. Cover (Stone Wall)" type="text" value="" />
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <p style="height:50px;overflow-y:scroll;">
                  You can put either an additional modifier or custom cover / human shield (if it is a ranged attack).
                  See page 155 for Using Cover and Human Shields.
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <label for="resistance">Resistance / Vulnerable Multiplier</label>
                <input name="resistance.custom" type="number" value="1" />
              </td>
              <td>
                <label for="resistance.flavor">Flavor</label>
                <input name="resistance.custom.flavor" placeholder="e.g. Fire Resistance" type="text" value="Has resistance / vulnerability" />
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

  const attackDamagePopup = new Dialog(
    {
      title: formTitle,
      content: renderContent(),
      buttons: {
        Roll: {
          label: "Attack/Defense",
          callback: () => {
            const els = {
              isAblating: document.querySelector(
                `#${cl("form")} input[name="isAblating"]`,
              ),
              attack: document.querySelector(
                `#${cl("form")} input[name="attack"]`,
              ),
              defenseRolled: document.querySelector(
                `#${cl("form")} select[name="defense.rolled"]`,
              ),
              defenseCustom: document.querySelector(
                `#${cl("form")} input[name="defense.custom"]`,
              ),
              damage: document.querySelector(
                `#${cl("form")} input[name="damage"]`,
              ),
              stoppingPowerCustom: document.querySelector(
                `#${cl("form")} input[name="stoppingPower.custom"]`,
              ),
              stoppingPowerCustomFlavor: document.querySelector(
                `#${cl("form")} input[name="stoppingPower.custom.flavor"]`,
              ),
              hitLocation: document.querySelector(
                `#${cl("form")} select[name="hitLocation"]`,
              ),
              isAimed: document.querySelector(
                `#${cl("form")} input[name="isAimed"]`,
              ),
              resistanceCustom: document.querySelector(
                `#${cl("form")} input[name="resistance.custom"]`,
              ),
              resistanceCustomFlavor: document.querySelector(
                `#${cl("form")} input[name="resistance.custom.flavor"]`,
              ),
              isSpecterOrElementa: document.querySelector(
                `#${cl("form")} input[name="isSpecterOrElementa"]`,
              ),
            };
            console.log("els", els);

            const vals = {
              attack: getNumValue(els.attack),
              defense:
                els.defenseRolled === "custom"
                  ? getNumValue(els.defenseCustom)
                  : getNumValue(els.defenseRolled),
              damage: getNumValue(els.damage),
              stoppingPowerCustom: getNumValue(els.stoppingPowerCustom),
              stoppingPowerCustomFlavor: els.stoppingPowerCustomFlavor.value,
              hitLocation: els.hitLocation.value,
              isAimed: els.isAimed.checked === true,
              isSpecterOrElementa: els.isSpecterOrElementa.checked === true,
              isAblating: els.isAblating.checked === true,
              resistanceCustom: parseFloat(els.resistanceCustom.value),
              resistanceCustomFlavor: els.resistanceCustomFlavor.value,
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
                speaker: ChatMessage.getSpeaker({ speaker: defendingActor }),
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
                number: vals.stoppingPowerCustom,
                options: {
                  flavor: `Custom SP${
                    vals.stoppingPowerCustomFlavor
                      ? ` (${vals.stoppingPowerCustomFlavor})`
                      : ""
                  }`,
                },
              }),
            ];
            const baseDamageTerm = ParentheticalTerm.fromTerms(
              baseDamageTerms,
              {
                // flavor: "Base Damage",
              },
            );

            const damageAfterMultiplierTerms =
              vals.resistanceCustom === 1
                ? [
                    baseDamageTerm,
                    new OperatorTerm({ operator: "*" }),
                    new NumericTerm({
                      number:
                        hitLocationAimedDamageBonusIndex[vals.hitLocation],
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
                      number:
                        hitLocationAimedDamageBonusIndex[vals.hitLocation],
                      options: {
                        flavor: `Hit Location Multiplier (${
                          hitLocationNameIndex[vals.hitLocation]
                        })`,
                      },
                    }),
                    new OperatorTerm({ operator: "*" }),
                    new NumericTerm({
                      number: vals.resistanceCustom,
                      options: {
                        flavor: vals.resistanceCustomFlavor,
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
                  speaker: ChatMessage.getSpeaker({ speaker: defendingActor }),
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
                  speaker: ChatMessage.getSpeaker({ speaker: defendingActor }),
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
                      speaker: defendingActor,
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
                      speaker: defendingActor,
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
