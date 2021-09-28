import {
  hitLocationNameIndex,
  hitLocationToMonsterArmourIndex,
  monsterArmourKeys,
  monsterArmorNameIndex,
  monsterArmourToHitLocations,
} from "./constants";
import { getNumValue } from "./helper";
import type { HitLocation, MonsterActorData } from "./types";

const renderMonsterArmoursTable = (options: { data: MonsterActorData }) => {
  const { data } = options;
  const separatorStyle = "border-right:solid 2px rgb(214,213,204);";

  const monsterArmoursTable = `
    <table>
      <thead>
        <tr>
          <th colspan="1" scope="colgroup"><!--Name--></th>
          <th colspan="${
            monsterArmourToHitLocations.human.length
          }" scope="colgroup" style="${separatorStyle}">Human</th>
          <th colspan="${
            monsterArmourToHitLocations.monster.length
          }" scope="colgroup">Monster</th>
        </tr>
        <tr>
          <th>Name</th>
           ${monsterArmourToHitLocations.human
             .map((hitLocation, i) => {
               const style =
                 i === monsterArmourToHitLocations.human.length - 1
                   ? `style="${separatorStyle}"`
                   : "";
               return `
                <th ${style}>
                  ${hitLocationNameIndex[hitLocation]}
                </th>
              `;
             })
             .join("")}
           ${monsterArmourToHitLocations.monster
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
        ${monsterArmourKeys
          .map((armourKey) => {
            const armourName = monsterArmorNameIndex[armourKey];
            return `
              <tr>
                <td>${armourName}</td>
                ${monsterArmourToHitLocations.human
                  .map((hitLocation, i) => {
                    const monsterArmourKey =
                      hitLocationToMonsterArmourIndex[hitLocation];
                    const value =
                      armourKey === monsterArmourKey
                        ? getNumValue(data[monsterArmourKey])
                        : 0;

                    const style =
                      i === monsterArmourToHitLocations.human.length - 1
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
                ${monsterArmourToHitLocations.monster
                  .map((hitLocation) => {
                    const monsterArmourKey =
                      hitLocationToMonsterArmourIndex[hitLocation];
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

  return monsterArmoursTable;
};

const getMonsterArmourTerms = (options: {
  data: MonsterActorData;
  selectedHitLocation: HitLocation;
}) => {
  const { data, selectedHitLocation } = options;

  // You can only aim one part
  const selectedMonsterArmourKey =
    hitLocationToMonsterArmourIndex[selectedHitLocation];

  return [
    new NumericTerm({
      number: getNumValue(data[selectedMonsterArmourKey]),
      options: {
        flavor: `${hitLocationNameIndex[selectedHitLocation]} (${monsterArmorNameIndex[selectedMonsterArmourKey]})`,
      },
    }),
  ] as RollTerm[];
};

export { getMonsterArmourTerms, renderMonsterArmoursTable };
