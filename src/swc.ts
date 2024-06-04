import { register } from "./core/api";

const ctx = register();

// Register Transpiler
if (ctx) {
  if (ctx.isEsmMode) {
    ctx.import("@swc-node/register/esm");
  } else {
    ctx.require("@swc-node/register/register", m => {
      m.register({ sourceMap: true });
    });
  }
}
