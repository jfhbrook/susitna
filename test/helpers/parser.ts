import { Parser, ParseResult } from '../../parser';
import { Input, Program } from '../../ast';

export function parseInput(source: string): ParseResult<Input> {
  const parser = new Parser();
  const input = parser.parseInput(source);
  return input;
}

export function parseProgram(
  source: string,
  filename: string,
): ParseResult<Program> {
  const parser = new Parser();
  const program = parser.parseProgram(source, filename);
  return program;
}
