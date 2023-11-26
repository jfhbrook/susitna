use rustyline::error::ReadlineError;
use tracing::{debug, error, info, warn};

use crate::ast::Exception;
use crate::error::Error;
use crate::host::Host;
use crate::symbol::Value;

#[derive(Debug)]
pub struct ConsoleHost {
    readline: rustyline::DefaultEditor,
}

impl ConsoleHost {
    pub fn new() -> Self {
        let mut readline = rustyline::DefaultEditor::new().unwrap();

        if readline.load_history("/home/josh/.s7bas_history").is_err() {
            debug!("No previous history.");
        }

        ConsoleHost { readline }
    }
}

impl Drop for ConsoleHost {
    fn drop(&mut self) {
        if let Err(err) = self.readline.save_history("/home/josh/.s7bas_history") {
            debug!("{:?}", err);
        }
    }
}

impl Host for ConsoleHost {
    fn write_out(&self, value: &Value) {
        match value {
            Value::String(s) => {
                println!("{}", s);
            }
            Value::Integer(i) => {
                println!("{}", i);
            }
            Value::Real(r) => {
                println!("{}", r);
            }
            Value::Boolean(b) => {
                println!("{}", b);
            }
        }
    }

    fn write_error(&self, value: &Value) {
        match value {
            Value::String(s) => {
                eprintln!("{}", s);
            }
            Value::Integer(i) => {
                eprintln!("{}", i);
            }
            Value::Real(r) => {
                eprintln!("{}", r);
            }
            Value::Boolean(b) => {
                eprintln!("{}", b);
            }
        }
    }

    fn write_debug(&self, value: &Value) {
        match value {
            Value::String(s) => {
                debug!("{}", s);
            }
            Value::Integer(i) => {
                debug!("{}", i);
            }
            Value::Real(r) => {
                debug!("{}", r);
            }
            Value::Boolean(b) => {
                debug!("{}", b);
            }
        }
    }

    fn write_info(&self, value: &Value) {
        match value {
            Value::String(s) => {
                info!("{}", s);
            }
            Value::Integer(i) => {
                info!("{}", i);
            }
            Value::Real(r) => {
                info!("{}", r);
            }
            Value::Boolean(b) => {
                info!("{}", b);
            }
        }
    }

    fn write_warn(&self, value: &Value) {
        match value {
            Value::String(s) => {
                warn!("{}", s);
            }
            Value::Integer(i) => {
                warn!("{}", i);
            }
            Value::Real(r) => {
                warn!("{}", r);
            }
            Value::Boolean(b) => {
                warn!("{}", b);
            }
        }
    }

    fn write_exception(&self, exception: &Error) {
        error!("{:?}", exception);
    }

    fn input(&mut self, prompt: &String) -> Result<String, Error> {
        match self.readline.readline(format!("{} ", prompt).as_str()) {
            Ok(input) => {
                self.readline.add_history_entry(input.as_str())?;
                Ok(input)
            }
            Err(ReadlineError::Interrupted) => Err(Exception::KeyboardInterrupt.into()),
            Err(ReadlineError::Eof) => Err(Exception::Eof.into()),
            Err(err) => Err(err.into()),
        }
    }
}
