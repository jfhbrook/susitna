import config from './config.mjs';
import { writeFile, run } from './io.mjs';
import { expandGlobs } from './util.mjs';

export const Color = {
  Auto: 'auto',
  Always: 'always',
  Never: 'never',
};

export const Format = {
  CheckStyle: 'checkstyle',
  Diff: 'diff',
  Gcc: 'gcc',
  Json: 'json',
  Json1: 'json1',
  Quiet: 'quiet',
  Tty: 'tty',
};

export const Shell = {
  Sh: 'sh',
  Bash: 'bash',
  Dash: 'dash',
  Ksh: 'ksh',
  BusyBox: 'busybox',
};

export const Severity = {
  Error: 'error',
  Warning: 'warning',
  Info: 'info',
  Style: 'style',
};

export function shellcheckArgv(options) {
  const argv = [];

  if (options.checkSourced) {
    argv.push('--check-sourced');
  }

  if (options.color) {
    argv.push(`--color=${options.color}`);
  }

  if (options.include) {
    argv.push(`--include=${options.include.join(',')}`);
  }

  if (options.exclude) {
    argv.push(`--exclude=${options.exclude.join(',')}`);
  }

  if (options.format) {
    argv.push(`--format=${options.format}`);
  }

  if (options.listOptional) {
    argv.push('--list-optional');
  }

  if (options.noRc) {
    argv.push('--norc');
  }

  if (options.rcFile) {
    argv.push(`--rcfile=${options.rcFile}`);
  }

  if (options.enable) {
    argv.push(`--enable=${options.enable.join(',')}`);
  }

  if (options.sourcePath) {
    argv.push(`--source-path=${options.sourcePath.join(':')}`);
  }

  if (options.shell) {
    argv.push(`--shell=${options.shell}`);
  }

  if (options.severity) {
    argv.push(`--severity=${options.severity}`);
  }

  if (options.wikiLinkCount) {
    argv.push(`--wiki-link-count=${options.wikiLinkCount}`);
  }

  if (options.externalSources) {
    argv.push('--external-sources');
  }

  return argv.concat(expandGlobs(options.files) || []);
}

export function shellcheckRcContents(options) {
  let file = '';
  const sourcePath = options.sourcePath || [];
  const enable = options.enable || [];
  const disable = options.disable || [];

  for (let path of sourcePath) {
    file += `source-path=${path}\n`;
  }

  if (sourcePath.length) {
    file += '\n';
  }

  if (typeof options.externalSources !== 'undefined') {
    file += `external-sources=${options.externalSources}\n\n`;
  }

  for (let rule of enable) {
    file += `enable=${rule}\n`;
  }

  for (let rule of disable) {
    file += `disable=${rule}\n`;
  }

  return file;
}

export function writeShellcheckRc() {
  const { sourcePath, externalSources, enable, disable } =
    config.check.shellcheck;
  const rcFile = config.check.shellcheck.rcFile || '.shellcheckrc';

  writeFile(
    rcFile,
    shellcheckRcContents({
      sourcePath,
      externalSources,
      enable,
      disable,
    }),
  );
}

export function runShellcheck() {
  const {
    checkSourced,
    color,
    include,
    exclude,
    format,
    listOptional,
    rcFile,
    shell,
    severity,
    wikiLinkCount,
    files,
  } = config.check.shellcheck;

  writeShellcheckRc();

  run(
    'shellcheck',
    shellcheckArgv({
      checkSourced,
      color,
      include,
      exclude,
      format,
      listOptional,
      rcFile,
      shell,
      severity,
      wikiLinkCount,
      files,
    }),
  );
}
