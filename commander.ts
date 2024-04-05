import * as readline from 'node:readline/promises';

import { span } from './trace';
import { Compiler } from './compiler';
import { Config } from './config';
import { formatter } from './format';
import { Host } from './host';
import { Runtime, RuntimeResult } from './runtime';
import { Ok, Err, Warn } from './result';
import { renderPrompt } from './shell';

import { TreeVisitor, CommandGroup, Line, Input, Program } from './ast';

export class Commander implements TreeVisitor<Promise<RuntimeResult>> {
  private compiler: Compiler;
  private runtime: Runtime;
  private _readline: readline.Interface | null;

  private ps1: string = '\\u@\\h:\\w\\$';

  constructor(
    private _config: Config,
    private host: Host,
  ) {
    this.compiler = new Compiler();
    this.runtime = new Runtime(host);
    this._readline = null;
  }

  /**
   * Initialize the commander.
   */
  async init(): Promise<void> {
    return await span('Commander.init', async () => {
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
    return span('Commander.close', () => {
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
    return span('Commander.input', () => {
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
    return span('Commander.prompt', () => {
      return this.readline.question(`${renderPrompt(this.ps1, this.host)} `);
    });
  }

  /**
   * Evaluate input or a program.
   *
   * @param tree An input or program to evaluate.
   */
  async eval(tree: Input | Program): Promise<void> {
    return span('eval', async () => {
      const compilerResult = this.compiler.compile(tree);

      if (compilerResult instanceof Err) {
        this.host.writeException(compilerResult.error);
        return null;
      }

      if (compilerResult instanceof Warn) {
        this.host.writeWarn(compilerResult.warning);
      }

      const compiled = compilerResult.result;

      const evalResult = await compiled.accept(this);

      if (evalResult instanceof Err) {
        this.host.writeException(formatter.format(evalResult.error));
        return;
      }

      if (evalResult instanceof Warn) {
        this.host.writeWarn(formatter.format(evalResult.warning));
      }

      if (typeof evalResult.result !== 'undefined') {
        this.host.writeOut(formatter.format(evalResult.result) + '\n');
      }
    });
  }

  // Evaluate the group of commands.
  async visitCommandGroupTree(group: CommandGroup): Promise<RuntimeResult> {
    return span('eval command group', async () => {
      return group.accept(this.runtime);
    });
  }

  // Add the line to the editor.
  async visitLineTree(_line: Line): Promise<RuntimeResult> {
    return span('eval line', async () => {
      console.log('TODO: Add line to editor');
      return new Ok(null);
    });
  }

  // Visit each row (a Line or CommandGroup) in the input.
  async visitInputTree(input: Input): Promise<RuntimeResult> {
    return span('eval input', async () => {
      let result: RuntimeResult;
      for (const row of input.input) {
        result = await row.accept(this);
      }
      return result;
    });
  }

  // Evaluate the program.
  async visitProgramTree(program: Program): Promise<RuntimeResult> {
    return span('eval program', async () => {
      return program.accept(this.runtime);
    });
  }
}
