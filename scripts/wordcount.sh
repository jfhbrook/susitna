#!/usr/bin/env bash

MATBAS_WC="$(wc -w < README.md)"
ADR_WC="$(cat ./adrs/*.md | wc -w)"

echo "project   count"
echo "-------- ------"
echo "main   ${MATBAS_WC}"
echo "adrs   ${ADR_WC}"
