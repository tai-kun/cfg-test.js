import type { LoadHook } from "node:module";

export const load: LoadHook = function dtsLoader(url, _, next) {
  if (url.endsWith(".d.ts")) {
    return {
      format: "module",
      source: "",
      shortCircuit: true,
    };
  }

  return next(url);
};
