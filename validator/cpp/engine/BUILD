load("@rules_cc//cc:defs.bzl", "cc_library", "cc_test")

load("//tools/build_defs/testing:bzl_library.bzl", "bzl_library")
load("embed_data.bzl", "embed_data")
load("//tools/build_defs/proto/cpp:cc_proto_library.bzl", "cc_proto_library")

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
    cc_api_version = 2,
    deps = [
        "//third_party/javascript/amp_validator:validator-proto",
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
        "//third_party/absl/strings",
        "//third_party/absl/strings:str_format",
        "//third_party/javascript/amp_validator:validator_cc_proto",
        "//third_party/re2",
    ],
)

cc_test(
    name = "parse-layout_test",
    srcs = ["parse-layout_test.cc"],
    args = ["--suppress_failure_output"],
    deps = [
        ":parse-layout",
        "//third_party/absl/strings",
        "@com_google_googletest//:gtest_main",
    ],
)

cc_library(
    name = "parse-layout-sizes",
    srcs = ["parse-layout-sizes.cc"],
    hdrs = ["parse-layout-sizes.h"],
    deps = [
        "//third_party/absl/strings",
        "//third_party/htmlparser:strings",
        "//third_party/re2",
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
        "//third_party/absl/strings",
        "//third_party/javascript/amp_validator:validator_cc_proto",
        "//third_party/re2",
        "@com_google_absl//absl/base",
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
        "//third_party/absl/strings",
        "//third_party/htmlparser:strings",
        "@com_google_absl//absl/base",
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
        "//third_party/absl/strings",
        "//third_party/absl/strings:cord",
        "//third_party/htmlparser:strings",
        "@com_google_absl//absl/base",
    ],
)

cc_test(
    name = "utf8-util_test",
    srcs = ["utf8-util_test.cc"],
    args = ["--suppress_failure_output"],
    deps = [
        ":utf8-util",
        "//third_party/htmlparser:strings",
        "@com_google_googletest//:gtest_main",
    ],
)

cc_library(
    name = "keyframes-parse-css",
    srcs = ["keyframes-parse-css.cc"],
    hdrs = ["keyframes-parse-css.h"],
    deps = [
        "//third_party/absl/memory",
        "//third_party/absl/strings",
        "//third_party/htmlparser/css:parse-css",
        "@com_google_absl//absl/base",
    ],
)

cc_test(
    name = "keyframes-parse-css_test",
    srcs = ["keyframes-parse-css_test.cc"],
    deps = [
        ":keyframes-parse-css",
        "//strings",
        "//third_party/absl/strings",
        "//third_party/htmlparser:strings",
        "//third_party/htmlparser/css:parse-css",
        "@com_google_googletest//:gtest_main",
    ],
)

cc_library(
    name = "type_identifier",
    srcs = ["type_identifier.cc"],
    hdrs = ["type_identifier.h"],
    deps = [
        "//third_party/absl/strings",
        "//third_party/javascript/amp_validator:validator_cc_proto",
    ],
)

cc_test(
    name = "type_identifier_test",
    srcs = ["type_identifier_test.cc"],
    deps = [
        ":type_identifier",
        "//third_party/javascript/amp_validator:validator_cc_proto",
        "@com_google_googletest//:gtest_main",
    ],
)

genrule(
    name = "validator-pb",
    srcs = ["//third_party/javascript/amp_validator:validator.protoascii"],
    outs = ["validator.pb"],
    cmd = "$(location :validator-convert) " +
          "--textproto_in.file=$(SRCS) --pb_out.file=$@",
    tools = [":validator-convert"],
)

cc_library(
    name = "validator-internal",
    srcs = [
        "validator-internal.cc",
    ],
    visibility = ["//visibility:private"],
    deps = [
        ":error-formatter",
        ":keyframes-parse-css",
        ":parse-layout",
        ":parse-srcset",
        ":parse-viewport",
        ":type_identifier",
        ":utf8-util",
        ":validator_cc_proto",
        ":validator_pb",
        "//file/base",
        "//third_party/absl/algorithm:container",
        "//third_party/absl/base:core_headers",
        "//third_party/absl/container:flat_hash_map",
        "//third_party/absl/container:flat_hash_set",
        "//third_party/absl/container:node_hash_map",
        "//third_party/absl/container:node_hash_set",
        "//third_party/absl/flags:flag",
        "//third_party/absl/memory",
        "//third_party/absl/status",
        "//third_party/absl/strings",
        "//third_party/absl/strings:cord",
        "//third_party/absl/synchronization",
        "//third_party/htmlparser:atom",
        "//third_party/htmlparser:atomutil",
        "//third_party/htmlparser:defer",
        "//third_party/htmlparser:node",
        "//third_party/htmlparser:parser",
        "//third_party/htmlparser:strings",
        "//third_party/htmlparser:url",
        "//third_party/htmlparser/css:amp4ads-parse-css",
        "//third_party/htmlparser/css:parse-css",
        "//third_party/htmlparser/css:parse_css_cc_proto",
        "//third_party/htmlparser/json:parser",
        "//third_party/javascript/amp_validator:validator_cc_proto",
        "//third_party/re2",
        "//webutil/url",
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
        "//third_party/javascript/amp_validator:validator_cc_proto",
    ],
    alwayslink = 1,
)

bzl_library(
    name = "embed_data_bzl",
    srcs = ["embed_data.bzl"],
    parse_tests = False,
    visibility = ["//visibility:private"],
)
