interface FifthEditionExampleShape {
  name: string;
  isNpc: boolean;
  source: string;
  page: number;
  type: {
    type: string;
    tags: string[];
  };
  alignment: string[];
  spellcasting: {
    name: string;
    headerEntries: string[];
    spells: Record<number, number>;
    ability: string;
    type: string;
  }[];
  hasToken: boolean;
  size: string;
  ac: any[];
  hp: {
    average: number;
    formula: string;
  };
  speed: {
    walk: number;
  };
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  save: {
    int: string;
    wis: string;
  };
  skill: {
    arcana: string;
    history: string;
  };
  passive: number;
  languages: string[];
  cr: string;
  action: {
    name: string;
    entries: string[];
  }[];
  languageTags: string[];
  damageTags: string[];
  spellcastingTags: string[];
  miscTags: string[];
}

export interface FeatItem {
  _id: string;
  name: string;
  type: string;
  data: {
    description: {
      value: string;
      chat: string;
      unidentified: string;
    };
    source: string;
    activation: {
      type: string;
      cost: number;
      condition: string;
    };
    duration: {
      value: number;
      units: string;
    };
    target: {
      value?: null;
      width?: null;
      units: string;
      type: string;
    };
    range: {
      value?: null;
      long?: null;
      units: string;
    };
    uses: {
      value: number;
      max: number;
      per: string;
    };
    consume: {
      type: string;
      target?: null;
      amount?: null;
    };
    ability: string;
    actionType: string;
    attackBonus: number;
    chatFlavor: string;
    critical?: null;
    damage: {
      parts?: null[] | null;
      versatile: string;
    };
    formula: string;
    save: {
      ability: string;
      dc?: null;
      scaling: string;
    };
    requirements: string;
    recharge: {
      value: number;
      charged: boolean;
    };
  };
  sort: number;
  flags: Record<string, any>;
  img: string;
  effects?: null[] | null;
}

interface SpellItem {
  _id: string;
  name: string;
  type: string;
  data: {
    description: {
      value: string;
      chat: string;
      unidentified: string;
    };
    source: string;
    activation: {
      type: string;
      cost: number;
      condition: string;
    };
    duration: {
      value: number;
      units: string;
    };
    target: {
      value: any;
      width: any;
      units: string;
      type: string;
    };
    range: {
      value: any;
      long: number | null;
      units: string;
    };
    uses: {
      value: number;
      max: number;
      per: string;
    };
    consume: {
      type: string;
      target: any;
      amount: any;
    };
    ability: string;
    actionType: string;
    attackBonus: number;
    chatFlavor: string;
    critical: any;
    damage: {
      parts: any[];
      versatile: string;
    };
    formula: string;
    save: {
      ability: string;
      dc: any;
      scaling: string;
    };
    level: number;
    school: string;
    components: {
      value: string;
      vocal: boolean;
      somatic: boolean;
      material: boolean;
      ritual: boolean;
      concentration: boolean;
    };
    materials: {
      value: string;
      consumed: boolean;
      cost: number;
      supply: number;
    };
    preparation: {
      mode: string;
      prepared: boolean;
    };
    scaling: {
      mode: string;
      formula: string;
    };
  };
  sort: number;
  flags: Record<string, string>;
  img: string;
  effects: any[];
}

type Item = FeatItem | SpellItem;

interface FoundryVTTNPCShape {
  _id: string;
  name: string;
  permission: {
    default: number;
    NjljZjFkNWZkNmE3: number;
  };
  type: "npc";
  data: {
    abilities: Record<
      "str" | "dex" | "con" | "int" | "wis" | "cha",
      {
        value: number;
        proficient: number;
        min: number;
        mod: number;
        save: number;
        prof: number;
        saveBonus: number;
        checkBonus: number;
        dc: number;
      }
    >;
    attributes: {
      ac: {
        value: number;
        formula: string;
      };
      hp: {
        value: number;
        min: number;
        max: number;
        temp?: any;
        tempmax?: any;
        formula: string;
      };
      init: {
        value: number;
        bonus: number;
        mod: number;
        prof: number;
        total: number;
      };
      movement: {
        burrow: number;
        climb: number;
        fly: number;
        swim: number;
        walk: number;
        units: string;
        hover: boolean;
      };
      senses: {
        darkvision: number;
        blindsight: number;
        tremorsense: number;
        truesight: number;
        units: string;
        special: string;
      };
      spellcasting: string;
      prof: number;
      spelldc: number;
      spellLevel: number;
      bar1: {
        value: number;
        min: number;
        max: number;
      };
      bar2: {
        value: number;
        min: number;
        max: number;
      };
      encumbrance: {
        value: number;
        max: number;
        pct: number;
        encumbered: boolean;
      };
    };
    details: {
      biography: {
        value: string;
        public: string;
      };
      alignment: string;
      race: string;
      type: string;
      environment: string;
      cr: number;
      spellLevel: number;
      xp: {
        value: number;
      };
      source: string;
      class: string;
      notes1name: string;
      notes2name: string;
      notes3name: string;
      notes4name: string;
      gender: string;
      age: string;
      height: string;
      weight: string;
      eyes: string;
      skin: string;
      hair: string;
    };
    traits: {
      size: string;
      di: {
        value: any[];
        custom: string;
      };
      dr: {
        value: any[];
        custom: string;
      };
      dv: {
        value: any[];
        custom: string;
      };
      ci: {
        value: any[];
        custom: string;
      };
      languages: {
        value: any[];
        custom: string;
      };
    };
    currency: {
      pp: number;
      gp: number;
      ep: number;
      sp: number;
      cp: number;
    };
    skills: Record<
      | "acr"
      | "ani"
      | "arc"
      | "ath"
      | "dec"
      | "his"
      | "ins"
      | "itm"
      | "inv"
      | "med"
      | "nat"
      | "prc"
      | "prf"
      | "per"
      | "rel"
      | "slt"
      | "ste"
      | "sur",
      {
        value: number;
        ability: string;
        bonus: number;
        mod: number;
        passive: number;
        prof: number;
        total: number;
      }
    >;
    spells: {
      spell1: {
        value: number;
        override?: any;
        max: number;
      };
      spell2: {
        value: number;
        override?: any;
        max: number;
      };
      spell3: {
        value: number;
        override?: any;
        max: number;
      };
      spell4: {
        value: number;
        override?: any;
        max: number;
      };
      spell5: {
        value: number;
        override?: any;
        max: number;
      };
      spell6: {
        value: number;
        override?: any;
        max: number;
      };
      spell7: {
        value: number;
        override?: any;
        max: number;
      };
      spell8: {
        value: number;
        override?: any;
        max: number;
      };
      spell9: {
        value: number;
        override?: any;
        max: number;
      };
      pact: {
        value: number;
        override?: any;
        max: number;
        level: number;
      };
      spell0: {
        value: number;
        max: number;
      };
    };
    bonuses: {
      mwak: {
        attack: string;
        damage: string;
      };
      rwak: {
        attack: string;
        damage: string;
      };
      msak: {
        attack: string;
        damage: string;
      };
      rsak: {
        attack: string;
        damage: string;
      };
      abilities: {
        check: string;
        save: string;
        skill: string;
      };
      spell: {
        dc: string;
      };
    };
    resources: {
      legact: {
        value: number;
        max: number;
      };
      legres: {
        value: number;
        max: number;
      };
      lair: {
        value: boolean;
        initiative: number;
      };
    };
  };
  sort: number;
  flags: {
    core: {
      sourceId: string;
    };
    cf: {
      id: string;
      path: string;
      color: string;
    };
  };
  img: string;
  token: {
    flags: {
      "token-hud-wildcard": {
        default: string;
      };
      barbrawl: {
        resourceBars: Record<
          "bar1" | "bar2",
          {
            id: string;
            attribute: string;
            max?: any;
            mincolor: string;
            maxcolor: string;
            visibility: number;
            position: string;
            style: string;
            ignoreMin: boolean;
            ignoreMax: boolean;
            invert: boolean;
          }
        >;
      };
    };
    name: string;
    displayName: number;
    img: string;
    tint: string;
    width: number;
    height: number;
    scale: number;
    mirrorX: boolean;
    mirrorY: boolean;
    lockRotation: boolean;
    rotation: number;
    vision: boolean;
    dimSight: number;
    brightSight: number;
    dimLight: number;
    brightLight: number;
    sightAngle: number;
    lightAngle: number;
    lightColor: string;
    lightAlpha: number;
    lightAnimation: {
      type: string;
      speed: number;
      intensity: number;
    };
    actorId: string;
    actorLink: boolean;
    disposition: number;
    displayBars: number;
    bar1: {
      attribute: string;
    };
    bar2: {
      attribute: string;
    };
    randomImg: boolean;
  };
  items: Item[];
}

export type { FifthEditionExampleShape, FoundryVTTNPCShape };
