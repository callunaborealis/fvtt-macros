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

const renderArmourCalculations = (options: {
  armourMarkupData: LayeredArmourDatum[];
}) => {
  const { armourMarkupData } = options;
  if (armourMarkupData.length === 0) {
    return "";
  }

  return `
    <table>
      <tbody>
        ${armourMarkupData
          .map((armourMarkupDatum, i) => {
            const enhancementsMarkup =
              armourMarkupDatum.enhancements.length > 0
                ? armourMarkupDatum.enhancements.map((enh) => {
                    const enhSP = armourMarkupDatum.sp.enhancements[enh.id];
                    const imgStyle =
                      "height:14px;display:inline;vertical-align:middle;";
                    return `+ ${enhSP} ( <img src="${enh.img}" style="${imgStyle}" /> ${enh.name} )`;
                  })
                : "";
            const bonusCalculationRows =
              i > 0
                ? `
                  <tr>
                    <td colspan="2">
                      <div>Bonus for SP Difference of ${armourMarkupDatum.sp.difference}:</div>
                      <div>${armourMarkupDatum.inner?.sp.totalWithBonus} - ${armourMarkupDatum.sp.total} (${armourMarkupDatum.name[1]})</div>
                    </td>
                    <td><b>${armourMarkupDatum.sp.bonus}</b></td>
                  </tr>
                `
                : "";
            return `
              <tr style="${
                armourMarkupDatum.sp.base > 0 ? "" : "opacity:0.5;"
              }">
                <td>
                  <img src="${armourMarkupDatum.img}" style="width:20px;" />
                </td>
                <td>
                  <div>${armourMarkupDatum.name[i > 0 ? 1 : 0]}</div>
                  <div>${armourMarkupDatum.sp.base} / ${
              armourMarkupDatum.sp.max
            } (Actual / Max)</p>
                </td>
                <td>-</td>
              </tr>
              ${
                enhancementsMarkup &&
                `
                  <tr>
                    <td colspan="2">
                      ${enhancementsMarkup}
                    </td>
                    <td><b>${armourMarkupDatum.sp.total}</b></td>
                  </tr>
                `
              }
              ${bonusCalculationRows}
              <tr>
                <td colspan="2">
                  <b>Layer ${i + 1} (${
              armourMarkupDatum.name[i > 0 ? 1 : 0]
            })</b>
                </td>
                <td><b>${armourMarkupDatum.sp.totalWithBonus}</b></td>
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

const renderDamageFlavor = (options: {
  actorIsMonster: boolean;
  layeredArmourMarkupData: LayeredArmourDatum | undefined;
  armourMarkupData: LayeredArmourDatum[];
  hitLocation: HitLocation;
  total: number;
}) => {
  const { actorIsMonster, armourMarkupData, total, hitLocation } = options;
  const title = total > 0 ? "Wounded" : "Stopped";
  const spReductionLocation = hitLocationNameIndex[hitLocation];
  const totalDamageFlavor =
    total > 0
      ? `Target is wounded with ${total} damage.`
      : `The attack was stopped by the armor (or cover) at <b>${spReductionLocation}</b>.`;
  const topLayerArmourPrescription = (() => {
    if (actorIsMonster) {
      return "reduce armor at armour location by 1.";
    }
    const validArmours = armourMarkupData.filter((datum) => datum.sp.base > 0);
    const len = validArmours.length;
    const topLayerArmour = validArmours[len - 1];
    return `reduce stopping power (SP) for <b>${
      topLayerArmour.name[len > 1 ? 1 : 0]
    }</b> at <b>${spReductionLocation}</b> by 1 (Current SP: ${
      topLayerArmour.sp.base
    } / Max SP: ${topLayerArmour.sp.max}).`;
  })();
  return `
    <div>
      <h1>Actual Damage: ${title}</h1>
      <p>${totalDamageFlavor}</p>
      ${actorIsMonster ? "" : renderArmourCalculations({ armourMarkupData })}
      <p>If attack is melee or if there is no cover, ${topLayerArmourPrescription}</p>
    </div>
  `
    .replaceAll(/>([ \n\r]+)</gim, "><")
    .trim();
};

export default renderDamageFlavor;
