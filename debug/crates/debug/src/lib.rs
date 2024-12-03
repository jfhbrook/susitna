use neon::prelude::*;
use tracing_subscriber;

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello node"))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    tracing_subscriber::fmt::init();
    cx.export_function("hello", hello)?;
    Ok(())
}
