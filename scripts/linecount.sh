#!/usr/bin/env bash

MATBAS_LC="$(cat ./*.ts \
  ./ast/index.citree ./ast/util.ts \
  ./bin/* \
  ./bytecode/* \
  ./examples/* \
  ./scripts/* \
  ./test/*.ts ./test/helpers/*.ts | wc -l)"

CITREE_LC="$(cat ./tools/citree/src/*.ts \
  ./tools/citree/src/templates/* | wc -l)"

TESTGEN_LC="$(cat ./tools/test-generator/*.ts | wc -l)"

echo "project                 count"
echo "--------               ------"
echo "main                 ${MATBAS_LC}"
echo "tools/citree         ${CITREE_LC}"
echo "tools/test-generator ${TESTGEN_LC}"

