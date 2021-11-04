import { data } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/module.mjs";
import fs from "fs";

import {
  forEveryRawDatum,
  forEveryShallowFile,
  joinDatumKey,
  processIndexedDataIntoFiles,
} from "./helpers";

import type { Datum, DatumId, DatumKey, FileName } from "./types";

let packsFolderPath: FileName | undefined = undefined;
let dataFolderPath: FileName | undefined = undefined;

process.argv.forEach((val, index) => {
  if (index === 2) {
    console.log("Packs folders: ", val);
    packsFolderPath = val;
  }
  if (index === 3) {
    console.log("Data folders: ", val);
    dataFolderPath = val;
  }
});

const defaultFileData: Record<
  "pack" | "data",
  { datum: Datum | {}; id: DatumId; fileName: FileName }
> = {
  pack: { datum: {}, id: "", fileName: "" },
  data: { datum: {}, id: "", fileName: "" },
};
const dataKeyIndexedData: Record<DatumKey, typeof defaultFileData> = {};

const dataFileNames: FileName[] = [];
const dataFilePromises: Promise<any>[] = [];
if (dataFolderPath) {
  forEveryShallowFile(
    dataFolderPath,
    (filename) => {
      return filename.indexOf(".db") >= 0;
    },
    (filename) => {
      dataFileNames.push(filename);
      dataFilePromises.push(
        new Promise((resolve, reject) => {
          fs.readFile(filename as FileName, "utf8", (err, data) => {
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

  // Look through every data/*.db file and expose the content for every file
  Promise.allSettled(dataFilePromises).then((settledResults) => {
    settledResults.forEach((settledResult, i) => {
      if (settledResult.status === "fulfilled") {
        const raw = settledResult.value;
        forEveryRawDatum(raw, (datum) => {
          if (datum._id && datum.name && datum.type) {
            const datumKey = joinDatumKey({
              name: datum.name,
              type: datum.type,
            });
            if (dataKeyIndexedData[datumKey]) {
              console.warn(
                `Duplicate data found: "${datum.name}" of type ${datum.type}`,
              );
            } else {
              if (!datum._id) {
                console.log(
                  "datum Id is undefined for",
                  datum.name,
                  "and",
                  datum.type,
                );
              }
              dataKeyIndexedData[datumKey] = {
                ...defaultFileData,
                data: {
                  ...defaultFileData.data,
                  datum,
                  id: datum._id,
                  fileName: dataFileNames[i],
                },
              };
            }
          }
        });
      }
    });
  });
}
const packFileNames: FileName[] = [];
const packsFilePromises: Promise<any>[] = [];

if (packsFolderPath) {
  forEveryShallowFile(
    packsFolderPath,
    (filename) => {
      return filename.indexOf(".db") >= 0;
    },
    (filename) => {
      packFileNames.push(filename);
      packsFilePromises.push(
        new Promise((resolve, reject) => {
          fs.readFile(filename as FileName, "utf8", (err, data) => {
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

  const fileNameIndexedNewPackData: Record<FileName, Datum[]> = {};
  const changedIdLogCSV: string[] = [
    "New ID from data,Old pack ID,Data FileName,Pack Filename,Name,Type",
  ];

  // Look through every packs/*.db file and expose the content for every file
  Promise.allSettled(packsFilePromises).then((settledResults) => {
    settledResults.forEach((settledResult, i) => {
      if (settledResult.status === "fulfilled") {
        const raw = settledResult.value;
        fileNameIndexedNewPackData[packFileNames[i]] = [];
        forEveryRawDatum(raw, (datum) => {
          if (datum._id && datum.name && datum.type) {
            const dataKey = joinDatumKey({
              name: datum.name,
              type: datum.type,
            });
            const newDatum = { ...datum };
            if (dataKeyIndexedData[dataKey]) {
              dataKeyIndexedData[dataKey] = {
                ...dataKeyIndexedData[dataKey],
                pack: {
                  ...defaultFileData.pack,
                  datum,
                  id: datum._id,
                  fileName: packFileNames[i],
                },
              };

              // Checking ID of either datum of the same name
              if (
                dataKeyIndexedData[dataKey].pack.id !==
                dataKeyIndexedData[dataKey].data.id
              ) {
                if (dataKeyIndexedData[dataKey].data.id) {
                  console.log(
                    `Inconsistent ID for "${datum.name}" of "${datum.type}" in "${dataKeyIndexedData[dataKey].data.fileName}": ` +
                      `pack ID "${dataKeyIndexedData[dataKey].pack.id}" will be replaced with data ID "${dataKeyIndexedData[dataKey].data.id}".`,
                  );
                  changedIdLogCSV.push(
                    // "New ID from data,Old pack ID,Data FileName,Pack Filename,Name,Type",
                    [
                      dataKeyIndexedData[dataKey].data.id,
                      dataKeyIndexedData[dataKey].pack.id,
                      dataKeyIndexedData[dataKey].data.fileName,
                      dataKeyIndexedData[dataKey].pack.fileName,
                      datum.name,
                      datum.type,
                    ].join(","),
                  );
                  newDatum._id = dataKeyIndexedData[dataKey].data.id;
                } else {
                  console.log(
                    `Inconsistent ID for "${datum.name}" of "${datum.type}" in "${dataKeyIndexedData[dataKey].data.fileName}": missing data ID. Skipping...`,
                  );
                }
              }
            }
            fileNameIndexedNewPackData[packFileNames[i]].push(newDatum);
          }
        });
      }
    });
    const newPacksFolderName = "packs-new";
    processIndexedDataIntoFiles(
      {
        data: fileNameIndexedNewPackData,
        fileNames: packFileNames,
        newPacksFolderName,
      },
      () => {
        const changeLogLocation = `${__dirname}/${newPacksFolderName}`;

        if (!fs.existsSync(newPacksFolderName)) {
          fs.mkdirSync(newPacksFolderName, { recursive: true });
        }

        const changeLogFileName = "changelog.csv";
        fs.writeFile(
          `${changeLogLocation}/${changeLogFileName}`,
          `${changedIdLogCSV.join("\n")}`,
          (err) => {
            if (err) {
              throw err;
            }
            console.log(
              `IDs changed can be found in ${changeLogLocation}/${changeLogFileName}`,
            );
          },
        );
      },
    );
  });
}
