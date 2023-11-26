// This file corresponds to flow.c in yabasic. It's largely concerned with
// managing the call stack(s) for functions and subroutines (including defining
// variables/params), gotos, and - interestingly enough - switch statements.
// It also has to, on some level, handle array access, since - as far as I can
// tell - arrays are indexed with parens.
//
// This is probably going to involve translating the global data structure
// into a Stack struct of some kind, with the functions being traits.
