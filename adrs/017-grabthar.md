# ADR 017 - Vitest, Vite, Grabthar, Oh My!

### Status: Accepted

### Josh Holbrook

In October, what began as a change in test frameworks snowballed into a complete refactor of Matanuska's builds. These changes were very significant, and yet happened quietly. This ADR intends to remedy that situation, to document what those changes were and why they happened.

## Tap and NodeNext

When I started Matanuska, I chose [Node Tap](https://node-tap.org/) as my test framework. Tap was my favorite test framework in Node for a very long time. It's historically had an API that's less "magical" than some of the other frameworks out there, it outputs [TAP](https://testanything.org/) by default - always a bonus - and it has pretty high-level reporting.

However, in recent years, Tap has started to grow weary. Its API became more complicated as it needed to support promises and async/await. Its features became more complicated and complex, and it became harder to use.

But what ultimately made me disillusioned was encountering bugs and odd behavior over time. For instance, I have a directory called `./test/helpers` which contains helper modules for my tests. This is a convention I learned from [Nest](https://nestjs.com/) tests during my time at [Procore](https://www.procore.com/). Tap absolutely refused to ignore this directory (which had no tests in it), regardless of my efforts to configure it thusly.

What pushed me over the edge was issues with native `import` syntax in Node.js modules (called "nodenext" in TypeScript parlance). Up to this point, I was using "commonjs" builds, where TypeScript would compile my files to use `require`. This was mostly fine and good, but it would struggle with modules using native `import`. Most of my dependencies used commonjs, but [one of my development dependencies](https://www.npmjs.com/package/strip-ansi) was using native import - this in part motivated me to make the switch. Unfortunately, [Tap struggled with this](https://github.com/jfhbrook/matanuska/pull/31) when I initially made this attempt.

## Vitest

I began searching for a new test framework, and [at the recommendation of Nuck](https://x.com/nucknyan/status/1841666256770105546), I gave [Vitest](https://vitest.dev/) a shot. It's by the developers of [Vite](https://vite.dev/), which I loved. I don't do a lot of frontend development, but when I do, Vite is often my choice. Unlike many other solutions to frontend builds I've tried in the past, Vite "just works" and involves minimal baggage (looking at you, Angular).

It turns out that Vitest is incredible, and I made the change incrementally - but also quickly. I started by configuring Vite to build files named `*.spec.ts`, and having Tap run tests named `*.tap.ts`. Within a few days, the switch was complete.

Overall, I have been _extremely_ happy with Vitest. It has the good parts of Jest and Chai, but without the stranger baggage. It really is incredible, and I can't recommend it enough.

## Native Imports in TSC and SWC

Switching to Vitest fixed native import in the tests, and I was quite happy with that. However, I was not out of the woods when it came to using native import in the main project - that effort was still failing.

The issue I ran into is deep in the weeds. When in module mode, Node likes to have imports specify the extension of the file you're importing, and doesn't like importing directories - you have to spell out `./directory/index.mjs`, rather than simply specifying `./directory`. `tsc` ([TypeScript's standard compiler](https://www.npmjs.com/package/typescript)) doesn't rewrite these import paths in "nodenext" mode. This alone made things awkward.

But I also had my Vitest build configured to use [SWC](https://swc.rs/), the compiler backend I had configured for Vitest, and it had issues of its own. SWC is cool. It's a TypeScript compiler written in Rust that is _extremely_ fast, and - unlike `tsc` - it _mostly_ handles rewriting import paths just fine. However, I did find that it rewrites `index.mjs` imports into directory imports.

I also found that [SWC's standard command line interface](https://www.npmjs.com/package/@swc/cli) was really immature. This seems to be because it was really intended to run within other build and bundling tools, such as Vite and Nextjs.

By this point, I was finding the impedance mismatch between Vitest's SWC-based build and my project's `tsc` build to be overwhelming, and I yearned to make the two match. I considered switching Vitest to use `tsc`. But I also found that SWC was SO much faster (it nearly doubled the speed of my tests) that I couldn't say no. By this point, I was committed to using SWC in my build.

## Vite

I realized that the way to use SWC successfully in Matanuska's main build was going to involve a singular bundle. At this point, I started asking if Vite itself could run my main build. After all, it was building my _tests_ with SWC successfully!

As it turns out, Vite is more than capable of doing this, through its [server-side rendering functionality](https://vite.dev/guide/ssr) (SSR). This is a bit of a misnomer. The _motivation_ is to support server-side rendering of React projects, but the _actual feature_ is bundles for server-side JavaScript runtimes like Node.js.

It's a little limited as compared to its frontend builds - but only a little. For one thing, it can only really handle one SSR entry point. The biggest issue, though, is that Vite's standard dev mode is geared towards [hot module replacement](https://vite.dev/guide/api-hmr) of frontend code through a proxy over a server - not something that benefits Matanuska. The ramifications of that, though, were simply that I would need to run Vite in batch build mode - not all that different from the pre-existing build process.

Ultimately, I've been pretty happy with Vite as a build tool. It's blazing fast and does exactly what I need!

## Type Checking, SWC and TSC

SWC is a great tool when it comes to compiling TypeScript. But it's a _bad_ tool for _type checking_ TypeScript. This is because part of why it's so fast is that it mostly ignores types completely. This meant that, while SWC was being used for the builds, I still needed `tsc` in the mix for type checking.

Luckily, `tsc` is much more flexible with inputs when it comes to type checking than it is with generating compiled output. After all, it doesn't need to concern itself with output at _all_ if it's running with the `--noEmit` flag.

Unfortunately, this _did_ mean that configuration began to sprawl. At this point, I had configurations not just for Vite (shared with Vitest) and `tsc`, but also for [Prettier](https://prettier.io/), [ESLint](https://eslint.org/) and even [ShellCheck](https://www.shellcheck.net/). Many of these files had shared settings that needed to match each other. This was somewhat manageable, until Vite was also in the mix.

## Grabthar

My instincts when presented with this configuration sprawl was to begin writing some scripts to generate and update configuration for me. The first draft can be seen in [the PR that initially implemented the Vite build](https://github.com/jfhbrook/matanuska/pull/38). These scripts reflected off a shared JSON file (later YAML) and generated the configurations for the downstream tools. In the case of Vite, this happened through an import, but for other tools, it just wrote JSON to disk.

I began to realize that these scripts were becoming elaborate enough that I wanted to massage them into a proper tool. I created a new package, moved the scripts into it, and named the project `grabthar`.

This name has a funny background. Many years ago, I was in an IRC conversation with a developer who began describing a build tool he was making. I was a jerk and scoffed at the API, and began sketching out my _own_ build tool. I named it `grabthar` after [my favorite joke from Galaxy Quest](https://www.youtube.com/watch?v=kgv7U3GYlDY). It didn't go anywhere, but I kept the source around. When it came time to write a tool for Matanuska, I decided to reuse the name. But anyway, it turns out I was talking to the author of [Grunt](https://gruntjs.com/), and boy did I look silly.

Either way - Matanuska now has a custom build tool. This tool runs hooks to generate configurations, exports functions for tools using JavaScript configs (ie., Vite and ESLint), and runs the appropriate tools in an opinionated manner.

Make no mistake, `grabthar` is _extremely_ opinionated. Aside from the shared configurations, it's not all that customizable. Any tools using it would need to support _exactly_ the same underlying build stack as Matanuska. But there are benefits to that, too. I'm currently only using it for Matanuska and a handful of its tools, but may use it outside Matanuska in the future if it ages well.

## citree

A brief note on [citree](../packages/citree). `citree` is a tool I wrote for generating [Matanuska's AST classes](../ast). This tool is heavily inspired by [the script used in Crafting Interpreters' `jlox` interpreter](https://craftinginterpreters.com/representing-code.html#metaprogramming-the-trees). It uses a DSL implemented in [ts-parsec](https://www.npmjs.com/package/typescript-parsec) that takes a specification for an AST and generates classes implementing a [visitor pattern](https://en.wikipedia.org/wiki/Visitor_pattern). The DSL is a little janky, but it does exactly what I need for Matanuska.

I considered rewriting `citree` to run as a step in the Vite build. However, I decided to keep it as a separate code generation step. This is because, while hacking, I need the TypeScript files to exist in order to do type checking - simple enough.

## jscc

A final consequence of these refactors was the introduction of [jscc](https://www.npmjs.com/package/jscc).

Matanuska has included build-time code generation from pretty early on. In particular, it uses an environment variable (`MATBAS_BUILD`) to control whether or not to include certain debugging hooks. During development, good debugging output is extremely desirable. But for a release, it slows things down to an unacceptable level - or, at least, that's the common wisdom.

Initially, I solved this through using [nunjucks](https://www.npmjs.com/package/nunjucks) templates for a `constants.ts` file and a `debug.ts` file. Under `MATBAS_BUILD=debug`, the latter file would contain debug output, including tracing ([see ADR 14](./adrs/014-opentelemetry.md) for more context here). But under `MATBAS_BUILD=release`, those hooks would be empty "no-op" functions. This all worked, but was dissatisfying.

JSCC was a simple, general purpose tool for the kind of conditional logic I was looking for. Not only did it have a nice syntax that constituted valid JavaScript; it also [had a build plugin](https://www.npmjs.com/package/rollup-plugin-jscc) that would integrate it into my build for _all_ my files. To me, this was a major win.

## Summary

That was a lot, so I wanted to quickly summarize what happened here.

### Before

- `citree` for generating the AST
- `tsc` for both TypeScript compiling and type checking
- No bundling
- Prettier for formatting
- ESLint for TypeScript linting
- ShellCheck for bash linting
- Node Tap for testing
- Nunjucks for build-time configuration and conditional compiling
- No shared build tool

### After

- `citree` for generating the AST, as before
- `tsc` for type checking only
- `swc` for TypeScript compiling
- Prettier, ESLint and ShellCheck used for formatting and linting, as before
- Vitest for testing
- `jscc` for build-time configuration and conditional compiling
- Custom `grabthar` build tool
