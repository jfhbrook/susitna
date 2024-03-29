import { Traceback, Frame, Code } from '../../traceback';

export const FILENAME = '/home/josh/script.bas';

export const CODE = new Code(FILENAME);
export const FRAME = new Frame(null, CODE);
export const TRACEBACK = new Traceback(null, FRAME, 100);
