import fs from "fs";

import type { FifthEditionExampleShape, FoundryVTTNPCShape } from "./types";

/**
 * Replace spells with actual spells
 */

let referenceFilePath: string | undefined = undefined;
let destinationFilePath: string | undefined = undefined;

process.argv.forEach((val, index) => {
  if (index === 2) {
    console.log("Reference file: ", val);
    referenceFilePath = val;
  }
  if (index === 3) {
    console.log("Destination file: ", val);
    destinationFilePath = val;
  }
});

if (referenceFilePath && destinationFilePath) {
  Promise.allSettled([
    new Promise((resolve, reject) => {
      fs.readFile(referenceFilePath as string, "utf8", (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        const parsedData = JSON.parse(data);
        resolve(parsedData[0] as FifthEditionExampleShape);
      });
    }),
    new Promise((resolve, reject) => {
      fs.readFile(destinationFilePath as string, "utf8", (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        const parsedData = JSON.parse(data);
        resolve(parsedData as FoundryVTTNPCShape);
      });
    }),
  ]).then((settledResults) => {
    const fileContents = settledResults.map((settledResult) => {
      if (settledResult.status === "fulfilled") {
        return settledResult.value;
      }
      return undefined;
    });

    const [fifthEdFileContents, foundryVTTFileContents] = fileContents;

    if (fifthEdFileContents && foundryVTTFileContents) {
      const newFifthEdFileContents = {
        ...(fifthEdFileContents as FifthEditionExampleShape),
      };
      const fifthEdFileSpells = (
        fifthEdFileContents as FifthEditionExampleShape
      ).spellcasting[0].spells;
      const foundryVTTSpells = (
        foundryVTTFileContents as FoundryVTTNPCShape
      ).items.filter((item) => item.type === "spell");

      const fifthEdFileSpellKeys = Object.keys(fifthEdFileSpells);

      fifthEdFileSpellKeys.forEach((key) => {
        const spellLevel = parseInt(key);
        if (!Number.isNaN(spellLevel)) {
          const fifthEdSpell = fifthEdFileSpells[key];
          if (fifthEdSpell.spells) {
            fifthEdSpell.spells.forEach((spell, fifthEdSpellIdx) => {
              const spellName = spell.split(/{@spell ([\d\w\s]+)}/gim)[1];
              if (spellName) {
                const foundryIdx = foundryVTTSpells.findIndex(
                  (spell) =>
                    spell.name.toLocaleLowerCase() ===
                    spellName.toLocaleLowerCase(),
                );
                const foundSpell = foundryVTTSpells[foundryIdx];
                if (foundSpell) {
                  console.log("foundSpell", foundSpell.name);
                  newFifthEdFileContents.spellcasting[0].spells[key].spells[
                    fifthEdSpellIdx
                  ] = foundSpell as any;
                }
              }
            });
          }
        }
      });

      fs.writeFile(
        `${__dirname}/here.json`,
        `${JSON.stringify(newFifthEdFileContents)}`,
        (err) => {
          if (err) {
            throw err;
          }
          console.log(`File is created successfully at ${__dirname}/here.json`);
        },
      );
    }
  });
}
