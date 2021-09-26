import {
  hitLocationNameIndex,
  hitLocationToMonsterArmorIndex,
  monsterArmorKeys,
  monsterArmorNameIndex,
  monsterArmorToHitLocations,
} from "./constants";
import { getNumValue } from "./helper";
import type { MonsterActorData } from "./types";

const renderMonsterArmoursTable = (options: { data: MonsterActorData }) => {
  const { data } = options;
  const separatorStyle = "border-right:solid 2px rgb(214,213,204);";
  return `
    <table>
      <thead>
        <tr>
          <th colspan="1" scope="colgroup"><!--Name--></th>
          <th colspan="${
            monsterArmorToHitLocations.human.length
          }" scope="colgroup" style="${separatorStyle}">Human</th>
          <th colspan="${
            monsterArmorToHitLocations.monster.length
          }" scope="colgroup">Monster</th>
        </tr>
        <tr>
          <th>Name</th>
           ${monsterArmorToHitLocations.human
             .map((hitLocation, i) => {
               const style =
                 i === monsterArmorToHitLocations.human.length - 1
                   ? `style="${separatorStyle}"`
                   : "";
               return `
                <th ${style}>
                  ${hitLocationNameIndex[hitLocation]}
                </th>
              `;
             })
             .join("")}
           ${monsterArmorToHitLocations.monster
             .map((hitLocation, i) => {
               return `
                <th>
                  ${hitLocationNameIndex[hitLocation]}
                </th>
              `;
             })
             .join("")}
        </tr>
      </thead>
      <tbody>
        ${monsterArmorKeys
          .map((armourKey) => {
            return `
            <tr>
              <td>${monsterArmorNameIndex[armourKey]}</td>
              ${monsterArmorToHitLocations.human
                .map((hitLocation, i) => {
                  const monsterArmourKey =
                    hitLocationToMonsterArmorIndex[hitLocation];
                  const value =
                    armourKey === monsterArmourKey
                      ? getNumValue(data[monsterArmourKey])
                      : 0;
                  const style =
                    i === monsterArmorToHitLocations.human.length - 1
                      ? `style="${separatorStyle}"`
                      : "";
                  return `
                  <td ${style}>
                    <input
                      min="0"
                      max="${value}"
                      name="monsterArmor"
                      step="1"
                      type="number"
                      value="${value}"
                      data-sp-type="${hitLocation}"
                      disabled
                      readonly
                    />
                  </td>
                `;
                })
                .join("")}
              ${monsterArmorToHitLocations.monster
                .map((hitLocation) => {
                  const monsterArmourKey =
                    hitLocationToMonsterArmorIndex[hitLocation];
                  const value =
                    armourKey === monsterArmourKey
                      ? getNumValue(data[monsterArmourKey])
                      : 0;
                  return `
                    <td>
                      <input
                        min="0"
                        max="${value}"
                        name="monsterArmor"
                        step="1"
                        type="number"
                        value="${value}"
                        data-sp-type="${hitLocation}"
                        disabled
                        readonly
                      />
                    </td>
                  `;
                })
                .join("")}
            </tr>
          `;
          })
          .join("")}
      </tbody>
    </table>
  `
    .replaceAll(/>([ \n\r]+)</gim, "><")
    .trim();
};

export default renderMonsterArmoursTable;
