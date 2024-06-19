#!/usr/bin/env bash

MATBAS_VERSION="$(node -pe 'require("./package.json").version')"
TYPESCRIPT_VERSION="$(tsc --version | sed 's/^Version //')"

exercise-bike \
  --matbas_build "${MATBAS_BUILD:-debug}" \
  --matbas_version "${MATBAS_VERSION}" \
  --typescript_version "${TYPESCRIPT_VERSION}" \
  constants.njk.ts constants.ts
