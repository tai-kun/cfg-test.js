import { strict } from "assert"; // Don't import "node:assert";

export const assert = Object.assign(strict as Assert, {
  jsonEqual(
    actual: unknown,
    expected: Jsonifiable,
    message?: string | Error | undefined,
  ): void {
    strict.equal(
      JSON.stringify(actual),
      JSON.stringify(expected),
      message,
    );
  },
  notJsonEqual(
    actual: unknown,
    expected: unknown,
    message?: string | Error | undefined,
  ): void {
    strict.notEqual(
      JSON.stringify(actual),
      JSON.stringify(expected),
      message,
    );
  },
  deepJsonEqual(
    actual: unknown,
    expected: Jsonifiable,
    message?: string | Error | undefined,
  ): void {
    strict.deepEqual(
      JSON.parse(JSON.stringify(actual)),
      JSON.parse(JSON.stringify(expected)),
      message,
    );
  },
  notDeepJsonEqual(
    actual: unknown,
    expected: unknown,
    message?: string | Error | undefined,
  ): void {
    strict.notDeepEqual(
      JSON.parse(JSON.stringify(actual)),
      JSON.parse(JSON.stringify(expected)),
      message,
    );
  },
});

// Comments are synchronized with "node:assert".
export type Assert = Omit<typeof import("node:assert"), "ok"> & {
  /**
   * An alias of {@link ok}.
   * @since v0.5.9
   * @param value The input that is checked for being truthy.
   */
  (value: unknown, message?: string | Error | undefined): void;
  /**
   * Tests if `value` is truthy. It is equivalent to `assert.equal(!!value, true, message)`.
   *
   * If `value` is not truthy, an `AssertionError` is thrown with a `message` property set equal to the value of the `message` parameter. If the `message` parameter is `undefined`, a default
   * error message is assigned. If the `message` parameter is an instance of an `Error` then it will be thrown instead of the `AssertionError`.
   * If no arguments are passed in at all `message` will be set to the string:`` 'No value argument passed to `assert.ok()`' ``.
   *
   * Be aware that in the `repl` the error message will be different to the one
   * thrown in a file! See below for further details.
   *
   * ```js
   * import assert from 'node:assert/strict';
   *
   * assert.ok(true);
   * // OK
   * assert.ok(1);
   * // OK
   *
   * assert.ok();
   * // AssertionError: No value argument passed to `assert.ok()`
   *
   * assert.ok(false, 'it\'s false');
   * // AssertionError: it's false
   *
   * // In the repl:
   * assert.ok(typeof 123 === 'string');
   * // AssertionError: false == true
   *
   * // In a file (e.g. test.js):
   * assert.ok(typeof 123 === 'string');
   * // AssertionError: The expression evaluated to a falsy value:
   * //
   * //   assert.ok(typeof 123 === 'string')
   *
   * assert.ok(false);
   * // AssertionError: The expression evaluated to a falsy value:
   * //
   * //   assert.ok(false)
   *
   * assert.ok(0);
   * // AssertionError: The expression evaluated to a falsy value:
   * //
   * //   assert.ok(0)
   * ```
   *
   * ```js
   * import assert from 'node:assert/strict';
   *
   * // Using `assert()` works the same:
   * assert(0);
   * // AssertionError: The expression evaluated to a falsy value:
   * //
   * //   assert(0)
   * ```
   * @since v0.1.21
   */
  ok(value: unknown, message?: string | Error | undefined): void;
};

type JsonPrimitive = string | number | boolean | null;

type JsonifiableObject =
  | { readonly [_ in string]?: Jsonifiable }
  | { readonly toJSON: () => Jsonifiable };

type JsonifiableArray = readonly Jsonifiable[];

type Jsonifiable = JsonPrimitive | JsonifiableObject | JsonifiableArray;
