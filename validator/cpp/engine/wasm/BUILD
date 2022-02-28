# Wraps AMP Validator into a WebAssembly library,
# which can be used by javascript files.

load("@bazel_skylib//rules:build_test.bzl", "build_test")
load("@emsdk//emscripten_toolchain:wasm_rules.bzl", "wasm_cc_binary")
load("@io_bazel_rules_closure//closure:defs.bzl", "closure_js_binary", "closure_js_library")

licenses(["notice"])

cc_library(
    name = "validator_inner_wrapper",
    srcs = ["validator_inner_wrapper.cc"],
    hdrs = ["validator_inner_wrapper.h"],
    copts = ["-std=c++17"],
    deps = [
        "//cpp/engine:error-formatter",
        "//cpp/engine:testing-utils",
        "//cpp/engine:validator",
        "@com_google_absl//absl/strings",
        "//:validator_cc_proto",
    ],
)

EMCC_SETTINGS = [
    "--bind",
    "--no-entry",
    "-g3",
    "-s DYNAMIC_EXECUTION=0",
    "-s EXPORT_NAME=loadValidatorWasm",
    "-s FILESYSTEM=0",
    "-s INITIAL_MEMORY=33554432",
    "-s MODULARIZE=1",
    "-s SINGLE_FILE=1",
    "-s USE_PTHREADS=0",
]

cc_binary(
    name = "validator_outer_wrapper_wasm",
    srcs = ["validator_outer_wrapper.cc"],
    copts = ["-std=c++17"],
    linkopts = EMCC_SETTINGS,
    deps = [
        ":validator_inner_wrapper",
    ],
)

wasm_cc_binary(
    name = "validator_emcc_wasm",
    cc_target = ":validator_outer_wrapper_wasm",
)

closure_js_library(
    name = "validator_js_lib",
    srcs = [
        "validator.js",
        "validator_emcc_wasm/validator_outer_wrapper_wasm.js",
    ],
    deps = [
        "//:validator_closure_proto",
        "@com_google_javascript_closure_library//closure/goog/asserts",
        "@com_google_javascript_closure_library//closure/goog/crypt:base64",
        "@com_google_javascript_closure_library//closure/goog/uri:utils",
    ],
)

closure_js_binary(
    name = "validator_js_bin",
    compilation_level = "WHITESPACE_ONLY",
    formatting = "PRETTY_PRINT",
    language = "ECMASCRIPT_2019",
    output_wrapper = "CLOSURE_NO_DEPS = true; %output%",
    deps = [
        ":validator_js_lib",
    ],
)

build_test(
    name = "validator_js_test",
    targets = [":validator_js_bin"],
)
