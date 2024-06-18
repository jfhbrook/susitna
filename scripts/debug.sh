#!/usr/bin/env bash

exercise-bike \
  --matbas_build "${MATBAS_BUILD:-debug}" \
  --trace "${DEBUG_TRACE:-0}" \
  --trace_parser "${DEBUG_TRACE_PARSER:-0}" \
  --show_tree "${DEBUG_SHOW_TREE:-0}" \
  --trace_compiler "${DEBUG_TRACE_COMPILER:-0}" \
  --show_chunk "${DEBUG_SHOW_CHUNK:-0}" \
  --trace_runtime "${DEBUG_TRACE_RUNTIME:-0}" \
  --trace_gc "${DEBUG_TRACE_GC:-0}" \
  debug.njk.ts debug.ts
