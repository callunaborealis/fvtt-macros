import { hitLocationNameIndex } from "./constants";
import type { HitLocation, LayeredArmourDatum } from "./types";

const renderLayeredArmourTable = (options: {
  layeredArmourMarkupData: LayeredArmourDatum;
}) => {
  const { layeredArmourMarkupData } = options;
  const innerMarkup = layeredArmourMarkupData.inner;
  const enhList = layeredArmourMarkupData.enhancements;
  const spAttr = layeredArmourMarkupData.sp;
  return `
    <table>
      <tbody>
        <tr>
          <td colspan="2">
            <span>${spAttr.bonus} (Difference: ${spAttr.difference})</span>
            <span> = ${spAttr.totalWithBonus}</span>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <span>Greater armor:</span>
            <span>${
              layeredArmourMarkupData.isStrongerThanInner
                ? layeredArmourMarkupData.name.join(" + ")
                : (innerMarkup?.name ?? []).join(" + ")
            }</span>
          </td>
        </tr>
        <tr>
          <td>
            <table>
              <tbody>
                <tr>
                  <td>
                    <img src="${
                      layeredArmourMarkupData.img
                    }" width="20px;"/></td>
                  <td>
                    ${layeredArmourMarkupData.name.join(" + ")}
                  </td>
                  <td>
                    ${spAttr.base}
                  </td>
                </tr>
                <tr>
                  <td colspan="2">Total</td>
                  <td>${spAttr.total}</td>
                </tr>
                <tr>
                  <td colspan="2">
                    ${
                      enhList.length > 0
                        ? `
                          <table>
                            <thead>
                              <tr>
                                <th colspan="3">Enhancements</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${enhList.map((enh) => {
                                return `
                                  <tr>
                                    <td><img src="${
                                      enh.img
                                    }" width="20px;"/></td>
                                    <td>${enh.name}</td>
                                    <td>${spAttr.enhancements[enh.id]}</td>
                                  </tr>
                                `;
                              })}
                            </tbody>
                          </table>
                        `
                        : "No enhancements"
                    }
                  </td>
                </tr>
              <tbody>
            </table>
          </td>
          <td>
            ${
              innerMarkup
                ? `
                    <table>
                      <tbody>
                        <tr>
                          <td>
                            <img src="${
                              innerMarkup?.img ?? "#"
                            }" width="20px" />
                          </td>
                          <td>
                            ${(innerMarkup?.name ?? []).join(" + ") ?? "-"}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            Total
                          </td>
                          <td>
                            ${innerMarkup?.sp.total ?? "-"}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            Total after bonus
                          </td>
                          <td>
                            ${innerMarkup?.sp.totalWithBonus ?? "-"}
                          </td>
                        </tr>
                      <tbody>
                    </table>
                `
                : ""
            }
          </td>
        </tr>
      </tbody>
    </table>
    ${
      innerMarkup
        ? renderLayeredArmourTable({
            layeredArmourMarkupData: innerMarkup,
          })
        : ""
    }
  `
    .replaceAll(/>([ \n\r]+)</gim, "><")
    .trim();
};

const renderDamageFlavor = (options: {
  layeredArmourMarkupData: LayeredArmourDatum;
  total: number;
  hitLocation: HitLocation;
}) => {
  const { layeredArmourMarkupData, total, hitLocation } = options;
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
      ${renderLayeredArmourTable({ layeredArmourMarkupData })}
    </div>
  `
    .replaceAll(/>([ \n\r]+)</gim, "><")
    .trim();
};

export default renderDamageFlavor;
