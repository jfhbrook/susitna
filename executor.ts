import { readFile, writeFile } from 'fs/promises';
import * as readline from 'node:readline/promises';

import { getTracer } from './debug';
import { Chunk } from './bytecode/chunk';
import { commandRunner, ReturnValue } from './commands';
import { compileCommands, compileProgram, CompiledCmd } from './compiler';
import { Config } from './config';
import { Editor } from './editor';
import {
  Exception,
  FileError,
  ParseError,
  ParseWarning,
  mergeParseErrors,
  splitParseError,
} from './exceptions';
import { RuntimeFault } from './faults';
import { inspector } from './format';
import { Host } from './host';
import { parseInput, parseProgram, ParseResult } from './parser';
import { Runtime } from './runtime';
import { renderPrompt } from './shell';

import { Line, CommandGroup, Program } from './ast';

const tracer = getTracer('main');

export class Executor {
  private runtime: Runtime;
  private _readline: readline.Interface | null;

  private ps1: string = '\\u@\\h:\\w\\$';

  private cmdNo: number = 0;
  private cmdSource: string = '';

  constructor(
    private _config: Config,
    private editor: Editor,
    private host: Host,
  ) {
    this.runtime = new Runtime(host);
    this._readline = null;
  }

  /**
   * Initialize the commander.
   */
  async init(): Promise<void> {
    tracer.open('Executor#init');
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
    tracer.close();
  }

  /**
   * Close the commander.
   */
  async close(): Promise<void> {
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

    return p;
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
   * Log that a command executed successfully.
   */
  ok(): void {
    this.host.writeLine('Ok');
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
    // TODO: This readFile call should be moved into the host
    let source: string;
    try {
      source = await readFile(filename, 'utf8');
    } catch (err) {
      throw FileError.fromError(null, err);
    }

    let result: ParseResult<Program>;

    // TODO: filename and warning should be a property on the Program
    try {
      result = parseProgram(source, filename);
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

    // TODO: This writeFile call should be moved into the host
    try {
      writeFile(this.editor.filename, this.editor.list() + '\n', 'utf8');
    } catch (err) {
      throw FileError.fromError(null, err);
    }
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
    const listings = this.editor.list();
    this.host.writeLine(listings);
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
    const [result, warning] = parseInput(input);

    const splitWarning = splitParseError(warning, 'row');

    for (const row of result.input) {
      const warning = splitWarning[row.row] || null;
      if (row instanceof Line) {
        if (warning) {
          this.host.writeWarn(warning);
        }
        this.editor.setLine(row, warning);
      } else {
        await this.evalParsedCommands([row, warning]);
      }
    }
  }

  /**
   * Evaluate a command group.
   *
   * @param cmds A group of commands to evaluate.
   */
  private async evalParsedCommands([
    cmds,
    parseWarning,
  ]: ParseResult<CommandGroup>): Promise<void> {
    // TODO: This should be getting attached in either the parser or
    // the translator
    this.cmdNo += 10;
    this.cmdSource = cmds.source;

    let warning: ParseWarning | null = null;
    try {
      const result = compileCommands(cmds.commands, {
        filename: '<input>',
        cmdNo: this.cmdNo,
        cmdSource: this.cmdSource,
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

      // Ok!!
      this.ok();
    } catch (err) {
      if (err instanceof ParseError) {
        err = mergeParseErrors([parseWarning, err]);
      }

      throw err;
    }

    this.cmdSource = '';
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
