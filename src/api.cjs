const { existsSync, readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { pathToFileURL } = require("node:url");
const { createRequire, register: imp } = require("node:module");
const { testEnv } = require("cfg-test/define");

const req = createRequire(pathToFileURL("./"));

const ARGV = ["/path/to/node", "/path/to/file"];
const fileIndex = ARGV.indexOf("/path/to/file");

/**
 * @param {object} [setup] 
 * @param {*} [setup.pkg]
 * @param {boolean} [setup.auto]
 * @param {string[]} [setup.argv]
 * @param {string[]} [setup.execArgv]
 * @param {(path: string) => string | URL} [setup.toFileURL]
 * @returns {void}
 */
exports.register = function register(setup = {}) {
  const argv = setup.argv || process.argv;

  if (fileIndex in argv) {
    const pkg = toPlainObject(
      typeof setup.pkg === "function"
        ? setup.pkg()
        : setup.pkg
    );
    const auto = setup.auto === true;
    const execArgv = setup.execArgv || process.execArgv;
    const toFileURL = setup.toFileURL || pathToFileURL;
    const optionList = `,${
      process.env.NODE_OPTIONS
        ? execArgv.concat(process.env.NODE_OPTIONS.split(/\s/g))
        : execArgv
    },`;

    // env

    Object.assign(process.env, testEnv);
    process.env.CFG_TEST_FILE = resolve(argv[fileIndex]);
    process.env.CFG_TEST_WATCH = String(watchMode(optionList));

    if (pkg.type === "module" || setup.toFileURL) {
      process.env.CFG_TEST_URL = String(toFileURL(process.env.CFG_TEST_FILE));
    }

    process.env.CFG_TEST_CFG = process.env.CFG_TEST_CFG || `${[
      "config/code/cfg-test",
      "config/cfg-test",
      "cfg-test",
    ]}`;

    // utils

    global.cfgTest = new Proxy(require("node:test"), {
      get(target, p, receiver) {
        switch (p) {
          case "url":
            return process.env.CFG_TEST_URL;

          case "file":
            return process.env.CFG_TEST_FILE;

          case "watch":
            return process.env.CFG_TEST_WATCH === "true";

          case "assert":
            return require("node:assert/strict");

          default:
            return Reflect.get(target, p, receiver);
        }
      }
    });

    // config

    const logs = [];
    const parentURL = toFileURL("./").toString();
    /** @type {import("./config").Config} */
    let cfg;

    for (const id of process.env.CFG_TEST_CFG.split(",")) {
      const file = id.endsWith(".json") ? id : `${id}.json`;

      if (existsSync(file)) {
        cfg = JSON.parse(readFileSync(file, "utf8"));
        break;
      }
    }

    if (cfg && cfg.env) {
      for (const [key, value] of Object.entries(cfg.env)) {
        if (typeof value === "string") {
          if (process.env[key] === undefined) {
            logs.push(`add-env: process.env[${JSON.stringify(key)}]`)
          } else {
            logs.push(`update-env: process.env[${JSON.stringify(key)}]`)
          }

          process.env[key] = value;
        }
      }
    }

    if (cfg && cfg.import) {
      if (!Array.isArray(cfg.import)) {
        cfg.import = [cfg.import];
      }

      cfg.import.forEach(id => {
        logs.push(`import: ${id}`);
        imp(id, parentURL);
      });
    }

    if (cfg && cfg.require) {
      if (!Array.isArray(cfg.require)) {
        cfg.require = [cfg.require];
      }

      cfg.require.forEach(id => {
        logs.push(`require: ${id}`);
        req(id);
      });
    }

    // transpiler

    if (auto) {
      const deps = []
        .concat(Object.keys(toPlainObject(pkg.dependencies)))
        .concat(Object.keys(toPlainObject(pkg.devDependencies)))
        .concat(Object.keys(toPlainObject(pkg.optionalDependencies)));
      const isAvailable = id => {
        const dependency = deps.includes(id);
        const installed = isInstalled(id);
        const available = dependency && installed;

        logs.push(`${id} availability: ${available}`);
        logs.push(`    dependency: ${dependency}`);
        logs.push(`    installed:  ${installed}`);

        return available;
      };

      if (isDTsFile(process.env.CFG_TEST_FILE)) {
        if (esmMode(optionList)) {
          imp("cfg-test/dts-loader", parentURL);

          logs.push("import cfg-test/dts-loader");
          logs.push(`    parentURL: ${parentURL}`);
        } else {
          // CommonJS implementation of `cfg-test/dts-loader`
          require("node:module")._extensions[".ts"] = () => ""

          logs.push("register .ts loader");
        }
      } else if (isAvailable("ts-node")) {
        if (esmMode(optionList)) {
          imp("ts-node/esm", parentURL);

          logs.push("import ts-node/esm");
          logs.push(`    parentURL: ${parentURL}`);
        } else {
          req("ts-node").register();

          logs.push("register ts-node");
        }
      } else if (isAvailable("@swc-node/register")) {
        if (esmMode(optionList)) {
          imp("@swc-node/register/esm", parentURL);

          logs.push("import @swc-node/register/esm");
          logs.push(`    parentURL: ${parentURL}`);
        } else {
          req("@swc-node/register/register").register({
            sourceMap: true,
          });

          logs.push("register @swc-node/register");
        }
      }
    }

    // logging

    process.once("exit", code => {
      const isTruey = v => ["1", "true"].includes(String(v).toLowerCase());

      if (
        code !== 0
        && (
          isTruey(process.env.ACT)
          || isTruey(process.env.DEBUG)
          || isTruey(process.env.TRACE)
          || isTruey(process.env.ACTIONS_STEP_DEBUG)
          || isTruey(process.env.ACTIONS_RUNNER_DEBUG)
        )
      ) {
        [
          `type: ${pkg.type || "commonjs"}`,
          `auto: ${auto}`,
          `argv: ${argv.join(" ")}`,
          `execArgv: ${execArgv.join(" ")}`,
          `env.NODE_ENV: ${process.env.NODE_ENV}`,
          `env.CFG_TEST: ${process.env.CFG_TEST}`,
          `env.CFG_TEST_URL: ${process.env.CFG_TEST_URL}`,
          `env.CFG_TEST_FILE: ${process.env.CFG_TEST_FILE}`,
          `env.CFG_TEST_WATCH: ${process.env.CFG_TEST_WATCH}`,
          `esm: ${esmMode(optionList)}`,
          `watch: ${watchMode(optionList)}`,
          `typescript: ${isTsFile(process.env.CFG_TEST_FILE)}`,
          `declare: ${isDTsFile(process.env.CFG_TEST_FILE)}`,
        ]
          .concat(logs)
          .forEach(log => console.log(`[cfg-test]`, log));
      }
    })
  }
};

/**
 * @param {*} o
 * @returns {boolean}
 */
function isPlainObject(o) {
  return (
    o !== null
    && typeof o === "object"
    && (o.constructor === Object || o.constructor === undefined)
  );
}

/**
 * @param {*} o
 * @returns {Record<string, *>}
 */
function toPlainObject(o) {
  return isPlainObject(o) ? o : {};
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isInstalled(id) {
  try {
    req.resolve(id);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * @param {string} file 
 * @returns {boolean}
 */
function isTsFile(file) {
  return /\.[cm]?tsx?$/i.test(file);
}

/**
 * @param {string} file 
 * @returns {boolean}
 */
function isDTsFile(file) {
  return file.endsWith(".d.ts");
}

/**
 * @param {string} option
 * @returns {boolean}
 */
function esmMode(option) {
  return /,--import[,=]cfg-test[,/]/.test(option);
}

/**
 * @param {string} option
 * @returns {boolean}
 */
function watchMode(option) {
  return /,--watch,/.test(option);
}
