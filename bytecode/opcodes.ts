export enum OpCode {
  // Constants and values
  IntConstant,
  RealConstant,
  StringConstant,
  Nil,
  True,
  False,

  Pop,

  // Conversions
  IntToReal,
  IntToBool,
  IntToString,
  RealToBool,
  RealToString,
  BoolToInt,
  BoolToString,

  // Operators
  //
  // TODO: There are a bunch of poorly-understood trade-offs between typed
  // instructions, instanceof checks in the VM, and doing type conversions
  // before comparison. I'd have to try some things out. But the major
  // consideration will likely be performance.

  // Comparisons are typed
  IntEq,
  IntGt,
  IntGe,
  IntLt,
  IntLe,
  RealEq,
  RealGt,
  RealGe,
  RealLt,
  RealLe,
  BoolEq,
  BoolGt,
  BoolGe,
  BoolLt,
  BoolLe,
  // Strings are compared lexicographically
  StringEq,
  StringGt,
  StringGe,
  StringLt,
  StringLe,

  // Logical operators are untyped - convert to bool first
  And,
  Or,
  Not,

  // Math operators
  IntAdd,
  IntSub,
  IntMul,
  IntDiv,
  IntNeg,
  RealAdd,
  RealSub,
  RealMul,
  RealDiv,
  RealNeg,

  // String operators
  StringCat,

  // Commands
  Print,

  // Jumping
  Jump,
  JumpIfFalse,
  Loop,

  Return,
}
