declare namespace NodeJS {
  interface ProcessEnv {
    CFG_TEST?: `${boolean}`
    CFG_TEST_URL?: `file://${string}` | undefined
    CFG_TEST_FILE?: string | undefined
    CFG_TEST_WATCH?: `${boolean}`
  }
}

type CfgTest = typeof import("node:test") & {
  url?: `file://${string}`
  file: string
  watch: boolean
  assert: Omit<typeof import("node:assert"), "ok"> & {
    (value: unknown, message?: string | Error): void
    ok(value: unknown, message?: string | Error): void
  }
}

declare var cfgTest: CfgTest | undefined
