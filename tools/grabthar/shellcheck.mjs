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

  return argv;
}

export function shellcheckRcContents(options) {
  let file = '';
  const sourcePath = options.sourcePath || [];
  const enable = options.enable || [];
  const disable = options.disable || [];

  for (let path of sourcePath) {
    file += `source-path=${path}\n`;
  }

  file += '\n';

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
