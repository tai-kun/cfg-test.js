export declare const testEnv: {
  readonly CFG_TEST: "true";
};

export declare const buildEnv: {
  readonly CFG_TEST: "false";
  readonly CFG_TEST_URL: undefined;
  readonly CFG_TEST_FILE: undefined;
  readonly CFG_TEST_WATCH: "false";
};

export declare const testDefine: {
  readonly "process.env.CFG_TEST": "\"true\"";
};

export declare const buildDefine: {
  readonly cfgTest: "undefined";
  readonly "process.env.CFG_TEST": "\"false\"";
  readonly "process.env.CFG_TEST_URL": "undefined";
  readonly "process.env.CFG_TEST_FILE": "undefined";
  readonly "process.env.CFG_TEST_WATCH": "\"false\"";
};
