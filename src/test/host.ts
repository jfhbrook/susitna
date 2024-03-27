import { Buffer } from 'buffer';
import { Transform, Writable } from 'stream';

import { ConsoleHost } from '../host';

/**
 * Generate the ANSI escape code for moving the cursor to a particular column.
 * Needed to test the output of the readline interface.
 *
 * @param column The column to move the cursor to.
 */
export function moveCursorTo(column: number): string {
  return `\u001b[${column}G`;
}

/**
 * The ANSI escape code for erasing until the end of the screen.
 * Needed to test the output of the readline interface.
 */
export const ERASE_TO_END = `\u001b[0J`;

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
  inputStream: MockInputStream;
  outputStream: MockOutputStream;
  errorStream: MockOutputStream;

  constructor() {
    super();
    this.inputStream = new MockInputStream();
    this.outputStream = new MockOutputStream();
    this.errorStream = new MockOutputStream();
  }
}
