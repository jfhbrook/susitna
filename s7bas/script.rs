use std::collections::HashMap;

use crate::exception::Exception;
use crate::instruction::Instruction;
use crate::module::Module;
use crate::parse;

#[derive(Debug)]
pub struct Script {
    lines: HashMap<i64, String>,
}

impl Script {
    pub fn new() -> Self {
        Script {
            lines: HashMap::new(),
        }
    }

    pub fn insert(&mut self, line_no: i64, line: String) {
        if self.lines.contains_key(&line_no) && line.len() == 0 {
            self.lines.remove(&line_no);
        } else {
            self.lines.insert(line_no, line);
        }
    }

    pub fn get(&self, line_no: i64) -> Option<(i64, String)> {
        if let Some(line) = self.lines.get(&line_no) {
            Some((line_no, line.to_owned()))
        } else {
            None
        }
    }

    pub fn to_module(&self) -> Result<Module, Exception> {
        let mut line_nos: Vec<i64> = self.lines.keys().map(|key| key.to_owned()).collect();
        let mut line_pos: HashMap<i64, usize> = HashMap::new();
        let mut lines: HashMap<i64, Vec<Instruction>> = HashMap::new();

        line_nos.sort_unstable();

        for (i, line_no) in line_nos.iter().enumerate() {
            line_pos.insert(line_no.to_owned(), i);
            lines.insert(
                line_no.to_owned(),
                parse::command(self.lines.get(line_no).unwrap().to_owned().as_str())?,
            );
        }

        Ok(Module {
            line_nos,
            line_pos,
            lines,
        })
    }

    pub fn lines(&mut self) -> Vec<(i64, String)> {
        let mut line_nos: Vec<i64> = self.lines.keys().map(|key| key.to_owned()).collect();

        line_nos.sort_unstable();

        line_nos
            .iter()
            .map(|line_no| {
                (
                    line_no.to_owned(),
                    self.lines.get(&line_no).unwrap().to_owned(),
                )
            })
            .collect()
    }
}
