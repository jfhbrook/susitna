import * as assert from 'assert';

import t from 'tap';
import { Test } from 'tap';

import { Formatter, DefaultFormatter } from '../format';

import { ErrorCode } from '../errors';
import {
  BaseException,
  AssertionError,
  BaseWarning,
  OsError,
  FileError,
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
} from '../exceptions';
import { Exit, ExitCode } from '../exit';
import { BaseFault, RuntimeFault, UsageFault } from '../faults';
import { Traceback, Frame, Code } from '../traceback';
import { FILENAME, FRAME, CODE, TRACEBACK } from './helpers/traceback';

const LINE = '100 print someFn(ident';

function formatTestSuite<F extends Formatter>(formatter: F): void {
  t.test(`given a ${formatter.constructor.name}`, async (t: Test) => {
    t.test('it formats a string', async (t: Test) => {
      t.matchSnapshot(formatter.format('hello'));
    });

    t.test('it formats a number', async (t: Test) => {
      t.matchSnapshot(formatter.format(12345));
    });

    t.test('it formats a boolean', async (t: Test) => {
      t.matchSnapshot(formatter.format(true));
    });

    t.test('it formats a Code', async (t: Test) => {
      t.matchSnapshot(formatter.format(CODE));
    });

    t.test('it formats a Frame', async (t: Test) => {
      t.matchSnapshot(formatter.format(FRAME));
    });

    t.test('it formats a Traceback', async (t: Test) => {
      t.matchSnapshot(formatter.format(TRACEBACK));
    });

    t.test('it formats a BaseException', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(new BaseException('message', TRACEBACK)),
      );
    });

    t.test('it formats a BaseWarning', async (t: Test) => {
      t.matchSnapshot(formatter.format(new BaseWarning('message', TRACEBACK)));
    });

    t.test('it formats an AssertionError', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(new AssertionError('message', TRACEBACK)),
      );
    });

    t.test('it formats an OsError', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(
          new OsError('message', ErrorCode.AddressInUse, null, TRACEBACK),
        ),
      );
    });

    t.test('it formats a FileError', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(
          new FileError(
            'message',
            ErrorCode.Access,
            ExitCode.NoInput,
            [FILENAME],
            TRACEBACK,
          ),
        ),
      );
    });

    t.test('it formats a SyntaxError', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(
          new SyntaxError('expected )', FILENAME, 100, 22, LINE),
        ),
      );
    });

    t.test('it formats a ParseError', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(
          new ParseError([
            new SyntaxError('expected )', FILENAME, 100, 22, LINE),
            new SyntaxWarning(
              'identifier has no sigil',
              FILENAME,
              100,
              17,
              LINE,
            ),
          ]),
        ),
      );
    });

    t.test('it formats a SyntaxWarning', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(
          new SyntaxWarning('expected )', FILENAME, 100, 22, LINE),
        ),
      );
    });

    t.test('it formats a ParseWarning', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(
          new ParseWarning([
            new SyntaxWarning(
              'identifier has no sigil',
              FILENAME,
              100,
              17,
              LINE,
            ),
          ]),
        ),
      );
    });

    t.test('it formats a BaseFault', async (t: Test) => {
      t.matchSnapshot(formatter.format(new BaseFault('message', TRACEBACK)));
    });

    t.test('it formats a RuntimeFault', async (t: Test) => {
      const underlying = new assert.AssertionError({
        message: 'underlying assertion',
        actual: false,
        expected: true,
        operator: '===',
      });

      t.matchSnapshot(
        formatter.format(
          new RuntimeFault('Some runtime fault', underlying, TRACEBACK),
        ),
      );
    });

    t.test('it formats a UsageFault', async (t: Test) => {
      t.matchSnapshot(formatter.format(new UsageFault('Usage: lol')));
    });

    t.test('it formats an Exit', async (t: Test) => {
      t.matchSnapshot(formatter.format(new Exit('message')));
    });
  });
}

for (let ctor of [DefaultFormatter]) {
  formatTestSuite(new ctor());
}
