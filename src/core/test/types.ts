export interface HookOptions {
  /**
   * If truthy, the hook is skipped.
   *
   * @default false
   */
  skip?: boolean | undefined;
  /**
   * A number of milliseconds the hook will fail after.
   *
   * If this value is 0, timeouts will be disabled.
   *
   * @default 5_000
   */
  timeout?: number | undefined;
}

// Most comments will be synced with "node:test".
export interface TestOptions {
  /**
   * If truthy, and the test context is configured to run `only` tests,
   * then this test will be run.
   *
   * Otherwise, the test is skipped.
   *
   * @default false
   */
  only?: boolean | undefined;
  /**
   * If truthy, the test is skipped.
   *
   * If a string is provided, that string is displayed in the test results as
   * the reason for skipping the test.
   *
   * @default false
   */
  skip?: boolean | string | undefined;
  /**
   * A number of milliseconds the test will fail after.
   *
   * If unspecified, tests inherit this value from their parent.
   *
   * If this value is 0, timeouts will be disabled.
   *
   * @default 5_000
   */
  timeout?: number | undefined;
}

export interface HookFn {
  (): void | Promise<void>;
}

export interface SuiteFn {
  (): void;
}

export interface TestFn {
  (): void | Promise<void>;
}

export interface HookFunction {
  (fn: HookFn): void;
  (options: HookOptions, fn: HookFn): void;
}

export interface SuiteFunction {
  (name: string, fn: SuiteFn): unknown;
  (name: string, options: TestOptions, fn: SuiteFn): unknown;
  skip: {
    (name: string, fn?: SuiteFn): unknown;
    (name: string, options: TestOptions, fn?: SuiteFn): unknown;
  };
  only: {
    (name: string, fn: SuiteFn): unknown;
    (name: string, options: TestOptions, fn: SuiteFn): unknown;
  };
}

export interface TestFunction {
  (name: string, fn: TestFn): unknown;
  (name: string, options: TestOptions, fn: TestFn): unknown;
  skip: {
    (name: string, fn?: TestFn): unknown;
    (name: string, options: TestOptions, fn?: TestFn): unknown;
  };
  only: {
    (name: string, fn: TestFn): unknown;
    (name: string, options: TestOptions, fn: TestFn): unknown;
  };
}
