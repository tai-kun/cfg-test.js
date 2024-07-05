import { esbuildPlugin } from "@web/dev-server-esbuild";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { sep } from "node:path";
import { pathToFileURL } from "node:url";

export function cfgTestPlugin(
  ...args: Parameters<typeof esbuildPlugin>
) {
  const cwd = process.cwd();
  const cwdUrl = pathToFileURL(
    cwd.endsWith(sep) ? sep : (cwd + sep /* convert to directory */),
  );
  const require = createRequire(cwdUrl);
  const webCfgTest = require.resolve("cfg-test/__wtr");
  const webCfgTestFile = readFileSync(webCfgTest, "utf8");
  const plugin = esbuildPlugin(...args);

  plugin.name = "cfg-test";
  // @ts-expect-error
  const transform: (...args: any) => Promise<string> = plugin.__transformCode;
  // @ts-expect-error
  plugin.__transformCode = async (...args: any) => `
    const cfgTest = (() => {
      ${webCfgTestFile}

      return createCfgTest({
        url: new URL(import.meta.url).origin + window.__WTR_CONFIG__.testFile,
        file: window.__WTR_CONFIG__.testFile,
        watch: window.__WTR_CONFIG__.watch,
      });
    })();

    ${await transform.apply(plugin, args)}
  `;

  return plugin;
}
