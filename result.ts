// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class Result<T, E, W = unknown> {
  constructor(public result: T) {}
}

export class Ok<T, E, W = unknown> extends Result<T, E, W> {
  constructor(result: T) {
    super(result);
  }
}

export class Err<T, E, W = unknown> extends Result<T, E, W> {
  constructor(
    result: T,
    public error: E,
  ) {
    super(result);
  }
}

export class Warn<T, E, W = unknown> extends Result<T, E, W> {
  constructor(
    result: T,
    public warning: W,
  ) {
    super(result);
  }
}
