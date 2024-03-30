import { Buffer } from 'buffer';
import { Transform, Writable } from 'stream';

import { ConsoleHost } from '../../host';

/**
 * An input stream for testing.
 */
class MockInputStream extends Transform {
  input: string;

  constructor() {
    super();
    this.input = '';
  }

  _transform(chunk: any, _encoding: any, callback: any) {
    if (chunk instanceof Buffer) {
      this.input += chunk.toString();
    } else {
      this.input += chunk;
    }
    this.push(chunk);
    callback();
  }

  reset() {
    this.input = '';
  }
}

/**
 * An output stream for testing.
 */
class MockOutputStream extends Writable {
  output: string;

  constructor() {
    super();
    this.output = '';
  }

  _write(chunk: any, _encoding: string, callback: any) {
    if (chunk instanceof Buffer) {
      this.output += chunk.toString();
    } else {
      this.output += chunk;
    }
    callback();
  }

  reset() {
    this.output = '';
  }
}

/**
 * A subclass of ConsoleHost with test streams.
 */
export class MockConsoleHost extends ConsoleHost {
  declare inputStream: MockInputStream;
  declare outputStream: MockOutputStream;
  declare errorStream: MockOutputStream;

  constructor() {
    super();
    this.inputStream = new MockInputStream();
    this.outputStream = new MockOutputStream();
    this.errorStream = new MockOutputStream();
  }

  hostname(): string {
    return 'gibson.local';
  }

  tty(): string | null {
    return 'tty0';
  }

  shell(): string {
    return 'matbas';
  }

  now(): Date {
    // TODO: Because I'm not handling time zones at all, tests using this
    // only past in Alaska in the summer.
    return new Date('23 Jun 2024 13:00:00 PST');
  }

  uid(): number {
    return 1000;
  }

  gid(): number {
    return 50;
  }

  username(): string {
    return 'josh';
  }

  homedir(): string {
    return '/Users/josh';
  }

  cwd(): string {
    return '/Users/josh/Software/jfhbrook/matanuska';
  }
}
