import { stdin, stdout, stderr } from 'node:process';
import * as readline from 'node:readline/promises';
import { Readable, Writable } from 'stream';
import { format } from 'util';

import { BaseException } from './exceptions';
import { PrettyFormatter, FormatValue } from './format';

/**
 * A logging level.
 */
export enum Level {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
}

export interface ReadLineOptions {}

export interface LoggingOptions {
  /**
   * An optional logging level. Defaults to Info.
   */
  level?: Level;
}

/**
 * Initialization options for the host.
 */
export type InitOptions = ReadLineOptions & LoggingOptions;

/**
 * An interface that encapsulates platform specific behavior. This includes:
 *
 * - Writing to output, error and logging channels
 * - Reading user input
 * - Reading source lines and interactive commands
 * - I/O for files and custom channels
 * - Process management
 * - Networking
 */
export interface Host {
  /**
   * Initialize the host. Called by the command module.
   */
  init(options: InitOptions): Promise<void>;

  /**
   * Close the host, cleaning up any open resources. Called by the command
   * module.
   */
  close(): Promise<void>;

  /**
   * The current logging level. Used to suppress debug, info and warning
   * messages.
   */
  level: Level;

  /**
   * Set the current logging level.
   *
   * @param level The new logging level.
   */
  setLevel(level: Level): void;

  /**
   * Request input from the user.
   *
   * @param question A question to ask the user.
   * @returns A promise that resolves to the user input.
   */
  input(question: string): Promise<string>;

  /**
   * Prompt for a line of source.
   *
   * @param prompt The prompt to display.
   * @returns A promise that resolves to the source line.
   */
  prompt(prompt: string): Promise<string>;

  /**
   * Write a value to the output channel.
   *
   * @param value The value to write.
   */
  writeOut(value: FormatValue): void;

  /**
   * Write a value to the error channel.
   *
   * @param value The value to write.
   */
  writeError(value: FormatValue): void;

  /**
   * Write a value to the debug channel. If the log level is not inclusive of
   * Debug, no output is written.
   *
   * @param value The value to write.
   */
  writeDebug(value: FormatValue): void;

  /**
   * Write a value to the info channel. If the log level is not inclusive of
   * Info, no output is written.
   *
   * @param value The value to write.
   */
  writeInfo(value: FormatValue): void;

  /**
   * Write a value to the warn channel. If the log level is not inclusive of
   * Warn, no output is written.
   *
   * @param value The value to write.
   */
  writeWarn(value: FormatValue): void;

  /**
   * Write an Exception to the error channel.
   *
   * @param exception The exception to write.
   */
  writeException(value: FormatValue): void;

  /**
   * Write a value to a numbered channel. The standard channels are:
   *
   * 1 - Output
   * 2 - Error
   * 3 - Warn
   * 4 - Info
   * 5 - Debug
   *
   * Channels 1 and 2 correspond to stdout and stderr, respectively. Channels 3-5 are treated as logging methods.
   *
   * In the future, custom channels may be supported as an abstraction over
   * file descriptors.
   *
   * @param channel The channel to write to.
   * @param value The value to write.
   */
  writeChannel(channel: number, value: FormatValue): void;
}

/**
 * A host for a standard terminal console.
 */
export class ConsoleHost implements Host {
  private formatter = new PrettyFormatter();
  inputStream: Readable;
  outputStream: Writable;
  errorStream: Writable;
  private _readline: readline.Interface | null;
  level: Level;

  constructor() {
    this.inputStream = stdin;
    this.outputStream = stdout;
    this.errorStream = stderr;
    this.level = Level.Info;
    this._readline = null;
  }

  private get readline(): readline.Interface {
    if (this._readline === null) {
      // If readline hasn't been initialized, create a default one.
      this._readline = this.createInterface({});
    }

    return this._readline;
  }

  private set readline(rl: readline.Interface) {
    this._readline = rl;
  }

  private createInterface(options: ReadLineOptions): readline.Interface {
    return readline.createInterface({
      input: this.inputStream,
      output: this.outputStream,
      terminal: true,
    });
  }

  async init(options: InitOptions): Promise<void> {
    await this.close();

    if (options.level) {
      this.setLevel(options.level);
    }

    // TODO: Support for tab-completion and history. Note:
    // - Tab complete will only apply for source input.
    // - History will be different between user and source input.
    this.readline = this.createInterface(options);
  }

  async close(): Promise<void> {
    let p: Promise<void> = Promise.resolve();

    if (this._readline) {
      p = new Promise((resolve, reject) => {
        this._readline.once('close', () => resolve());
      });

      this._readline.close();
    }

    return p;
  }

  setLevel(level: Level): void {
    this.level = level;
  }

  input(question: string): Promise<string> {
    return this.readline.question(`${question} > `);
  }

  prompt(prompt: string): Promise<string> {
    return this.readline.question(prompt);
  }

  writeOut(value: FormatValue): void {
    this.outputStream.write(value);
  }

  writeError(value: FormatValue): void {
    this.errorStream.write(this.formatter.format(value));
  }

  writeDebug(value: FormatValue): void {
    if (this.level <= Level.Debug) {
      this.errorStream.write(`DEBUG: ${this.formatter.format(value)}\n`);
    }
  }

  writeInfo(value: FormatValue): void {
    if (this.level <= Level.Info) {
      this.errorStream.write(`INFO: ${this.formatter.format(value)}\n`);
    }
  }

  writeWarn(value: FormatValue): void {
    if (this.level <= Level.Warn) {
      this.errorStream.write(`WARN: ${this.formatter.format(value)}\n`);
    }
  }

  writeException(value: FormatValue): void {
    let exc = value;
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      exc = new BaseException(String(value), null);
    }

    this.errorStream.write(`${this.formatter.format(exc)}\n`);
  }

  writeChannel(channel: number, value: FormatValue): void {
    switch (channel) {
      case 1:
        this.writeOut(value);
        break;
      case 2:
        this.writeError(value);
        break;
      case 3:
        this.writeWarn(value);
        break;
      case 4:
        this.writeInfo(value);
        break;
      case 5:
        this.writeDebug(value);
        break;
      default:
        // TODO: Custom channels + file descriptors
        // TODO: IOError for unknown channel
        this.writeException(`Unknown channel: ${channel}`);
    }
  }
}
