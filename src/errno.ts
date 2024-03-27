/**
 * An OS error code.
 *
 * These are conceptually similar to C error codes, as in errno.h. However,
 * they are actually based on libuv errors and further refined in Node.JS core.
 * Most of these map to errno.h on POSIX, but differ on Windows.
 *
 * This type is non-exhaustive, and is based on Node.js's documented "Common
 * system errors" combined with any errors I encounter in practice.
 *
 * See: https://nodejs.org/api/errors.html#common-system-errors
 */
export enum ErrorCode {
  Access = 'EACCES',
  AddressInUse = 'EADDRINUSE',
  ConnectionRefused = 'ECONNREFUSED',
  ConnectionReset = 'ECONNRESET',
  Exists = 'EEXIST',
  IsDirectory = 'EISDIR',
  MaxFileDescriptors = 'EMFILE',
  NoEntity = 'ENOENT',
  NotADirectory = 'ENOTDIR',
  NotEmpty = 'ENOTEMPTY',
  DnsNotFound = 'ENOTFOUND',
  NotPermitted = 'EPERM',
  BrokenPipe = 'EPIPE',
  TimedOut = 'ETIMEDOUT',
}
