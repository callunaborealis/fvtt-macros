import {
  hitLocationNameIndex,
  hitLocationToSPIndex,
  stoppingPowerCols,
} from "./constants";
import { ArmourData, OwnItemData } from "./types";

const renderArmoursTable = (options: {
  armours: OwnItemData<ArmourData>[];
}) => {
  const { armours } = options;
  return `
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
  `
    .replaceAll(/>([ \n\r]+)</gim, "><")
    .trim();
};

export default renderArmoursTable;
