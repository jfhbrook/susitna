#!/usr/bin/env bash

README_WC="$(wc -w < README.md)"
ADR_WC="$(cat ./adrs/*.md | wc -w)"
ADR_DRAFT_WC="$(cat ./adrs/draft/*.md | wc -w)"

echo "project     count"
echo "--------   ------"
echo "README   ${README_WC}"
echo "adrs"
echo " complete${ADR_WC}"
echo " drafts  ${ADR_DRAFT_WC}"
