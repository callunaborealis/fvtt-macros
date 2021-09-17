import { hitLocationNameIndex } from "./constants";
import type { HitLocation, LayeredArmourDatum } from "./types";

const renderDamageFlavor = (options: {
  layeredArmourMarkupData: LayeredArmourDatum;
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

export default renderDamageFlavor;
