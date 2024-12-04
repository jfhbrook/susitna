use std::collections::HashMap;
use neon::prelude::*;
use tracing::{debug, span, Level};
use tracing::span::Entered;
use lazy_static::lazy_static;
use tracing_subscriber;

fn open_span(mut cx: FunctionContext) -> NeonResult<Handle<JsFunction>> {
    let name = cx.argument::<JsString>(0)?.value(&mut cx);
    let span = span!(Level::TRACE, "{}", name);
    let entered = span.enter();

    let close_span = |mut cx: FunctionContext| -> JsResult<JsUndefined> {
        span;
        Ok(cx.undefined())
    }

    JsFunction::new(&mut cx, close_span)
}


#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    let mut idx: i64 = 0;

    let open = |mut cx: FunctionContext| -> JsResult<JsNumber> {
        HANDLES.insert(idx, entered);
        idx += 1;
        Ok(JsNumber::new(&mut cx, idx as f64))
    }

    let close = |mut cx: FunctionContext| -> JsResult<JsUndefined> {
        let handle = cx.argument::<JsNumber>(0)?.value(&mut cx) as i64;
        handles.remove(&handle);
        Ok(cx.undefined())
    }

    cx.export_function("open", open)?;
    cx.export_function("close", close)?;
    Ok(())
}
