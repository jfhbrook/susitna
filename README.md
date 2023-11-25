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
