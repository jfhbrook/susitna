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
expressions. Now is time to add some basic features and button up a few
gaps.

### Prioritized Backlog

- Editing and running
  - [X] upsert lines
  - [X] delete lines
  - [X] fix line deletes
  - [X] load entire program
  - [X] solve contradiction between running program vs input
  - [ ] pass warnings between load and run
    - Attach to the Editor
    - Bite off splitting warnings by row number
  - [ ] reset entire program
  - [ ] editor tests
  - Commands
    - new
      - clear the program
      - clear runtime state
      - close open files
    - load
      - load a program into the Editor
      - optionally run the program
    - save
      - stub it out for now
    - list
      - print the AST in the Editor for now
    - run
- tracing, again
  - manual calls to `tracer.open` and `tracer.close`
    - each span adds a bunch of garbage to the stack trace
    - but you need the helpers, practically speaking, to make sure a trace
      always gets closed
  - "main" tracing actually not useful
- Remove 'peek' from parser (use this.current)
- citree issues
  - parser has problems with Thing! in the middle
  - handle optional semicolons
- add `env` support to `exercise-bike`
- attach cmdNo to AST somehow
- recreator
  - remember, `10 rem` should serialize to `10`
  - make list use recreator
  - make save work
- Write ADR about architectural changes from 002
  - Renamed commander to executor
  - Actual command(s) module executes visitor pattern on interactive commands
  - editing is now in the executor, not the translator
  - translator combined with index and Cli, is basically just the `repl`
    function
  - who should own readline? executor? host? translator?
  - WIC&I didn't have the benefit of OOP, mind you
- Global variables
- If/else
- For and while
- Logical operators
  - [X] Support through the parser
  - [ ] Requires Jump and JumpIfFalse operators
- Complete Print syntax
  - Print can take multiple arguments
  - Print can also take a channel config
- Support `end`
  - In MSX BASIC, `end` closes open files and ends program execution. It's
    distinct from a bare `exit`, insofar as `end` will hand control back to the
    commander in the context of a `run`.
  - In MSX BASIC, `stop` 
- REPL history support
  - Support \# and \! in prompt rendering
- Gotos
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
- PS1/PS2 support
  - `SET PS1` and `SET PS2`?
- "Expect" tests for the REPL and script input
  - Including generated "exceedingly large" tests
- Type-checking compiler
  - Implement type analogues to operations
  - Simulated stack in the compiler
- Escaped newlines

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
  - MSX BASIC uses the `stop` and `cont` commands to control break-in behavior
  - Will need to intercept and handle ctrl-c from readline (ctrl-stop in
    MSX BASIC)
- Symbol dump
- Profiling
  - Line-based for users
  - Opcode-based for me
- Performance tests
  - Benchmarks
  - Profile slow benchmarks
- Editor plugins

### The Future

- String templates
- Module system
- Package manager
- Partial rewrite in Rust and/or C/C++
- Implement entry point in Rust or C/C++
- Rollup "release build"?
- Port to bun?
  - Nice FFI
  - Support for bundled executable
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
- [MSX-BASIC Instructions - MSX Wiki](https://www.msx.org/wiki/Category:MSX-BASIC_Instructions)
- [An Introduction to Programming BBC BASIC](https://www.bbcbasic.co.uk/bbcwin/tutorial/index.html)
- [BASIC Computer Games Microcomputer Edition](https://annarchive.com/files/Basic_Computer_Games_Microcomputer_Edition.pdf)
