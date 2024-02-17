// src/lib.ts

// the implementation
export function addOne(a: number): number {
  return a + 1
}

// in-source test suites
if (cfgTest!.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("addOne", () => {
    test("it works", () => {
      assert.equal(addOne(2), 3)
    })
  })
}
