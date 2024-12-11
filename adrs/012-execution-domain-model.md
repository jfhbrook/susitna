# ADR 012 - Execution Domain Model

### Status: Draft

### Josh Holbrook

## Context

Matanuska contains a number of domain concepts to describe the syntax and semantics of source code, parsed trees, and compiled programs. Currently, they are named (and defined) as such:

- **Expressions**: Units of code which apply a stack of _operations_ on _values_ and evaluate to another value. Expressions do not cause side effects directly, though function calls may execute _commands_ which _do_ cause side effects.
- **Values**: Elements within memory that represent numbers, booleans, strings, and various object types. May either be contained within a variable, or specified as a "literal" within source code.
- **Operations** and **Operators** (**source** and **AST**): Elements within _expressions_ that add or remove _values_ from the expression stack when they're evaluated. These have varying semantics, such as having infix/prefix/postfix operators and having operator precedence. Note that _operators_ are the syntactic element, and _operations_ are the corresponding units of execution.
- **Commands**: Units of code which generally invoke state when executed. Commands _may_ take expressions as arguments, but may also include non-expression syntactic elements or other commands. These are generally separated by colons (`:`) within _command groups_.
- **Interactive commands**: Commands which may only be executed in an interactive session, through use of the `command` module. These commands are syntactically within non-line _command groups_.
- **Runtime commands**: Commands which are compiled into chunks and op codes and executed by the `runtime`.
- **Simple** and **complex** commands: Complex commands are commands which _may_ contain other commands. This is in contrast to "simple commands", which _never_ contain other commands. This concept is not currently represented within the source code, but is useful to distinguish in the context of this ADR.
- **Command groups**: A series of commands, separated by colons (`:`). These command groups may form the non-numbered portion of a line, or may constitute "bare" _interactive commands_.
- **Lines**: A command group combined with a preceding line number. Lines are currently contained on a single source line, though that may not be true in the future if newlines can be escaped (like Bash).
- **Instructions**: Collections of _op codes_ and _addresses_ which, when encountered by the runtime, cause some effect to occur.
- **Op codes**: Integer values which, when combined with addresses into _instructions_, cause the `runtime` to execute an "operation". These values are between 0 and 255, and are intended to be represented by bytes (as in bytecode). These are also called "byte codes" - or simply "codes". "Op" is short for "operation".
- **Operations** (**bytecode**): Stateful actions which occur when the `runtime` encounters an _op code_. This is distinct from _operations_ in source or AST code, though they may implement the behavior implied by a source or AST operation.
- **Chunks**: Collections of _bytecode_, along with various pieces of metadata. These form the base units which are executed by the `runtime`. This term comes directly from `Crafting Interpreters`.
- **Bytecode**: The unifying concept around _op codes_, _instructions_ and _chunks_. In other words, _bytecode_ is made up of _chunks_ and _instructions_.

However, in the [MSX Wiki](https://www.msx.org/wiki/Category:MSX-BASIC_Instructions), they very consistently call them "instructions" - and it is believed that the domain model in not _just_ MSX BASIC but most other classic BASIC languages as well.

This raises the question: should Matanuska rename "commands" to "instructions"? If so, how would this decision cascade to the rest of the domain model?

## Motivations for Renaming Commands

The first, and most obvious reason, to rename "commands" to "instructions" is to maintain consistency with MSX BASIC. While this may allow for borrowing more ideas from MSX BASIC (instead of having to invent them), it _also_ makes Matanuska more of a "true BASIC". One of Matanuska's design goals is to, in fact, invoke classic elements of an 80s era BASIC; therefore, this reason is compelling.

But another motivation is that the term "command" is overloaded in Matanuska right now. This can be seen by having to differentiate between "interactive commands" and "runtime commands". While these types of commands are represented similarly in source code, they are executed through very different mechanics. In the former case, they are executed through the `command` module directly from the AST. In the latter, they are compiled into "instructions" or "op codes" and executed through the `runtime`.

This could also be motivated by a desire to align with `WIC&I`. The idea of a separate execution path for commands, through the `command` module, comes directly from this source, which implies that "runtime commands" are not commands in the `WIC&I` model.

## Instructions in ASTs and Bytecode

Consider that we rename "commands" to "instructions", and consider "interactive commands" to be simply "commands", a special case of "instructions". This reveals a new problem: the term "instruction" is already used within the `runtime` to refer to collections of op codes and addresses.

This is not entirely accidental - in traditional BASIC, programs are stored in an uncanny valley between AST and bytecode. Like bytecode, BASIC programs are stored in bytes, with instructions stored in "reverse polish" - but, like an AST, they can be translated back into source code at any time. The structure of BASIC means that source code instructions are exactly equivalent to bytecode instructions. Even as Matanuska diverges from this design, there's still a clear lineage of semantics between the construction of a BASIC source instruction and a bytecode instruction.

On the surface, it may make sense to rename "instructions" in bytecode to some alternative name. However, that's challenging, because "instruction" has particular meaning within the context of bytecode. But consider that "instruction" has general meaning within a language itself, and that - in a sense - the BASIC source and the bytecode constitute different _languages_. In short, "instruction" has the same semantic meaning with the additional context of them being in the source code and AST or in bytecode. This is different from the case of "command", as "interactive commands" are a subtype of source/AST instructions/commands, rather than a type of command distinct from source/AST instructions/commands.

## Decision

Matanuska will modify its definitions for execution domain concepts to align with the following:

- **Instructions** (**Source** or **AST**): Units of code which generally invoke state when executed. These were previously called _commands_. This will extend to other concepts: "instruction groups", "simple instructions", "complex instructions", etc.
- **Commands**: Instructions which are executed in an interactive session. This is similar to the previous idea of _interactive commands_, but also includes "runtime commands" which were executed interactively. Note that, depending on the context, a command _may_ be made up of multiple colon-separated instructions.
- **Runtime instructions**: Instructions which are compiled into chunks and codes and executed by the `runtime`. These were previously called "runtime commands". Often these will simply be called "instructions" - we only need to invoke "runtime instructions" when there's a strong need to exclude "commands".
- **Runtime commands** (or **compiled commands**): Runtime instructions which were sent as commands in the REPL. These are known as "commands" before they are scanned and sorted into runtime instructions, at which point they are known as "runtime commands" or "instructions" depending on the context.
- **Instructions** (**Bytecode**): Instructions in bytecode will continue to be called "instructions", but may be referred to as "bytecode instructions" to distinguish from source or AST instructions.
