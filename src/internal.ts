
export type LineNo = number;

export enum Code {
  Print
}

export interface Line {
  lineNo: LineNo;
  commands: Code[]
}
