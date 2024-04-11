#!/usr/bin/env bash

LC="$(cat ./*.ts \
  ./ast/index.citree ./ast/util.ts \
  ./bin/* \
  ./bytecode/* \
  ./examples/* \
  ./scripts/* \
  ./test/*.ts ./test/helpers/*.ts | wc -l)"
echo "line count:${LC}"


