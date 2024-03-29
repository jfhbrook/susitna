#!/usr/bin/env bash

MATBAS_VERSION="$(node -pe 'require("./package.json").version')"
TYPESCRIPT_VERSION="$(tsc --version | sed 's/^Version //')"

exercise-bike \
  --matbas_version "${MATBAS_VERSION}" \
  --typescript_version "${TYPESCRIPT_VERSION}" \
  versions.ts.njk versions.ts
