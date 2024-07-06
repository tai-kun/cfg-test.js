# cfg-test.js

In-source testing using [Node.js Test Runner](https://nodejs.org/api/test.html)

As a general recommendation, I suggest using [`tsx`](https://github.com/privatenumber/tsx) to transpile TypeScript files while running tests. `cfg-test` also provides presets for using either [`ts-node`](https://github.com/TypeStrong/ts-node) or [`swc`](https://github.com/swc-project/swc-node) as the transpiler. Naturally, these can be customised to fit your needs.

[![npm latest package](https://img.shields.io/npm/v/cfg-test/latest.svg)](https://www.npmjs.com/package/cfg-test)
[![Quality](https://github.com/tai-kun/cfg-test.js/actions/workflows/quality.yaml/badge.svg)](https://github.com/tai-kun/cfg-test.js/actions/workflows/quality.yaml)

- [Requirements](#requirements)
- [Install](#install)
- [Setup](#setup)
- [Examples](#examples)
- [Production Build](#production-build)
  - [ESBuild](#esbuild)
  - [Vite](#vite)
  - [Rollup](#rollup)
  - [Webpack](#webpack)
- [Configuration (Optional)](#configuration)
- [web-test-runner (Experimental)](#web-test-runner)

## Requirements

Node.js `>=18.19.0`

## Install

```bash
npm i -D cfg-test tsx typescript
```

## Setup

See: [examples/readme/tsx/esm](examples/readme/tsx/esm)

```console
/your-project
├─ src
│  ├─ lib.ts
│  └─ env.d.ts
├─ package.json
└─ tsconfig.json
```

```ts
// src/lib.ts

// the implementation
export function addOne(a: number): number {
  return a + 1
}

// in-source test suites
if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("addOne", () => {
    test("it works", () => {
      assert.equal(addOne(2), 3)
    })
  })
}
```

```ts
// src/env.d.ts

/// <reference types="cfg-test/globals" />
```

```json5
// package.json

{
  "type": "module",
  "scripts": {
    "test": "tsx --import cfg-test --test ./src/**/*.ts"
  },
  "devDependencies": {
    "cfg-test": "latest",
    "tsx": "latest",
    "typescript": "latest"
  }
}
```

```json5
// tsconfig.json

{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
  },
  "include": [
    "./src/**/*",
  ],
}
```

Then you can start to test.

```bash
npm test
```

## Examples

|Node.js|Transpiler|Type    |Link                                                      |
|:------|:---------|:-------|:---------------------------------------------------------|
|^18.19 |swc       |ESM     |[examples/node18/swc/esm](examples/node18/swc/esm)        |
|       |          |CommonJS|[examples/node18/swc/cjs](examples/node18/swc/cjs)        |
|       |ts-node   |ESM     |[examples/node18/ts-node/esm](examples/node18/ts-node/esm)|
|       |          |CommonJS|[examples/node18/ts-node/cjs](examples/node18/ts-node/cjs)|
|       |tsx       |ESM     |[examples/node18/tsx/esm](examples/node18/tsx/esm)        |
|       |          |CommonJS|[examples/node18/tsx/cjs](examples/node18/tsx/cjs)        |
|20.x   |swc       |ESM     |[examples/node20/swc/esm](examples/node20/swc/esm)        |
|       |          |CommonJS|[examples/node20/swc/cjs](examples/node20/swc/cjs)        |
|       |ts-node   |ESM     |[examples/node20/ts-node/esm](examples/node20/ts-node/esm)|
|       |          |CommonJS|[examples/node20/ts-node/cjs](examples/node20/ts-node/cjs)|
|       |tsx       |ESM     |[examples/node20/tsx/esm](examples/node20/tsx/esm)        |
|       |          |CommonJS|[examples/node20/tsx/cjs](examples/node20/tsx/cjs)        |
|22.x   |swc       |ESM     |[examples/node22/swc/esm](examples/node22/swc/esm)        |
|       |          |CommonJS|[examples/node22/swc/cjs](examples/node22/swc/cjs)        |
|       |ts-node   |ESM     |[examples/node22/ts-node/esm](examples/node22/ts-node/esm)|
|       |          |CommonJS|[examples/node22/ts-node/cjs](examples/node22/ts-node/cjs)|
|       |tsx       |ESM     |[examples/node22/tsx/esm](examples/node22/tsx/esm)        |
|       |          |CommonJS|[examples/node22/tsx/cjs](examples/node22/tsx/cjs)        |

## Production Build

```ts
import {
  // {
  //   NODE_ENV: "test",
  //   CFG_TEST: "true",
  // }
  testEnv,

  // {
  //   CFG_TEST: "false",
  //   CFG_TEST_URL: undefined,
  //   CFG_TEST_FILE: undefined,
  //   CFG_TEST_WATCH: "false",
  // }
  buildEnv,

  // {
  //   "process.env.NODE_ENV": "\"test\"",
  //   "process.env.CFG_TEST": "\"true\"",
  // }
  testDefine,

  // {
  //   cfgTest: "undefined",
  //   "process.env.CFG_TEST": "\"false\"",
  //   "process.env.CFG_TEST_URL": "undefined",
  //   "process.env.CFG_TEST_FILE": "undefined",
  //   "process.env.CFG_TEST_WATCH": "\"false\"",
  // }
  buildDefine,
} from "cfg-test/define"
```

### ESBuild

```ts
import { buildDefine } from "cfg-test/define"
import { build } from "esbuild"

build({
  define: {
    ...buildDefine,
    "process.env.NODE_ENV": "\"production\"",
  },
  // other options
})
```

### Vite

```ts
// vite.config.ts

import { buildDefine } from "cfg-test/define"
import { defineConfig } from "vite"

export default defineConfig({
  define: {
    ...buildDefine,
    "process.env.NODE_ENV": "\"production\"",
  },
  // other options
})
```

### Rollup

```ts
// rollup.config.js

import replace from "@rollup/plugin-replace"
import { buildDefine } from "cfg-test/define"

export default {
  plugins: [
    replace({ 
      ...buildDefine,
      "process.env.NODE_ENV": "\"production\"",
    }),
  ],
  // other options
}
```

### Webpack

```ts
import { buildDefine } from "cfg-test/define"

const definePlugin = new webpack.DefinePlugin({
  ...buildDefine,
  "process.env.NODE_ENV": "\"production\"",
})
```

## Configuration

Loaders can be added via the configuration file.

Specify the path to the configuration file in the environment variable CFG_TEST_CFG. The default value is a comma-separated list of paths: `.config/cfg-test.json`, `.config/cfg-test/config.json`, `config/cfg-test/config`, `config/cfg-test`, and `cfg-test`.

```json5
// .config/cfg-test.json, .config/cfg-test/config.json,
// config/cfg-test.json, config/cfg-test/config.json, cfg-test.json
// or process.env.CFG_TEST_CFG="<your-config-path>"

{
  // Additonal environment variables
  "env": {
    "MY_CUSTOM_ENV": "true"
  },
  "globals": {
    // Additional global variables
    "__DEV__": true
  },
  // Additional require modules
  "require": [
    "./path/to/require.js"
  ],
  // Additional import modules
  "import": [
    "./path/to/import.js"
  ]
}
```

## web-test-runner

See: [examples/readme/wtr/esm](examples/readme/wtr/esm)

```bash
npm i -D cfg-test typescript @web/test-runner @web/test-runner-playwright react react-dom @types/react @types/react-dom
```

```console
/your-project
├─ src
│  ├─ App.tsx
│  └─ env.d.ts
├─ package.json
├─ tsconfig.json
└─ web-test-runner.config.js
```

```tsx
// src/App.tsx

import React from "react";

// the implementation
export function App() {
  return <h1>Hello</h1>;
}

// in-source test suites
if (cfgTest && cfgTest.url === import.meta.url) {
  const { createRoot } = await import("react-dom/client");
  const { flushSync } = await import("react-dom");
  const { assert, describe, test } = cfgTest;

  function renderToString(node: any): string {
    const div = document.createElement("div");
    const root = createRoot(div);
    flushSync(() => {
      root.render(node);
    });
    const string = div.innerHTML;
    root.unmount();

    return string;
  }

  describe("App", () => {
    test("can be rendered", () => {
      assert.equal(renderToString(<App />), "<h1>Hello</h1>");
    });
  });
}
```

```ts
// src/env.d.ts

/// <reference types="cfg-test/globals" />
```

```json5
// package.json

{
  "type": "module",
  "scripts": {
    "postinstall": "playwright install --with-deps chromium",
    "test": "wtr ./src/**/*.tsx"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@web/test-runner": "latest",
    "@web/test-runner-playwright": "latest",
    "cfg-test": "file:../../../..",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "latest"
  }
}
```

```json5
// tsconfig.json

{
  "compilerOptions": {
    "module": "NodeNext",
    "esModuleInterop": true,
    "moduleResolution": "NodeNext",
    "jsx": "react-jsxdev",
    "lib": ["DOM"]
  },
  "include": [
    "./src/**/*"
  ]
}
```

```js
// web-test-runner.config.js

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
```

Then you can start to test.

```bash
npm test
```
