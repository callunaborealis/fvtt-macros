import fs from "fs";
import { forEveryShallowFile } from "./helpers";

let packsFilePath: string | undefined = undefined;
let dataFilePath: string | undefined = undefined;

process.argv.forEach((val, index) => {
  if (index === 2) {
    console.log("Packs folders: ", val);
    packsFilePath = val;
  }
  if (index === 3) {
    console.log("Data folders: ", val);
    dataFilePath = val;
  }
});

const packFileNames: string[] = [];
const packsFilePromises: Promise<any>[] = [];

if (packsFilePath) {
  forEveryShallowFile(
    packsFilePath,
    (filename) => {
      return filename.indexOf(".db") >= 0;
    },
    (filename) => {
      packFileNames.push(filename);
      packsFilePromises.push(
        new Promise((resolve, reject) => {
          fs.readFile(filename as string, "utf8", (err, data) => {
            if (err) {
              console.error(err);
              reject(err);
              return;
            }
            resolve(data);
          });
        }),
      );
    },
  );

  const packsFiles: Record<string, any> = {};
  Promise.allSettled(packsFilePromises).then((settledResults) => {
    settledResults.forEach((settledResult, i) => {
      if (settledResult.status === "fulfilled") {
        const raw = settledResult.value;
        const parts = raw
          .split("\n")
          .filter((part) => part)
          .map((part) => {
            let acc;
            try {
              acc = JSON.parse(part);
            } catch (error) {
              acc = part;
            }
            return acc;
          });
        packsFiles[packFileNames[i]] = parts;
      }
    });
    fs.writeFile(
      `${__dirname}/packs-combined.json`,
      `${JSON.stringify(packsFiles)}`,
      (err) => {
        if (err) {
          throw err;
        }
        console.log(
          `File is created successfully at ${__dirname}/packs-combined.json`,
        );
      },
    );
  });
}

const dataFileNames: string[] = [];
const dataFilePromises: Promise<any>[] = [];
if (dataFilePath) {
  forEveryShallowFile(
    dataFilePath,
    (filename) => {
      return filename.indexOf(".db") >= 0;
    },
    (filename) => {
      dataFileNames.push(filename);
      dataFilePromises.push(
        new Promise((resolve, reject) => {
          fs.readFile(filename as string, "utf8", (err, data) => {
            if (err) {
              console.error(err);
              reject(err);
              return;
            }
            resolve(data);
          });
        }),
      );
    },
  );
  const dataFiles: Record<string, any> = {};
  Promise.allSettled(packsFilePromises).then((settledResults) => {
    settledResults.forEach((settledResult, i) => {
      if (settledResult.status === "fulfilled") {
        const raw = settledResult.value;
        const parts = raw
          .split("\n")
          .filter((part) => part)
          .map((part) => {
            let acc;
            try {
              acc = JSON.parse(part);
            } catch (error) {
              acc = part;
            }
            return acc;
          });
        dataFiles[dataFileNames[i]] = parts;
      }
    });
    fs.writeFile(
      `${__dirname}/data-combined.json`,
      `${JSON.stringify(dataFiles)}`,
      (err) => {
        if (err) {
          throw err;
        }
        console.log(
          `File is created successfully at ${__dirname}/data-combined.json`,
        );
      },
    );
  });
}
