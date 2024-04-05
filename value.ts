import { BaseException } from './exceptions';
import { Formattable, Formatter } from './format';

export class Nil implements Formattable {
  format(_formatter: Formatter): string {
    return 'nil';
  }
}

export const nil = new Nil();

export type Value = number | string | boolean | BaseException | Nil;
