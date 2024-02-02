declare namespace NodeJS {
  interface ProcessEnv {
    CFG_TEST?: `${boolean}`
    CFG_TEST_URL?: `file://${string}` | undefined
    CFG_TEST_FILE?: string | undefined
    CFG_TEST_WATCH?: `${boolean}`
  }
}

type CfgTest = typeof import("node:test") & {
  assert: typeof import("node:assert")
}

declare var cfgTest: CfgTest | undefined
