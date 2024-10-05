#!/usr/bin/env bash

MATBAS_LC="$(cat ./*.ts \
  ./ast/index.citree ./ast/util.ts \
  ./bin/* \
  ./bytecode/* \
  ./commands/* \
  ./examples/*.bas \
  ./scripts/* \
  ./value/* \
  ./test/*.ts \
  ./test/helpers/*.ts \
  ./test/value/*.ts | wc -l)"
CITREE_LC="$(cat ./tools/citree/src/*.ts \
  ./tools/citree/src/templates/* | wc -l)"
GRABTHAR_LC="$(cat ./tools/grabthar/*.mjs | wc -l)"
TESTGEN_LC="$(cat ./tools/test-generator/*.ts | wc -l)"

echo '======== line counts ========'
echo "project                 count"
echo "--------               ------"
echo "main                 ${MATBAS_LC}"
echo "tools/citree         ${CITREE_LC}"
echo "tools/grabthar       ${GRABTHAR_LC}"
echo "tools/test-generator ${TESTGEN_LC}"

README_WC="$(wc -w < README.md)"
ADR_WC="$(cat ./adrs/*.md | wc -w)"
ADR_DRAFT_WC="$(cat ./adrs/draft/*.md | wc -w)"

echo ''
echo '=== word counts ==='
echo "project       count"
echo "--------     ------"
echo "README     ${README_WC}"
echo "adrs       ${ADR_WC}"
echo "adrs/drafts${ADR_DRAFT_WC}"

echo ''
echo '=== artifact sizes ==='
echo 'size	          file'
echo '----	--------------'
du -h ./dist/main.js
