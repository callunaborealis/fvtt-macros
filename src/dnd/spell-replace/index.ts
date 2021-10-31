import fs from "fs";

import type { FifthEditionExampleShape, FoundryVTTNPCShape } from "./types";

/**
 * Replace spells with actual spells
 */

let referenceFilePath: string | undefined = undefined;
let destinationFilePath: string | undefined = undefined;

process.argv.forEach(function (val, index, array) {
  console.log(index, ":", val);

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

    const [referenceFileContents, destinationFileContents] = fileContents;

    if (referenceFileContents && destinationFileContents) {
      fs.writeFile(
        `${__dirname}/new-foundry-file.json`,
        `{"reference":${JSON.stringify(
          referenceFileContents,
        )},"destination":${JSON.stringify(destinationFileContents)}}`,
        function (err) {
          if (err) throw err;
          console.log(
            `File is created successfully at ${__dirname}/new-foundry-file.json`,
          );
        },
      );
    }
  });
}
