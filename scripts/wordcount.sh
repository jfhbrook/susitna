#!/usr/bin/env bash

README_WC="$(wc -w < README.md)"
ADR_WC="$(cat ./adrs/*.md | wc -w)"

echo "project   count"
echo "-------- ------"
echo "README ${README_WC}"
echo "adrs   ${ADR_WC}"
