use std::fs::File;
use std::io::{BufRead, BufReader, Write};

use tracing::debug;

use crate::exception::Exception;
use crate::host::Host;
use crate::parse;
use crate::script::Script;
use crate::value::Value;

#[derive(Debug)]
pub struct Editor {
    script: Script,
}

impl Editor {
    pub fn new() -> Self {
        Editor {
            script: Script::new(),
        }
    }

    pub fn script(&self) -> &Script {
        &self.script
    }

    pub fn insert(&mut self, line_no: i64, line: String) {
        self.script.insert(line_no, line);
    }

    // TODO: right now I'm delegating exec to the Instruction impl, which
    // for Reasons requires that there are no generic methods
    // fn load_script<P: AsRef<Path> + std::fmt::Debug>(&mut self, filename: P) -> Result<()> {
    pub fn load_script(&mut self, filename: &String) -> Result<(), Exception> {
        let file = File::open(filename)?;
        let mut script = Script::new();

        for line in BufReader::new(file).lines() {
            let line = line?;

            let (line_no, line) = parse::input(line.as_str())?;

            if let Some(line_no) = line_no {
                script.insert(line_no, line);
            } else {
                debug!("non-numbered line: {}", line);
            }
        }

        self.script = script;

        Ok(())
    }

    // fn save_script<P: AsRef<Path> + std::fmt::Debug>(&mut self, filename: P) -> Result<()> {
    pub fn save_script(&mut self, filename: &String) -> Result<(), Exception> {
        let mut file = File::create(filename)?;
        for (line_no, line) in self.script.lines().iter() {
            file.write_all(format!("{} {}", line_no, line).as_bytes())?;
        }
        Ok(())
    }

    pub fn list<H>(&mut self, host: &H)
    where
        H: Host,
    {
        for (line_no, line) in self.script.lines().iter() {
            host.write_out(&Value::String(String::from(format!(
                "{} {}",
                line_no, line
            ))));
        }
    }
}
