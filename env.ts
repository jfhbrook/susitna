export type EnvValue = string | undefined;

/**
 * Parse a boolean environment variable.
 *
 * The following values are considered false:
 *
 * - undefined
 * - an empty string
 * - the number 0
 * - the string 'false' (case insensitive)
 *
 * @param value The value to parse.
 */
export function parseBoolEnv(value: EnvValue): boolean {
  if (!value) {
    return false;
  }

  if (value.match(/^\W*$/)) {
    return false;
  }

  if (value.match(/^\W*0\W*$/)) {
    return false;
  }

  if (value.match(/^\W*false\W*$/i)) {
    return false;
  }

  return true;
}
