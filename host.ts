import { basename } from 'path';
import * as os from 'os';
import { spawnSync } from 'child_process';
import { stdin, stdout, stderr } from 'node:process';
import { Readable, Writable } from 'stream';

import { BaseException } from './exceptions';
import { DefaultFormatter, FormatValue } from './format';

/**
 * A logging level.
 */
export enum Level {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
}

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
  //
  // Ground floor I/O. IO is exposed as stdio streams so that lower level
  // components (like readline) can use them directly.
  //

  /**
   * The standard input stream.
   */
  inputStream: Readable;

  /**
   * The standard output stream.
   */
  outputStream: Writable;

  /**
   * The standard error stream.
   */
  errorStream: Writable;

  //
  // Logging concerns. It's arguable these shouldn't be the Host's problem,
  // but it needs to work at the ground floor, so we do it here.
  //

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

  /**
   * The OS's hostname.
   */
  hostname(): string;

  /**
   * The OS's tty (if available).
   */
  tty(): string | null;

  /**
   * The basename of Matanuska BASIC's entry point script. This is a decent
   * approximation for the shell command as invoked.
   */
  shell(): string;

  /**
   * The current date and time.
   */
  now(): Date;

  /**
   * The current user's uid.
   */
  uid(): number;

  /**
   * The current user's gid.
   */
  gid(): number;

  /**
   * The current user's username.
   */
  username(): string;

  /**
   * The current user's home directory.
   */
  homedir(): string;

  /**
   * The process's current working directory. This is not the same as the
   * shell's current working directory.
   */
  cwd(): string;
}

/**
 * A host for a standard terminal console.
 */
export class ConsoleHost implements Host {
  private formatter = new DefaultFormatter();
  inputStream: Readable;
  outputStream: Writable;
  errorStream: Writable;
  level: Level;

  private _tty: string | null | undefined = undefined;

  constructor() {
    this.inputStream = stdin;
    this.outputStream = stdout;
    this.errorStream = stderr;
  }

  setLevel(level: Level): void {
    this.level = level;
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

  //
  // OS and environment concerns.
  //

  hostname(): string {
    return os.hostname();
  }

  tty(): string | null {
    if (typeof this._tty === 'undefined') {
      try {
        // I'm running this synronously because I assume it will be a quick
        // process and that it will only need to run once (since a process's
        // TTY never changes).
        const { stdout } = spawnSync('tty');
        this._tty = stdout.toString().trim();
      } catch (err) {
        // I'm assuming that if this fails, it's because it ultimately doesn't
        // make sense to ascribe a TTY to the process. But it would be nice
        // to have tracing for this, in some capacity.
        this._tty = null;
      }
    }

    return this._tty;
  }

  // In bash this is from the raw arguments before shebangs. Node doesn't quite
  // give us that, BUT pulling the basename of the second argument is probably
  // good enough for government work.
  shell(): string {
    return basename(process.argv[1]);
  }

  // TODO: JavaScript Dates aren't very good. Is there a sensible replacement?
  // TODO: Can we control locale-awareness better?
  now(): Date {
    return new Date();
  }

  uid(): number {
    return os.userInfo().uid;
  }

  gid(): number {
    return os.userInfo().gid;
  }

  username(): string {
    return os.userInfo().username;
  }

  homedir(): string {
    return os.homedir();
  }

  cwd(): string {
    return process.cwd();
  }
}
