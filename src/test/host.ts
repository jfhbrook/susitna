import { Buffer } from 'buffer';
import { Transform, Writable } from 'stream';

import { ConsoleHost } from '../host';

/**
 * An input stream for testing.
 */
class InputStream extends Transform {
  input: Array<string>;

  _transform(chunk: any, _encoding: any, callback: any) {
    if (chunk instanceof Buffer) {
      this.input.push(chunk.toString());
    } else {
      this.input.push(chunk);
    }
    this.push(chunk);
    callback();
  }

  reset() {
    this.input = [];
  }
}

/**
 * An output stream for testing.
 */
class OutputStream extends Writable {
  output: Array<string>;

  constructor() {
    super();
    this.output = [];
  }

  _write(chunk: any, _encoding: string, callback: any) {
    if (chunk instanceof Buffer) {
      this.output.push(chunk.toString());
    } else {
      this.output.push(chunk);
    }
    callback();
  }

  reset() {
    this.output = [];
  }
}

/**
 * A subclass of ConsoleHost with test streams.
 */
export class TestConsoleHost extends ConsoleHost {
  constructor() {
    super();
    this.inputStream = new InputStream();
    this.outputStream = new OutputStream();
    this.errorStream = new OutputStream();
  }
}
