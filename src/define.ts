export const testEnv = Object.freeze(
  {
    NODE_ENV: "test",
    CFG_TEST: "true",
  } as const,
)

export const buildEnv = Object.freeze(
  {
    CFG_TEST: "false",
    CFG_TEST_URL: undefined,
    CFG_TEST_FILE: undefined,
    CFG_TEST_WATCH: "false",
  } as const,
)

export const testDefine = Object.freeze(
  {
    "process.env.NODE_ENV": "\"test\"",
    "process.env.CFG_TEST": "\"true\"",
  } as const,
)

export const buildDefine = Object.freeze(
  {
    cfgTest: "undefined",
    "process.env.CFG_TEST": "\"false\"",
    "process.env.CFG_TEST_URL": "undefined",
    "process.env.CFG_TEST_FILE": "undefined",
    "process.env.CFG_TEST_WATCH": "\"false\"",
  } as const,
)
