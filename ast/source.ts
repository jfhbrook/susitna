//
// A tuple-like class to store source code. This is needed so we can easily
// renumber source lines without having to use regular expressions.
//

export class Source {
  public static UNKNOWN = new Source('', '', '', '<unknown>');

  constructor(
    public leadingWs: string,
    public lineNo: string,
    public separatingWs: string,
    public source: string,
  ) {}

  public static command(source: string): Source {
    return new Source('', '', '', source);
  }

  public clone(): Source {
    return new Source(
      this.leadingWs,
      this.lineNo,
      this.separatingWs,
      this.source,
    );
  }

  public get prefix(): string {
    return this.leadingWs + this.lineNo + this.separatingWs;
  }

  public toString(): string {
    return this.prefix + this.source;
  }
}
