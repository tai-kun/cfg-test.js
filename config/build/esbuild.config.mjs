// @ts-check

import { replace } from "esbuild-plugin-replace";
import autoInsertExt from "./autoInsertExt.mjs";

/** @type {import("esbuild").BuildOptions} */
const common = {
  // General

  bundle: true,
  platform: "node",

  // Output contents

  lineLimit: 80,

  // Output location

  write: true,
  outdir: "dist",
  outbase: "src",

  // Transformation

  target: "es2020",

  // Source maps

  sourcemap: "linked",
};

/** @type {import("esbuild").BuildOptions[]} */
export default [
  {
    ...common,

    // Input

    entryPoints: [
      "src/**/*.ts",
      // "src/*.cts",
    ],

    // Output contents

    format: "cjs",

    // Output location

    outExtension: { ".js": ".cjs" },

    // Plugins

    plugins: [
      replace({
        "__IS_ESM_MODE__": "false",
      }),
      autoInsertExt("cjs"),
    ],
  },
  {
    ...common,

    // Input

    entryPoints: [
      "src/**/*.ts",
      "src/**/*.mts",
    ],

    // Output contents

    format: "esm",

    // Output location

    outExtension: { ".js": ".mjs" },

    // Plugins

    plugins: [
      replace({
        "__IS_ESM_MODE__": "true",
      }),
      autoInsertExt("esm"),
    ],
  },
];
