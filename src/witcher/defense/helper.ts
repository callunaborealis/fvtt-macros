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
  return `<h1>Attack v. Defense: ${title}</h1>`;
};

const getRollMessagesInChat = (options: {
  actors: Actors;
  messages: Messages;
  type: "attack" | "defense" | "damage";
}): {
  typeName: string | undefined;
  imgSrc: string | undefined;
  roll: Roll | undefined;
  itemId: string | undefined;
  timestamp: number;
  actor: Actor | undefined;
}[] => {
  const { actors, messages, type } = options;

  const rollsInChat = messages
    .map((message) => {
      const actor = actors.find(
        (a) => a.data.name === message.data.speaker.alias,
      );
      if (typeof message.data.flavor !== "string") {
        return {
          typeName: undefined,
          imgSrc: undefined,
          roll: undefined,
          itemId: undefined,
          timestamp: message.data.timestamp,
          actor,
        };
      }
      const imageSrcParts = message.data.flavor.split(
        /<h1><img src="([\w\d\_\-\/\%\.]+)"/gim,
      );
      const imgSrc = imageSrcParts[1];
      const parts =
        type === "attack"
          ? message.data.flavor.split(/Attack: (.+)<\/h1>/gim)
          : type === "defense"
          ? message.data.flavor.split(/<h1>Defense: (.+)<\/h1>/gim)
          : message.data.flavor.split(/Damage: (.+)<\/h1>/gim);
      if (parts.length === 3) {
        const typeName = parts[1].trim().replaceAll("&amp;", "&");
        const roll = message.data.roll;
        const item = actor?.items.getName(typeName, { strict: false });
        return {
          typeName,
          imgSrc,
          roll: roll ? JSON.parse(roll) : undefined,
          timestamp: message.data.timestamp,
          actor,
          itemId: item?.data._id ?? undefined,
        };
      }
      return {
        typeName: undefined,
        imgSrc: undefined,
        roll: undefined,
        itemId: undefined,
        timestamp: message.data.timestamp,
        actor,
      };
    })
    .filter((message) => typeof message.typeName === "string");

  // Sort by latest to earliest
  rollsInChat.sort((a, b) => b.timestamp - a.timestamp);
  return rollsInChat;
};

export { cl, getCritDamage, getRollMessagesInChat, renderAttackFlavor };
