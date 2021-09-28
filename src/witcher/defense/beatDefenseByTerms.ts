const getBeatDefenseByTerms = (options: {
  attack: number;
  attackCritical: number;
  defense: number;
  defenseCritical: number;
}) => {
  const { attack, attackCritical, defense, defenseCritical } = options;
  const beatDefenseByTermsIndex = {
    attack:
      attackCritical > 0
        ? ParentheticalTerm.fromTerms(
            [
              new NumericTerm({
                number: attack,
                options: {},
              }),
              new OperatorTerm({ operator: "+" }),
              new NumericTerm({
                number: attackCritical,
                options: { flavor: "Critical" },
              }),
            ],
            { flavor: "Attack" },
          )
        : new NumericTerm({
            number: attack,
            options: { flavor: "Attack" },
          }),
    defense:
      defenseCritical > 0
        ? ParentheticalTerm.fromTerms(
            [
              new NumericTerm({
                number: defense,
                options: {},
              }),
              new OperatorTerm({ operator: "+" }),
              new NumericTerm({
                number: defenseCritical,
                options: { flavor: "Critical" },
              }),
            ],
            { flavor: "Defense" },
          )
        : new NumericTerm({
            number: defense,
            options: { flavor: "Defense" },
          }),
  };
  return [
    beatDefenseByTermsIndex.attack,
    new OperatorTerm({ operator: "-" }),
    beatDefenseByTermsIndex.defense,
  ];
};

export { getBeatDefenseByTerms };
