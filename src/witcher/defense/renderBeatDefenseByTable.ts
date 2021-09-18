import { hitLocationCreatureIndex, hitLocationNameIndex } from "./constants";
import { getRollMessagesInChat } from "./helper";

const renderBeatDefenseByTable = (options: {
  actors: Actors;
  messages: Messages;
}) => {
  const { actors, messages } = options;

  const attackRollsInChat = getRollMessagesInChat({
    actors,
    messages,
    type: "attack",
  });

  const defenseRollsInChat = getRollMessagesInChat({
    actors,
    messages,
    type: "defense",
  });

  const damageRollsInChat = getRollMessagesInChat({
    actors,
    messages,
    type: "damage",
  });

  return `
    <table>
      <tbody>
        <tr>
          <td colspan="2">
            <h2>Beat Defense By...</h2>
          </td>
        </tr>
        <tr>
          <td>
            <label for="attack.rolled">Attack</label>
            <select
              name="attack.rolled"
              style="width:180px;text-overflow:ellipsis;"
            >
              <option value="custom">
                Custom
              </option>
              ${attackRollsInChat
                .map((attackRoll) => {
                  const currentRoll = attackRoll.roll as Roll;
                  return `
                    <option 
                      data-actor-id="${attackRoll.actor?.data._id ?? ""}"
                      data-item-id="${attackRoll.itemId ?? ""}"
                      value="${currentRoll.total}"
                    >
                      <span>${currentRoll.total}</span>
                      <span>&nbsp;-&nbsp;</span>
                      <span>${attackRoll.typeName}</span>
                      <span>&nbsp;-&nbsp;</span>
                      <span>${attackRoll.actor?.data.name ?? "?"}</span>
                      <span>&nbsp;-&nbsp;</span>
                      <span>
                        ${new Date(attackRoll.timestamp).toTimeString()}
                      </span>
                    </option>
                  `;
                })
                .join("")}
            </select>
          </td>
          <td>
            <input min="0" name="attack.custom" placeholder="Attack: Custom" step="1" type="number" value="" />
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
              Hit Location Attack Penalty (p. 153) will not be subtracted from above.
              If there is a critical from beating defense, and if the body part selected has more than 1 possible type of critical wound
              (i.e. head or torso), an additional roll will occur on the roll to determine which type
              of critical for the aimed body part (i.e. lesser / critical). See Critical Wounds / Aimed Critical at page 158.
            </p>
          </td>
        </tr>
        <tr>
          <td>
            <label for="defense.rolled">Defense</label>
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
                    <option
                      data-actor-id="${defenseRoll.actor?.data._id ?? ""}"
                      value="${currentRoll.total}"
                    >
                      <span>${defenseRoll.typeName}</span>
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
            <input min="0" name="defense.custom" placeholder="Defense: Custom" step="1" type="number" value="" />
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <label for="defense.critical">Defense (Critical)</label>
            <input min="0" name="defense.critical" step="1" type="number" value="" />
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <h2>Actual Damage</h2>
          </td>
        </tr>
        <tr>
          <td>
            <label for="damage.rolled">Damage</label>
            <select
              name="damage.rolled"
              style="width:180px;text-overflow:ellipsis;"
            >
              <option value="custom">
                Custom
              </option>
              ${damageRollsInChat
                .map((damageRoll) => {
                  const currentRoll = damageRoll.roll as Roll;
                  return `
                    <option 
                      data-actor-id="${
                        damageRoll.user?.character?.data._id ?? ""
                      }"
                      data-item-id="${damageRoll.itemId ?? ""}"
                      value="${currentRoll.total}"
                    >
                      <span>${currentRoll.total}</span>
                      <span>&nbsp;-&nbsp;</span>
                      <span>${damageRoll.typeName}</span>
                      <span>&nbsp;-&nbsp;</span>
                      <span>${
                        damageRoll.user?.character?.data.name ??
                        damageRoll.user?.name ??
                        "?"
                      }</span>
                      <span>&nbsp;-&nbsp;</span>
                      <span>
                        ${new Date(damageRoll.timestamp).toTimeString()}
                      </span>
                    </option>
                  `;
                })
                .join("")}
            </select>
          </td>
          <td>
            <input min="0" name="damage.custom" placeholder="Damage: Custom" step="1" type="number" value="" />
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
  `
    .replaceAll(/>([ \n\r]+)</gim, "><")
    .trim();
};

export default renderBeatDefenseByTable;
