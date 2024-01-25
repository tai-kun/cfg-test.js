exports.testEnv = Object.freeze({
  CFG_TEST: "true",
});

exports.buildEnv = Object.freeze({
  CFG_TEST: "false",
  CFG_TEST_URL: undefined,
  CFG_TEST_FILE: undefined,
  CFG_TEST_WATCH: "false",
});

exports.testDefine = Object.freeze({
  "process.env.CFG_TEST": "\"true\"",
});

exports.buildDefine = Object.freeze({
  "cfgTest": "undefined",
  "process.env.CFG_TEST": "\"false\"",
  "process.env.CFG_TEST_URL": "undefined",
  "process.env.CFG_TEST_FILE": "undefined",
  "process.env.CFG_TEST_WATCH": "\"false\"",
});