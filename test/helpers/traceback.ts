import { Traceback, Frame, Code } from '../../traceback';

export const FILENAME = './script.bas';

export const TRACEBACK = new Traceback(
  null,
  new Frame(null, new Code('FILENAME')),
  100,
);
