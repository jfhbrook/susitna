// BASIC arrays. I'm not ready to implement yet, but I have grand designs so I
// want to start this file to take notes.

use anyhow::{ Result, Error };

pub enum Index<'a> {
    Number(i64),
    Key(&'a String)
    // TODO: various ranges
}

pub struct Array {}

pub enum Value<'a> {
    Number(i64),
    Real(f64),
    String(&'a String),
    // Array(&'a Array)
}

pub trait Callable {
    fn call(&self, args: Vec<&Value>) -> Result<Value, Error>;
}

// TODO: defaults which return Exceptions
// TODO: visitors for Arrays
// TODO: &self ??
pub trait BinaryOperator {
    fn num_num(&self, a: i64, b: i64) -> Result<Value, Error>;
    fn num_real(&self, a: i64, b: f64) -> Result<Value, Error>;
    fn num_string(&self, a: i64, b: &String) -> Result<Value, Error>;

    fn real_num(&self, a: f64, b: i64) -> Result<Value, Error>;
    fn real_real(&self, a: f64, b: f64) -> Result<Value, Error>;
    fn real_string(&self, a: f64, b: &String) -> Result<Value, Error>;

    fn string_num(&self, a: &String, b: i64) -> Result<Value, Error>;
    fn string_real(&self, a: &String, b: f64) -> Result<Value, Error>;
    fn string_string(&self, a: &String, b: &String) -> Result<Value, Error>;
}

impl Callable for dyn BinaryOperator {
    fn call(&self, args: Vec<&Value>) -> Result<Value, Error> {
        match (args[0], args[1]) {
            (Value::Number(a), Value::Number(b)) => self.num_num(*a, *b),
            (Value::Number(a), Value::Real(b)) => self.num_real(*a, *b),
            (Value::Number(a), Value::String(b)) => self.num_string(*a, b),
            (Value::Real(a), Value::Number(b)) => self.real_num(*a, *b),
            (Value::Real(a), Value::Real(b)) => self.real_real(*a, *b),
            (Value::Real(a), Value::String(b)) => self.real_string(*a, b),
            (Value::String(a), Value::Number(b)) => self.string_num(a, *b),
            (Value::String(a), Value::Real(b)) => self.string_real(a, *b),
            (Value::String(a), Value::String(b)) => self.string_string(a, b)
        }
    }
}

pub trait UnaryOperator {
    fn num(&self, a: i64) -> Result<Value, Error>;
    fn real(&self, a: f64) -> Result<Value, Error>;
    fn string(&self, a: &String) -> Result<Value, Error>;
}

impl Callable for dyn UnaryOperator {
    fn call(&self, args: Vec<&Value>) -> Result<Value, Error> {
        match args[9] {
            Value::Number(a) => self.num(*a),
            Value::Real(a) => self.real(*a),
            Value::String(a) => self.string(a)
        }
    }
}

// TODO: should these be straightforward structs/impls?
pub trait Get {
    fn string(&self, i: Index) -> Result<Value, Error>;
}

pub trait Set {
    fn string(&self, i: Index, v: &String) -> Result<Value, Error>;
}

/* base ops:
 * - new(mn, n)
 * - get
 * - set
 * - length
 * - size
 * - slice
 *
 * associative ops:
 * - get (key)
 * - set (key)
 * element-wise ops
 * linear ops
 * iterative ops:
 * - keys
 * - values
 * - entries
 * functional ops:
 * - map
 * - filter
 * - reduce
 * sort
 * stack ops
 * - push
 * - pop
 * - unshift
 * - shift
 * oop
 * - extend
 */
