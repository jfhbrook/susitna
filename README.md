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

### stacks

yabasic has two stacks, which I'll probably need some variation of:

- symbol stack - a stack for managing symbols - things like variables, but more broad
- call stack - a stack for managing function calls, gosubs etc

I'm not confident in yabasic's implementation, though. I kinda want to
"step back" and implement smaller versions of these, referencing them if I
ever need them.

### commands

There are a few concepts here:

- the commands themselves, which are distinct from AST and token concerns
- the command runner, which for yabasic is basically just a big fat loop/match
  in main.c

I'll need some kind of "virtual machine" or "interpreter" abstraction for
actually running the commands.

### editor

I implemented an Editor abstraction in s7bas. It's actually quite a bit better
than what's in yabasic, so I should probably reference it.

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
