# Matanuska BASIC

Matanuska will be a BASIC intended to run as a shell. It asks what it would've
been like if the classic 80s BASIC was better able to rise to the occasion
when it came to disk features and/or competing with DOS.

## Prior Attempts

This is roughly my fourth attempt. Here are some notes on prior attempts:

- joshiverse/s7bas - a YOLO attempt at writing a basic from scratch, based
  largely on the MSX Technical Handbook. I learned at TON but ultimately
  realized I needed to step back and figure out how you would actually
  architect a modern BASIC interpreter.
- joshiverse/yabasic-rs - an attempt to port yabasic to rust. everything
  worthwhile from there has been moved to this repo.
- ./rs - wherein I successfully ported most of the scanner from yabasic,
  changed focus to doing Crafting Interpreters, sketched out a few patterns,
  then realized I should be prototyping in typescript
- this project, which has a basic scanner and some architectural structure,
  written in typescript

## Resources

My two major resources are [Crafting Interpreters by Robert Nystrom](https://craftinginterpreters.com/contents.html)
and `Writing Interactive Compilers and Interpreters` by PJ Brown. The former shows
how to write a lox interpreter in both java (tree-walking) and C (bytecode).
The latter is from 1979 and is BASIC-oriented, but less example-driven.
The outputs from my work with `Crafting Interpreters` can be viewed at
<https://github.com/jfhbrook/crafting-interpreters>.

I haven't finished either. In `Crafting Interpreters`, here are things I
*haven't* done:

- Ch. 12 and 13 - classes and inheritance in Java (which I *might* implement)
- Ch. 22 - local variables on a stack (which I *probably* want)
- Ch. 23 and 24 - jmp/GOTO and call stack shenanigans (which I definitely need)
- Ch. 25 - closures (which I don't intend to implement)
- Ch. 26 - garbage collection (which typescript solves For Now)
- ch. 27 through 29 - classes in C (which, again, I *might* implement)

In `Writing Interactive Compilers and Interpreters`, I made it up to Ch. 5.2,
which is on executing "reverse polish notation" (which is not unlike the modern
concept of bytecode). Broad strokes, this is what I expect the rest of the
book to cover:

- The rest of Ch 5, on the runtime
  - Ch. 5.2 - advice on executing stack-based bytecode
  - Ch. 5.3 - variables, likely global-oriented and relatively low-level
  - Ch. 5.4 - some finer points on executing statements
  - Ch. 5.5 - subtleties on handling stack-allocated strings in a low-level context
- Ch. 6.1 - the pre-run module, which is expected to fill in details and do
  syntax checks after editing and before running
- Ch. 6.2 - the re-creator module, which is in charge of converting our bytecode
  back into valid source code
- Ch 6.3 - the command module, which I need to study more in terms of architecture
  and responsibilities
- Ch. 7 - testing and release advice
- Ch. 8 - "some advanced and specialized topics"

PJ says the 14th deadly sin isn't finishing the book ;) I think between these
two, WIC&I is more important to finish due to its outsized influence on my
architecture, while CI can be used to show me *how* to do something once I
know *what* I want to do.

## Languages

### Source Language

This is the BASIC code itself. I intend to implement a pretty classic BASIC
to start, and then add features over time. The most important of those are
shell-related - supporting spawning [jobs](https://www.baeldung.com/linux/jobs-job-control-bash),
stream redirection, pipelines etc. Another big one will be a built-in test
framework, if only so I can easily test Matanuska *in* Matanuska.

#### Sigils

BASIC uses sigils to mark strings, and - for various reasons - I may adopt
sigils more broadly, a la perl.

#### Hashes

A big open question is how I'm going to support hash-like data structures.
There are two big alternatives:

1. Augment arrays to support associative array features, similar to Lua tables
2. Implement a separate Record type, inspired by Pascal

I'm tickled by the tables idea, but it makes the typing a lot more squishy
than a standard BASIC.

### Encoding Language

This is the language used to *implement* the interpreter. I'm *starting* with
typescript and node.js. This is because typescript is one of my strongest
languages - writing an interpreter is hard enough and I don't want the added
overhead of fighting a language I'm bad at. Plus, I *like* typescript, *and*
I think it will make a really nice extension language.

That said, if I want to make my interpreter *performant*, I'll want to
implement it in a compiled language. I've historically been leaning towards
Rust, and in fact have prototyped a lot of stuff in Rust. Rust comes with
a number of advantages:

1. Decent [toolkits](https://neon-bindings.com/docs/introduction) for implementing
   node bindings
2. A lot more high level abstractions and data structures than something like
   C
3. Good building and testing facilities
4. A nice ecosystem to work with
5. Memory safety when viable
6. "unsafe" abstractions when necessary

However, using C++ to implement a Node addon may be a better fit:

1. Is the [official extension mechanism](https://github.com/nodejs/node-addon-api)
2. With [cmake.js](https://github.com/cmake-js/cmake-js), supports a build system I don't hate
3. Unsafe abstractions are "normal" and don't require the same amount of rigmarole as Rust does
4. C-like language means plagiarizing Crafting Interpreters is easier, less "translation" effort

Using C++ will mean some potential testing issues - do I call test functions
from typescript? Use callbacks to the test harness in C++? Etc. It also means
not having some of the nicer abstractions in Rust.

Note, however, that I can mix and match - I can expose Rust abstactions over
a C-style API if I want to link into the C++ addon, and if I glue together
multiple addons in Node.JS then I can choose language per addon.

All that said, this is all stuff I plan on punting on until I have a
practically usable language.

### Internal Language (Internal Representation)

I'm implementing what's very similar to a bytecode - what PJ Brown calls
"reverse Polish notation". However, a big difference is that it's line-aware.
Each line is encoded like so:

```
... Field Length, LineNo, <Code | Value>...,
```

Field length includes the line number, but not the field length itself.
Values are currently marked by being stored in an object (`{ value: RawValue }`),
but this would likely use a bytecode marking the following 64 bits as a
value if re-implemented in a lower level language.

More on this can be seen in `./src/internal.ts`.

## Architecture

These notes describe the intended architecture. This is based partly on
what I've learned through my prior experiences but is largely influenced by
WIC&I and augmented by modern ideas from CI.

A loose architecture diagram may be seen here:

<https://oldbytes.space/@jfhbrook/111654216080409628>

Though I'd like to generate a better one. One idea is to leverage a DI
pattern to inject dependencies which procedurally generate an architecture
diagram with `mermaid` or something.

### Host

WIC&I refers to this as the I/O module. I'm borrowing a page from posh and
calling it the Host.

This is the one component which varies based on environment or frontend - that
is, `Host` is an interface, and while I use a `ConsoleHost` in my implementation
I could easily plug in a `BrowserHost` in the future.

Host has a lot of responsibilities, *because* it's the primary interface to
the system:

- prompting/reading input
- writing simple output and/or logging - this it shares with a posh host
- file reading/writing and tracking file handles
- process spawning, stdio redirection and tracking child processes/PIDs
- ports - both serial and networking, as well as HTTP
- drawing procedures - ie, wrapping [ink](https://github.com/vadimdemedes/ink),
  [ratatui](https://github.com/ratatui-org/ratatui), etc.

### Translator

This component contains the main REPL loop and feeds parsed lines to other
components. The basic loop is:

1. Read source code input from the prompt
2. Use the scanner and parser to generate IR in a "buffer"
3. If prefixed by a line number, feed to the Editor
4. If *not* prefixed by a line number, feed to the command module directly

It's likely that my Translator would also have the ability to directly read
and run "headless" from a file.

### Editor

The editor is what's in charge of taking lines from the Translator and updating
a `Program` accordingly. Its interface is similar to a dictionary.

### Recreator

Suppose that, when I edit a `Program`, I'm *not* saving the original source
code along with the IR. This means I'll need a component which can take IR
and convert it *back* to valud source code.

My current feeling is that I should implement a recreator, because I'd like to
put formatting concerns to bed - similar to go. There are some challenges
here, but I think with good testing it should give me auto-formatting almost
for free.

### Program

A `Program` is the core abstraction for storing IR. As mentioned, IR is in
a flat array, which includes field lengths before each encoded line.

But note that `Program` *also* owns storing variables. This means it maintains
some sense of an `Environment` internally.

#### Cursor

I need an abstraction to iterate over the lines of a program. In my head,
you can call `cursor.next()` or `cursor.seek(lineNo)` on the cursor, and then
do `for (const i = cursor.start; i < cursor.end; i++) { ... }` or similar.
Note, this abstraction may require some changes to support a proper bytecode
if ported to a lower level language.

#### Environment

The Java implementation of Lox in CI stores all variables in a Map that can
look upwards into ancestor scopes. But in my case, things might be different:

1. I intend to know types at the time I compile to IR, largely due to the use
   of sigils, and therefore can benefit from multiple narrowly-typed dicts
2. I don't intend to implement nested functions and may only have builtin,
   global and local scope - or similar.
3. I will likely implement local variables on a values stack, like the C
   implementation

### Scanning and Parsing

I'm starting out with using parser combinators, namely typescript-parsec.
This should let me write a lexer and parser which map pretty closely to
a recursive descent style parser, as seen in both WIC&I and CI. However, I
might implement expressions using a Pratt parser (a great example in CI) and
I may hand-roll a scanner in the future.

One open question is how I want to handle shell commands in the scanner. I want
to take bare cli commands and execute them with minimal friction, which means:

1. Treating "commands" which map to bins in the PATH as being roughly
   equivalent to BASIC commands
2. Allowing for a standard-ish way of doing stream redirects that's idiomatic
   for a BASIC
3. Scanning `--option`s and `-sHoRtOpTs` as CLI arguments instead of parts of
   an expression. I'm going to make this a later milestone and concentrate on
   a base language to start so I can punt on this problem, but the big
   question is whether to introduce context and use different scanning logic
   when handling shell commands, versus having context-independent scanning
   rules that parse those as flags/options regardless of command and treat
   them as syntax errors for native commands. Probably the latter, especially
   if it lets native commands or cmdlets support options/flags.

I'm hopeful that, as I develop the scanner and parser, that I'll be able to
make new combinators which make it easier to define "standard" commands.

One combinator I need to think about is a `synchronize` combinator, which can
eat invalid tokens to the end of the malformed command in an effort to recover.
The point of recovering here is to flag the rest of the obvious syntax errors
in the input without having an avalanche of cascading issues.

I'm doing this in typescript for now, but I may port to rust and nom in the
future. Though, note, rust/nom will require either implementing a `Token` type
or foregoing tokens in favor of lower level str-based combinators.

### Pre-Run Module

Lines are initially parsed without knowing the context of the rest of the
program. A lot can be checked ahead of time - you can even allocate space for
variables ahead of time! But a lot of things will need to be checked or
"filled in" after editing is done but before actually running the `Program`.

This component will basically do a linear scan across the resulting `Program`
and:

1. Ensure variables are defined before they're used
2. Ensure for loops, if statements, and so on, are properly nested/closed
3. Resolve addresses for GOTOs and the like

### Runtime

The runtime maps loosely to `vm.c` in the C lox implementation from CI. It owns
the program counter (instruction pointer) (a `Cursor`) and, most likely, the
call stack and symbol stack as well.

The call stack will likely contain `Cursors`. Note that, when reporting
errors, I can reference line numbers from this stack and look up the
originating code through the `Editor`.

### Command Module

I have some reading to do, frankly, before I fully understand the
responsibilities of this component. I *do* know that it evals the RUN command.
I also suspect it's in charge of loading `autoexec.bas`. This should be
clarified in 6.3 of WIC&I.

### Errors

Errors are going to be a BIG part of the interpreter, especially since most
arbitrary input is going to be a syntax error of some kind. I'm intending
on having a centralized component for now, since Java lox in CI had a
centralized component. In my head, it's in charge of taking error inputs,
formatting them to text, and passing that text to the Host. I suspect other
components will be able to manage their own *state* without its help.

### Interrupts

Interrupts will be interesting, especially in an async context. The primary
use cases for interrupts so far are keyboard interrupts and/or breaking to
debugger, but basically any event will involve an interrupt of some kind.

### Testing

#### Source Language

My thinking here is to make `TEST` and `ASSERT` commands, which - when testing
mode is enabled in the `Runtime` - generate [tape](https://www.npmjs.com/package/tape)
tests. Then, if testing mode is enabled, actually run the tests.

I'll need a pretty reporter. I'm thinking about hooking tape up to
[node-tap's reporter module](https://github.com/tapjs/tapjs/tree/main/src/reporter).

#### Encoding Language

I'll of course need to write tests for *everything*. Because I'm probably
using `tape` to write the source language tests, I'll probably use it to write
the typescript tests too.

Something I want to do for tests is stack effects. Each operation should have
an expected and consistent stack effect. I plan on making a simple DSL that
clocks [factor](https://github.com/factor/factor/blob/master/extra/rot13/rot13.factor#L6)
and generating tests off that.

### Debugging

#### Break-In

I want ctrl-d to pause execution and enter a "debugger" state. This will mean
having to get interrupts right, but it should be a really neat feature.

#### Symbol Dump

See also "heap dumps". In fact, implementing the
[v8 format](https://github.com/jwalton/node-heapsnapshot-parser/blob/master/src/HeapSnapshot.coffee)
might be a good idea.

#### Profiler

I think I can actually leverage some bleeding edge otel shit here. But also,
check out these links:

- <https://github.com/open-telemetry/oteps/blob/main/text/profiles/0212-profiling-vision.md>
- <https://github.com/google/pprof>
- <https://github.com/VictoriaMetrics/VictoriaMetrics#profiling>

A really cool stretch goal would be to implement flame graphs.

#### Help

PJ actually says good errors are better than interactive help. That said, I
should still write documentation.

### Cmdlets

I *think* I can implement commands using classes similar to powershell cmdlets.
Basically a cmdlet would use parser combinators and/or an IR Builder to
implement commands. This could be a REALLY cool way to extend the base
language. But we'll see.

### Require/Import/Source

None of my resources give a treatment to imports. My guess is that each
"import" is basically a separate `Program` keyed by a namespace, and that my
call stack becomes namespace-aware. But this should be pretty late in the
game.

Note that I can't really use the `export` keyword, since that term's overloaded
by exporting env variables. Instead, I'll probably just export "everything"
like Python does by default.

## Next Steps

First, I need to at LEAST finish WIC&I. Doing more of CI would be valuable too.

Then, I just need to implement the base language. I can loosely follow the
structure of CI to inform what direction I go. Unlike CI, I'll want to use
some level of TDD.

In pretty short order - probably after I have call stacks - I'll want to
implement relevant source language testing features. This should open up
possibilities for writing even more tests.

## The Future

once I actually have the bedrock of a working BASIC, there are three general
directions to go in.

first, I'll want to get the base language completed and tested, and have a good
idea of how it's the same or different from other classic BASICs, like
MSX BASIC or C64 BASIC. this may involve porting old BASIC games to s7bas, such
as "acey ducey".

second, the *actual* goal for this project isn't just to write a BASIC, it's
to make a BASIC which can replace bash:

- shell pt 1: the basics
  - `spawn <REDIRECTS>;ARGS` instruction - args can be unquoted but variables must be in `()` or template string
  - `shell <REDIRECTS>;SCRIPT` instruction - minimal script parsing, pass directly to SHELL
    - BONUS: sessions
  - `export VARIABLE`/`unset VARLABLE` - export/unset variable to the env created by spawn/shell
  - `cd`, `dir`, etc - "disk BASIC" inspired directory/file navigation/operations
  - bash-inspired template strings
  - reading and writing files through "named file descriptors"
  - `source FILENAME`
  - `~/.autoexec.bas` support (a la `~/.bashrc`) using `source` functionality
  - did you know about bash's `jobs` command? that could influence how processes are modeled
- shell pt 2: starship
  - `PS1` analogue
  - before/after hooks prompt and spawning/shelling
  - NOTE: needs dates, datetimes + durations
  - script that can be pasted into`autoexec.bas`
  - examples: <https://github.com/starship/starship/tree/master/src/init>
- shell pt 3: shell expressions?
  - `spawn`, `shell`, `call` as expressions
  - bitwise operations, ie pipes
  - note that we can already redirect streams to named pipes through instruction syntax

third, I want MUCH better data structures. in very loose order of priority:

- hashes/dicts - be thoughtful about this!! maybe ruby or posh flavored? maybe an associative `dim`?
- vector/tensor-like arrays/dims
  - should be able to do n-dimensional w/ research and testing
  - should be able to cast 1-d and 2-d to vectors and matrices
  - implement `.\` and `.*`
  - add `'` (transpose)
- dates/datetimes/durations
  - needed for timings, which is a loose prereq for starship support
- objects/records
  - almost certainly prototypal, no such thing as a class
  - has js-like key iterability but treated as public/private properties
- tables + sqlite support
  - inspired by posh
  - possibly inspired by cobol?
  - *possibly* inspired by lua??
  - `select` expression?

## Other Resources

- [MSX2 Technical Handbook](https://konamiman.github.io/MSX2-Technical-Handbook/md/Chapter2.html) - the
  language spec, plus a bunch of detail on the internal memory structure of MSX BASIC
- [choosing a combinator](https://github.com/rust-bakery/nom/blob/main/doc/choosing_a_combinator.md) - the
  go-to resource for figuring out what combinator I need to do rusty things
- [yabasic](https://github.com/marcIhm/yabasic) - a BASIC with good language
  features and a clean codebase. My plan is to target close compatibility with
  yabasic's core language to start, and evolve from there.
- [monkey-rust](https://github.com/Rydgel/monkey-rust) - a good
  example/reference for how to do token-based lexing/parsing with nom
- [nom_locate](https://crates.io/crates/nom_locate) - this library will make
  it easier to track position/spans inside the lexer/parser, which will help
  make MUCH better errors.
- [error management](https://github.com/rust-bakery/nom/blob/main/doc/error_management.md) - nom's
  error handling is a little funky - &str lifetimes are finnicky - and I'll
  need to do some heavy lifting to get useful errors out of it.
- [miette](https://crates.io/crates/miette) - when I'm ready, this should
  help me print dank errors.

# Licenses

- monkey-rust: BSD 3-clause
- yabasic: MIT
