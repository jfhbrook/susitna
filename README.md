# shell-basic

My intent is to build a BASIC which can be practically used as a shell.

Building a BASIC is a little involved, and this is roughly my third attempt.

## Prior Attempts

- joshiverse/s7bas - a YOLO attempt at writing a basic from scratch. I learned
  at TON but ultimately realized I needed to step back and figure out how a
  "real" BASIC works.
- joshiverse/yabasic-rs - an attempt to port yabasic to rust. really good
  progress on porting yabasic's lexer to nom, but I ran into a lot of issues I
  had to research to get past. The parser was a bit less fleshed out.

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

I'm not confident in yabasic's implementation, though. I kinda want to
"step back" and implement smaller versions of these, referencing them if I
ever need them.

### program, module

yabasic parses a `Program` as being a collection of separated statements, and
it rips through those statements to get a list of `Command`s, which it then
executes in a VM. by the time you reach this abstraction, all the libraries
have been imported and the line numbers more or less stripped, and otherwise
the commands do the heavy lifting.

s7bas, however, has an abstraction called a `Module`, which constitutes
indexed lines that it can seek through. this is almost certainly more true to
an old school BASIC, where you would represent the program as ordered lines
parsed to the token level in memory. executing code would be a matter of
reading the line and parsing it anew every time.

we don't necessarily need to do it *exactly* like an old school BASIC - that
was a pathological memory optimization at the end of the day - and in the case
of yabasic it manages all that stuff through its commands and stacks. I'm
however a little partial to doing it the old school way, perhaps plus-or-minus
some optimizations - for example, storing commands in that `Module` data
structure instead of tokens.

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

probably what I'll do is implement "commands" as methods instead of as
enums that get matched. that will help me encapsulate some common tasks
that would need to happen for any given instruction, but will be more direct.

### editor

I implemented an Editor abstraction in s7bas. It's actually quite a bit better
than what's in yabasic, so I should probably reference it. The `Script`
abstraction will also be useful here.

### host

I implemented a `Host` abstraction in s7bas, which dealt with IO concerns and
which could be plugged into the Editor and/or the headless runtime. I was
pretty happy with it! I think it could be useful going forward.

## Next Steps

I made good progress studying yabasic's parsing code. I now have a pretty
robust lexer, I have some ideas for parsing, and I know that I need a call
stack and symbol stack. But I think my ability to learn from yabasic is
going to be limited going forward - its penchant for side effects is very
different from what I'm doing!

I think the next stage might actually be to step through an interpreters
book? Like the one monkey-rust is based on? Maybe I read that book and
reference monkey-rust, and I'll know enough to make a clean attempt at the
other abstractions.

## Resources

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
