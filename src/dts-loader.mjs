/** @type {import("node:module").LoadHook} */
export const load = function dtsLoader(url, _, next) {
  if (url.endsWith(".d.ts")) {
    return {
      format: "module",
      source: "",
      shortCircuit: true,
    };
  }

  return next(url);
};
