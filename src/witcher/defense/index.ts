import {
  hitLocationNameIndex,
  hitLocationCreatureIndex,
  stoppingPowerCols,
  criticalNameIndex,
  critWoundUnaimedThresholdIndex,
  hitLocationCritWoundKeyIndex,
  hitLocationPenaltyIndex,
  hitLocationAimedDamageBonusIndex,
  differencesInSP,
  hitLocationToSPIndex,
} from "./constants";

import type {
  ArmourData,
  EnhancementData,
  HitLocation,
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

  const defendingActor = tokens[0].actor;

  const armours = defendingActor.items
    .filter((it) => it.data.type === "armor")
    .map((item) => item.data as OwnItemData<ArmourData>);
  const enhancementItems = defendingActor.items
    .filter((it) => it.data.type === "enhancement")
    .map((item) => item.data as OwnItemData<EnhancementData>);

  const uniqueId = Date.now();
  const cl = (name: string) => `critWounds-${name}--${uniqueId}`;

  const formTitle = `Attack on ${defendingActor.name}`;

  const defenseRollsInChat = messages
    .map((message) => {
      const actor = actors.find(
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
        const roll = message.data?.roll;
        return {
          defenseType,
          roll: roll ? (JSON.parse(roll) as Roll) : undefined,
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
          <td>
            <label for="defense.rolled">Defense (rolled)</label>
            <select
              name="defense.rolled"
              style="width:180px;text-overflow:ellipsis;"
            >
              <option value="custom">
                Custom
              </option>
              ${defenseRollsInChat
                .map((defenseRoll) => {
                  const currentRoll = defenseRoll.roll as Roll;
                  return `
                    <option value="${currentRoll.total}">
                      <span>${defenseRoll.defenseType}</span>
                      <span>&nbsp;-&nbsp;</span>
                      <span>${currentRoll.total}</span>
                      <span>&nbsp;-&nbsp;</span>
                      <span>${defenseRoll.actor?.data.name ?? "--"}</span>
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

  const armoursTable = `
    <p>The leftmost column is for armor layer order. Unequipped is 0, innermost armor is 1, outermost is ${
      armours.length
    }. If numbers are repeated, the table order will be taken for the repeated rows.</p>
    <table>
      <thead>
        <tr>
          <th colspan="3" scope="colgroup">Armor</td>
          <th
            colspan="${stoppingPowerCols.length}" 
            scope="colgroup"
          >
            Stopping Power
          </th>
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
          <th>Rel</th>
          <th data-tooltip="Bludgeoning">B</th>
          <th data-tooltip="Piercing">P</th>
          <th data-tooltip="Slashing">S</th>
        </tr>
      </thead>
      <tbody>
        ${
          armours.length === 0
            ? `<tr><td colspan="${
                3 + stoppingPowerCols.length + 1 + 3
              }" style="text-align:center;padding: 10px;">No armors</td></tr>`
            : ""
        }
        ${armours
          .map((armour) => {
            return `
              <tr>
                <td style="max-width:24px;">
                  <input
                    min="1"
                    name="armourLayerNumber"
                    step="1"
                    type="number"
                    data-armour-id="${armour._id}"
                    value="${armour.data.equiped === "/" ? "1" : "0"}"
                  />
                </td>
                <td style="min-width:24px;padding-left:2px;padding-right:2px;">
                  <img
                    src="${armour.img}"
                    style="height:24px;width:24px;"
                  />
                </td>
                <td>${armour.name}</td>
                ${stoppingPowerCols
                  .map((key) => {
                    const [value, maxValue] = hitLocationToSPIndex[key];
                    const spValue = armour.data[value];
                    return `
                      <td>
                        <input
                          min="0"
                          max="${maxValue}"
                          name="stoppingPower"
                          step="1"
                          type="number"
                          value="${spValue}"
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
                  <input name="resistance.bludgeoning" type="checkbox" disabled ${
                    armour.data.bludgeoning ? "checked" : ""
                  }/>
                </td>
                <td>
                  <input name="resistance.piercing" type="checkbox" disabled ${
                    armour.data.percing ? "checked" : ""
                  }/>
                </td>
                <td>
                  <input name="resistance.slashing" type="checkbox" disabled ${
                    armour.data.slashing ? "checked" : ""
                  }/>
                </td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;

  const enhancementsTable = `
    <table>
      <thead>
        <tr>
          <th colspan="3" scope="colgroup">Enhancements</td>
          <th colspan="1" scope="colgroup">&nbsp;<!--Body Part--></th>
          <th colspan="1" scope="colgroup">&nbsp;<!--SP--></th>
          <th colspan="3" scope="colgroup">Resistance</th>
        </tr>
        <tr>
          <th><!--Equipped--></th>
          <th><!--Image--></th>
          <th>Name</th>
          <th>Armor Attached</th>
          <th>SP</th>
          <th data-tooltip="Bludgeoning">B</th>
          <th data-tooltip="Piercing">P</th>
          <th data-tooltip="Slashing">S</th>
        </tr>
      </thead>
      <tbody>
        ${
          enhancementItems.length === 0
            ? '<tr><td colspan="8" style="text-align:center;padding:10px;">No enhancements</td></tr>'
            : ""
        }
        ${enhancementItems
          .map((enhancementItem) => {
            return `
              <tr>
                <td style="max-width:24px;">
                  <input
                    name="equipped"
                    data-enhancement-id="${enhancementItem._id}"
                    type="checkbox"
                    ${enhancementItem.data.equiped === "/" ? "checked" : ""}
                  />
                </td>
                <td style="min-width:24px;padding-left:2px;padding-right:2px;">
                  <img
                    src="${enhancementItem.img}"
                    style="height:24px;width:24px;"
                  />
                </td>
                <td>${enhancementItem.name}</td>
                <td>
                  <select
                    data-enhancement-id="${enhancementItem._id}"
                    name="armourAttached"
                  >
                    <option value="" selected>
                      None
                    </option>
                    ${armours
                      .map(
                        (armour) => `
                          <option value="${armour._id}">
                            ${armour.name}
                          </option>
                        `,
                      )
                      .join("")}
                  </select>
                </td>
                <td>
                  <input
                    min="0"
                    name="stoppingPower"
                    step="1"
                    type="number"
                    value="${enhancementItem.data.stopping}"
                    data-enhancement-id="${enhancementItem._id}"
                    disabled
                    readonly
                  />
                </td>
                <td>
                  <input
                    name="resistance.bludgeoning"
                    type="checkbox"
                    disabled
                    data-enhancement-id="${enhancementItem._id}"
                    ${enhancementItem.data.bludgeoning ? "checked" : ""}
                  />
                </td>
                <td>
                  <input
                    name="resistance.piercing"
                    type="checkbox"
                    disabled
                    ${enhancementItem.data.percing ? "checked" : ""}
                  />
                </td>
                <td>
                  <input
                    name="resistance.slashing"
                    type="checkbox"
                    disabled
                    ${enhancementItem.data.slashing ? "checked" : ""}
                  />
                </td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;

  const renderContent = () => {
    return `
      <div id="${cl("form")}">
        <h1>${formTitle}</h1>
        ${beatDefenseByTable}
        <h2>Stopping Power</h2>
        ${armoursTable}
        ${enhancementsTable}
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

  const renderDamageFlavor = (options: {
    total: number;
    hitLocation: HitLocation;
  }) => {
    const { total, hitLocation } = options;
    const title = (() => {
      if (total > 0) {
        return "Wounded";
      }
      return "Stopped";
    })();
    const spReductionLocation = hitLocationNameIndex[hitLocation];
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

  const getNumValue = (value: any) => {
    const rawDamageVal = parseInt(`${value}`);
    return Number.isNaN(rawDamageVal) ? 0 : rawDamageVal;
  };

  const getCritDamage = (
    isSpecterOrElementa: boolean,
    beatDefenseByRollTotal: number,
  ): [
    specterOrElementaTag: string,
    defenseBeatTag: string,
    critDamage: number,
  ] => {
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
            interface LayeredArmourDatum {
              id: string;
              enhancements: { id: string }[];
              name:
                | [armourName: string]
                | [innerArmour: string, outerArmour: string];
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
                    enhancements: enhs.map((enh) => {
                      return { id: enh?._id ?? "-" };
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
                    enhancements: enhs.map((enh) => {
                      return { id: enh?._id ?? "-" };
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
                        <a class="inline-roll roll" title="1d10" data-mode="roll" data-flavor data-formula="1d10[Stun Save]">
                          <i class="fas fa-dice-d20"></i>&nbsp;Stun Save
                        </a>.
                      </p>
                      <p>Deduct from ${defendingActor.name}'s HP directly. Ignore SP, Resistance and Hit Location for this damage.</p>
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
