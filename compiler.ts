import { Tree, Input, Program } from './ast';

//
// The compiler will, like the base parser, also follow a recursive descent
// pattern.
//

/*
 * Compile input or a program into an executable tree.
 */
export class Compiler {
  compile(tree: Input | Program): Tree {
    if (tree instanceof Input) {
      return this.compileInput(tree);
    }
    return this.compileProgram(tree);
  }

  private compileInput(input: Input): Tree {
    return input;
  }

  private compileProgram(program: Program): Tree {
    return program;
  }
}
