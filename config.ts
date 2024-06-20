import { getTracer } from './debug';
import { MATBAS_BUILD, MATBAS_VERSION } from './constants';
import { UsageFault } from './faults';
import { Level } from './host';
import { Exit, ExitCode } from './exit';

const tracer = getTracer('main');

let TRACE_USAGE = '';

if (MATBAS_BUILD === 'debug') {
  TRACE_USAGE = `
TRACE             enable debug tracing
TRACE_PARSER      enable parser tracing`;
}

const USAGE = `Usage: matbas [options] [ script.bas ] [arguments]

Options:
  -h, --help               print matbas command line options
  -c, --command <command>  evaluate command
  -e, --eval <script>      evaluate script
  -v, --version            print matbas version
  --log-level <level>      set log level (debug, info, warn, error)
  
Environment variables:
MATBAS_LOG_LEVEL  set log level (debug, info, warn, error)${TRACE_USAGE}
`;

function help(): Exit {
  return new Exit(ExitCode.Success, USAGE);
}

function version(): Exit {
  return new Exit(ExitCode.Success, `v${MATBAS_VERSION}`);
}

function usage(message: string): UsageFault {
  return new UsageFault(`${message}\n${USAGE}`);
}

const LEVELS = {
  debug: Level.Debug,
  info: Level.Info,
  warn: Level.Warn,
  error: Level.Error,
};

function parseLevel(arg: string): Level {
  const level: Level | undefined = LEVELS[arg];

  if (typeof level === 'undefined') {
    throw usage(
      `Invalid log level: ${arg} ` +
        '(must be one of: debug, info, warn, error)',
    );
  }

  return level;
}

/**
 * Basic configuration for Matanuska BASIC.
 */
export class Config {
  public readonly eval: string | null;

  /**
   * @param command A command to run.
   * @param eval_ The source of a script to evaluate.
   * @param script The path to a script to run.
   * @param logLevel The log level.
   * @param argv Command line arguments passed to the runtime.
   * @param env Environment variables.
   */
  constructor(
    public readonly command: string | null,
    eval_: string | null,
    public readonly script: string | null,
    public readonly level: Level,
    public readonly argv: string[],
    public readonly env: typeof process.env,
  ) {
    this.eval = eval_;
  }

  /**
   * Load configuration from command line arguments and environment variables.
   *
   * @param argv Node's command line arguments, without the executable or
   *        script name. In practice, this is `process.argv.slice(2)`.
   * @param env Environment variables. In practice, this is `process.env`.
   */
  static load(argv: typeof process.argv, env: typeof process.env) {
    return tracer.spanSync('Config.load', () => {
      let command = null;
      let eval_ = null;
      let script = null;
      let level = Level.Info;
      const scriptArgv: string[] = [
        process.env.__MATBAS_DOLLAR_ZERO || 'matbas',
      ];

      if (env.MATBAS_LOG_LEVEL) {
        level = parseLevel(env.MATBAS_LOG_LEVEL);
      }

      const args = Array.from(argv);

      while (args.length) {
        switch (args[0]) {
          case '-h':
          case '--help':
            throw help();
          case '-c':
          case '--command':
            args.shift();
            command = args.shift();
            break;
          case '-e':
          case '--eval':
            args.shift();
            eval_ = args.shift();
            break;
          case '--log-level':
            args.shift();
            level = parseLevel(args.shift());
            break;
          case '-v':
          case '--version':
            throw version();
          default:
            if (!script && !args[0].startsWith('-')) {
              script = args.shift();
              scriptArgv.push(script);
              break;
            }

            if (script || command || eval_) {
              scriptArgv.push(args.shift());
              break;
            }

            throw usage(`Invalid option: ${args.shift()}`);
        }
      }

      return new Config(command, eval_, script, level, scriptArgv, env);
    });
  }

  /**
   * Serialize the config to a string. Elides environment variables.
   */
  toString() {
    return JSON.stringify(
      {
        command: this.command,
        eval: this.eval,
        script: this.script,
        logLevel: this.level,
        argv: this.argv,
      },
      null,
      2,
    );
  }
}
