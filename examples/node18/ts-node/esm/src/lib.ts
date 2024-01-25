import { fileURLToPath } from "node:url"

/*                                  example                                   */

export function addOne(a: number): number {
  return a + 1
}

if (
  process.env.NODE_ENV === "test"
  && process.env.CFG_TEST_URL === import.meta.url
) {
  const { assert, describe, test } = cfgTest

  describe("addOne", () => {
    test("it works", () => {
      assert.equal(addOne(2), 3)
    })
  })
}

/*                                  cfg-test                                  */

const { assert, test } = cfgTest

test("cfg-test", () => {
  assert.equal(process.env.NODE_ENV, "test")
  assert.equal(process.env.CFG_TEST, "true")
  assert.equal(process.env.CFG_TEST_URL, import.meta.url)
  assert.equal(process.env.CFG_TEST_FILE, fileURLToPath(import.meta.url))
  assert.equal(process.env.CFG_TEST_WATCH, "false")
})
