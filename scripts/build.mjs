// @ts-check

import { build } from "esbuild";
import { polyfillNode } from "esbuild-plugin-polyfill-node";
import options from "../config/build/esbuild.config.mjs";

await Promise.all(options.map(opts => build(opts)));
await Promise.all(
  [
    "src/core/__wtr.ts",
  ].flatMap(entrypoint =>
    ["cjs", "esm"].map(async format => {
      await build({
        // General

        bundle: true,
        platform: "browser",

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

        // Input

        entryPoints: [
          entrypoint,
        ],

        // Output contents

        format: format === "esm" ? "esm" : "cjs",

        // Output location

        outExtension: { ".js": format === "esm" ? ".mjs" : ".cjs" },

        // Plugins

        plugins: [
          polyfillNode({
            globals: {
              buffer: true,
              global: true,
              process: true,
              navigator: true,
              // The following may be injected by the bundler:
              __dirname: false,
              __filename: false,
            },
            polyfills: {
              // Use the assert package instead of the polyfill,
              // as the polyfill is missing some functionality.
              assert: false,
              "assert/strict": false,
            },
          }),
        ],
      });
    })
  ),
);
