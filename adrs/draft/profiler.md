# ADR ??? - Profiler

### Status: Draft

### Josh Holbrook

## Context

`Writing Interactive Compilers & Interpreters` (WIC&I) discusses the need for a profiler. WIC&I shows this as a map from the line to how many times it's been executed. This is basically the same idea as modern profiling, but a little simpler due to the nature of a classic BASIC.

I thought about implementing profiling with opentelemetry, and I haven't ruled it out _completely_ - in fact, it could be the most straightforward path given that Matanuska BASIC uses otel internally. But a big limitation of otel spans is that the instrumentation emits a single event when a span closes, and the collector and query engine has to construct the full picture after the fact. That makes it tough to show traces until after execution is complete.

A really cool stretch goal would be to implement flame graphs. But for my own sanity, starting simple will still be useful.

## Decision

TK
