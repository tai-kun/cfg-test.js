#!/usr/bin/env bash

GREEN='\033[1;32m'
RED='\033[1;31m'
NC='\033[0m'

if [ -n "$CI" ]; then
    GREEN=''
    RED=''
    NC=''
fi

function run() {
    local rc
    local log_file

    echo -n "running: $* ... "

    log_file="$(mktemp)"
    bash -c "$* >> $log_file 2> $log_file"
    rc=$?

    if [ $rc -eq 0 ]; then
        echo -e "${GREEN}ok${NC}"
    else
        echo -e "${RED}FAILED${NC}"
        echo
        cat "$log_file"
        echo
    fi

    rm "$log_file"

    return $rc
}

function run_tests() {
    local rc
    local test_case="$1"

    echo -e "[$test_case] Running tests with node ${GREEN}$(node --version)${NC}"

    rc=0
    run npm i || rc=$?
    run npm run test:type || rc=$?
    run npm run test:unit:js || rc=$?
    run npm run test:unit:ts || rc=$?

    echo

    return $rc
}

rc=0

for example in "$@"; do
    test_case="$example"

    if [ ! -d "examples/$test_case" ]; then
        echo "[$test_case] No such example"
        exit 1
    fi

    for transpiler in swc ts-node tsx wtr; do
        test_case="$example/$transpiler"

        if [ ! -d "examples/$test_case" ]; then
            echo "[$test_case] Skip"
            continue
        fi

        for typ in cjs esm; do
            test_case="$example/$transpiler/$typ"

            if [ ! -d "examples/$test_case" ]; then
                echo "[$test_case] Skip"
                continue
            fi

            (cd "examples/$test_case" && run_tests "$test_case") || rc=$?
        done
    done
done

exit $rc
