const { resolve } = require("node:path");
const { pathToFileURL } = require("node:url");
const { createRequire, register: imp } = require("node:module");

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

    process.env.NODE_ENV = "test";
    process.env.CFG_TEST = "true";
    process.env.CFG_TEST_FILE = resolve(argv[fileIndex]);
    process.env.CFG_TEST_WATCH = String(/,--watch,/.test(optionList));

    if (pkg.type === "module" || setup.toFileURL) {
      process.env.CFG_TEST_URL = String(toFileURL(process.env.CFG_TEST_FILE));
    }

    // utils

    global.cfgTest = new Proxy(require("node:test"), {
      get(target, p, receiver) {
        return p === "assert"
          ? require("node:assert/strict")
          : Reflect.get(target, p, receiver);
      }
    });

    // transpiler

    const logs = [];

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

      if (isAvailable("ts-node")) {
        if (/,--import[,=]cfg-test[,/]/.test(optionList)) {
          const parentURL = toFileURL("./").href;
          imp("ts-node/esm", parentURL);

          logs.push("import ts-node/esm");
          logs.push(`    parentURL: ${parentURL}`);
        } else {
          req("ts-node").register();

          logs.push("register ts-node");
        }
      } else if (isAvailable("@swc-node/register")) {
        if (/,--import[,=]cfg-test[,/]/.test(optionList)) {
          const parentURL = toFileURL("./").href;
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
          `typescript: ${isTsFile(process.env.CFG_TEST_FILE)}`,
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
