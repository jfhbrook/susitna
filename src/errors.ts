/**
 * Tag an Error class with a name. JavaScript struggles with subclassing Error
 * and you need two things to make it work:
 *
 * 1. Manually set the name of the prototype. This must be done for every
 *    subclass in the chain. This is a decorator to improve the ergonomics of
 *    that.
 * 2. Manually call Object.setPrototypeOf(this, new.target.prototype) in the
 *    constructor. Unfortunately, there is no good way to improve the
 *    ergonomics of this. It is, however, only necessary for the first
 *    subclass.
 *
 * @param name The name of the error.
 * @returns a decorator of Error classes.
 */
export function errorType<E extends any>(name: string) {
  return function (cls: E): E {
    (cls as any).prototype.name = name;
    return cls;
  };
}
