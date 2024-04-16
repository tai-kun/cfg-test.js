#!/usr/bin/env bash

GH_USER="nektos"
GH_REPO="act"

TAG=$(curl --silent "https://api.github.com/repos/$GH_USER/$GH_REPO/releases/latest" | jq -r .tag_name)
BIN=".cache/act-$TAG"

if [ ! -f "$BIN" ]; then
    echo "Downloading act $TAG"

    mkdir -p "$BIN-tmp"
    curl "https://github.com/nektos/act/releases/download/$TAG/act_Linux_x86_64.tar.gz" -L -o "$BIN-tmp/assets.tar.gz"
    tar xzf "$BIN-tmp/assets.tar.gz" -C "$BIN-tmp"
    mv "$BIN-tmp/act" "$BIN"

    echo "act $TAG downloaded"
fi

rc=0

"$BIN" -W .github/workflows/quality.yaml || rc=$?

echo
echo "Test exit code: $rc"
exit $rc
