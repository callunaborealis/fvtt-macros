const uniqueId = Date.now();
const cl = (name: string) => `critWounds-${name}--${uniqueId}`;

const getCritDamage = (
  isSpecterOrElementa: boolean,
  beatDefenseByRollTotal: number,
): [
  specterOrElementaTag: string,
  defenseBeatTag: string,
  critDamage: number,
] => {
  const specterOrElementaTag = isSpecterOrElementa
    ? " (Specter or Elementa)"
    : "";
  if (beatDefenseByRollTotal >= 15) {
    return [
      "Deadly",
      `Defense beat by 15+${specterOrElementaTag}`,
      isSpecterOrElementa ? 20 : 10,
    ];
  }
  if (beatDefenseByRollTotal >= 13) {
    return [
      "Difficult",
      `Defense beat by 13+${specterOrElementaTag}`,
      isSpecterOrElementa ? 15 : 8,
    ];
  }
  if (beatDefenseByRollTotal >= 10) {
    return [
      "Complex",
      `Defense beat by 10+${specterOrElementaTag}`,
      isSpecterOrElementa ? 10 : 5,
    ];
  }
  if (beatDefenseByRollTotal >= 7) {
    return [
      "Simple",
      `Defense beat by 7+${specterOrElementaTag}`,
      isSpecterOrElementa ? 5 : 3,
    ];
  }
  return ["", "", 0];
};

const renderAttackFlavor = ({ total }) => {
  const title = (() => {
    if (total > 0) {
      return "Hit";
    }
    return "Missed";
  })();
  return `<h1>Attack: ${title}</h1>`;
};

export { cl, getCritDamage, renderAttackFlavor };
