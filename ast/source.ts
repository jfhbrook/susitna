export class Source {
  constructor(
    public leadingWhitespace: string,
    public lineNo: string,
    public trailingWhitespace: string,
    public rest: string = '',
  ) {}

  public clone(): Source {
    return new Source(
      this.leadingWhitespace,
      this.lineNo,
      this.trailingWhitespace,
      this.rest,
    );
  }

  public toString(): string {
    return [
      this.leadingWhitespace,
      this.lineNo,
      this.trailingWhitespace,
      this.rest,
    ].join('');
  }
}
