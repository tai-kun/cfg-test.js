declare namespace NodeJS {
  interface ProcessEnv {
    CFG_TEST?: `${boolean}`;
    CFG_TEST_CFG?: string | undefined;
    CFG_TEST_URL?: string | undefined;
    CFG_TEST_FILE?: string | undefined;
    CFG_TEST_WATCH?: `${boolean}`;
  }
}

type CfgTest = Readonly<
  & typeof import("./dist/core/test/nodejs")
  & typeof import("./dist/core/assert")
  & {
    url?: string;
    file: string;
    watch: boolean;
  }
>;

declare var cfgTest: CfgTest | undefined;
