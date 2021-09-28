const getBeatDefenseByTerms = (options: {
  attack: number;
  defense: number;
  defenseCritical: number;
}) => {
  const { attack, defense, defenseCritical } = options;
  const beatDefenseByTermsIndex = {
    attack: new NumericTerm({
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
