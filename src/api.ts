import { existsSync, readFileSync } from "node:fs"
import { createRequire, register as load } from "node:module"
import { resolve } from "node:path"
import { sep } from "node:path"
import process from "node:process"
import { pathToFileURL } from "node:url"
import type { Config } from "./config"
import { testEnv } from "./define"

const ARGV = ["/path/to/node", "/path/to/file"]
const fileIndex = ARGV.indexOf("/path/to/file")

const cwd = process.cwd()
const cwdUrl = pathToFileURL(cwd.endsWith(sep) ? sep : (cwd + sep /*not file*/))
const require = createRequire(cwdUrl)
const parentUrl = cwdUrl.toString()

export interface RegisterOptions {
  readonly pkg?: unknown
  readonly auto?: boolean | undefined
  readonly argv?: readonly string[] | undefined
  readonly execArgv?: readonly string[] | undefined
}

export function register(options: RegisterOptions | undefined = {}): void {
  const argv = options.argv || process.argv

  if (!(fileIndex in argv)) {
    return
  }

  const pkg = toPlainObject(
    typeof options.pkg === "function"
      ? options.pkg()
      : options.pkg,
  )
  const auto = options.auto === true
  const file = resolve(argv[fileIndex]!)
  const execArgv = options.execArgv || process.execArgv
  const nodeOptions = `,${
    process.env["NODE_OPTIONS"]
      ? execArgv.concat(process.env["NODE_OPTIONS"].split(/\s/g))
      : execArgv
  },`
  // ... --import cfg-test ...
  // ... --import=cfg-test ...
  const isEsmMode = /,--import[,=]cfg-test[,/]/.test(nodeOptions)
  const isWatchMode = /,--watch,/.test(nodeOptions)

  if (
    isEsmMode
    // @ts-expect-error
    && __IS_ESM_MODE__ !== true
  ) {
    throw new Error("Cannot import `cfg-test` in CommonJS")
  }

  // env

  Object.assign(process.env, {
    ...testEnv,
    CFG_TEST_CFG: process.env.CFG_TEST_CFG ?? `${[
      ".config/cfg-test",
      ".config/cfg-test/config",
      "config/cfg-test",
      "config/cfg-test/config",
      "cfg-test",
    ]}`,
    CFG_TEST_FILE: file,
  })

  if (isEsmMode) {
    Object.assign(process.env, {
      CFG_TEST_URL: pathToFileURL(file),
    })
  }

  Object.assign(process.env, {
    CFG_TEST_WATCH: `${isWatchMode}`,
  })

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

  const logs: any[] = []
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
        logs.push(`add-env: process.env[${JSON.stringify(key)}]`)
      } else {
        logs.push(`update-env: process.env[${JSON.stringify(key)}]`)
      }

      process.env[key] = value
    }
  }

  if (cfg && cfg.globals) {
    for (const [key, value] of Object.entries(cfg.globals)) {
      if (key in global) {
        logs.push(`ignore-global: ${key}`)
      } else {
        logs.push(`add-global: ${key}`)
        // @ts-expect-error
        global[key] = value
      }
    }
  }

  if (cfg && cfg.import) {
    if (!Array.isArray(cfg.import)) {
      cfg.import = [cfg.import]
    }

    cfg.import.forEach(id => {
      logs.push(`import: ${id}`)
      load(id, parentUrl)
    })
  }

  if (cfg && cfg.require) {
    if (!Array.isArray(cfg.require)) {
      cfg.require = [cfg.require]
    }

    cfg.require.forEach(id => {
      logs.push(`require: ${id}`)
      require(id)
    })
  }

  // transpiler

  const isDTsFile = file.endsWith(".d.ts")

  if (auto) {
    const deps = new Set([
      ...Object.keys(toPlainObject(pkg["dependencies"])),
      ...Object.keys(toPlainObject(pkg["devDependencies"])),
      ...Object.keys(toPlainObject(pkg["optionalDependencies"])),
    ])
    const isAvailable = (id: string): boolean => {
      const dependency = deps.has(id)
      const installed = isInstalled(id)
      const available = dependency && installed

      logs.push(`${id} availability: ${available}`)
      logs.push(`    dependency: ${dependency}`)
      logs.push(`    installed:  ${installed}`)

      return available
    }

    if (isDTsFile) {
      if (isEsmMode) {
        load("cfg-test/dts-loader", parentUrl)

        logs.push("import cfg-test/dts-loader")
        logs.push(`    parentUrl: ${parentUrl}`)
      } else {
        // CommonJS implementation of `cfg-test/dts-loader`
        require("node:module")._extensions[".ts"] = () => ""

        logs.push("register .ts loader")
      }
    } else if (isAvailable("ts-node")) {
      if (isEsmMode) {
        load("ts-node/esm", parentUrl)

        logs.push("import ts-node/esm")
        logs.push(`    parentUrl: ${parentUrl}`)
      } else {
        require("ts-node").register()

        logs.push("register ts-node")
      }
    } else if (isAvailable("@swc-node/register")) {
      if (isEsmMode) {
        load("@swc-node/register/esm", parentUrl)

        logs.push("import @swc-node/register/esm")
        logs.push(`    parentUrl: ${parentUrl}`)
      } else {
        require("@swc-node/register/register").register({
          sourceMap: true,
        })

        logs.push("register @swc-node/register")
      }
    }
  }

  // log

  let showLog = (): void => {
    showLog = () => {}
    const isTruey = (v: any) => ["1", "true"].includes(String(v).toLowerCase())

    if (
      isTruey(process.env["ACT"])
      || isTruey(process.env["DEBUG"])
      || isTruey(process.env["TRACE"])
      || isTruey(process.env["ACTIONS_STEP_DEBUG"])
      || isTruey(process.env["ACTIONS_RUNNER_DEBUG"])
    ) {
      ;[
        `type: ${pkg["type"] || "commonjs"}`,
        `auto: ${auto}`,
        `argv: ${argv.join(" ")}`,
        `execArgv: ${execArgv.join(" ")}`,
        `env.NODE_ENV: ${process.env["NODE_ENV"]}`,
        `env.CFG_TEST: ${process.env.CFG_TEST}`,
        `env.CFG_TEST_URL: ${process.env.CFG_TEST_URL}`,
        `env.CFG_TEST_FILE: ${process.env.CFG_TEST_FILE}`,
        `env.CFG_TEST_WATCH: ${process.env.CFG_TEST_WATCH}`,
        `esm: ${isEsmMode}`,
        `watch: ${isWatchMode}`,
        `typescript: ${/\.[cm]?tsx?$/i.test(file)}`,
        `declare: ${isDTsFile}`,
        ...logs,
      ].forEach(log => console.log(`[cfg-test]`, log))
    }
  }

  process.once("exit", code => code && showLog())
  process.once("uncaughtException", () => showLog())
  process.once("unhandledRejection", () => showLog())
}

function isPlainObject(o: unknown): o is Record<string, any> {
  return (
    o !== null
    && typeof o === "object"
    && (o.constructor === Object || o.constructor === undefined)
  )
}

function toPlainObject(o: unknown): Record<string, any> {
  return isPlainObject(o) ? o : {}
}

function isInstalled(id: string): boolean {
  try {
    require.resolve(id)

    return true
  } catch {
    return false
  }
}
