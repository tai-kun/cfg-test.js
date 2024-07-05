import * as Node from "node:test";
import type {
  HookFn,
  HookFunction,
  HookOptions,
  SuiteFn,
  SuiteFunction,
  TestFn,
  TestFunction,
  TestOptions,
} from "./types";
import {
  createCounter,
  parseHookArgs,
  parseSuiteArgs,
  parseTestArgs,
} from "./utils";

export const beforeAll: HookFunction = function beforeAll(
  ...args:
    | [HookFn]
    | [HookOptions, HookFn]
) {
  const [hookFn, options] = parseHookArgs(args);

  if (options.skip) {
    // Do nothing
  } else {
    Node.before(hookFn, {
      timeout: options.timeout,
    });
  }
};

export const beforeEach: HookFunction = function beforeEach(
  ...args:
    | [HookFn]
    | [HookOptions, HookFn]
) {
  const [hookFn, options] = parseHookArgs(args);

  if (options.skip) {
    // Do nothing
  } else {
    Node.beforeEach(hookFn, {
      timeout: options.timeout,
    });
  }
};

export const afterAll: HookFunction = function afterAll(
  ...args:
    | [HookFn]
    | [HookOptions, HookFn]
) {
  const [hookFn, options] = parseHookArgs(args);

  if (options.skip) {
    // Do nothing
  } else {
    Node.after(hookFn, {
      timeout: options.timeout,
    });
  }
};

export const afterEach: HookFunction = function afterEach(
  ...args:
    | [HookFn]
    | [HookOptions, HookFn]
) {
  const [hookFn, options] = parseHookArgs(args);

  if (options.skip) {
    // Do nothing
  } else {
    Node.afterEach(hookFn, {
      timeout: options.timeout,
    });
  }
};

const counter = createCounter();

export const describe: SuiteFunction = Object.assign(
  function describe(
    ...args:
      | [string, SuiteFn]
      | [string, TestOptions, SuiteFn]
  ) {
    using count = counter();
    const [name, suiteFn, options] = parseSuiteArgs(args, {}, {
      timeout: count.current === 1
        ? 5_000
        : undefined,
    });

    if (options.skip) {
      Node.describe.skip(name, { timeout: options.timeout }, suiteFn);
    } else if (options.only) {
      Node.describe.only(name, { timeout: options.timeout }, suiteFn);
    } else {
      Node.describe(name, suiteFn);
    }
  },
  {
    skip(
      ...args:
        | [string, SuiteFn]
        | [string, TestOptions, SuiteFn]
    ) {
      const [name, suiteFn] = parseSuiteArgs(args, { skip: true });

      Node.describe.skip(name, suiteFn);
    },
    only(
      ...args:
        | [string, SuiteFn]
        | [string, TestOptions, SuiteFn]
    ) {
      using count = counter();
      const [name, suiteFn, options] = parseSuiteArgs(args, { only: true }, {
        timeout: count.current === 1
          ? 5_000
          : undefined,
      });

      Node.describe.only(name, { timeout: options.timeout }, suiteFn);
    },
  },
);

export const test: TestFunction = Object.assign(
  function test(
    ...args:
      | [string, TestFn]
      | [string, TestOptions, TestFn]
  ) {
    using count = counter();
    const [name, testFn, options] = parseTestArgs(args, {}, {
      timeout: count.current === 1
        ? 5_000
        : undefined,
    });

    if (options.skip) {
      Node.test.skip(name, { timeout: options.timeout }, testFn);
    } else if (options.only) {
      Node.test.only(name, { timeout: options.timeout }, testFn);
    } else {
      Node.test(name, testFn);
    }
  },
  {
    skip(
      ...args:
        | [string, TestFn]
        | [string, TestOptions, TestFn]
    ) {
      const [name, testFn] = parseTestArgs(args, { skip: true });

      Node.test.skip(name, testFn);
    },
    only(
      ...args:
        | [string, TestFn]
        | [string, TestOptions, TestFn]
    ) {
      using count = counter();
      const [name, testFn, options] = parseTestArgs(args, { only: true }, {
        timeout: count.current === 1
          ? 5_000
          : undefined,
      });

      Node.test.only(name, { timeout: options.timeout }, testFn);
    },
  },
);

export const after = afterAll;
export const before = beforeAll;
export const suite = describe;
export const it = test;
export { default as sinon } from "sinon";
