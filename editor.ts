import { Injectable, Inject } from '@nestjs/common';

import {
  ParseWarning,
  mergeParseErrors,
  removeFromParseError,
} from './exceptions';
import { Host } from './host';
import { Line, Program } from './ast';
import { Rem } from './ast/instr';

type LineNo = number;

interface Index {
  i: number;
  lineNo: LineNo | null;
  match: boolean;
}

// An index corresponding to inserting the line at the very front
const HEAD: number = -1;

type Numbering = {
  to: number;
  toStr: string;
  shift: number;
  source: string;
};

type Renumbering = Record<LineNo, Numbering>;

export enum Justify {
  Left,
  Right,
}

@Injectable()
export class Editor {
  public program: Program;
  public warning: ParseWarning | null;
  public justify: Justify = Justify.Left;

  constructor(@Inject('Host') public host: Host) {
    this.program = new Program('untitled.bas', []);
    this.warning = null;
  }

  get filename(): string {
    return this.host.relativePath('.', this.program.filename);
  }

  set filename(filename: string) {
    this.program.filename = this.host.resolvePath(filename);
  }

  /**
   * Initialize editor state.
   *
   * @param program A program.
   * @param warning An associated warning, if any.
   */
  init(program: Program, warning: ParseWarning | null): void {
    this.program = program;
    this.warning = warning;
  }

  /**
   * Reset the editor.
   */
  reset(): void {
    this.program = new Program('untitled.bas', []);
    this.warning = null;
  }

  /**
   * List the current program.
   *
   * @returns The source code for the program.
   */
  list(): string {
    return this.program.lines
      .map((l) => {
        if (
          l.instructions.length === 1 &&
          l.instructions[0] instanceof Rem &&
          l.instructions[0].remark === ''
        ) {
          return `${l.lineNo}`;
        }
        return l.source;
      })
      .join('\n');
  }

  /**
   * Renumber the current program.
   */
  renum(): void {
    const renumbering: Renumbering = {};

    // Used to calculate padding
    let maxToLength: number = 0;

    for (let i = 0; i < this.program.lines.length; i++) {
      const line = this.program.lines[i];

      // Calculate new line number
      const from = line.lineNo;
      const to = (i + 1) * 10;
      const toStr = String(to);
      renumbering[from] = {
        to,
        toStr,
        shift: 0,
        source: '',
      };

      // Track max lengths
      maxToLength = Math.max(maxToLength, toStr.length);
    }

    for (const line of this.program.lines) {
      const from = line.lineNo;
      const { to, toStr } = renumbering[from];

      // Justification
      const leftPadding =
        this.justify === Justify.Left
          ? ''
          : ' '.repeat(maxToLength - toStr.length);
      const rightPadding =
        this.justify === Justify.Left
          ? ' '.repeat(maxToLength - toStr.length + 1)
          : ' ';
      const fromWidth = line.source.prefix.length;
      const toWidth = leftPadding.length + toStr.length + rightPadding.length;
      const shift = toWidth - fromWidth;

      // Renumber the line
      line.lineNo = to;
      line.source.lineNo = toStr;

      // Justify the new numbering
      line.source.leadingWs = leftPadding;
      line.source.separatingWs = rightPadding;

      // For use with renumbering/formatting warnings
      renumbering[from].shift = shift;
      renumbering[from].source = line.source.toString();

      for (const instr of line.instructions) {
        instr.offsetStart += shift;
        instr.offsetEnd += shift;
      }
    }

    // Renumber/format warnings
    if (this.warning) {
      for (let i = 0; i < this.warning.warnings.length; i++) {
        const warning = this.warning.warnings[i];
        const { to, shift, source } = renumbering[warning.lineNo];
        if (to) {
          warning.lineNo = to;
          warning.source = source;
          warning.offsetStart += shift;
          warning.offsetEnd += shift;
        }
      }
    }
  }

  // A binary search to find the index containing a lineNo. If there's no
  // exact match, return the index just prior.
  private findLineIndex(lineNo: number): Index {
    let lower = 0;
    let upper = this.program.lines.length - 1;

    if (!this.program.lines.length) {
      return { i: HEAD, lineNo: null, match: false };
    }

    let lowerLine = this.program.lines[lower];
    let upperLine = this.program.lines[upper];

    if (lowerLine.lineNo > lineNo) {
      return {
        i: HEAD,
        lineNo: null,
        match: false,
      };
    }

    if (lowerLine.lineNo === lineNo) {
      return {
        i: lower,
        lineNo: lowerLine.lineNo,
        match: true,
      };
    }

    if (upperLine.lineNo <= lineNo) {
      return {
        i: upper,
        lineNo: upperLine.lineNo,
        match: upperLine.lineNo === lineNo,
      };
    }

    // At this point, we know that the line, if defined, *must* exist
    // *between* lower and upper.

    while (true) {
      // We've exhausted our options and don't have a match. Since lower and
      // upper are guaranteed to be below and above our line respectively,
      // we can just return lower as the prior line.
      if (upper - lower <= 1) {
        return {
          i: lower,
          lineNo: lowerLine.lineNo,
          match: false,
        };
      }

      const middle = Math.floor((lower + upper) / 2);
      const middleLine = this.program.lines[middle];

      // Exact match!
      if (middleLine.lineNo === lineNo) {
        return {
          i: middle,
          lineNo: middleLine.lineNo,
          match: true,
        };
      }

      // middle is a new bound, either lower or upper
      if (middleLine.lineNo > lineNo) {
        upper = middle;
        upperLine = middleLine;
      } else if (middleLine.lineNo < lineNo) {
        lower = middle;
        lowerLine = middleLine;
      }
    }
  }

  /**
   * Set a line and its corresponding warnings.
   *
   * If a line has no instructions, delete the corresponding line. Otherwise,
   * insert or update the line based on lineNo.
   */
  setLine(line: Line, warning: ParseWarning | null): void {
    const { i, match } = this.findLineIndex(line.lineNo);

    if (!line.instructions.length) {
      if (match) {
        this.program.lines.splice(i, 1);
        this.warning = removeFromParseError(
          this.warning,
          'lineNo',
          line.lineNo,
        );
      }
      return;
    }

    if (match) {
      this.program.lines[i] = line;
      if (warning) {
        this.warning = mergeParseErrors([this.warning, warning]);
      }
      return;
    }

    this.program.lines.splice(i + 1, 0, line);
  }
}
