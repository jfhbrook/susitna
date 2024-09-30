export class LineSource {
  constructor(
    public leadingWhitespace: string,
    public lineNo: string,
    public trailingWhitespace: string,
    public rest: string = '',
  ) {}

  public toString(): string {
    return [
      this.leadingWhitespace,
      this.lineNo,
      this.trailingWhitespace,
      this.rest,
    ].join('');
  }
}
