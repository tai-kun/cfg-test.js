import {
  type Context,
  type DevServerCoreConfig,
  getRequestFilePath,
  type Logger,
  type Plugin,
} from "@web/dev-server-core";
import { build, type BuildOptions } from "esbuild";
import { minimatch } from "minimatch";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { sep } from "node:path";
import { pathToFileURL } from "node:url";
import { testDefine } from "./core/define";

type ServerStartArgs = Parameters<NonNullable<Plugin["serverStart"]>>[0];

const cwd = process.cwd();
const cwdUrl = pathToFileURL(
  cwd.endsWith(sep) ? sep : (cwd + sep /* convert to directory */),
);
const require = createRequire(cwdUrl);
const webCfgTest = require.resolve("cfg-test/__wtr");
const webCfgTestFile = readFileSync(webCfgTest, "utf8");

const omitOptionKeys = [
  "absWorkingDir",
  "bundle",
  "entryPoints",
  "outbase",
  "outdir",
  "outfile",
  "stdin",
  "write",
] as const satisfies (keyof BuildOptions)[];

export interface CfgTestPluginOptions
  extends Omit<BuildOptions, (typeof omitOptionKeys)[number]>
{
  include: readonly string[];
  exclude?: readonly string[] | undefined;
}

class CfgTestPlugin implements Plugin {
  name = "cfg-test";

  #config: DevServerCoreConfig = undefined as any;
  #logger: Logger = undefined as any;
  #esbuildConfig: Omit<CfgTestPluginOptions, "include" | "exclude">;
  #include: readonly string[];
  #exclude: readonly string[];
  #isBundleTarget: (path: string) => boolean = undefined as any;

  constructor(options: CfgTestPluginOptions) {
    const {
      include,
      exclude = [],
      ...esbuildConfig
    } = options;
    omitOptionKeys.forEach(key => {
      delete esbuildConfig[key as never];
    });
    this.#esbuildConfig = {
      jsx: "transform",
      format: "esm",
      target: "esnext",
      packages: "bundle",
      platform: "browser",
      sourcemap: false,
      mainFields: ["browser", "module", "main"],
      treeShaking: true,
      ...(esbuildConfig.jsx === "automatic" ? { jsxDev: true } : {}),
      ...esbuildConfig,
      define: {
        ...testDefine,
        ...esbuildConfig.define,
      },
      loader: {
        ".js": "js",
        ".ts": "ts",
        ".jsx": "jsx",
        ".tsx": "tsx",
        ...esbuildConfig.loader,
      },
    };
    this.#include = [...include];
    this.#exclude = [...exclude];
  }

  serverStart(args: ServerStartArgs) {
    this.#config = args.config;
    this.#logger = args.logger;
    const iFilters = this.#include
      .map(i => minimatch.filter(path.posix.join(args.config.rootDir, i)));
    const eFilters = this.#exclude
      .map(e => minimatch.filter(path.posix.join(args.config.rootDir, e)));
    this.#isBundleTarget = p =>
      iFilters.some(i => i(p))
      && eFilters.every(e => !e(p));
  }

  resolveMimeType(c: Context): void | string {
    const loader = this.#esbuildConfig.loader![path.posix.extname(c.path)];

    if (!["tsx", "ts", "js", "jsx"].includes(loader!)) {
      return;
    }

    const file = getRequestFilePath(c, this.#config.rootDir);

    if (!this.#isBundleTarget(file)) {
      return;
    }

    return "js";
  }

  async transform(c: Context): Promise<void | string> {
    const loader = this.#esbuildConfig.loader![path.posix.extname(c.path)];

    if (!["tsx", "ts", "js", "jsx"].includes(loader!)) {
      return;
    }

    const file = getRequestFilePath(c, this.#config.rootDir);

    if (!this.#isBundleTarget(file)) {
      return;
    }

    const result = await build({
      ...this.#esbuildConfig,
      write: false,
      bundle: true,
      entryPoints: [file],
    });

    for (const w of result.warnings) {
      this.#logger.warn(w);
    }

    for (const e of result.errors) {
      this.#logger.error(e);
    }

    return `
      const cfgTest = (() => {
        ${webCfgTestFile}

        return createCfgTest({
          url: new URL(import.meta.url).origin + window.__WTR_CONFIG__.testFile,
          file: window.__WTR_CONFIG__.testFile,
          watch: window.__WTR_CONFIG__.watch,
        });
      })();

      ${
      // TODO(tai-kun): Importing other resources
      result.outputFiles[0]?.text}
    `;
  }
}

export function cfgTestPlugin(options: CfgTestPluginOptions) {
  return new CfgTestPlugin(options);
}
