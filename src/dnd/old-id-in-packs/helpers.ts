import fs from "fs";
import path from "path";

import type { Datum, DataType, FileName } from "./types";

const forEveryShallowFile = (
  targetFolderPath: string,
  isFile: (filename: string) => boolean,
  callback: (filename: string) => void,
) => {
  if (!fs.existsSync(targetFolderPath)) {
    console.log(`Invalid target folder: ${targetFolderPath}`);
    return;
  }
  const files = fs.readdirSync(targetFolderPath);
  if (files.length === 0) {
    console.log(`No files found within: ${targetFolderPath}`);
    return;
  }
  files.forEach((file) => {
    const filename = path.join(targetFolderPath, file);
    const stats = fs.lstatSync(filename);
    if (!stats.isDirectory()) {
      if (isFile(filename)) {
        callback(filename);
      }
    }
  });
};

const forEveryRawDatum = (
  raw: string,
  cb: (datum: Datum, i: number) => void,
) => {
  raw
    .split("\n")
    .filter((part) => part)
    .forEach((part, i) => {
      let datum;
      try {
        datum = JSON.parse(part);
      } catch (error) {
        datum = part;
      }
      cb(datum, i);
    });
};

const datumKeyConnector = "--";
const joinDatumKey = (options: { name: string; type: DataType }): string => {
  const { name, type } = options;
  return `${name}${datumKeyConnector}${type}`;
};

const processIndexedDataIntoFiles = (
  options: {
    data: Record<FileName, Datum[]>;
    fileNames: FileName[];
    newPacksFolderName: string;
  },
  cb: (v: any) => void,
) => {
  const { data, fileNames, newPacksFolderName } = options;
  const newPacksDir = `${__dirname}/${newPacksFolderName}`;
  if (!fs.existsSync(newPacksDir)) {
    fs.mkdirSync(newPacksDir, { recursive: true });
  }
  const writeFilePromises: Promise<any>[] = fileNames.map((fileName) => {
    return new Promise((resolve, reject) => {
      const fileLocation = `${newPacksDir}/${path.basename(fileName)}`;
      fs.writeFile(
        fileLocation,
        `${data[fileName].map((datum) => JSON.stringify(datum)).join("\n")}`,
        (err) => {
          if (err) {
            reject(err);
          } else {
            const message = `File is created successfully at ${fileLocation}`;
            console.log(message);
            resolve(message);
          }
        },
      );
    });
  });
  Promise.allSettled(writeFilePromises).then((val) => {
    cb(val);
  });
};

export {
  forEveryShallowFile,
  forEveryRawDatum,
  processIndexedDataIntoFiles,
  joinDatumKey,
};
