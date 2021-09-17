import { hitLocationCreatureIndex, hitLocationNameIndex } from "./constants";

const renderBeatDefenseByTable = (options: {
  actors: Actors;
  messages: Messages;
}) => {
  const { actors, messages } = options;
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

  return `
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
};

export default renderBeatDefenseByTable;
