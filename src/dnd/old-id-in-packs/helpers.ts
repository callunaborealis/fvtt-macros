import fs from "fs";
import path from "path";

const forEveryShallowFile = (
  targetPath: string,
  isFile: (filename: string) => boolean,
  callback: (filename: string) => void,
) => {
  if (!fs.existsSync(targetPath)) {
    console.log("no dir ", targetPath);
    return;
  }
  const files = fs.readdirSync(targetPath);
  files.forEach((file) => {
    const filename = path.join(targetPath, file);
    const stats = fs.lstatSync(filename);
    if (!stats.isDirectory()) {
      if (isFile(filename)) {
        callback(filename);
      }
    }
  });
};

export { forEveryShallowFile };
