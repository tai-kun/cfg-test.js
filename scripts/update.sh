#!/usr/bin/env bash

for example in node18 node20 node21 node22 readme; do
    test_case="$example"

    if [ ! -d "examples/$test_case" ]; then
        echo "[$test_case] No such example"
        exit 1
    fi

    for transpiler in swc ts-node; do
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

            (cd "examples/$test_case" && npx npm-check-updates --upgrade --reject @types/node)
        done
    done
done
