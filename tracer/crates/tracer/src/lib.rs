use neon::prelude::*;
use once_cell::sync::OnceCell;
use std::env;
use std::ops::Deref;
use tokio::runtime::Runtime;
use tracing::{debug, span, Level};
use tracing_subscriber;

fn trace_enabled() -> bool {
    match env::var("NO_TRACE") {
        Ok(no_trace) => {
            let no_trace = no_trace.trim();
            !(no_trace == "0" || no_trace.to_lowercase() == "false")
        }
        Err(_) => false,
    }
}

fn trace(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    if trace_enabled() {
        let message = cx.argument::<JsString>(0)?.value(&mut cx);
        debug!("{}", message);
    }
    Ok(cx.undefined())
}

fn runtime<'a, C: Context<'a>>(cx: &mut C) -> NeonResult<&'static Runtime> {
    static RUNTIME: OnceCell<Runtime> = OnceCell::new();

    RUNTIME.get_or_try_init(|| Runtime::new().or_else(|err| cx.throw_error(err.to_string())))
}

fn async_span(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let name = cx.argument::<JsString>(0)?.value(&mut cx);
    let callback = cx.argument::<JsFunction>(1)?;

    let span = span!(Level::TRACE, "{}", name);
    let _guard = span.enter();

    let p: Handle<JsPromise> = callback.call_with(&mut cx).apply(&mut cx)?;
    let (deferred, result) = cx.promise();

    let rt = runtime(&mut cx)?;

    let fut = p.to_future(&mut cx, |mut cx, result| Ok(()))?;

    rt.spawn(async move {
        fut.await?;

        deferred.resolve(&mut cx, cx.undefined());
        Ok(())
    });
    Ok(result)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    tracing_subscriber::fmt::init();
    cx.export_function("trace", trace)?;
    cx.export_function("async_span", async_span)?;
    Ok(())
}
