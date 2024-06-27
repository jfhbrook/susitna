import t from 'tap';
import { Test } from 'tap';

import { ExitCode } from '../exit';
import { ErrorCode } from '../errors';

import {
  BaseException,
  Exception,
  AssertionError,
  RuntimeError,
  NotImplementedError,
  BaseWarning,
  Warning,
  DeprecationWarning,
  ValueError,
  ArithmeticError,
  OsError,
  FileError,
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
  mergeParseErrors,
  splitParseError,
  removeFromParseError,
} from '../exceptions';
import { FILENAME, TRACEBACK } from './helpers/traceback';

const SIMPLE_EXCEPTIONS: Array<typeof BaseException> = [
  BaseException,
  Exception,
  AssertionError,
  RuntimeError,
  NotImplementedError,
  ValueError,
  ArithmeticError,
];

const SIMPLE_WARNINGS: Array<typeof BaseWarning> = [
  BaseWarning,
  Warning,
  DeprecationWarning,
];

function simpleTest(t: Test, ctor: typeof BaseException): void {
  t.test(`Can construct a ${ctor.name} with a traceback`, async (t: Test) => {
    const exc = new ctor('Some exception', TRACEBACK);

    t.ok(exc);
    t.equal(exc.message, 'Some exception');
    t.same(exc.traceback, TRACEBACK);
  });

  t.test(
    `Can construct a ${ctor.name} without a traceback`,
    async (t: Test) => {
      const exc = new ctor('Some exception', null);

      t.ok(exc);
      t.equal(exc.message, 'Some exception');
      t.same(exc.traceback, null);
    },
  );
}

t.test('For simple exceptions', async (t: Test) => {
  for (const ctor of SIMPLE_EXCEPTIONS) {
    simpleTest(t, ctor);
  }
});

t.test('For simple warnings', async (t: Test) => {
  for (const ctor of SIMPLE_WARNINGS) {
    simpleTest(t, ctor);
  }
});

const DEFAULT_EXIT_CODES: Array<[ErrorCode | string, ExitCode]> = [
  ['EACCES', ExitCode.OsError],
  ['EADDRINUSE', ExitCode.Protocol],
  ['ECONNREFUSED', ExitCode.Unavailable],
  ['ECONNRESET', ExitCode.Unavailable],
  ['EEXIST', ExitCode.CantCreate],
  ['EISDIR', ExitCode.IoError],
  ['EMFILE', ExitCode.OsError],
  ['ENOENT', ExitCode.NoInput],
  ['ENOTDIR', ExitCode.NoInput],
  ['ENOTEMPTY', ExitCode.OsError],
  ['ENOTFOUND', ExitCode.NoHost],
  ['EPERM', ExitCode.NoPermission],
  ['EPIPE', ExitCode.OsError],
  ['ETIMEDOUT', ExitCode.Unavailable],
  ['EMYSTERY', ExitCode.OsError],
];

const EXIT_CODES: Array<ExitCode> = DEFAULT_EXIT_CODES.map(([_, code]) => code);

function testDefaultExitCode(t: Test, code: string, exitCode: number): void {
  t.test(`it has a default exit code ${exitCode}`, async (t: Test) => {
    const exc = new OsError('Some OS error', code, null, null);

    t.ok(exc);
    t.equal(exc.message, 'Some OS error');
    t.equal(exc.exitCode, exitCode);
  });
}

function testOverriddenExitCode(t: Test, code: string, exitCode: number): void {
  t.test(`it has an overridden exit code ${exitCode}`, async (t: Test) => {
    const exc = new OsError('Some OS error', code, exitCode, null);

    t.ok(exc);
    t.equal(exc.message, 'Some OS error');
    t.equal(exc.exitCode, exitCode);
  });
}

t.test('OsError', async (t: Test) => {
  for (const [code, defaultExitCode] of DEFAULT_EXIT_CODES) {
    t.test(`with error code ${code}`, async (t: Test) => {
      t.test('when the exit code is overridden', async (t: Test) => {
        for (const overriddenExitCode of EXIT_CODES) {
          testOverriddenExitCode(t, code, overriddenExitCode);
        }
      });

      t.test('when the exit code is set to null', async (t: Test) => {
        testDefaultExitCode(t, code, defaultExitCode);
      });
    });
  }
});

function fileErrorTest(
  t: Test,
  method: 'fromError' | 'fromReadError' | 'fromWriteError',
  exitCode: ExitCode,
): void {
  t.test('without a custom message', async (t: Test) => {
    const exc = FileError[method](
      null,
      {
        message: 'Some file error',
        code: ErrorCode.Access,
        path: '/path/to/file',
      } as any,
      null,
    );

    t.ok(exc);
    t.equal(exc.message, 'Some file error');
    t.equal(exc.code, ErrorCode.Access);
    t.equal(exc.exitCode, exitCode);
    t.same(exc.paths, ['/path/to/file']);
    t.equal(exc.traceback, null);
  });

  t.test('with a custom message', async (t: Test) => {
    const exc = FileError[method](
      'Some custom file error',
      {
        message: 'Some file error',
        code: ErrorCode.Access,
        path: '/path/to/file',
      } as any,
      null,
    );

    t.ok(exc);
    t.equal(exc.message, 'Some custom file error');
    t.equal(exc.code, ErrorCode.Access);
    t.equal(exc.exitCode, exitCode);
    t.same(exc.paths, ['/path/to/file']);
    t.equal(exc.traceback, null);
  });

  t.test('with a non-access error code', async (t: Test) => {
    const exc = FileError[method](
      null,
      {
        message: 'Some file error',
        code: ErrorCode.IsDirectory,
        path: '/path/to/file',
      } as any,
      null,
    );

    t.ok(exc);
    t.equal(exc.message, 'Some file error');
    t.equal(exc.code, ErrorCode.IsDirectory);
    t.equal(exc.exitCode, ExitCode.IoError);
    t.same(exc.paths, ['/path/to/file']);
    t.equal(exc.traceback, null);
  });
}

t.test('FileError', async (t: Test) => {
  t.test('when constructed directly', async (t: Test) => {
    const exc = new FileError(
      'Some file error',
      ErrorCode.Access,
      null,
      ['/path/to/file'],
      null,
    );

    t.ok(exc);
    t.equal(exc.message, 'Some file error');
    t.equal(exc.code, ErrorCode.Access);
    t.equal(exc.exitCode, ExitCode.OsError);
    t.same(exc.paths, ['/path/to/file']);
    t.equal(exc.traceback, null);
  });

  t.test('when created from a naive error', async (t: Test) => {
    fileErrorTest(t, 'fromError', ExitCode.OsError);
  });

  t.test('when created from a read error', async (t: Test) => {
    fileErrorTest(t, 'fromReadError', ExitCode.NoInput);
  });

  t.test('when created from a write error', async (t: Test) => {
    fileErrorTest(t, 'fromWriteError', ExitCode.CantCreate);
  });
});

t.test('ParseError', async (t: Test) => {
  t.test('it can construct a ParseError', async (t: Test) => {
    const line = '100 print someFn(ident';

    const exc = new ParseError([
      new SyntaxError('expected )', {
        filename: FILENAME,
        row: 0,
        isLine: false,
        lineNo: 100,
        offsetStart: 22,
        offsetEnd: 23,
        source: line,
      }),
      new SyntaxWarning('identifier has no sigil', {
        filename: FILENAME,
        row: 0,
        isLine: false,
        lineNo: 100,
        offsetStart: 17,
        offsetEnd: 18,
        source: line,
      }),
    ]);

    t.ok(exc);
    t.equal(exc.message, '');
    t.equal(exc.exitCode, ExitCode.Software);
    t.equal(exc.traceback, null);
    t.equal(exc.errors.length, 2);

    t.equal(exc.errors[0].message, 'expected )');
    t.same(exc.errors[0].filename, FILENAME);
    t.equal(exc.errors[0].lineNo, 100);
    t.same(exc.errors[0].offsetStart, 22);
    t.same(exc.errors[0].offsetEnd, 23);

    t.equal(exc.errors[1].message, 'identifier has no sigil');
    t.same(exc.errors[1].filename, FILENAME);
    t.equal(exc.errors[1].lineNo, 100);
    t.same(exc.errors[1].offsetStart, 17);
    t.same(exc.errors[1].offsetEnd, 18);
  });
});

t.test('ParseWarning', async (t: Test) => {
  t.test('it can construct a ParseWarning', async (t: Test) => {
    const line = '100 print someFn(ident)';

    const exc = new ParseWarning([
      new SyntaxWarning('identifier has no sigil', {
        filename: FILENAME,
        row: 0,
        isLine: false,
        lineNo: 100,
        offsetStart: 17,
        offsetEnd: 18,
        source: line,
      }),
    ]);

    t.ok(exc);
    t.equal(exc.message, '');
    t.equal(exc.traceback, null);
    t.equal(exc.warnings.length, 1);

    t.equal(exc.warnings[0].message, 'identifier has no sigil');
    t.same(exc.warnings[0].filename, FILENAME);
    t.equal(exc.warnings[0].lineNo, 100);
    t.same(exc.warnings[0].offsetStart, 17);
    t.same(exc.warnings[0].offsetEnd, 18);
  });
});

t.test('mergeParseErrors', async (t: Test) => {
  const PARSE_WARNING_1 = new ParseWarning([
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 0,
      isLine: true,
      lineNo: 100,
      offsetStart: 17,
      offsetEnd: 18,
      source: '100 print someFn(ident)',
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 4,
      isLine: true,
      lineNo: 500,
      offsetStart: 17,
      offsetEnd: 18,
      source: '500 print someFn(ident)',
    }),
  ]);

  const PARSE_WARNING_2 = new ParseWarning([
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 1,
      isLine: true,
      lineNo: 200,
      offsetStart: 17,
      offsetEnd: 18,
      source: '200 print someFn(ident)',
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 5,
      isLine: true,
      lineNo: 600,
      offsetStart: 17,
      offsetEnd: 18,
      source: '600 print someFn(ident)',
    }),
  ]);

  const PARSE_ERROR_1 = new ParseError([
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 2,
      isLine: false,
      lineNo: 300,
      offsetStart: 22,
      offsetEnd: 23,
      source: '300 print someFn(ident',
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 6,
      isLine: false,
      lineNo: 700,
      offsetStart: 22,
      offsetEnd: 23,
      source: '700 print someFn(ident',
    }),
  ]);

  const PARSE_ERROR_2 = new ParseError([
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 3,
      isLine: false,
      lineNo: 400,
      offsetStart: 22,
      offsetEnd: 23,
      source: '400 print someFn(ident',
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 7,
      isLine: false,
      lineNo: 800,
      offsetStart: 22,
      offsetEnd: 23,
      source: '800 print someFn(ident',
    }),
  ]);

  t.matchSnapshot(
    mergeParseErrors([PARSE_WARNING_2, PARSE_WARNING_1]),
    'merge two warnings',
  );
  t.matchSnapshot(
    mergeParseErrors([PARSE_ERROR_2, PARSE_ERROR_1]),
    'merge two errors',
  );
  t.matchSnapshot(
    mergeParseErrors([PARSE_WARNING_1, PARSE_ERROR_1]),
    'merge a warning and an error',
  );
  t.matchSnapshot(
    mergeParseErrors([PARSE_WARNING_1, null]),
    'merge a warning and null',
  );
  t.matchSnapshot(
    mergeParseErrors([PARSE_WARNING_1, null]),
    'merge an error and null',
  );
  t.matchSnapshot(
    mergeParseErrors([PARSE_ERROR_1, PARSE_WARNING_2, null]),
    'merge a warning, an error and null',
  );
  t.matchSnapshot(mergeParseErrors([null, null, null]), 'merge a few nulls');
});

t.test('splitParseError', async (t: Test) => {
  const ERROR = new ParseError([
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 0,
      isLine: true,
      lineNo: 100,
      offsetStart: 17,
      offsetEnd: 18,
      source: '100 print someFn(ident)',
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 1,
      isLine: true,
      lineNo: 200,
      offsetStart: 17,
      offsetEnd: 18,
      source: '200 print someFn(ident)',
    }),

    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 2,
      isLine: false,
      lineNo: 300,
      offsetStart: 22,
      offsetEnd: 23,
      source: '300 print someFn(ident',
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 3,
      isLine: false,
      lineNo: 400,
      offsetStart: 22,
      offsetEnd: 23,
      source: '400 print someFn(ident',
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 4,
      isLine: true,
      lineNo: 500,
      offsetStart: 17,
      offsetEnd: 18,
      source: '500 print someFn(ident)',
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 5,
      isLine: true,
      lineNo: 600,
      offsetStart: 17,
      offsetEnd: 18,
      source: '600 print someFn(ident)',
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 6,
      isLine: false,
      lineNo: 700,
      offsetStart: 22,
      offsetEnd: 23,
      source: '700 print someFn(ident',
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 7,
      isLine: false,
      lineNo: 800,
      offsetStart: 22,
      offsetEnd: 23,
      source: '800 print someFn(ident',
    }),
  ]);

  const WARN = new ParseError([
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 0,
      isLine: true,
      lineNo: 100,
      offsetStart: 17,
      offsetEnd: 18,
      source: '100 print someFn(ident)',
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 1,
      isLine: true,
      lineNo: 200,
      offsetStart: 17,
      offsetEnd: 18,
      source: '200 print someFn(ident)',
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 4,
      isLine: true,
      lineNo: 500,
      offsetStart: 17,
      offsetEnd: 18,
      source: '500 print someFn(ident)',
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 5,
      isLine: true,
      lineNo: 600,
      offsetStart: 17,
      offsetEnd: 18,
      source: '600 print someFn(ident)',
    }),
  ]);

  function test(error: Record<number, any>, key: string) {
    for (const [k, err] of Object.entries(error)) {
      const errs = err.errors ? err.errors : err.warnings;
      for (const e of errs) {
        t.same(k, e[key]);
      }
    }
  }

  test(splitParseError(ERROR, 'row'), 'row');
  test(splitParseError(WARN, 'row'), 'row');
  test(splitParseError(ERROR, 'lineNo'), 'lineNo');
  test(splitParseError(WARN, 'lineNo'), 'lineNo');
  t.same(splitParseError(null, 'row'), {});
});

t.test('removeFromParseError', async (t: Test) => {
  const ERROR = new ParseError([
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 0,
      isLine: true,
      lineNo: 100,
      offsetStart: 17,
      offsetEnd: 18,
      source: '100 print someFn(ident)',
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 1,
      isLine: true,
      lineNo: 200,
      offsetStart: 17,
      offsetEnd: 18,
      source: '200 print someFn(ident)',
    }),

    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 2,
      isLine: false,
      lineNo: 300,
      offsetStart: 22,
      offsetEnd: 23,
      source: '300 print someFn(ident',
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 3,
      isLine: false,
      lineNo: 400,
      offsetStart: 22,
      offsetEnd: 23,
      source: '400 print someFn(ident',
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 4,
      isLine: true,
      lineNo: 500,
      offsetStart: 17,
      offsetEnd: 18,
      source: '500 print someFn(ident)',
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 5,
      isLine: true,
      lineNo: 600,
      offsetStart: 17,
      offsetEnd: 18,
      source: '600 print someFn(ident)',
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 6,
      isLine: false,
      lineNo: 700,
      offsetStart: 22,
      offsetEnd: 23,
      source: '700 print someFn(ident',
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 7,
      isLine: false,
      lineNo: 800,
      offsetStart: 22,
      offsetEnd: 23,
      source: '800 print someFn(ident',
    }),
  ]);

  const WARN = new ParseError([
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 0,
      isLine: true,
      lineNo: 100,
      offsetStart: 17,
      offsetEnd: 18,
      source: '100 print someFn(ident)',
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 1,
      isLine: true,
      lineNo: 200,
      offsetStart: 17,
      offsetEnd: 18,
      source: '200 print someFn(ident)',
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 4,
      isLine: true,
      lineNo: 500,
      offsetStart: 17,
      offsetEnd: 18,
      source: '500 print someFn(ident)',
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 5,
      isLine: true,
      lineNo: 600,
      offsetStart: 17,
      offsetEnd: 18,
      source: '600 print someFn(ident)',
    }),
  ]);

  function test(error: any, key: string, value: number) {
    const errs = error.errors ? error.errors : error.warnings;
    for (const e of errs) {
      e[key] !== value;
    }
  }

  test(removeFromParseError(ERROR, 'row', 2), 'row', 2);
  test(removeFromParseError(WARN, 'row', 2), 'row', 2);
  t.same(removeFromParseError(null, 'row', 2), null);
  test(removeFromParseError(ERROR, 'lineNo', 400), 'lineNo', 400);
  test(removeFromParseError(WARN, 'lineNo', 400), 'lineNo', 400);
  t.same(removeFromParseError(null, 'lineNo', 400), null);
});
