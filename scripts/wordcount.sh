#!/usr/bin/env bash

README_WC="$(wc -w < README.md)"
ADR_WC="$(cat ./adrs/*.md | wc -w)"
ADR_DRAFT_WC="$(cat ./adrs/draft/*.md | wc -w)"

echo "project       count"
echo "--------     ------"
echo "README     ${README_WC}"
echo "adrs       ${ADR_WC}"
echo "adrs/drafts${ADR_DRAFT_WC}"
