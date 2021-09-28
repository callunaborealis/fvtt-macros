import { cl } from "./helper";
import type { MonsterActorData } from "./types";

const renderContent = (options: {
  formTitle: string;
  beatDefenseByTable: string;
  armoursTable: string;
  monsterArmoursTable: string;
  enhancementsTable: string;
  monsterCategory: MonsterActorData["category"] | undefined;
}) => {
  const {
    formTitle,
    beatDefenseByTable,
    armoursTable,
    monsterArmoursTable,
    enhancementsTable,
    monsterCategory,
  } = options;
  return `
    <div id="${cl("form")}">
      <h1>${formTitle}</h1>
      ${beatDefenseByTable}
      <h2>Stopping Power</h2>
      ${armoursTable}
      ${enhancementsTable}
      ${monsterArmoursTable}
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
                <input name="isSpecterOrElementa" type="checkbox" ${
                  monsterCategory &&
                  (monsterCategory === "Elementa" ||
                    monsterCategory === "Specter")
                    ? "checked"
                    : ""
                }/>
              </div>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <p></p>
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

export default renderContent;
