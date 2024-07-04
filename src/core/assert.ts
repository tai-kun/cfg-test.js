import assert from "assert";

export default Object.assign(assert.strict, {
  jsonEqual<T extends Jsonifiable = Jsonifiable>(
    actual: unknown,
    expected: Jsonifiable,
    message?: string | Error | undefined,
  ): asserts actual is T {
    assert.strictEqual(
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
    assert.notStrictEqual(
      JSON.stringify(actual),
      JSON.stringify(expected),
      message,
    );
  },
  deepJsonEqual<T extends Jsonifiable = Jsonifiable>(
    actual: unknown,
    expected: Jsonifiable,
    message?: string | Error | undefined,
  ): asserts actual is T {
    assert.deepStrictEqual(
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
    assert.notDeepStrictEqual(
      JSON.parse(JSON.stringify(actual)),
      JSON.parse(JSON.stringify(expected)),
      message,
    );
  },
});

export type JsonPrimitive = string | number | boolean | null;

export type JsonifiableObject =
  | { readonly [_ in string]?: Jsonifiable }
  | { readonly toJSON: () => Jsonifiable };

export type JsonifiableArray = readonly Jsonifiable[];

export type Jsonifiable = JsonPrimitive | JsonifiableObject | JsonifiableArray;
