// yabasic stores a bunch of things adjacent to symbols in here:
//
// 1. the symbol stack, which is not the same as the call stack. the call
//    stack is what tracks where you're supposed to return to; the symbol stack
//    is what manages scope. note that this includes function arguments.
// 2. symbol stack *entries*, which includes labels/GOTOs (because labels are
//    scoped)
// 3. operations related to arrays - allocation, offsets/indexing, access
//

// The value of a "stack entry". For now, this is values that a variable
// may contain, but it might be expanded to include other things, like how
// yabasic's stack entries do. This should at least let me stub out other
// parts of the interpreter, though.
#[derive(PartialEq, Debug, Clone)]
pub(crate) enum Value {
    Real(f64),
    Integer(i64),
    String(String),
    Boolean(bool),
}

// symbol stack - not the same as the call stack! this is what manages scope.
// note this includes function arguments, etc.
pub(crate) struct Symbols {}
