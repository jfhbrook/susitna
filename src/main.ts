import { ConsoleHost } from './host';
import { Translator } from './translator';
import { Commander } from './commander';
import { Editor } from './editor';
import { Runtime } from './runtime';
import { Errors } from './errors';
import { Interrupts } from './interrupts';

export async function main() {
  // TODO: where do global variables live? Especially if global variables
  // can be accessed by the Commander as well as the Runtime...

  // host is an abstract interface for all I/O. This includes:
  //
  // - prompting
  // - logging
  // - stdio
  // - file i/o
  // - serial
  // - sockets
  // - i/o events, such as CTRL-C and CTRL-D
  // - drawing, curses
  //
  // This component is the one which is expected to differ based on the
  // environment - console, graphical, and so on.
  //
  // Notable, it does NOT include formatting internal representations.
  const host = new ConsoleHost();

  // Multiple components can generate errors. This is a central component
  // to handle those errors.
  const errors = new Errors({ host });

  // Various things will be able to interrupt the interpreter. The main use
  // case I have in mind is breaking into debug mode, but it will probably
  // be generalizable to event handling in general (with the ON keyword)
  //
  // I haven't figured out how this abstraction works yet. It might actually
  // need a handle on the runtime and other components, instead of those
  // components getting handles to it - since an interrupt handler is global.
  const interrupts = new Interrupts();

  // Runtime runs programs. This is where the program counter lives. Unlike
  // the commander, it can handle looping.
  const runtime = new Runtime({ host, interrupts, errors });

  // Editor handles adding/removing lines from the program you're editing,
  // abstracting dictionary-like operations.
  const editor = new Editor();

  // Commander is in charge of running non-runtime commands. This includes:
  //
  // - RUN, which calls preRun and kicks off the runtime
  // - LIST, which calls the recreator and passes the results to the Host
  //   directly
  const commander = new Commander({ host, editor, runtime });

  // The translator is where the main REPL logic lives:
  //
  // - reads lines from the host
  // - calls scanner and parser to generate IR
  // - passes commands to the commander
  // - passes edits to the editor
  //
  // It actually does not receive data from the commander or editor - that
  // would go directly to the host.
  //
  // It also handles:
  //
  // - non-interactive sessions, which read from a file and then exit
  // - dropping to debugging mode on a CTRL-D during runtime
  const translator = new Translator({ host, commander, editor });

  // giddyup.
  await translator.run();
}

if (require.main === module) {
  main();
}

