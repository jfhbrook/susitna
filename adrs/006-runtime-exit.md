# ADR 006 - Runtime Exit
### Status: Accepted
### Josh Holbrook

## Context

Matanuska supports an `exit` command, which exits the interpreter.

Currently, Matanuska's architecture supports exiting in the CLI through an
exit handler configured in the `Cli` class, and a special exception called
`Exit`. Currently, the `Exit` exception only supports successful exits.

While implementing the `exit` command in Matanuska, I first opted to emit an
event on `Runtime` (which is now an `EventEmitter`), listened to that event in
the `Commander`, and implemented a `Host#exit` method to actually call
`process.exit`.

These two mechanisms are redundant and inconsistent. We would like to find one
mechanism for exiting the application in a non-error context.

### Why an Error? Why in Cli?

Exiting has to be implemented in `Cli` because it contains the top-level error
handling code. This is where we decide how to report on various Errors which
may be thrown by other parts of the application, and how to exit.

The motivation for the exit handler override is entirely testing. When
testing the `Cli` abstraction, I want it to "exit" without actually ending the
process. In the relevant tests, I override the exit handler that asserts the
expected exit code and throws a test-only Error to stop execution and signal
the exit.

The motivation for an `Exit` Error type is largely in anticipation of a
[click-like](https://click.palletsprojects.com/en/8.1.x/) API. It was a
decision made on the guess that being able to exit through exceptions would
be useful. In practice, it's entirely unused outside of the CLI tests.

That said, one nice property of the `Exit` error is that it allows a graceful
shutdown - that is, error handling in the rest of the application can call its
"finally" blocks to cleanly spin down resources before an exit. Calling
`process.exit` directly doesn't allow for that.

### Why Host#exit?

As Matanuska has evolved, it's become clear that the `Host` abstraction owns
much more than just logging - in fact, it owns all "os-level" actions. This
includes things like getting the current UNIX user and the current working
directory. Through this lens, it's appropriate for it to handle exits as well.

This also offers a clear, consistent mechanism for overriding exit behavior -
that is, overriding the Host. The `Cli` class already supports a custom
`Host`, and the tests include a `MockConsoleHost` used for these purposes.
It would be natural to extend `MockConsoleHost` to implement a test-only
behavior for exits as well.

### Why an EventEmitter?

The event emitter interface is largely motivated by an interest in delegating
exit behavior to the `Commander`.

Given you *are* going to delegate to the `Commander`, the alternative to
an event is injecting it as a dependency to the `Runtime`. Events allow
the runtime to be unaware of the commander, at the cost of the commander
being unable to "yield" data back to the runtime.

Unfortunately, there are already reasons to inject the commander into the
runtime. In particular, the commander handles prompting, because it handles
the `readline` interface. This decision was made because readline requires
asynchronous initialization, and because it's higher level than what the
host provides. That decision isn't set in stone, but it *is* really convenient.

While it hasn't been implemented yet, the runtime will need to request input
from the commander *eventually* - so we might as well inject it now and avoid
two interfaces.

But we could also inject the host into the runtime, and have it call `Host#exit`
directly. The alternative to this is implementing proxy methods on the
commander whenever the runtime needs to access anything from the host. But
the host contains a *lot* of functionality, and effectively adding all of the
host's functionality to the commander muddies its interface.

## Decision

1. The `Host` will be injected into the `Runtime`, where its `exit` method will
   be called directly. This will follow a pattern which should become more
   common over time.
2. The `Runtime` will *not* inherit from `EventEmitter`, instead preferring
   to call methods on an injected `Commander` instance. This will create one
   consistent way to call back to the `Commander` that supports "yielding".
3. Runtime options will no longer accept an exit handler. Instead, that
   behavior will be delegated to the already injected Host.
4. `ConsoleHost#exit` will call `process.exit` for now.
5. `MockConsoleHost#exit` will throw a `MockExit` error, maintaining the
   current structure of the tests.
6. The `Exit` exception will be retained as-is for now.

## The Future

The remaining bit of ambiguity is in whether or not `ConsoleHost#exit` should
call `process.exit` directly, or throw the special `Exit` error. As discussed,
the latter is somewhat valuable as a mechanism to allow graceful shutdowns.
This motivates extending `Exit` to take an exit code, and making the host
throw it. However, this removes some responsibility from the host object
and places it on `Cli`, which is a somewhat bitter pill.

In the meantime, calling `process.exit` directly works, and the `Exit`
exception is non-harmful as it stands. This decision can be comfortably
deferred.

