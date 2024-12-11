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
CITREE_LC="$(cat ./packages/citree/src/*.ts \
  ./packages/citree/src/templates/* | wc -l)"
ENTRY_LC="$(cat ./packages/entrypoint/src/*.ts \
  ./packages/entrypoint/modules/entrypoint/*.tf | wc -l)"
FIREBALL_LC="$(cat ./packages/fireball/src/*.ts \
  ./packages/fireball/modules/fireball/*.tf | wc -l)"
GRABTHAR_LC="$(cat ./packages/grabthar/*.mjs | wc -l)"
TESTGEN_LC="$(cat ./packages/test-generator/*.ts | wc -l)"

TOTAL_LC=$((MATBAS_LC + CITREE_LC + ENTRY_LC + FIREBALL_LC + GRABTHAR_LC + TESTGEN_LC))

echo '======== line counts ========'
echo "project                    count"
echo "--------                  ------"
echo "main                    ${MATBAS_LC}"
echo "packages/citree         ${CITREE_LC}"
echo "packages/entrypoint     ${ENTRY_LC}"
echo "packages/fireball       ${FIREBALL_LC}"
echo "packages/grabthar       ${GRABTHAR_LC}"
echo "packages/test-generator ${TESTGEN_LC}"
echo "total                      ${TOTAL_LC}"

README_WC="$(wc -w < README.md)"
ADR_WC="$(cat ./adrs/*.md | wc -w)"
ADR_DRAFT_WC="$(cat ./adrs/draft/*.md | wc -w)"
TOTAL_WC=$((README_WC + ADR_WC + ADR_DRAFT_WC))

echo ''
echo '=== word counts ==='
echo "project       count"
echo "--------     ------"
echo "README     ${README_WC}"
echo "adrs       ${ADR_WC}"
echo "adrs/drafts${ADR_DRAFT_WC}"
echo "total         ${TOTAL_WC}"

echo ''
echo '=== artifact sizes ==='
echo 'size	          file'
echo '----	--------------'
du -h ./dist/main.js
