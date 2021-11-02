import fs from "fs";
import { forEveryShallowFile } from "./helpers";

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

if (referenceFilePath) {
  forEveryShallowFile(
    referenceFilePath,
    (filename) => {
      return filename.indexOf(".db") >= 0;
    },
    (filename) => {
      console.log(filename);
    },
  );
}
if (destinationFilePath) {
  forEveryShallowFile(
    destinationFilePath,
    (filename) => {
      return filename.indexOf(".db") >= 0;
    },
    (filename) => {
      console.log(filename);
    },
  );
}
