import table from 'text-table';

import { formatter } from '../format';
import { OpCode } from './opcodes';
import { Chunk } from './chunk';

type LineNo = string;
type Offset = string;
type Code = string;
type Row = [LineNo, Offset, Code, string];

function chunkName(_chunk: Chunk): string {
  return '<chunk>';
}

/*
function toHex(value: number): string {
  return `0x${value.toString(16)}`;
}
*/

export function disassemble(chunk: Chunk): string {
  const data: Row[] = [];
  const header = `Disassembly of ${chunkName(chunk)}:`;

  let offset = 0;
  const lineNo = 0;

  function done() {
    return offset >= chunk.code.length;
  }

  /*
  function peek(): number {
    return chunk.code[offset];
  }
  */

  function advance(): number {
    offset++;
    return chunk.code[offset - 1];
  }

  function simple(code: string): Row {
    return [String(lineNo), String(offset), code, ''];
  }

  function constant(): Row {
    return [
      String(lineNo),
      String(offset),
      'CONSTANT',
      formatter.format(chunk.constants[advance()]),
    ];
  }

  /*
  function byte(code: string): Row {
    return [String(lineNo), String(offset), code, toHex(advance())];
  }
  */

  while (!done()) {
    switch (advance()) {
      case OpCode.Constant:
        data.push(constant());
        break;
      case OpCode.Nil:
        data.push(simple('NIL'));
        break;
      case OpCode.True:
        data.push(simple('TRUE'));
        break;
      case OpCode.False:
        data.push(simple('FALSE'));
        break;
      case OpCode.Pop:
        data.push(simple('POP'));
        break;
      case OpCode.Eq:
        data.push(simple('NIL'));
        break;
      case OpCode.Gt:
        data.push(simple('GT'));
        break;
      case OpCode.Ge:
        data.push(simple('GE'));
        break;
      case OpCode.Lt:
        data.push(simple('LT'));
        break;
      case OpCode.Le:
        data.push(simple('LE'));
        break;
      case OpCode.Ne:
        data.push(simple('NE'));
        break;
      case OpCode.And:
        data.push(simple('AND'));
        break;
      case OpCode.Or:
        data.push(simple('OR'));
        break;
      case OpCode.Not:
        data.push(simple('NOT'));
        break;
      case OpCode.Add:
        data.push(simple('ADD'));
        break;
      case OpCode.Sub:
        data.push(simple('SUB'));
        break;
      case OpCode.Mul:
        data.push(simple('MUL'));
        break;
      case OpCode.Div:
        data.push(simple('DIV'));
        break;
      case OpCode.Neg:
        data.push(simple('NEG'));
        break;
      case OpCode.Print:
        data.push(simple('PRINT'));
        break;
      case OpCode.Jump:
        data.push(simple('JUMP'));
        break;
      case OpCode.JumpIfFalse:
        data.push(simple('JUMP_IF_FALSE'));
        break;
      case OpCode.Loop:
        data.push(simple('LOOP'));
        break;
      case OpCode.Return:
        data.push(simple('RETURN'));
        break;
    }
  }

  return `${header}\n${table(data)}`;
}
