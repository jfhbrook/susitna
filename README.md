# shell-basic

My intent is to build a BASIC which can be practically used as a shell.

Building a BASIC is a little involved, and this is roughly my third attempt.

## Prior Attempts

- joshiverse/s7bas - a YOLO attempt at writing a basic from scratch, based
  largely on the MSX Technical Handbook. I learned at TON but ultimately
  realized I needed to step back and figure out how you would actually
  architect a modern BASIC interpreter.
- joshiverse/yabasic-rs - an attempt to port yabasic to rust. everything
  worthwhile from there has been moved to this repo.

## Architecture

These notes describe the intended architecture, based on what I know from
my prior experiments and/or studying yabasic.

### lexing/parsing/etc

I'm confident in these parts:

- lexer - parser combinators which break up input into `Vec<Token>`s. this is
  actually more or less good enough to work off, minus ambiguity with seps.
- parser - parser combinators which turn `Tokens` into `Expr`s, `Statement`s, `Program`s etc

But I need to think about how commands work. I think bison actually
generates the commands as a side effect of parsing - I'll probably want a
separate layer for that.

### symbol and call stacks

yabasic has two stacks, which I'll probably need some variation of:

- symbol stack - a stack for managing symbols - things like variables, but more broad
- call stack - a stack for managing function calls, gosubs etc

this is quite a bit more sophisticated than what MSX BASIC does, which is
have various areas:

- program area (see "program, module")
- various variable and array areas - symbols, sure, but not a *stack*
- stack area - ie. the call stack, but simpler because MSX BASIC did less

I think I ultimately want both a symbol and a call stack, but I don't know
that I want to copy yabasic's implementation. I'd kinda rather learn how those
work from other examples, and then step back and derive them from first
principles.

### program, module

yabasic parses a `Program` as being a collection of separated statements, and
it rips through those statements to get a list of `Command`s, which it then
executes in a VM. by the time you reach this abstraction, all the libraries
have been imported and the line numbers more or less stripped, and otherwise
the commands do the heavy lifting.

s7bas, however, has an abstraction called a `Module`, which constitutes
indexed lines that it can seek through. this is based on how MSX BASIC does
it, but with more modern data structures - though MSX BASIC would represent
the tokens in memory, not the parsed statements as such. executing code would
be a matter of reading the line and parsing it anew every time.

we don't necessarily need to do it *exactly* like an old school BASIC - that
was a pathological memory optimization at the end of the day - and in the case
of yabasic it manages all that stuff through its commands and stacks. I'm
however a little partial to doing it the old school way, perhaps plus-or-minus
some optimizations - for example, storing instructions or commands in that
`Module` data structure instead of tokens.

in my case, there's also a lot of overlap between the needs of a "program"
and a "module". would a program actually be a collection of modules? in the
case of s7bas I punted on that and, while I named my thing `Module`, I was
just treating it as a singular program.

### execution

yabasic has a series of "command" data structures, distinct from AST and token
concerns; and it has a command runner, which is basically a big fat while loop
and match statement. the "interpreter" abstraction in s7bas does something
somewhat similar, though against more or less parsed statements (called
"instructions" - possibly the technical term).

what I like about yabasic's "command" system is that it represents a simplified
"virtual machine" that:

1. has a much smaller surface area than the full statement and expression
   language
2. becomes a loose replacement for the space assembly would've filled in an
   old school BASIC

what I don't like about it as much is that the old school BASIC more or less
models the program in-memory as a kind of vm already - it steps through the
"program" data structure and loads "instructions" into memory much like a
z80 would already.

### editor

I implemented an Editor abstraction in s7bas. It's actually quite a bit better
than what's in yabasic, so I should probably reference it. The `Script`
abstraction will also be useful here.

### host

I implemented a `Host` abstraction in s7bas, which dealt with IO concerns and
which could be plugged into the Editor and/or the headless runtime. I was
pretty happy with it! I think it could be useful going forward.

## Next Steps

first of all, I should do a "real" interpreters book. I think I'm gonna do
`Crafting Interpreters` by robert nystrom. he's chill.

here are some thing I know I need to do just to get a basic feature set:

* `Script` and `Module` from s7bas should be ported over as a single
  abstraction. This was a challenge previously because lines from scripts
  were unparsed. In this version, though, we'll scan the command into tokens
  when it's entered into the editor and execute instructions on the token
  level. this should make it easier.
* `Editor` needs to be ported from s7bas. this is probably straightforward,
  aside from there being no interpreter.
* go through tokens and the scanner and delete most of the yabasic stuff. I
  only need/want a few features from yabasic - I don't need to include the
  tokens for those things! they'll only stand to confuse me.
* start implementing parser code. following yabasic's example isn't going to
  work well for me - instead, reference the parsers I have in s7bas for
  instructions and expressions, but move them over to using `Tokens`.
* clean up the `Tokens` struct. right now it's a straight copy, more or less,
  from monkey-rust, and it has a bunch of optimizations I don't think I need.
  **this will be easiest to test after "hello world" works!**
* implement an interpreter. s7bas uses a program counter variable called `pc`
  to track which line it's executing from a module at a given time. we don't
  want to copy it though - rather, we'd like to try clocking the memory layout
  of MSX BASIC, starting fresh. it also contained the concept of "flags" as
  in a z80, which I think is cute. **this is something more formal knowledge
  of interpreters will help with!**
* implement a symbol stack. I can reference yabasic here to an extent, but
  overall I'm going to want to do this from-scratch. start with cleaning up
  the domain model for symbols and implementing a non-stacking stack which
  just tracks variables. then, start adding contexts and go from there.
  **more formal interpreters experience will help here!**
* implement a call stack. this will be necessary for implementing control flow.
  **more formal interpreters experience will help!!**
* completely overhauling exceptions. right now they're a huge mess - the
  details are noted in the source code. I'll probably want to do this sooner
  rather than later, since I'll have to cheese a lot of stuff to get it all
  working otherwise. `miette` might be useful here.
* implement starter arrays/dims. arrays can have 1 or 2 dimensions, if memory
  serves.
* implement configuration through `~/.autoexec.bas`.

at some point, I'll really need to write some tests. something I found I really
wanted while writing s7bas was a test framework:

* `assert` command that understands top-level operators in exprs
* `Host::assert` method that throws an `AssertError` on `ConsoleHost`
* `test`/`end test` block
* `flags.test` flag that disables the `test` block in non-test modes
* `TestHost` that outputs TAP w/ `testanything` crate
* `s8bas test *.bas` test runner that uses `TestHost` and `flag.test == true`

this would let me write unit tests *in basic*, which would not only help me
actually test the functionality of everything; it would just be a cool feature.

finally, I'll want to implement import. it will help to have the base
interpreter without import fully working, but I should do this sooner rather
than later. in my head, it means extending `pc` to be module-aware, which might
be easy if I decide to make it loop-aware.

a big question is how I want to resolve import paths. I think I want to do a
python/java-like pattern, using a `MODULE_PATH` variable to set where to look
for modules. this pattern also matches with bash's `PATH` variable. it should
also be amenable to virtuelenv-like patterns.

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
- objects
  - almost certainly prototypal, no such thing as a class
  - has js-like key iterability but treated as public/private properties
- tables + sqlite support
  - inspired by posh
  - possibly inspired by cobol?
  - *possibly* inspired by lua??
  - `select` expression?

## Resources

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
