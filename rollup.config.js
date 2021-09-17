import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
// import autoprefixer from "autoprefixer";
// import postcss from "rollup-plugin-postcss-modules";
import typescript from "@rollup/plugin-typescript";

export default {
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
  plugins: [
    resolve({ browser: true }),
    // postcss({
    //   extract: true,
    //   modules: {
    //     generateScopedName: "mm3e__[folder]__[name]__[local]--[hash:base64:5]",
    //   },
    //   minimize: true,
    //   plugins: [autoprefixer()],
    //   writeDefinitions: false, // Writing automatic definitions will freeze up the rollup build
    // }),
    json(),
    typescript(),
  ],
};
