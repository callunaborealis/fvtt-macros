import { ArmourData, EnhancementData, OwnItemData } from "./types";

const renderEnhancementsTable = (options: {
  armours: OwnItemData<ArmourData>[];
  enhancementItems: OwnItemData<EnhancementData>[];
}) => {
  const { armours, enhancementItems } = options;
  return `
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
};

export default renderEnhancementsTable;
