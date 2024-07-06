import { cfgTestPlugin } from "cfg-test/wtr";

import { playwrightLauncher } from "@web/test-runner-playwright";

import { defaultReporter, summaryReporter } from "@web/test-runner";

export default {
  nodeResolve: true,
  plugins: [
    cfgTestPlugin({
      include: ["./src/**/*"],
    }),
  ],
  browsers: [
    playwrightLauncher({
      product: "chromium",
    }),
  ],
  reporters: [
    defaultReporter({
      reportTestResults: true,
      reportTestProgress: false,
    }),
    summaryReporter(),
  ],
};
