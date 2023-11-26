use std::collections::HashMap;

use crate::instruction::Instruction;

#[derive(Debug)]
pub struct Module {
    pub(crate) line_nos: Vec<i64>,
    pub(crate) line_pos: HashMap<i64, usize>,
    pub(crate) lines: HashMap<i64, Vec<Instruction>>,
}

impl Module {
    pub fn new() -> Module {
        Module {
            line_nos: vec![],
            line_pos: HashMap::new(),
            lines: HashMap::new(),
        }
    }
    pub fn zero(&self) -> Option<i64> {
        if self.lines.len() == 0 {
            return None;
        }
        Some(self.line_nos[0])
    }

    pub fn next(&self, line_no: i64) -> Option<i64> {
        if let Some(i) = self.line_pos.get(&line_no) {
            let i = i + 1;
            if i >= self.line_pos.len() {
                None
            } else {
                Some(self.line_nos[i])
            }
        } else {
            None
        }
    }

    pub fn prev(&self, line_no: i64) -> Option<i64> {
        if let Some(i) = self.line_pos.get(&line_no) {
            if i < &1 {
                None
            } else {
                Some(self.line_nos[i - 1])
            }
        } else {
            None
        }
    }

    pub fn load(&self, line_no: i64) -> Option<&Vec<Instruction>> {
        self.lines.get(&line_no)
    }
}
