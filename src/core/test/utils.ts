import type {
  HookFn,
  HookOptions,
  SuiteFn,
  TestFn,
  TestOptions,
} from "./types";

export function parseHookArgs(
  args:
    | [HookFn]
    | [HookOptions, HookFn],
) {
  let [
    {
      skip = false,
      timeout = 5_000,
    },
    fn,
  ] = args.length === 1 ? [{}, args[0]] : args;

  if (Number.isFinite(timeout) && timeout > 0) {
    timeout = Math.floor(timeout + 1);
  } else {
    timeout = Infinity;
  }

  function hookFn() {
    return fn.call(null);
  }

  return [
    hookFn,
    {
      skip: !!skip,
      timeout,
    },
  ] satisfies [any, any];
}

export function parseSuiteArgs(
  args:
    | [string, SuiteFn]
    | [string, TestOptions, SuiteFn],
  override: TestOptions = {},
  defaults: TestOptions = {},
) {
  let [
    name,
    {
      skip = defaults.skip ?? false,
      only = defaults.only ?? false,
      timeout = defaults.timeout,
    },
    fn,
  ] = args.length === 2 ? [args[0], {}, args[1]] : args;
  skip = override.skip ?? !!skip;
  only = override.only ?? !!only;
  timeout = override.timeout ?? timeout;

  if (skip && only) {
    throw new Error(`The "skip" and "only" options cannot both be enabled.`);
  }

  if (typeof timeout === "number") {
    if (Number.isFinite(timeout) && timeout > 0) {
      timeout = Math.floor(timeout + 1);
    } else {
      timeout = Infinity;
    }
  }

  function suiteFn() {
    fn.call(null);
  }

  return [
    name,
    suiteFn,
    {
      skip,
      only,
      timeout,
    },
  ] satisfies [any, any, any];
}

export function parseTestArgs(
  args:
    | [string, TestFn]
    | [string, TestOptions, TestFn],
  override: TestOptions = {},
  defaults: TestOptions = {},
) {
  let [
    name,
    {
      skip = defaults.skip ?? false,
      only = defaults.only ?? false,
      timeout = defaults.timeout,
    },
    fn,
  ] = args.length === 2 ? [args[0], {}, args[1]] : args;
  skip = override.skip ?? !!skip;
  only = override.only ?? !!only;
  timeout = override.timeout ?? timeout;

  if (skip && only) {
    throw new Error(`The "skip" and "only" options cannot both be enabled.`);
  }

  if (typeof timeout === "number") {
    if (Number.isFinite(timeout) && timeout > 0) {
      timeout = Math.floor(timeout + 1);
    } else {
      timeout = Infinity;
    }
  }

  function testFn() {
    return fn.call(null);
  }

  return [
    name,
    testFn,
    {
      skip,
      only,
      timeout,
    },
  ] satisfies [any, any, any];
}

export function createCounter() {
  const Symbol_dispose = Symbol.dispose || Symbol.for("Symbol.dispose");
  let count = 0;

  return () => ({
    current: count++,
    [Symbol_dispose as typeof Symbol.dispose]: () => {
      count--;
    },
  });
}
