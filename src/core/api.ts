import { existsSync, readFileSync } from "node:fs";
import { createRequire, register as load } from "node:module";
import { resolve } from "node:path";
import { sep } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { assert } from "./assert";
import type { Config } from "./config";
import { testEnv } from "./define";
import * as log from "./log";

const ARGV = ["/path/to/node", "/path/to/file"];
const fileIndex = ARGV.indexOf("/path/to/file");

const cwd = process.cwd();
const cwdUrl = pathToFileURL(
  cwd.endsWith(sep) ? sep : (cwd + sep /*not file*/),
);
const require = createRequire(cwdUrl);
const parentUrl = cwdUrl.toString();

export interface RegisterOptions {
  readonly argv?: readonly string[] | undefined;
  readonly execArgv?: readonly string[] | undefined;
}

export function register(options: RegisterOptions | undefined = {}) {
  const argv = options.argv || process.argv;

  if (!(fileIndex in argv)) {
    return;
  }

  const file = resolve(argv[fileIndex]!);
  const execArgv = options.execArgv || process.execArgv;
  const nodeOptions = `,${
    process.env["NODE_OPTIONS"]
      ? execArgv.concat(process.env["NODE_OPTIONS"].split(/\s/g))
      : execArgv
  },`;
  // ... --import cfg-test ...
  const isEsmMode = /,--import,cfg-test[,/]/.test(nodeOptions);
  const isWatchMode = /,--watch,/.test(nodeOptions);
  const isDTsFile = file.endsWith(".d.ts");
  const isTypeScript = /\.[cm]?tsx?$/i.test(file);

  log.debug(() => [
    `esm mode -> ${isEsmMode}`,
    `watch mode -> ${isWatchMode}`,
    `typescript file -> ${isTypeScript}`,
    `declare file -> ${isDTsFile}`,
    `argv -> ${argv.map(a => JSON.stringify(a)).join(" ")}`,
    `execArgv -> ${execArgv.map(a => JSON.stringify(a)).join(" ")}`,
    `cwd -> ${JSON.stringify(cwd)}`,
    `parentUrl -> ${JSON.stringify(parentUrl)}`,
    `target file -> ${JSON.stringify(file)}`,
  ]);

  if (
    isEsmMode
    // @ts-expect-error
    && __IS_ESM_MODE__ !== true
  ) {
    log.error(() => ["Cannot import `cfg-test` in CommonJS"]);
    process.exit(1);
  }

  // env

  const env = {
    ...testEnv,
    CFG_TEST_CFG: process.env.CFG_TEST_CFG ?? `${[
      ".config/cfg-test",
      ".config/cfg-test/config",
      "config/cfg-test",
      "config/cfg-test/config",
      "cfg-test",
    ]}`,
    CFG_TEST_FILE: file,
  };

  if (isEsmMode) {
    Object.assign(env, {
      CFG_TEST_URL: pathToFileURL(file),
    });
  }

  Object.assign(env, {
    CFG_TEST_WATCH: `${isWatchMode}`,
  });

  const originalEnv = { ...process.env };

  log.debug(() =>
    Object.entries(env)
      .filter(([k, v]) => [undefined, v].includes(originalEnv[k]))
      .map(([k, v]) => `Added env.${k}=${JSON.stringify(v)} by cfg-test.`)
  );
  log.warn(() =>
    Object.entries(env)
      .filter(([k, v]) => [undefined, v].every(v => v !== originalEnv[k]))
      .map(([k, v]) => `Updated env.${k}=${JSON.stringify(v)} by cfg-test.`)
  );

  Object.assign(process.env, env);

  // utils

  const cfgTest: CfgTest = new Proxy(require("node:test"), {
    get(target, p, receiver) {
      switch (p) {
        case "url":
          return process.env.CFG_TEST_URL;

        case "file":
          return process.env.CFG_TEST_FILE;

        case "watch":
          return process.env.CFG_TEST_WATCH === "true";

        case "assert":
          return assert;

        default:
          return Reflect.get(target, p, receiver);
      }
    },
  });

  global.cfgTest = cfgTest;

  // config

  let cfg: Config | undefined;

  for (const id of process.env.CFG_TEST_CFG!.split(",")) {
    const cfgPath = id.endsWith(".json") ? id : `${id}.json`;

    if (existsSync(cfgPath)) {
      cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
      break;
    }
  }

  if (cfg && cfg.env) {
    for (const [key, value] of Object.entries(cfg.env)) {
      if (typeof value !== "string") {
        continue;
      }

      if (process.env[key] === undefined) {
        log.debug(() => [`Added env.${key} by config file.`]);
      } else {
        log.warn(() => [`Updated env.${key} by config file.`]);
      }

      process.env[key] = value;
    }
  }

  if (cfg && cfg.globals) {
    for (const [key, value] of Object.entries(cfg.globals)) {
      if (key in global) {
        log.warn(() => [`Updated global.${key} by config file.`]);
      } else {
        log.debug(() => [`Added global.${key} by config file.`]);
        // @ts-expect-error
        global[key] = value;
      }
    }
  }

  if (cfg && cfg.import) {
    if (!Array.isArray(cfg.import)) {
      cfg.import = [cfg.import];
    }

    for (const id of cfg.import) {
      log.debug(() => [`Imported module ${id} by config file.`]);
      load(id, parentUrl);
    }
  }

  if (cfg && cfg.require) {
    if (!Array.isArray(cfg.require)) {
      cfg.require = [cfg.require];
    }

    for (const id of cfg.require) {
      log.debug(() => [`Required module ${id} by config file.`]);
      require(id);
    }
  }

  const ctx = {
    log,
    argv,
    file,
    execArgv,
    isEsmMode,
    parentUrl,
    isWatchMode,
    isTypeScript,
    import(id: string): void {
      try {
        log.debug(() => [`Register ESM module ${id}.`]);
        load(id, parentUrl);
        log.debug(() => [`Registered ESM module ${id}.`]);
      } catch (e) {
        log.error(() => [`Cannot register ESM module ${id}.`]);
        throw e;
      }
    },
    require(id: string, onLoad: (mod: any) => void): void {
      try {
        log.debug(() => [`Register CJS module ${id}`]);
        const mod = require(id);
        log.debug(() => [`Loaded CJS module ${id}`]);
        onLoad(mod);
        log.debug(() => [`Registered CJS module ${id}`]);
      } catch (e) {
        log.error(() => [`Cannot register CJS module ${id}.`]);
        throw e;
      }
    },
  };

  if (isDTsFile) {
    if (ctx.isEsmMode) {
      ctx.import("cfg-test/dts-loader");
    } else {
      try {
        // CommonJS implementation of `cfg-test/dts-loader`
        require("node:module")._extensions[".ts"] = () => "";
        ctx.log.debug(() => ["Registered CJS module cfg-test/dts-loader."]);
      } catch {
        // The TypeScript loader is already handled by something.
        ctx.log.warn(() => ["Cannot register CJS module cfg-test/dts-loader."]);
      }
    }

    return;
  }

  return ctx;
}
