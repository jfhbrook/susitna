import t from 'tap';
import { Test } from 'tap';

import {
  ExitCode,
  BaseException,
  Exception,
  AssertionError,
  RuntimeError,
  NotImplementedError,
  BaseWarning,
  Warning,
  DeprecationWarning,
  ErrorCode,
  OsError,
  FileError,
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
  FatalException,
  FlagrantError,
  UsageError,
} from './exceptions';

const SIMPLE_EXCEPTIONS: Array<typeof BaseException> = [
  BaseException,
  Exception,
  AssertionError,
  RuntimeError,
  NotImplementedError,
  FatalException
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
  for (let [code, defaultExitCode] of DEFAULT_EXIT_CODES) {
    t.test(`with error code ${code}`, async (t: Test) => {
      t.test('when the exit code is overridden', async (t: Test) => {
        for (let overriddenExitCode of EXIT_CODES) {
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

t.skip('ParseError', async (t: Test) => {});

t.skip('ParseWarning', async (t: Test) => {});

t.skip('FlagrantError', async (t: Test) => {});

t.skip('UsageError', async (t: Test) => {});
