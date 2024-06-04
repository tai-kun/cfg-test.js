import { register } from "./core/api";

const ctx = register();

// Register Transpiler
if (ctx) {
  if (ctx.isEsmMode) {
    ctx.import("ts-node/esm");
  } else {
    ctx.require("ts-node", m => {
      m.register();
    });
  }
}
