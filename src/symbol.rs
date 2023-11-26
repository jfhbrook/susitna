// yabasic stores a bunch of things adjacent to symbols in here:
//
// 1. the symbol stack, which is not the same as the call stack. the call
//    stack is what tracks where you're supposed to return to; the symbol stack
//    is what manages scope. note that this includes function arguments.
// 2. symbol stack *entries*, which includes labels/GOTOs (because labels are
//    scoped)
// 3. operations related to arrays - allocation, offsets/indexing, access
