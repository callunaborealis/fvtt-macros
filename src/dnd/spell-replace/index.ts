import fs from "fs";

import type { FoundryVTTNPCShape } from "./types";

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

if (referenceFilePath) {
  fs.readFile(referenceFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const parsedData = JSON.parse(data);
    const datum = parsedData[0] as any;
    console.log(datum.name);
  });
}

if (destinationFilePath) {
  fs.readFile(destinationFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const parsedData = JSON.parse(data);
    const datum = parsedData as FoundryVTTNPCShape;
    console.log(datum.type, datum.name);
  });
}

if (referenceFilePath && destinationFilePath) {
  fs.writeFile(
    `${__dirname}/new-foundry-file.json`,
    '{"test": "hello"}',
    function (err) {
      if (err) throw err;
      console.log(
        `File is created successfully at ${__dirname}/new-foundry-file.json`,
      );
    },
  );
}
