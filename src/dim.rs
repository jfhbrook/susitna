// BASIC arrays. I'm not ready to implement yet, but I have grand designs so I
// want to start this file to take notes.

use anyhow::{ Result, Error };

pub enum Value {
    Number(i64),
    Real(f64),
    String(String)
    // Reference(i64)
}

pub enum Scalar {
    Number(i64),
    Real(f64),
    String(String)
}

pub enum Index {
    Simple(i64),
    Key(String),
    Tensor(Vec<i64>)
}

pub struct Slice {}

pub struct Callable {}

pub struct Dim {
}

// I'd actually like this to be more dynamic, but there are a LOT of challenges
// when it comes to object safety and dyn traits:
//
// https://doc.rust-lang.org/reference/items/traits.html#object-safety
impl Dim {
    // base operations
    fn new(dimensions: Vec<i64>) -> Result<Dim, Error> {
        Ok(Dim {})
    }

    fn get(&self, i: Index) -> Result<i64, Error> {
        unimplemented!("get");
    }

    fn set(&self, i: Index, value: Value) -> Result<(), Error> {
        unimplemented!("set");
    }

    // length is total number of elements, both indexes and keys
    fn length(&self) -> Result<i64, Error> {
        unimplemented!("length");
    }

    // size is m x n x ... for numerical keys only
    fn size(&self) -> Result<Dim, Error> {
        unimplemented!("size");
    }

    fn slice(&self, slice: Slice) -> Result<(), Error> {
        unimplemented!("slice");
    }

    // scalar operations
    fn add_scalar(&self, scalar: Scalar) -> Result<Dim, Error> {
        unimplemented!("add_scalar_to");
    }

    fn sub_scalar_from(&self, scalar: Scalar) -> Result<Dim, Error> {
        unimplemented!("sub_scalar_from");
    }

    fn sub_from_scalar(&self, scalar: Scalar) -> Result<Dim, Error> {
        unimplemented!("sub_from_scalar");
    }

    fn mul_scalar(&self, scalar: Scalar) -> Result<Dim, Error> {
        unimplemented!("mul_scalar");
    }

    fn div_by_scalar(&self, scalar: Scalar) -> Result<Dim, Error> {
        unimplemented!("div_by_scalar");
    }

    fn div_scalar_by(&self, scalar: Scalar) -> Result<Dim, Error> {
        unimplemented!("div_scalar_by");
    }

    fn neg(&self) -> Result<dim, Error> {
        unimplemented!("neg");
    }

    // element-wise operations

    // tensor operations

    // iterative operations
    fn keys(&self) -> Result<Dim, Error> {
        unimplemented!("keys");
    }

    fn values(&self) -> Result<Dim, Error> {
        unimplemented!("values");
    }

    fn entries(&self) -> Result<Dim, Error> {
        unimplemented!("entries");
    }

    // function operations
    fn map(&self, callable: Callable) -> Result<Dim, Error> {
        unimplemented!("map");
    }

    fn filter(&self, callable: Callable) -> Result<Dim, Error> {
        unimplemented!("filter");
    }

    fn reduce(&self, acc: Value, callable: Callable) -> Result<Value, Error> {
        unimplemented!("reduce");
    }

    // stack operations
    fn push(&self, value: Value) -> Result<(), Error> {
        unimplemented!("push");
    }

    fn pop(&self) -> Result<Value, Error> {
        unimplemented!("pop");
    }

    fn unshift(&self, value: Value) -> Result<(), Error> {
        unimplemented!("unshift");
    }

    fn shift(&self) -> Result<Value, Error> {
        unimplemented!("shift");
    }

    // object-oriented operations
    fn extend(&self, prototype: Dim) -> Result<(), Error> {
        unimplemented!("extend");
    }
}
