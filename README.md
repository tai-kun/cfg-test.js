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

## Requirements

Node.js `>=18.19.0`

## Install

```bash
npm i -D cfg-test tsx typescript
```

## Setup

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
