import fs from "node:fs/promises"
import { fileURLToPath } from "node:url"

export async function load(url, _, next) {
  if (url.endsWith("lib.js")) {
    return {
      format: "module",
      source: (await fs.readFile(fileURLToPath(url), "utf8"))
        .replace("__PLACEHOLDER_FOR_TEST__", JSON.stringify("OK")),
      shortCircuit: true,
    }
  }

  if (url.endsWith("lib.ts")) {
    return {
      format: "ts",
      source: (await fs.readFile(fileURLToPath(url), "utf8"))
        .replace("__PLACEHOLDER_FOR_TEST__", JSON.stringify("OK")),
    }
  }

  return next(url)
}
