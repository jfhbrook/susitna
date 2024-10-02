import { BaseException } from '../exceptions.mjs';
import { Formattable, Formatter } from '../format.mjs';

export class Nil implements Formattable {
  format(_formatter: Formatter): string {
    return 'nil';
  }
}

export const nil = new Nil();

export type Value = number | boolean | string | BaseException | Nil;
