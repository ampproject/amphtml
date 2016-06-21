# Run this file with bash to generate new closure based compiled
# fragments for inclusion into AMP.

# $1 is a path to a closure compiler jar file.
# $2 is a path to a closure library directory.

# compile-encode-byte-array-trampoline.sh ../closure-compiler/compiler.jar ../../../../closure-library/closure-library/closure


readonly GIT_COMMIT=`sh -c "cd $2 && git log --pretty=format:'%H' -n 1"`


# We manually list deps, because this yields a 1KB smaller file size
# over automatically managed dependencies.
# As an output wrapper we add and export at the end, so we can use this
# file from ES6 modules.
java -jar $1 \
    --compilation_level ADVANCED_OPTIMIZATIONS \
    --js "encode-byte-array-trampoline.js" \
    --js "base64.js" \
    --js "$2/goog/crypt/crypt.js" \
    --js "$2/goog/base.js" \
    --js "$2/goog/asserts/asserts.js" \
    --js "$2/goog/array/array.js" \
    --js "$2/goog/debug/error.js" \
    --js "$2/goog/dom/nodetype.js" \
    --js "$2/goog/string/string.js" \
    --js_output_file "encode-byte-array-trampoline-generated.js" \
    --output_wrapper "/* Generated from closure library commit $GIT_COMMIT */%output%;export function encodeByteArray(input, opt_webSafe) { return encodeByteArrayEx(input, opt_webSafe) };" \
    --manage_closure_dependencies \
    --process_closure_primitives \
    --use_types_for_optimization \
    --language_in=ECMASCRIPT5 \
    --language_out=ECMASCRIPT5 \
    --define "goog.DEBUG=false"
