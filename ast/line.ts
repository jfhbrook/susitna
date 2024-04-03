import { Cmd } from './cmd';

export class Line {
  constructor(
    public lineNo: number,
    public commands: Cmd[]
  ) {}
}
