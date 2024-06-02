#!/usr/bin/env bash

set -e

function cleanup() {
    if [ -f tsconfig.build.json ]; then
        rm tsconfig.build.json
    fi
}

trap cleanup EXIT

if [ -d dist ]; then
    rm -rf dist
fi

node scripts/build.mjs

cp config/build/tsconfig.build.json .
npx tsc -p tsconfig.build.json

cp docs/schema.json .
