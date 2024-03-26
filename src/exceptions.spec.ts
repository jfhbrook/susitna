import t from 'tap';
import { Test } from 'tap';

import {
  BaseException,
  Exception,
  AssertionError,
  RuntimeError,
  NotImplementedError,
  BaseWarning,
  Warning,
  DeprecationWarning,
  OsError,
  FileError,
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
  FlagrantError,
  UsageError,
} from './exceptions';

const SIMPLE_EXCEPTIONS: Array<typeof BaseException> = [
  BaseException,
  Exception,
  AssertionError,
  RuntimeError,
  NotImplementedError,
];

const SIMPLE_WARNINGS: Array<typeof BaseWarning> = [
  BaseWarning,
  Warning,
  DeprecationWarning,
];

function simpleTest(t: Test, ctor: typeof BaseException): void {
  t.test(`Can construct a ${ctor.name} with a traceback`, async (t: Test) => {
    const traceback = {
      next: null,
      frame: { previous: null },
      lineNo: 100,
    };
    const exc = new ctor('Some exception', traceback);

    t.ok(exc);
    t.equal(exc.message, 'Some exception');
    t.same(exc.traceback, traceback);
  });

  t.test(
    `Can construct a ${ctor.name} without a traceback`,
    async (t: Test) => {
      const traceback = null;
      const exc = new ctor('Some exception', traceback);

      t.ok(exc);
      t.equal(exc.message, 'Some exception');
      t.same(exc.traceback, traceback);
    },
  );
}

t.test('For simple exceptions', async (t: Test) => {
  for (let ctor of SIMPLE_EXCEPTIONS) {
    simpleTest(t, ctor);
  }
});

t.test('For simple warnings', async (t: Test) => {
  for (let ctor of SIMPLE_WARNINGS) {
    simpleTest(t, ctor);
  }
});

// Create OsErrors with an error code and assert their exit codes:
// - EACCES
// - EADDRINUSE
// - ECONNREFUSED
// - ECONNRESET
// - EEXIST
// - EISDIR
// - EMFILE
// - ENOENT
// - ENOTDIR
// - ENOTEMPTY
// - ENOTFOUND
// - EPERM
// - EPIPE
// - ETIMEDOUT
//
// Create an OSError with an overridden exit code
//
// Construct a FileError directly
// Create a FileError from a naive error
// Create a FileError from a read error
// Create a FileError from a write error
//
// Construct a ParseError
// Construct a ParseWarning
//
// Construct a FlagrantError
// Construct a UsageError
