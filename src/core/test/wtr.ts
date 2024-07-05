import type * as Mocha from "mocha";
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

const Wtr = {
  before: globalThis.before as typeof Mocha.before,
  beforeEach: globalThis.beforeEach as typeof Mocha.beforeEach,
  after: globalThis.after as typeof Mocha.after,
  afterEach: globalThis.afterEach as typeof Mocha.afterEach,
  describe: globalThis.describe as typeof Mocha.describe,
  it: globalThis.it as typeof Mocha.it,
};

export const beforeAll: HookFunction = function beforeAll(
  ...args:
    | [HookFn]
    | [HookOptions, HookFn]
) {
  const [hookFn, options] = parseHookArgs(args);

  Wtr.before(function() {
    if (options.skip) {
      this.skip();
    }

    if (options.timeout === Infinity) {
      this.timeout(options.timeout);
    } else {
      this.timeout(0);
    }

    return hookFn();
  });
};

export const beforeEach: HookFunction = function beforeEach(
  ...args:
    | [HookFn]
    | [HookOptions, HookFn]
) {
  const [hookFn, options] = parseHookArgs(args);

  Wtr.beforeEach(function() {
    if (options.skip) {
      this.skip();
    }

    if (options.timeout === Infinity) {
      this.timeout(options.timeout);
    } else {
      this.timeout(0);
    }

    return hookFn();
  });
};

export const afterAll: HookFunction = function afterAll(
  ...args:
    | [HookFn]
    | [HookOptions, HookFn]
) {
  const [hookFn, options] = parseHookArgs(args);

  Wtr.after(function() {
    if (options.skip) {
      this.skip();
    }

    if (options.timeout === Infinity) {
      this.timeout(options.timeout);
    } else {
      this.timeout(0);
    }

    return hookFn();
  });
};

export const afterEach: HookFunction = function afterEach(
  ...args:
    | [HookFn]
    | [HookOptions, HookFn]
) {
  const [hookFn, options] = parseHookArgs(args);

  Wtr.afterEach(function() {
    if (options.skip) {
      this.skip();
    }

    if (options.timeout === Infinity) {
      this.timeout(options.timeout);
    } else {
      this.timeout(0);
    }

    return hookFn();
  });
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
      Wtr.describe.skip(name, suiteFn);
    } else if (options.only) {
      Wtr.describe.only(name, function() {
        if (options.timeout === Infinity) {
          this.timeout(options.timeout);
        } else {
          this.timeout(0);
        }

        suiteFn();
      });
    } else {
      Wtr.describe(name, function() {
        if (options.timeout === Infinity) {
          this.timeout(options.timeout);
        } else {
          this.timeout(0);
        }

        suiteFn();
      });
    }
  },
  {
    skip(
      ...args:
        | [string, SuiteFn]
        | [string, TestOptions, SuiteFn]
    ) {
      const [name, suiteFn] = parseSuiteArgs(args, { skip: true });

      Wtr.describe.skip(name, suiteFn);
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

      Wtr.describe.only(name, function() {
        if (options.timeout === Infinity) {
          this.timeout(options.timeout);
        } else {
          this.timeout(0);
        }

        suiteFn();
      });
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
      const title = typeof options.skip === "string"
        ? name + " # SKIP: " + options.skip
        : name;

      Wtr.it.skip(title, testFn);
    } else if (options.only) {
      Wtr.it.only(name, function() {
        if (options.timeout === Infinity) {
          this.timeout(options.timeout);
        } else {
          this.timeout(0);
        }

        return testFn();
      });
    } else {
      Wtr.it(name, function() {
        if (options.timeout === Infinity) {
          this.timeout(options.timeout);
        } else {
          this.timeout(0);
        }

        return testFn();
      });
    }
  },
  {
    skip(
      ...args:
        | [string, TestFn]
        | [string, TestOptions, TestFn]
    ) {
      const [name, testFn, options] = parseTestArgs(args, { skip: true });
      const title = typeof options.skip === "string"
        ? name + " # SKIP: " + options.skip
        : name;

      Wtr.it.skip(title, testFn);
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

      Wtr.it.only(name, function() {
        if (options.timeout === Infinity) {
          this.timeout(options.timeout);
        } else {
          this.timeout(0);
        }

        return testFn();
      });
    },
  },
);

export const after = afterAll;
export const before = beforeAll;
export const suite = describe;
export const it = test;
export { default as sinon } from "sinon";
