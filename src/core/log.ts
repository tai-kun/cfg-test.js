import process from "node:process";
import { formatWithOptions } from "node:util";

// Constants

const isColorSupported = !("NO_COLOR" in process.env) && (
  "FORCE_COLOR" in process.env
  || process.platform === "win32"
  || process.stdout.isTTY
);

const isDebugMode = "CFG_TEST_DEBUG" in process.env
  || "ACT" in process.env
  || "DEBUG" in process.env
  || "TRACE" in process.env;

// Colors

type Fmt = (s: string) => string;

const dim: Fmt = !isColorSupported
  ? String
  : s => `\x1b[2m${s}\x1b[22m`;
const red: Fmt = !isColorSupported
  ? String
  : s => `\x1b[31m${s}\x1b[39m`;
const yellow: Fmt = !isColorSupported
  ? String
  : s => `\x1b[33m${s}\x1b[39m`;

// Utilities

const time = (): string => (new Date()).toLocaleTimeString();

const toStr = (msg: unknown): string =>
  typeof msg === "object" && msg !== null
    ? formatWithOptions({ colors: isColorSupported }, "%O", msg)
    : String(msg);

// Logger

function log(
  o: NodeJS.WriteStream,
  lv: string,
  msg: () => readonly unknown[],
): void {
  for (const m of msg()) {
    o.write(`${dim(time())} ${lv} ${dim("[cfg-test]")} ${toStr(m)}\n`, "utf8");
  }
}

export function debug(msg: () => readonly unknown[]): void {
  if (isDebugMode) {
    log(process.stdout, "DEBUG", msg);
  }
}

export function error(msg: () => readonly unknown[]): void {
  log(process.stderr, red("ERROR"), msg);
}

export function warn(msg: () => readonly unknown[]): void {
  log(process.stdout, yellow("WARN") + " ", msg);
}
