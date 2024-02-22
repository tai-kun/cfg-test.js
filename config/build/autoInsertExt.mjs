import fs from "node:fs"
import { join } from "node:path"

/** @param {string} path */
function isLocalFile(path) {
  return path.startsWith(".")
}

/** @type {Record<string, boolean>} */
const accessCache = {}

/** @param {string} file */
function readOk(file) {
  if (file in accessCache) {
    return accessCache[file]
  }

  try {
    fs.accessSync(file, fs.constants.R_OK)

    return accessCache[file] = true
  } catch {
    return accessCache[file] = false
  }
}

/**
 * @param {string} dir
 * @param {string} file
 * @param {"cjs" | "esm"} fmt
 */
function getBuiltPath(dir, file, fmt) {
  if (file.endsWith(".cjs") || file.endsWith(".mjs")) {
    return file
  }

  dir = join(dir, file)

  for (
    const [src, dst] of Object.entries({
      ".ts": fmt === "cjs"
        ? ".cjs"
        : ".mjs",
      ".cts": ".cjs",
      ".mts": ".mjs",
    })
  ) {
    if (readOk(dir + src)) {
      return file + dst
    }
  }

  return null
}

/**
 * @param {"cjs" | "esm"} fmt
 * @returns {import("esbuild").Plugin}
 */
export default function autoInsertExt(fmt) {
  return {
    name: "auto-insert-extension",
    setup(build) {
      build.onResolve({ filter: /.*/ }, args => {
        if (args.namespace !== "file" || args.kind !== "import-statement") {
          return null
        }

        if (
          args.resolveDir.includes("node_modules")
          || !isLocalFile(args.path)
        ) {
          return {
            external: true,
          }
        }

        const builtPath = getBuiltPath(args.resolveDir, args.path, fmt)

        if (builtPath) {
          return {
            path: builtPath,
            external: true,
          }
        }

        return {
          errors: [
            {
              text: `File not found: ${args.path}`,
            },
          ],
        }
      })
    },
  }
}
