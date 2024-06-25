# Matanuska BASIC

Matanuska is a BASIC dialect designed for use as a shell.  It asks what it
would've been like if the classic 80s BASIC was better able to rise to the
occasion when it came to disk features and/or competing with DOS.

Matanuska is still in development, and needs a lot of work before it's ready
for regular use. 

## Install

There currently aren't any installable packages for Matanuska. If you would
like to try it today, follow the instructions for development.

## Development

Matanuska BASIC uses `npm` for all of its tasks. Refer to `package.json`
for details.

## ADRs

Architectural decisions are documented in [./adrs](./adrs). Notes on future
decisions I haven't made yet are in [./adrs/draft](./adrs/draft).

## Current Status and Next Steps

The interpreter can run "hello world" in a REPL and evaluate simple
expressions. But it's brittle, and has a lot of gaps.

### Near Term Polish

- [ ] Format ZeroDivisionError
- Interpreted/compiled mixed commands support in the compiler
  - Merge errors from parser and compiler when running files
- Test programs with asserted output
  - Including generated "exceedingly large" tests
- Escaped newlines

### New Features

- Editing
  - Editor class
  - Editor commands
  - Syntax for blank (not removed) line
- Complete Print syntax
  - Print can take multiple arguments
  - Print can also take a channel config
- Code formatting
- Shell commands
  - Will need to research jobs in Bash
  - Scanner and parser support for shell commands and "shell tokens"
  - Compiler support for shell commands
  - Host support for shell commands
  - Runtime support for shell commands
  - Support \j in prompt rendering
  - (Pipes will come later)
- Shell variable export
- Date/Time/Duration/TZData types
  - Core library
  - Host support
  - (Language support can come later)
- REPL history support
  - Support \# and \! in prompt rendering
- Global variables
- PS1/PS2 support
  - `SET PS1` and `SET PS2`?
- If/else
- For and while
- Gotos
- Logical operators
  - [X] Support through the parser
  - [ ] Requires Jump and JumpIfFalse operators
- "Expect" tests for the REPL and script input
- Type-checking compiler
  - [ ] Implement type analogs to operations
  - [ ] Simulated stack in the compiler

### Up Next

- Arrays
  - Including array literals - BASIC assigns each index one at a time, or
    uses the `data` command
- Functions and/or subroutines
  - Local variables
  - Closures
  - Native functions
- Implement Acey Ducey
  - `center$(n)`
  - `rnd!` (random) function
  - If/then/goto
  - functions
  - no-arguments print
  - `end` command
- Hashes
- Date/time language support
- Exception language support
- Test harness
  - `test` and `assert` commands
  - Runtime "test mode" and entrypoint subcommand
  - Reporter, possibly based off node-tap
- File I/O
- Research garbage collection
  - TypeScript is obviously garbage collected
  - But the architecture may hang onto references I don't want
- Tab-complete support in the REPL
- Starship support
- Stream/pipe support
- Break-in
  - Will need to intercept and handle ctrl-c from readline
  - Will likely need lock/unlock opcodes
- Symbol dump
- Profiling
  - Line-based for users
  - Opcode-based for me
- Performance tests
  - Benchmarks
  - Profile slow benchmarks
- Editor plugins

### The Future

- Run tests with GitHub Actions
- String templates
- Module system
- Package manager
- Partial rewrite in Rust and/or C/C++
- Implement entry point in Rust or C/C++
- Rollup "release build"
- Object support
- Vector/matrix support for 1D/2D integer/float arrays
- Assembler mini-language

## Resources

- [Architecture Diagram on Google Drawings](https://docs.google.com/drawings/d/1RmTGs-GMPhkeLOoZW9sSs_WXXnlG2CRBoIJOK83_qkk/edit?usp=sharing)
- [Crafting Interpreters](https://craftinginterpreters.com/contents.html) by Robert Nystrom
  - My implementations of lox: <https://github.com/jfhbrook/crafting-interpreters>
  - [A blog series on adding exception handling to clox](https://amillioncodemonkeys.com/2021/02/03/interpreter-exception-handling-implementation/)
- `Writing Interactive Compilers and Interpreters` by PJ Brown
- `Modern MSX BASIC Game Development` by Raul Portales
- [List of Java bytecode instructions](https://en.m.wikipedia.org/wiki/List_of_Java_bytecode_instructions)
- [Z80 Instruction Set (Complete)](https://ftp83plus.net/Tutorials/z80inset_fullA.htm)
- [OpenJDK Architecture](https://www.dcs.gla.ac.uk/~jsinger/pdfs/sicsa_openjdk/OpenJDKArchitecture.pdf)
- [cpython internals](https://devguide.python.org/internals/)
  - [Python disassembler](https://docs.python.org/3/library/dis.html)
- [MSX2 Technical Handbook](https://github.com/Konamiman/MSX2-Technical-Handbook/blob/master/md/Chapter2.md/)
- [An Introduction to Programming BBC BASIC](https://www.bbcbasic.co.uk/bbcwin/tutorial/index.html)
- [BASIC Computer Games Microcomputer Edition](https://annarchive.com/files/Basic_Computer_Games_Microcomputer_Edition.pdf)
