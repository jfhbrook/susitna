import t from 'tap';
import { Test } from 'tap';

import { ExitCode } from '../exit';
import { RuntimeFault } from '../faults';
import { Host } from '../host';

import { cliTest, TestCommand, TestConfig } from './helpers/cli';
import { MockExit } from './helpers/host';

t.test('when the command succeeds', async (t: Test) => {
  await t.test("and it doesn't throw an Exit", async (t: Test) => {
    await t.test('it exits with code 0', async (t: Test) => {
      async function run(_config: TestConfig, _host: Host): Promise<void> {
        // Nothing.
      }
      await cliTest(run, async (command: TestCommand) => {
        try {
          await command();
        } catch (err) {
          t.equal(err.exitCode, ExitCode.Success);
          t.type(err, MockExit);
        }
      });
    });
  });

  await t.test('and it throws an Exit', async (t: Test) => {
    await t.test('it exits with code 0', async (t: Test) => {
      async function run(_config: TestConfig, _host: Host): Promise<void> {
        throw new MockExit(0);
      }
      await cliTest(run, async (command: TestCommand) => {
        t.plan(2);
        try {
          await command();
        } catch (err) {
          t.equal(err.exitCode, ExitCode.Success);
          t.type(err, MockExit);
        }
      });
    });
  });
});

t.test('when the command fails with a RuntimeFault', async (t: Test) => {
  await t.test('it exits with the expected code', async (t: Test) => {
    async function run(_config: TestConfig, _host: Host): Promise<void> {
      throw new RuntimeFault(
        'runtime fault',
        new Error('underlying error'),
        null,
      );
    }
    await cliTest(run, async (command: TestCommand) => {
      t.plan(2);
      try {
        await command();
      } catch (err) {
        t.equal(err.exitCode, ExitCode.Software);
        t.type(err, MockExit);
      }
    });
  });
});
