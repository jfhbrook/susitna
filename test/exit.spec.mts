import { describe, expect, test } from 'vitest';

import { Exit, ExitCode } from '../exit.mjs';

describe('Exit', () => {
  describe('when there is a code and message', () => {
    test(`it can construct an Exit`, () => {
      const exit = new Exit(ExitCode.Success, 'huge success');

      expect(exit).toBeTruthy();
      expect(exit.message).toBe('huge success');
      expect(exit).toBeInstanceOf(Error);
      expect(exit).toBeInstanceOf(Exit);
      expect(exit.exitCode).toBe(ExitCode.Success);
    });
  });

  describe('when there is a code but not a message', () => {
    test(`it can construct an Exit`, () => {
      const exit = new Exit(ExitCode.Software);

      expect(exit).toBeTruthy();
      expect(exit.message).toBe('');
      expect(exit).toBeInstanceOf(Error);
      expect(exit).toBeInstanceOf(Exit);
      expect(exit.exitCode).toBe(ExitCode.Software);
    });
  });

  describe('when there is neither a code nor a message', () => {
    test(`it can construct an Exit`, () => {
      const exit = new Exit();

      expect(exit).toBeTruthy();
      expect(exit.message).toBe('');
      expect(exit).toBeInstanceOf(Error);
      expect(exit).toBeInstanceOf(Exit);
      expect(exit.exitCode).toBe(ExitCode.Success);
    });
  });
});
