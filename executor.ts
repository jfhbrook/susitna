import * as readline from 'node:readline/promises';
import * as path from 'node:path';

import { Injectable, Inject } from '@nestjs/common';

import { getTracer } from './debug';
import { Chunk } from './bytecode/chunk';
import { commandRunner, ReturnValue } from './commands';
import { compileCommands, compileProgram, CompiledCmd } from './compiler';
import { Config } from './config';
import { Editor } from './editor';
import {
  Exception,
  ParseError,
  ParseWarning,
  mergeParseErrors,
  splitParseError,
} from './exceptions';
import { RuntimeFault } from './faults';
import { inspector } from './format';
import { Host } from './host';
import { Parser, ParseResult } from './parser';
import { Runtime } from './runtime';
import { renderPrompt } from './shell';

import { Line, Cmd, Program } from './ast';

const tracer = getTracer('main');

@Injectable()
export class Executor {
  private parser: Parser;
  private runtime: Runtime;
  private _readline: readline.Interface | null;
  private history: string[];

  private ps1: string = '\\u@\\h:\\w\\$';

  constructor(
    private config: Config,
    private editor: Editor,
    @Inject('Host') private host: Host,
  ) {
    this.parser = new Parser();
    this.runtime = new Runtime(host);
    this._readline = null;
    this.history = [];
  }

  /**
   * Initialize the commander.
   */
  async init(): Promise<void> {
    tracer.open('Executor#init');
    // Ensure the commander's state is clean before initializing.
    await this.close(false);

    await this.loadHistory();

    // TODO: Support for tab-completion
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
    this.readline.on('history', (history) => {
      this.history = history;
    });
    tracer.close();
  }

  /**
   * Close the commander.
   */
  async close(saveHistory: boolean = true): Promise<void> {
    tracer.open('Executor#close');
    let p: Promise<void> = Promise.resolve();

    if (this._readline) {
      const rl = this._readline;
      p = new Promise((resolve, _reject) => {
        rl.once('close', () => {
          tracer.close();
          resolve();
        });
      });

      this._readline.close();
    }

    return Promise.all([
      p,
      saveHistory ? this.saveHistory() : Promise.resolve(),
    ]).then(() => {});
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
      history: this.history,
      historySize: this.config.historySize,
    });
  }

  private get historyFile(): string {
    return path.join(this.host.homedir(), '.matbas_history');
  }

  private async loadHistory(): Promise<void> {
    try {
      this.history = (await this.host.readFile(this.historyFile)).split('\n');
    } catch (err) {
      // TODO: Why is this not logging?
      // if (err.code !== 'ENOENT') {
      this.host.writeWarn(err);
      // }
    }
  }

  private async saveHistory(): Promise<void> {
    try {
      await this.host.writeFile(this.historyFile, this.history.join('\n'));
    } catch (err) {
      this.host.writeWarn(err);
    }
  }

  /**
   * Request input from the user.
   *
   * @param question A question to ask the user.
   * @returns A promise that resolves to the user input.
   */
  input(question: string): Promise<string> {
    return this.readline.question(`${question} > `);
  }

  /**
   * Prompt for a line of source.
   *
   * @param prompt The prompt to display.
   * @returns A promise that resolves to the source line.
   */
  prompt(): Promise<string> {
    return this.readline.question(`${renderPrompt(this.ps1, this.host)} `);
  }

  /**
   * Start a new program and reset the runtime.
   */
  new(filename: string): void {
    this.runtime.reset();
    this.editor.reset();
    this.editor.filename = filename;
    // TODO: Close open file handles on this.host
  }

  /**
   * Load a script into the editor.
   *
   * @param filename The file path to the script.
   * @returns A promise.
   */
  async load(filename: string): Promise<void> {
    const source = await this.host.readFile(filename);

    let result: ParseResult<Program>;

    try {
      result = this.parser.parseProgram(
        source,
        this.host.resolvePath(filename),
      );
    } catch (err) {
      if (err instanceof Exception) {
        throw err;
      }

      throw RuntimeFault.fromException(err);
    }

    const [program, warning] = result;

    this.editor.program = program;
    this.editor.warning = warning;
  }

  /**
   * Save a program.
   *
   * @Returns A promise.
   */
  async save(filename: string | null): Promise<void> {
    if (filename) {
      this.editor.filename = filename;
    }

    await this.host.writeFile(this.editor.filename, this.editor.list() + '\n');
  }

  /**
   * Retrieve listings from the current program.
   *
   * @returns The recreated source of the current program.
   */
  list(): void {
    if (this.editor.warning) {
      this.host.writeWarn(this.editor.warning);
    }

    this.host.writeLine(
      `${this.editor.filename}\n${'-'.repeat(this.editor.filename.length)}`,
    );
    const listings = this.editor.list();
    this.host.writeLine(listings);
  }

  /**
   * Renumber the current program.
   */
  renum(): void {
    this.editor.renum();
  }

  /**
   * Run the script in the editor.
   *
   * @returns A promise.
   */
  async run(): Promise<void> {
    const program = this.editor.program;
    const parseWarning = this.editor.warning;
    const filename = program.filename;

    let chunk: Chunk;
    let warning: ParseWarning | null;

    try {
      const result = compileProgram(program, { filename });
      chunk = result[0];
      warning = result[1];
    } catch (err) {
      if (err instanceof ParseError) {
        err = mergeParseErrors([parseWarning, err]);
      }

      if (err instanceof Exception) {
        this.host.writeException(err);
        return;
      }
      throw err;
    }

    warning = mergeParseErrors([parseWarning, warning]);

    if (warning) {
      this.host.writeWarn(warning);
    }

    this.runtime.interpret(chunk);
  }

  /**
   * Evaluate input.
   *
   * @param input Source code to eval.
   * @returns A promise.
   */
  async eval(input: string): Promise<void> {
    const [result, warning] = this.parser.parseInput(input);

    const splitWarning = splitParseError(warning, 'row');

    for (const row of result.input) {
      const warning = splitWarning[row.row] || null;
      if (row instanceof Line) {
        if (warning) {
          this.host.writeWarn(warning);
        }
        this.editor.setLine(row, warning as ParseWarning);
      } else {
        await this.evalParsedCommands([row, warning as ParseWarning]);
      }
    }
  }

  /**
   * Evaluate a group of commands.
   *
   * @param instrs A group of instructions to evaluate.
   */
  private async evalParsedCommands([
    cmds,
    parseWarning,
  ]: ParseResult<Cmd>): Promise<void> {
    let warning: ParseWarning | null = null;
    try {
      const result = compileCommands(cmds.instructions, {
        filename: '<input>',
        cmdNo: cmds.cmdNo,
        cmdSource: cmds.source,
      });
      const commands = result[0];
      warning = result[1];

      warning = mergeParseErrors([parseWarning, warning]);

      if (warning) {
        this.host.writeWarn(warning);
      }

      const lastCmd = commands.pop();

      for (const cmd of commands) {
        await this.runCompiledCommand(cmd);
      }

      if (lastCmd) {
        const rv = await this.runCompiledCommand(lastCmd);
        if (rv !== null) {
          this.host.writeLine(inspector.format(rv));
        }
      }
    } catch (err) {
      if (err instanceof ParseError) {
        err = mergeParseErrors([parseWarning, err]);
      }

      throw err;
    }
  }

  //
  // Run a compiled command.
  //
  private async runCompiledCommand([
    cmd,
    chunks,
  ]: CompiledCmd): Promise<ReturnValue> {
    // Interpret any chunks.
    const args = chunks.map((c) => {
      return c ? this.runtime.interpret(c) : null;
    });

    if (cmd) {
      // Run an interactive command.
      return await cmd.accept(
        commandRunner(this, this.editor, this.host, args),
      );
    } else {
      // The args really contained the body of the non-interactive
      // command, which we just interpreted.
      return null;
    }
  }
}
