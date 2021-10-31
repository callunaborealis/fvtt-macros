import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: {
      "witcher/defense": "src/witcher/defense/index.ts",
    },
    output: {
      dir: "build",
      entryFileNames: "[name].js",
      format: "es",
      preserveModules: false, // Keep directory structure and files
      preserveModulesRoot: "src",
      sourcemap: false,
    },
    plugins: [resolve({ browser: true }), json(), typescript()],
  },
  {
    input: {
      "dnd/spell-replace": "src/dnd/spell-replace/index.ts",
    },
    output: {
      dir: "build",
      entryFileNames: "[name]/index.js",
      format: "cjs",
      preserveModules: false, // Keep directory structure and files
      preserveModulesRoot: "src",
      sourcemap: false,
    },
    plugins: [
      resolve({ browser: true }),
      json(),
      typescript(),
      copy({
        targets: [
          {
            src: ["src/dnd/spell-replace/**/*", "!**/*.ts"],
            dest: "build/dnd/spell-replace",
          },
        ],
      }),
    ],
  },
];
