declare namespace NodeJS {
  interface ProcessEnv {
    CFG_TEST?: `${boolean}`;
    CFG_TEST_CFG?: string | undefined;
    CFG_TEST_URL?: `file://${string}` | undefined;
    CFG_TEST_FILE?: string | undefined;
    CFG_TEST_WATCH?: `${boolean}`;
  }
}

type CfgTest =
  & typeof import("node:test")
  & typeof import("./dist/core/assert")
  & {
    url?: `file://${string}`;
    file: string;
    watch: boolean;
  };

declare var cfgTest: CfgTest | undefined;
