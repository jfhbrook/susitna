mod console;

use crate::ast::Exception;
use crate::error::Error;
use crate::symbol::Value;

pub trait Host {
    fn write_out(&self, value: &Value) -> ();
    fn write_error(&self, value: &Value) -> ();
    fn write_debug(&self, value: &Value) -> ();
    fn write_info(&self, value: &Value) -> ();
    fn write_warn(&self, value: &Value) -> ();

    // TODO: This bit of cognitive dissonance between exception and error is
    // because this method needs to print out errors which can't be represented
    // in the AST; but host also makes a distinction between the error *stream*
    // and Exceptions.
    //
    // The answer to this conundrom is to convert all Error cases into
    // language Exceptions. But this is OK for now.
    fn write_exception(&self, exception: &Error) -> ();

    fn write_fd(&self, fd: i64, value: &Value) -> Result<(), Exception> {
        if fd == 1 {
            self.write_out(value);
        } else if fd == 2 {
            self.write_error(value);
        } else if fd == 3 {
            self.write_debug(value);
        } else if fd == 4 {
            self.write_info(value);
        } else if fd == 5 {
            self.write_warn(value);
        // TODO: Does powershell really use stream 6 to write out exceptions?
        // This seems a little odd.
        } else if fd == 6 {
            self.write_exception(&Exception::FileError(format!("{:?}", value)).into());
        } else {
            self.write_exception(
                &Exception::FileError(format!("unknown file descriptor: {:?}", value)).into(),
            );
        };
        Ok(())
    }

    fn input(&mut self, prompt: &String) -> Result<String, Error>;
}
