# cfg-test.js

In-source testing using [Node.js Test Runner](https://nodejs.org/api/test.html)

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
npm i -D cfg-test \
  @swc-node/register \
  @types/node \
  typescript
```

## Setup

```ts
// src/lib.ts

// the implementation
export function addOne(a: number): number {
  return a + 1
}

// in-source test suites
if (
  process.env.NODE_ENV === "test"
  && process.env.CFG_TEST_FILE === import.meta.filename
) {
  const { assert, describe, test } = cfgTest

  describe("addOne", () => {
    test("it works", () => {
      assert.equal(addOne(2), 3)
    })
  })
}
```

```ts
// @types/global.d.ts

/// <reference types="cfg-test/globals" />
```

```json5
// tsconfig.json

{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
  },
  "include": [
    "@types",
    "src",
  ],
}
```

```json5
// package.json

{
  "type": "module",
  "scripts": {
    "test": "node --import cfg-test --test ./src/lib.ts"
  },
  "devDependencies": {
    "@swc-node/register": "latest",
    "@types/node": "latest",
    "cfg-test": "latest",
    "typescript": "latest"
  }
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
|^20.0  |swc       |ESM     |[examples/node20/swc/esm](examples/node20/swc/esm)        |
|       |          |CommonJS|[examples/node20/swc/cjs](examples/node20/swc/cjs)        |
|       |ts-node   |ESM     |[examples/node20/ts-node/esm](examples/node20/ts-node/esm)|
|       |          |CommonJS|[examples/node20/ts-node/cjs](examples/node20/ts-node/cjs)|
|^21.0  |swc       |ESM     |[examples/node21/swc/esm](examples/node21/swc/esm)        |
|       |          |CommonJS|[examples/node21/swc/cjs](examples/node21/swc/cjs)        |
|       |ts-node   |ESM     |[examples/node21/ts-node/esm](examples/node21/ts-node/esm)|
|       |          |CommonJS|[examples/node21/ts-node/cjs](examples/node21/ts-node/cjs)|

## Production Build

```ts
import {
  // { CFG_TEST: "true" }
  testEnv,

  // {
  //   CFG_TEST: "false",
  //   CFG_TEST_URL: undefined,
  //   CFG_TEST_FILE: undefined,
  //   CFG_TEST_WATCH: "false",
  // }
  buildEnv,

  // { "process.env.CFG_TEST": "\"true\"" }
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
    NODE_ENV: "\"production\"",
    ...buildDefine,
  },
  // other options
})
```

### Vite

```ts
// vite.config.ts

import { buildDefine } from "cfg-test/define"

export default defineConfig({
  define: { 
    NODE_ENV: "\"production\"",
    ...buildDefine,
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
      NODE_ENV: "\"production\"",
      ...buildDefine,
    }),
  ],
  // other options
}
```

### Webpack

```ts
import { buildDefine } from "cfg-test/define"

const definePlugin = new webpack.DefinePlugin({
  NODE_ENV: "\"production\"",
  ...buildDefine,
})
```

## Configuration

```json5
// config/code/cfg-test.json
// or config/cfg-test.json
// or cfg-test.json

{
  // Additonal environment variables
  "env": {
    "MY_CUSTOM_ENV": "true"
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
