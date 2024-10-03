import t from 'tap';
import { Test } from 'tap';

import { Exit } from '../exit.mjs';
import { Config } from '../config.mjs';
import { UsageFault } from '../faults.mjs';
import { Level } from '../host.mjs';

t.test('help', async (t: Test) => {
  t.test('when the -h flag is passed', async (t: Test) => {
    t.test('it shows help text', async (t: Test) => {
      t.plan(2);
      try {
        Config.load(['-h'], {});
      } catch (err) {
        t.type(err, Exit);
        t.match(err.message, /^Usage:/);
      }
    });
  });

  t.test('when the --help flag is passed', async (t: Test) => {
    t.test('it shows help text', async (t: Test) => {
      t.plan(2);
      try {
        Config.load(['--help'], {});
      } catch (err) {
        t.type(err, Exit);
        t.match(err.message, /^Usage:/);
      }
    });
  });
});

t.test('version', async (t: Test) => {
  t.test('when the -v flag is passed', async (t: Test) => {
    t.test('it shows the version', async (t: Test) => {
      t.plan(2);
      try {
        Config.load(['-v'], {});
      } catch (err) {
        t.type(err, Exit);
        t.match(err.message, /^v\d+\.\d+\.\d+/);
      }
    });
  });

  t.test('when the --version flag is passed', async (t: Test) => {
    t.test('it shows the version', async (t: Test) => {
      t.plan(2);
      try {
        Config.load(['--version'], {});
      } catch (err) {
        t.type(err, Exit);
        t.match(err.message, /^v\d+\.\d+\.\d+/);
      }
    });
  });
});

t.test('command', async (t: Test) => {
  t.test('when the -c option is passed', async (t: Test) => {
    t.test('it sets a command', async (t: Test) => {
      const config = Config.load(['-c', 'print "hello world"'], {});
      t.equal(config.command, 'print "hello world"');
      t.equal(config.eval, null);
      t.equal(config.script, null);
    });
  });

  t.test('when the --command option is passed', async (t: Test) => {
    t.test('it sets a command', async (t: Test) => {
      const config = Config.load(['--command', 'print "hello world"'], {});
      t.equal(config.command, 'print "hello world"');
      t.equal(config.eval, null);
      t.equal(config.script, null);
    });
  });
});

t.test('eval', async (t: Test) => {
  t.test('when the -e option is passed', async (t: Test) => {
    t.test('it sets source to eval', async (t: Test) => {
      const config = Config.load(['-e', '100 print "hello world"'], {});
      t.equal(config.eval, '100 print "hello world"');
      t.equal(config.command, null);
      t.equal(config.script, null);
    });
  });

  t.test('when the --eval option is passed', async (t: Test) => {
    t.test('it sets source to eval', async (t: Test) => {
      const config = Config.load(['--eval', '100 print "hello world"'], {});
      t.equal(config.eval, '100 print "hello world"');
      t.equal(config.command, null);
      t.equal(config.script, null);
    });
  });
});

t.test('script', async (t: Test) => {
  t.test('when a script is passed', async (t: Test) => {
    t.test('and there are no other arguments', async (t: Test) => {
      t.test('it sets the path to a script', async (t: Test) => {
        const config = Config.load(['./script.bas'], {});
        t.equal(config.script, './script.bas');
        t.equal(config.command, null);
        t.equal(config.eval, null);
      });
    });

    t.test('and there is another argument', async (t: Test) => {
      t.test('it sets the path to a script', async (t: Test) => {
        const config = Config.load(['./script.bas', 'arg'], {});
        t.equal(config.script, './script.bas');
        t.equal(config.command, null);
        t.equal(config.eval, null);
        t.same(config.argv, ['matbas', './script.bas', 'arg']);
      });
    });

    t.test('and there is a valid option prior', async (t: Test) => {
      t.test(
        'it sets the path to a script and respects the option',
        async (t: Test) => {
          const config = Config.load(
            ['-c', 'print "hello world"', './script.bas'],
            {},
          );
          t.equal(config.command, 'print "hello world"');
          t.equal(config.script, './script.bas');
          t.equal(config.eval, null);
          t.same(config.argv, ['matbas', './script.bas']);
        },
      );
    });

    t.test('and there is an invalid option prior', async (t: Test) => {
      t.test('it exits with a usage fault', async (t: Test) => {
        t.plan(3);
        try {
          Config.load(['--invalid', './script.bas'], {});
        } catch (err) {
          t.type(err, UsageFault);
          t.match(err.message, /^Invalid option: --invalid/);
          t.match(err.message, /Usage:/);
        }
      });
    });
  });
});

t.test('level', async (t: Test) => {
  t.test('when no level is passed', async (t: Test) => {
    t.test('and there is no environment variable', async (t: Test) => {
      t.test('the level is set to info', async (t: Test) => {
        const config = Config.load([], {});
        t.equal(config.level, Level.Info);
      });
    });

    t.test('but there is a valid environment variable', async (t: Test) => {
      t.test('the level is set to that level', async (t: Test) => {
        const config = Config.load([], { MATBAS_LOG_LEVEL: 'debug' });
        t.equal(config.level, Level.Debug);
      });
    });

    t.test('but there is an invalid environment variable', async (t: Test) => {
      t.test('it exits with a usage fault', async (t: Test) => {
        t.plan(3);
        try {
          Config.load([], { MATBAS_LOG_LEVEL: 'fatal' });
        } catch (err) {
          t.type(err, UsageFault);
          t.match(err.message, /^Invalid log level: fatal/);
          t.match(err.message, /Usage:/);
        }
      });
    });
  });

  t.test('when a valid level is passed', async (t: Test) => {
    t.test('the level is set to that level', async (t: Test) => {
      const config = Config.load(['--log-level', 'debug'], {});
      t.equal(config.level, Level.Debug);
    });
  });

  t.test('when an invalid level is passed', async (t: Test) => {
    t.test('it exits with a usage fault', async (t: Test) => {
      t.plan(3);
      try {
        Config.load(['--log-level', 'fatal'], {});
      } catch (err) {
        t.type(err, UsageFault);
        t.match(err.message, /^Invalid log level: fatal/);
        t.match(err.message, /Usage:/);
      }
    });
  });
});

t.test('historySize', async (t: Test) => {
  await t.test('when no history size is passed', async (t: Test) => {
    await t.test('and there is no environment variable', async (t: Test) => {
      await t.test('the size is set to 500', async (t: Test) => {
        const config = Config.load([], {});
        t.equal(config.historySize, 500);
        t.equal(config.historyFileSize, 500);
      });
    });

    await t.test(
      'but there is a valid HISTSIZE environment variable',
      async (t: Test) => {
        await t.test('the history size gets set', async (t: Test) => {
          const config = Config.load([], { HISTSIZE: '1000' });
          t.equal(config.historySize, 1000);
          t.equal(config.historyFileSize, 500);
        });
      },
    );

    await t.test(
      'but there is an invalid HISTSIZE environment variable',
      async (t: Test) => {
        await t.test('it exits with a usage fault', async (t: Test) => {
          t.plan(2);
          try {
            Config.load([], { HISTSIZE: 'pony' });
          } catch (err) {
            t.type(err, UsageFault);
            t.match(err.message, /Usage:/);
          }
        });
      },
    );
  });

  await t.test('when a valid history size is passed', async (t: Test) => {
    await t.test('the history size gets set', async (t: Test) => {
      const config = Config.load(['--history-size', '1000'], {});
      t.equal(config.historySize, 1000);
      t.equal(config.historyFileSize, 500);
    });
  });

  await t.test('when an invalid history size is passed', async (t: Test) => {
    await t.test('it exits with a usage fault', async (t: Test) => {
      t.plan(2);
      try {
        Config.load(['--history-size', 'pony'], {});
      } catch (err) {
        t.type(err, UsageFault);
        t.match(err.message, /Usage:/);
      }
    });
  });
});

t.test('historyFileSize', async (t: Test) => {
  await t.test('when no history file size is passed', async (t: Test) => {
    await t.test(
      'but there is a valid HISTFILESIZE environment variable',
      async (t: Test) => {
        await t.test("that's less than the history size", async (t: Test) => {
          await t.test('the history size gets set', async (t: Test) => {
            const config = Config.load([], { HISTFILESIZE: '100' });
            t.equal(config.historySize, 500);
            t.equal(config.historyFileSize, 100);
          });
        });

        await t.test(
          "that's greater than the history size",
          async (t: Test) => {
            await t.test(
              'the history size defaults to history size',
              async (t: Test) => {
                const config = Config.load([], { HISTFILESIZE: '1000' });
                t.equal(config.historySize, 500);
                t.equal(config.historyFileSize, 500);
              },
            );
          },
        );
      },
    );

    await t.test(
      'but there is an invalid HISTFILESIZE environment variable',
      async (t: Test) => {
        await t.test('it exits with a usage fault', async (t: Test) => {
          t.plan(2);
          try {
            Config.load([], { HISTFILESIZE: 'pony' });
          } catch (err) {
            t.type(err, UsageFault);
            t.match(err.message, /Usage:/);
          }
        });
      },
    );
  });

  await t.test('when a valid history file size is passed', async (t: Test) => {
    await t.test("that's less than the history size", async (t: Test) => {
      await t.test('the history size gets set', async (t: Test) => {
        const config = Config.load(['--history-file-size', '100'], {});
        t.equal(config.historySize, 500);
        t.equal(config.historyFileSize, 100);
      });
    });

    await t.test("that's greater than the history size", async (t: Test) => {
      await t.test(
        'the history size defaults to history size',
        async (t: Test) => {
          const config = Config.load(['--history-file-size', '1000'], {});
          t.equal(config.historySize, 500);
          t.equal(config.historyFileSize, 500);
        },
      );
    });
  });

  await t.test('when an invalid history size is passed', async (t: Test) => {
    await t.test('it exits with a usage fault', async (t: Test) => {
      t.plan(2);
      try {
        Config.load(['--history-size', 'pony'], {});
      } catch (err) {
        t.type(err, UsageFault);
        t.match(err.message, /Usage:/);
      }
    });
  });
});
