import * as assert from "./assert";
import * as test from "./test/wtr";

// @ts-expect-error
window.createCfgTest = (
  options: Omit<CfgTest, keyof typeof test | keyof typeof assert>,
): CfgTest => ({
  ...test,
  ...assert,
  ...options,
});
