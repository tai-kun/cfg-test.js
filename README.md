# cfg-test.js

In-source testing with the [Node.js Test Runner](https://nodejs.org/api/test.html)

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

## Requirements

Node.js `>=18.19.0`

## Install

```bash
npm i -D cfg-test \
  @swc-node/register \
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
    "test": "node --import cfg-test --test=./src/**/*.ts"
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
|>=18.19|       swc|     ESM|[examples/node18/swc/esm](examples/node18/swc/esm)        |
|       |          |CommonJS|[examples/node18/swc/cjs](examples/node18/swc/cjs)        |
|       |   ts-node|     ESM|[examples/node18/ts-node/esm](examples/node18/ts-node/esm)|
|       |          |CommonJS|[examples/node18/ts-node/cjs](examples/node18/ts-node/cjs)|
|>=20   |       swc|     ESM|[examples/node20/swc/esm](examples/node20/swc/esm)        |
|       |          |CommonJS|[examples/node20/swc/cjs](examples/node20/swc/cjs)        |
|       |   ts-node|     ESM|[examples/node20/ts-node/esm](examples/node20/ts-node/esm)|
|       |          |CommonJS|[examples/node20/ts-node/cjs](examples/node20/ts-node/cjs)|

## Production Build

```ts
import {
  // CFG_TEST: "true"
  testEnv,

  // CFG_TEST: "false"
  // CFG_TEST_URL: undefined
  // CFG_TEST_FILE: undefined
  // CFG_TEST_WATCH: "false"
  buildEnv,

  // "process.env.CFG_TEST": "\"true\""
  testDefine,

  // cfgTest: "undefined"
  // "process.env.CFG_TEST": "\"false\""
  // "process.env.CFG_TEST_URL": "undefined"
  // "process.env.CFG_TEST_FILE": "undefined"
  // "process.env.CFG_TEST_WATCH": "\"false\""
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
  ...buildDefine,
})
```
