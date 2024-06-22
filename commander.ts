import * as readline from 'node:readline/promises';

import { getTracer } from './debug';
import { Chunk } from './bytecode/chunk';
import { compile } from './compiler';
import { Config } from './config';
import { Exception } from './exceptions';
import { Host } from './host';
import { Runtime } from './runtime';
import { renderPrompt } from './shell';
import { Value } from './value';

import { CommandGroup, Program } from './ast';
import { Cmd, CmdVisitor, Exit, Print, Expression } from './ast/cmd';

const tracer = getTracer('main');

export class Commander implements CmdVisitor<Value | null> {
  private runtime: Runtime;
  private _readline: readline.Interface | null;

  private ps1: string = '\\u@\\h:\\w\\$';

  private lineNo: number = -1;

  constructor(
    private _config: Config,
    private host: Host,
  ) {
    this.runtime = new Runtime(host);
    this._readline = null;
  }

  /**
   * Initialize the commander.
   */
  async init(): Promise<void> {
    return await tracer.span('Commander.init', async () => {
      // Ensure the commander's state is clean before initializing.
      await this.close();

      // TODO: Support for tab-completion and history. Note:
      // - Tab complete will only apply for source input.
      // - History will be different between user and source input.
      this.readline = this.createInterface();

      // TODO: Node's behavior on first press is to print:
      //
      //     (To exit, press Ctrl+C again or Ctrl+D or type .exit)
      //
      // Python's behavior is to raise a KeyboardInterrupt, which the REPL logs
      // and otherwise ignores.
      //
      // Neither behavior is simple. Node's behavior requires tracking state
      // in the Translator - count sigints, reset to zero on any new input.
      // You'd have to expose this event to the Translator. Python's behavior
      // seems simpler - throw an Error - but any error thrown here is thrown
      // asynchronously and the context is lost. Again, you would need to emit
      // an event on the Host and handle it in the Translator.
      //
      // If there's no handler at *all*, the default behavior is ostensibly to
      // call readline.pause() - here, we're calling this.close() which also
      // calls readline.close(). The latter ostensibly causes readline.question
      // to throw an error. *Practically speaking* this causes the process to
      // quietly exit - I believe it *is* throwing an error, but that Node is
      // checking the type and deciding not to log it. That said, who knows.
      //
      // Either way, I should dig into this more.
      this.readline.on('SIGINT', () => {
        this.host.writeError('\n');
        this.host.writeDebug('Received SIGINT (ctrl-c)');
        this.close();
      });
    });
  }

  /**
   * Close the commander.
   */
  async close(): Promise<void> {
    return tracer.span('Commander.close', () => {
      let p: Promise<void> = Promise.resolve();

      if (this._readline) {
        p = new Promise((resolve, _reject) => {
          this._readline.once('close', () => resolve());
        });

        this._readline.close();
      }

      return p;
    });
  }

  /**
   * Use the commander. Initializes the commander, runs the provided function,
   * and closes the commander afterwards.
   */
  async using(fn: () => Promise<void>): Promise<void> {
    await this.init();
    try {
      await fn();
    } finally {
      await this.close();
    }
  }

  private get readline(): readline.Interface {
    if (this._readline === null) {
      // If readline hasn't been initialized, create a default one.
      this._readline = this.createInterface();
    }

    return this._readline;
  }

  private set readline(rl: readline.Interface) {
    this._readline = rl;
  }

  private createInterface(): readline.Interface {
    return readline.createInterface({
      input: this.host.inputStream,
      output: this.host.outputStream,
      terminal: true,
    });
  }

  /**
   * Request input from the user.
   *
   * @param question A question to ask the user.
   * @returns A promise that resolves to the user input.
   */
  input(question: string): Promise<string> {
    return tracer.span('Commander.input', () => {
      return this.readline.question(`${question} > `);
    });
  }

  /**
   * Prompt for a line of source.
   *
   * @param prompt The prompt to display.
   * @returns A promise that resolves to the source line.
   */
  prompt(): Promise<string> {
    return tracer.span('Commander.prompt', () => {
      return this.readline.question(`${renderPrompt(this.ps1, this.host)} `);
    });
  }

  /**
   * Evaluate a command group.
   *
   * @param cmds A group of commands to evaluate.
   */
  async evalCommands(cmds: CommandGroup): Promise<void> {
    return tracer.span('evalCommands', async () => {
      try {
        const commands = Array.from(cmds.commands);
        const lastCmd = commands.pop();
        for (const cmd of commands) {
          cmd.accept(this);
        }

        if (lastCmd) {
          const rv = lastCmd.accept(this);
          if (rv !== null) {
            this.host.writeLine(rv);
          }
        }
      } catch (err) {
        if (err instanceof Exception) {
          this.host.writeException(err);
          return;
        }
        throw err;
      }
    });
  }

  async evalProgram(program: Program, filename: string): Promise<void> {
    return tracer.span('evalProgram', async () => {
      let chunk: Chunk;
      try {
        chunk = compile(program, { filename });
      } catch (err) {
        if (err instanceof Exception) {
          this.host.writeException(err);
          return;
        }
        throw err;
      }

      this.runtime.interpret(chunk);
    });
  }

  //
  // Non-program commands.
  //

  visitPrintCmd(print: Print): Value | null {
    this.runCommand(print);
    return null;
  }

  visitExitCmd(exit: Exit): Value | null {
    this.runCommand(exit);
    return null;
  }

  visitExpressionCmd(expression: Expression): Value | null {
    return this.runCommand(expression);
  }

  //
  // Run a compiled command.
  //

  private runCommand(cmd: Cmd): Value {
    return tracer.spanSync('runCommand', () => {
      let chunk: Chunk;
      try {
        // TODO: Plug readline history into cmdNo
        chunk = compile(cmd, { cmdNo: 100 });
      } catch (err) {
        if (err instanceof Exception) {
          this.host.writeException(err);
          return;
        }
        throw err;
      }
      return this.runtime.interpret(chunk);
    });
  }
}
