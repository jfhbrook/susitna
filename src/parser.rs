// This file will have the parser code. These will take a Tokens collection
// type and return Expressions, Statements, etc.
//
// I really need the lexer code to be complete before I can take this too
// seriously. But once I'm ready, there are going to be two major references:
//
// 1. yabasic-rs's parse.rs file and/or yabasic's parser. The yabasic parser
//    will need some heavy translation because it's suuuuuuuuuper stateful;
//    the rust port makes very light progress in that direction, so it may be
//    a better reference in places. That said, this is going to tell me what
//    the shape of the actual expressions are.
// 2. monkey-rust's parser. This is going to be an example of how to think
//    about parsing with rust/nom. The work I did in the lexer anticipates
//    the strategy used by monkey-rust, so I'll want to use that to get an
//    idea for how to actually structure things.
