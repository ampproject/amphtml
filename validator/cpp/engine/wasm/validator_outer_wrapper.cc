// This file selects which C++ functions are exported to WebAssembly
#include <emscripten/bind.h>

#include "cpp/engine/wasm/validator_inner_wrapper.h"

EMSCRIPTEN_BINDINGS(what) {
  emscripten::function("renderErrorMessage",
                       &amp::validator::RenderErrorMessage);
  emscripten::function("renderInlineResult",
                       &amp::validator::RenderInlineResult);
  emscripten::function("validateString", &amp::validator::ValidateString);
}
