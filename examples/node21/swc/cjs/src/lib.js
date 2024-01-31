// @ts-check

/*                                  example                                   */

/**
 * @param {number} a
 * @returns {number}
 */
const addOne = exports.addOne = function addOne(a) {
  return a + 1
}

if (
  process.env.NODE_ENV === "test"
  && process.env.CFG_TEST_FILE === __filename
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
  assert.equal(process.env.CFG_TEST_URL, undefined)
  assert.equal(process.env.CFG_TEST_FILE, __filename)
  assert.equal(process.env.CFG_TEST_WATCH, "false")
})
