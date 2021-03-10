#!/bin/bash

# Run this file with bash to generate new closure based compiled
# fragments for inclusion into AMP.

CLOSURE_LIB=../../node_modules/google-closure-library

readonly VERSION=`node -e 'console.log(require("../../node_modules/google-closure-library/package.json").version)'`

# We manually list deps, because this yields a 1KB smaller file size
# over automatically managed dependencies.
# As an output wrapper we add and export at the end, so we can use this
# file from ES6 modules.
npx google-closure-compiler \
    --compilation_level ADVANCED_OPTIMIZATIONS \
    --output_wrapper "/* Generated from closure library version $VERSION */\
const window = {Uint8Array: Uint8Array};\
export const sha384 = (function(window){\
%output%;\
return window.__AMP_SHA384_DIGEST;\
}).call(window, window);" \
    --manage_closure_dependencies \
    --process_closure_primitives \
    --use_types_for_optimization \
    --language_out=ECMASCRIPT5 \
    --formatting=PRETTY_PRINT \
    --define "goog.DEBUG=false" \
    --js "sha384.js" \
    --js "$CLOSURE_LIB/closure/goog/base.js" \
    --js "$CLOSURE_LIB/closure/goog/array/array.js" \
    --js "$CLOSURE_LIB/closure/goog/asserts/asserts.js" \
    --js "$CLOSURE_LIB/closure/goog/crypt/crypt.js" \
    --js "$CLOSURE_LIB/closure/goog/crypt/hash.js" \
    --js "$CLOSURE_LIB/closure/goog/crypt/sha2_64bit.js" \
    --js "$CLOSURE_LIB/closure/goog/crypt/sha384.js" \
    --js "$CLOSURE_LIB/closure/goog/debug/error.js" \
    --js "$CLOSURE_LIB/closure/goog/dom/nodetype.js" \
    --js "$CLOSURE_LIB/closure/goog/math/long.js" \
    --js "$CLOSURE_LIB/closure/goog/reflect/reflect.js" \
    --js_output_file "sha384-generated.js"
