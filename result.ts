import { BaseException } from './exceptions';
import { RuntimeFault } from './faults';

/*
 * A result of some kind. Can either represent a value or an exception
 * state.
 */
export abstract class Result<T, E extends BaseException> {
  /**
   * Map over the value if it exists.
   *
   * @param fn The mapping function.
   */
  abstract then(fn: (value: T) => T): Result<T, E>;

  /**
   * Catch an exception and convert it into a new Result.
   *
   * @param fn The exception handling function.
   */
  abstract catch(fn: (exc: E) => Result<T, E>): Result<T, E>;

  /**
   * Throw a RuntimeFault of exceptions haven't been handled.
   */
  abstract done(): void;
}

/**
 * A result representing a value.
 */
export class Ok<T, E extends BaseException> extends Result<T, E> {
  constructor(public value: T) {
    super();
  }

  then(fn: (value: T) => T): Result<T, E> {
    return new Ok<T, E>(fn(this.value));
  }

  catch(_: (exc: E) => Result<T, E>): Result<T, E> {
    return this;
  }

  done(): void {}
}

/**
 * A result representing an exception.
 */
export class Exc<T, E extends BaseException> extends Result<T, E> {
  constructor(public exc: E) {
    super();
  }

  then(_: (value: T) => T): Result<T, E> {
    return this;
  }

  catch(fn: (exc: E) => Result<T, E>): Result<T, E> {
    return fn(this.exc);
  }

  done(): void {
    throw RuntimeFault.fromException(this.exc);
  }
}
