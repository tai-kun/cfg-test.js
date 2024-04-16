import { existsSync, readFileSync } from "node:fs"
import { createRequire, register as load } from "node:module"
import { resolve } from "node:path"
import { sep } from "node:path"
import process from "node:process"
import { pathToFileURL } from "node:url"
import type { Config } from "./config"
import { testEnv } from "./define"
import * as log from "./log"

const ARGV = ["/path/to/node", "/path/to/file"]
const fileIndex = ARGV.indexOf("/path/to/file")

const cwd = process.cwd()
const cwdUrl = pathToFileURL(cwd.endsWith(sep) ? sep : (cwd + sep /*not file*/))
const require = createRequire(cwdUrl)
const parentUrl = cwdUrl.toString()

export interface RegisterOptions {
  readonly auto?: boolean | undefined
  readonly argv?: readonly string[] | undefined
  readonly execArgv?: readonly string[] | undefined
}

export function register(options: RegisterOptions | undefined = {}): void {
  const argv = options.argv || process.argv

  if (!(fileIndex in argv)) {
    return
  }

  const auto = options.auto === true
  const file = resolve(argv[fileIndex]!)
  const execArgv = options.execArgv || process.execArgv
  const nodeOptions = `,${
    process.env["NODE_OPTIONS"]
      ? execArgv.concat(process.env["NODE_OPTIONS"].split(/\s/g))
      : execArgv
  },`
  // ... --import cfg-test ...
  const isEsmMode = /,--import,cfg-test[,/]/.test(nodeOptions)
  const isWatchMode = /,--watch,/.test(nodeOptions)
  const isDTsFile = file.endsWith(".d.ts")
  const isTypeScript = /\.[cm]?tsx?$/i.test(file)

  log.debug(() => [
    `auto mode -> ${auto}`,
    `esm mode -> ${isEsmMode}`,
    `watch mode -> ${isWatchMode}`,
    `typescript file -> ${isTypeScript}`,
    `declare file -> ${isDTsFile}`,
    `argv -> ${argv.map(a => JSON.stringify(a)).join(" ")}`,
    `execArgv -> ${execArgv.map(a => JSON.stringify(a)).join(" ")}`,
    `cwd -> ${JSON.stringify(cwd)}`,
    `parentUrl -> ${JSON.stringify(parentUrl)}`,
    `target file -> ${JSON.stringify(file)}`,
  ])

  if (
    isEsmMode
    // @ts-expect-error
    && __IS_ESM_MODE__ !== true
  ) {
    log.error(() => ["Cannot import `cfg-test` in CommonJS"])
    process.exit(1)
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
  }

  if (isEsmMode) {
    Object.assign(env, {
      CFG_TEST_URL: pathToFileURL(file),
    })
  }

  Object.assign(env, {
    CFG_TEST_WATCH: `${isWatchMode}`,
  })

  const originalEnv = { ...process.env }

  log.debug(() =>
    Object.entries(env)
      .filter(([k, v]) => [undefined, v].includes(originalEnv[k]))
      .map(([k, v]) => `Added env.${k}=${JSON.stringify(v)} by cfg-test.`)
  )
  log.warn(() =>
    Object.entries(env)
      .filter(([k, v]) => [undefined, v].every(v => v !== originalEnv[k]))
      .map(([k, v]) => `Updated env.${k}=${JSON.stringify(v)} by cfg-test.`)
  )

  Object.assign(process.env, env)

  // utils

  const cfgTest: CfgTest = new Proxy(require("node:test"), {
    get(target, p, receiver) {
      switch (p) {
        case "url":
          return process.env.CFG_TEST_URL

        case "file":
          return process.env.CFG_TEST_FILE

        case "watch":
          return process.env.CFG_TEST_WATCH === "true"

        case "assert":
          return require("node:assert/strict")

        default:
          return Reflect.get(target, p, receiver)
      }
    },
  })

  global.cfgTest = cfgTest

  // config

  let cfg: Config | undefined

  for (const id of process.env.CFG_TEST_CFG!.split(",")) {
    const cfgPath = id.endsWith(".json") ? id : `${id}.json`

    if (existsSync(cfgPath)) {
      cfg = JSON.parse(readFileSync(cfgPath, "utf8"))
      break
    }
  }

  if (cfg && cfg.env) {
    for (const [key, value] of Object.entries(cfg.env)) {
      if (typeof value !== "string") {
        continue
      }

      if (process.env[key] === undefined) {
        log.debug(() => [`Added env.${key} by config file.`])
      } else {
        log.warn(() => [`Updated env.${key} by config file.`])
      }

      process.env[key] = value
    }
  }

  if (cfg && cfg.globals) {
    for (const [key, value] of Object.entries(cfg.globals)) {
      if (key in global) {
        log.warn(() => [`Updated global.${key} by config file.`])
      } else {
        log.debug(() => [`Added global.${key} by config file.`])
        // @ts-expect-error
        global[key] = value
      }
    }
  }

  if (cfg && cfg.import) {
    if (!Array.isArray(cfg.import)) {
      cfg.import = [cfg.import]
    }

    for (const id of cfg.import) {
      log.debug(() => [`Imported module ${id} by config file.`])
      load(id, parentUrl)
    }
  }

  if (cfg && cfg.require) {
    if (!Array.isArray(cfg.require)) {
      cfg.require = [cfg.require]
    }

    for (const id of cfg.require) {
      log.debug(() => [`Required module ${id} by config file.`])
      require(id)
    }
  }

  // transpiler

  if (auto) {
    const isAvailable = (id: string): boolean => {
      const available = isInstalled(id)

      if (available) {
        log.debug(() => [`Transpiler ${id} is available.`])
      } else {
        log.warn(() => [`Transpiler ${id} is not available.`])
      }

      return available
    }

    if (isDTsFile) {
      if (isEsmMode) {
        load("cfg-test/dts-loader", parentUrl)
      } else {
        // CommonJS implementation of `cfg-test/dts-loader`
        require("node:module")._extensions[".ts"] = () => ""
      }

      log.debug(() => ["Registered `cfg-test/dts-loader`"])
    } else if (isAvailable("ts-node")) {
      if (isEsmMode) {
        load("ts-node/esm", parentUrl)

        log.debug(() => ["Registered `ts-node/esm` automatically."])
      } else {
        require("ts-node").register()

        log.debug(() => ["Registered `ts-node` automatically."])
      }
    } else if (isAvailable("@swc-node/register")) {
      if (isEsmMode) {
        load("@swc-node/register/esm", parentUrl)

        log.debug(() => ["Registered `@swc-node/register/esm` automatically."])
      } else {
        require("@swc-node/register/register").register({ sourceMap: true })

        log.debug(() => [
          "Registered `@swc-node/register/register` automatically.",
        ])
      }
    }
  }
}

function isInstalled(id: string): boolean {
  try {
    require.resolve(id)

    return true
  } catch {
    return false
  }
}
