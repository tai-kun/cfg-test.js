exports.testEnv = Object.freeze({
  NODE_ENV: "test",
  CFG_TEST: "true",
});

exports.buildEnv = Object.freeze({
  CFG_TEST: "false",
  CFG_TEST_URL: undefined,
  CFG_TEST_FILE: undefined,
  CFG_TEST_WATCH: "false",
});

exports.testDefine = Object.freeze({
  "process.env.NODE_ENV": "\"test\"",
  "process.env.CFG_TEST": "\"true\"",
});

exports.buildDefine = Object.freeze({
  "cfgTest": "undefined",
  "cfgTest.url": "undefined",
  "cfgTest?.url": "undefined",
  "cfgTest!.url": "undefined",
  "cfgTest.file": "undefined",
  "cfgTest?.file": "undefined",
  "cfgTest!.file": "undefined",
  "cfgTest.watch": "false",
  "cfgTest?.watch": "false",
  "cfgTest!.watch": "false",
  "process.env.CFG_TEST": "\"false\"",
  "process.env.CFG_TEST_URL": "undefined",
  "process.env.CFG_TEST_FILE": "undefined",
  "process.env.CFG_TEST_WATCH": "\"false\"",
});
