load("@rules_cc//cc:defs.bzl", "cc_library", "cc_test")
load("@bazel_skylib//:bzl_library.bzl", "bzl_library")
load("embed_data.bzl", "embed_data")

# Requirements:
# clang with c++17 support.
#
# Usage:
# To build the library, use the following bazel command:
#
# bazel build --repo_env=CC=clang --cxxopt='-std=c++17' <build_target>

package(default_visibility = ["//visibility:public"])

licenses(["notice"])

exports_files(["LICENSE"])

proto_library(
    name = "validator-proto",
    srcs = ["validator.proto"],
    deps = [
        "@validator//:validator_proto",
    ],
)

cc_proto_library(
    name = "validator_cc_proto",
    deps = [":validator-proto"],
)

cc_library(
    name = "validator_pb",
    hdrs = [
        "validator_pb.h",
    ],
)

embed_data(
    name = "validator_pb_h",
    src = "validator.pb",
    header_out = "validator_pb.h",
    namespace = "amp::validator::data",
    varname = "kValidatorProtoBytes",
)

cc_library(
    name = "parse-layout",
    srcs = ["parse-layout.cc"],
    hdrs = ["parse-layout.h"],
    deps = [
        "@com_google_absl//absl/strings",
        "@com_google_absl//absl/strings:str_format",
        "@com_googlesource_code_re2//:re2",
        "@validator//:validator_cc_proto",
    ],
)

cc_test(
    name = "parse-layout_test",
    srcs = ["parse-layout_test.cc"],
    args = ["--suppress_failure_output"],
    deps = [
        ":parse-layout",
        "@com_google_absl//absl/strings",
        "@com_google_googletest//:gtest_main",
    ],
)

cc_library(
    name = "parse-layout-sizes",
    srcs = ["parse-layout-sizes.cc"],
    hdrs = ["parse-layout-sizes.h"],
    deps = [
        "@com_google_absl//absl/strings",
        "@com_googlesource_code_re2//:re2",
        "@htmlparser//:strings",
    ],
)

cc_test(
    name = "parse-layout-sizes_test",
    srcs = ["parse-layout-sizes_test.cc"],
    args = ["--suppress_failure_output"],
    deps = [
        ":parse-layout-sizes",
        "@com_google_googletest//:gtest_main",
    ],
)

cc_library(
    name = "parse-srcset",
    srcs = ["parse-srcset.cc"],
    hdrs = ["parse-srcset.h"],
    deps = [
        "//strings",
        "@com_google_absl//absl/base",
        "@com_google_absl//absl/strings",
        "@com_googlesource_code_re2//:re2",
        "@validator//:validator_cc_proto",
    ],
)

cc_test(
    name = "parse-srcset_test",
    srcs = ["parse-srcset_test.cc"],
    args = ["--suppress_failure_output"],
    deps = [
        ":parse-srcset",
        "@com_google_googletest//:gtest_main",
    ],
)

cc_library(
    name = "parse-viewport",
    srcs = ["parse-viewport.cc"],
    hdrs = ["parse-viewport.h"],
    deps = [
        ":utf8-util",
        "//strings",
        "@com_google_absl//absl/base",
        "@com_google_absl//absl/strings",
        "@htmlparser//:strings",
    ],
)

cc_test(
    name = "parse-viewport_test",
    srcs = ["parse-viewport_test.cc"],
    args = ["--suppress_failure_output"],
    deps = [
        ":parse-viewport",
        "@com_google_googletest//:gtest_main",
    ],
)

cc_library(
    name = "utf8-util",
    srcs = ["utf8-util.cc"],
    hdrs = ["utf8-util.h"],
    deps = [
        "@com_google_absl//absl/base",
        "@com_google_absl//absl/strings",
        "@com_google_absl//absl/strings:cord",
        "@htmlparser//:strings",
    ],
)

cc_test(
    name = "utf8-util_test",
    srcs = ["utf8-util_test.cc"],
    args = ["--suppress_failure_output"],
    deps = [
        ":utf8-util",
        "@com_google_googletest//:gtest_main",
        "@htmlparser//:strings",
    ],
)

cc_library(
    name = "keyframes-parse-css",
    srcs = ["keyframes-parse-css.cc"],
    hdrs = ["keyframes-parse-css.h"],
    deps = [
        "@com_google_absl//absl/base",
        "@com_google_absl//absl/memory",
        "@com_google_absl//absl/strings",
        "@htmlparser//css:parse-css",
    ],
)

cc_test(
    name = "keyframes-parse-css_test",
    srcs = ["keyframes-parse-css_test.cc"],
    deps = [
        ":keyframes-parse-css",
        "//strings",
        "@com_google_absl//absl/strings",
        "@com_google_googletest//:gtest_main",
        "@htmlparser//:strings",
        "@htmlparser//css:parse-css",
    ],
)

cc_library(
    name = "type_identifier",
    srcs = ["type_identifier.cc"],
    hdrs = ["type_identifier.h"],
    deps = [
        "@com_google_absl//absl/strings",
        "@validator//:validator_cc_proto",
    ],
)

cc_test(
    name = "type_identifier_test",
    srcs = ["type_identifier_test.cc"],
    deps = [
        ":type_identifier",
        "@com_google_googletest//:gtest_main",
        "@validator//:validator_cc_proto",
    ],
)

cc_library(
    name = "validator-internal",
    srcs = [
        "validator-internal.cc",
    ],
    visibility = ["//visibility:private"],
    deps = [
        ":keyframes-parse-css",
        ":parse-layout",
        ":parse-srcset",
        ":parse-viewport",
        ":type_identifier",
        ":utf8-util",
        ":validator_cc_proto",
        ":validator_pb",
        # TODO: determine correct dep for //file/base
        # "//file/base",
        "@com_google_absl//absl/algorithm:container",
        "@com_google_absl//absl/base:core_headers",
        "@com_google_absl//absl/container:flat_hash_map",
        "@com_google_absl//absl/container:flat_hash_set",
        "@com_google_absl//absl/container:node_hash_map",
        "@com_google_absl//absl/container:node_hash_set",
        "@com_google_absl//absl/flags:flag",
        "@com_google_absl//absl/memory",
        "@com_google_absl//absl/status",
        "@com_google_absl//absl/strings",
        "@com_google_absl//absl/strings:cord",
        "@com_google_absl//absl/synchronization",
        "@com_googlesource_code_re2//:re2",
        "@htmlparser//:atom",
        "@htmlparser//:atomutil",
        "@htmlparser//:defer",
        "@htmlparser//:node",
        "@htmlparser//:parser",
        "@htmlparser//:strings",
        "@htmlparser//:url",
        "@htmlparser//css:amp4ads-parse-css",
        "@htmlparser//css:parse-css",
        "@htmlparser//css:parse_css_cc_proto",
        "@htmlparser//json:parser",
        "@validator//:validator_cc_proto",
        # TODO: determine correct dep for //webutil/url
        # "//webutil/url",
    ],
)

cc_library(
    name = "validator",
    hdrs = [
        "validator.h",
    ],
    deps = [
        ":validator-internal",
        ":validator_cc_proto",
        "@validator//:validator_cc_proto",
    ],
    alwayslink = 1,
)

bzl_library(
    name = "embed_data_bzl",
    srcs = ["embed_data.bzl"],
    visibility = ["//visibility:private"],
)
