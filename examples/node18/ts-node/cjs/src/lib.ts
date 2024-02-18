/*                                  example                                   */

export function addOne(a: number): number {
  return a + 1
}

if (cfgTest && cfgTest.file === __filename) {
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
  assert.equal(process.env.CFG_TEST_URL, undefined)
  assert.equal(process.env.CFG_TEST_FILE, __filename)
  assert.equal(process.env.CFG_TEST_WATCH, "false")

  assert.equal(process.env.ENV_FROM_CONFIG_FILE, "OK")
  assert.equal(__PLACEHOLDER_FOR_TEST__, "OK")
})
