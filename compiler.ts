import { Exception } from './exceptions';
import { Result, Ok } from './result';
import { Tree, Input, Program } from './ast';

export type CompilerResult<N> = Result<N, Exception>;

//
// The compiler will, like the base parser, also follow a recursive descent
// pattern.
//

/*
 * Compile input or a program into an executable tree.
 */
export class Compiler {
  compile(tree: Input | Program): CompilerResult<Tree> {
    if (tree instanceof Input) {
      return this.compileInput(tree);
    }
    return this.compileProgram(tree);
  }

  private compileInput(input: Input): CompilerResult<Tree> {
    return new Ok(input);
  }

  private compileProgram(program: Program): CompilerResult<Tree> {
    return new Ok(program);
  }
}
