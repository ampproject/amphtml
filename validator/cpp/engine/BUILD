load("@rules_cc//cc:defs.bzl", "cc_library", "cc_test")
load("@bazel_skylib//:bzl_library.bzl", "bzl_library")
load("embed_data.bzl", "embed_data")

# Requirements:
# clang with c++17 support.
#
# Usage:
# To build the library, use the following bazel command:
#
# bazel build --repo_env=CC=clang --cxxopt='-std=c++17' validator
#
# To run the tests, use the following bazel command:
#
# bazel test --cxxopt='-std=c++17' validator_test

package(default_visibility = ["//visibility:public"])

licenses(["notice"])

exports_files(["LICENSE"])

cc_library(
    name = "validator_pb",
    hdrs = [
        "validator_pb.h",
    ],
    copts = ["-std=c++17"],
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
    copts = ["-std=c++17"],
    deps = [
        "@com_google_absl//absl/strings",
        "@com_google_absl//absl/strings:str_format",
        "@com_googlesource_code_re2//:re2",
        "//:validator_cc_proto",
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
    copts = ["-std=c++17"],
    deps = [
        "@com_google_absl//absl/strings",
        "@com_googlesource_code_re2//:re2",
        "//cpp/htmlparser:strings",
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
    copts = ["-std=c++17"],
    deps = [
        "@com_google_absl//absl/base",
        "@com_google_absl//absl/strings",
        "@com_googlesource_code_re2//:re2",
        "//:validator_cc_proto",
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
    copts = ["-std=c++17"],
    deps = [
        ":utf8-util",
        "@com_google_absl//absl/base",
        "@com_google_absl//absl/strings",
        "//cpp/htmlparser:logging",
        "//cpp/htmlparser:strings",
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
    copts = ["-std=c++17"],
    deps = [
        "@com_google_absl//absl/base",
        "@com_google_absl//absl/strings",
        "@com_google_absl//absl/strings:cord",
        "//cpp/htmlparser:logging",
        "//cpp/htmlparser:strings",
    ],
)

cc_test(
    name = "utf8-util_test",
    srcs = ["utf8-util_test.cc"],
    args = ["--suppress_failure_output"],
    deps = [
        ":utf8-util",
        "@com_google_googletest//:gtest_main",
        "//cpp/htmlparser:strings",
    ],
)

cc_library(
    name = "keyframes-parse-css",
    srcs = ["keyframes-parse-css.cc"],
    hdrs = ["keyframes-parse-css.h"],
    copts = ["-std=c++17"],
    deps = [
        "@com_google_absl//absl/base",
        "@com_google_absl//absl/memory",
        "@com_google_absl//absl/strings",
        "//cpp/htmlparser/css:parse-css",
    ],
)

cc_test(
    name = "keyframes-parse-css_test",
    srcs = ["keyframes-parse-css_test.cc"],
    deps = [
        ":keyframes-parse-css",
        "@com_google_absl//absl/strings",
        "@com_google_googletest//:gtest_main",
        "//cpp/htmlparser:strings",
        "//cpp/htmlparser/css:parse-css",
    ],
)

cc_library(
    name = "type-identifier",
    srcs = ["type-identifier.cc"],
    hdrs = ["type-identifier.h"],
    copts = ["-std=c++17"],
    deps = [
        "@com_google_absl//absl/strings",
        "//:validator_cc_proto",
    ],
)

cc_test(
    name = "type-identifier_test",
    srcs = ["type-identifier_test.cc"],
    deps = [
        ":type-identifier",
        "@com_google_googletest//:gtest_main",
        "//:validator_cc_proto",
    ],
)

cc_library(
    name = "error-formatter",
    srcs = ["error-formatter.cc"],
    hdrs = ["error-formatter.h"],
    copts = ["-std=c++17"],
    deps = [
        ":validator_pb",
        "@com_googlesource_code_re2//:re2",
        "//cpp/htmlparser:logging",
        "//cpp/htmlparser:strings",
        "//:validator_cc_proto",
    ],
)

cc_test(
    name = "error-formatter_test",
    srcs = ["error-formatter_test.cc"],
    args = ["--suppress_failure_output"],
    deps = [
        ":error-formatter",
        "@com_google_googletest//:gtest_main",
    ],
)

cc_binary(
    name = "validator-convert",
    srcs = ["validator-convert.cc"],
    copts = ["-std=c++17"],
    deps = [
        "@com_google_protobuf//:protobuf",
        "//cpp/htmlparser:defer",
        "//cpp/htmlparser:fileutil",
        "//cpp/htmlparser:logging",
        "//:validator_cc_proto",
    ],
)

genrule(
    name = "validator-pb",
    srcs = ["//:validator.protoascii"],
    outs = ["validator.pb"],
    cmd = "$(location :validator-convert) " +
          "$(SRCS) $@",
    tools = [":validator-convert"],
)

cc_library(
    name = "validator-internal",
    srcs = [
        "validator-internal.cc",
    ],
    copts = ["-std=c++17"],
    visibility = ["//visibility:private"],
    deps = [
        ":keyframes-parse-css",
        ":parse-layout",
        ":parse-srcset",
        ":parse-viewport",
        ":type-identifier",
        ":utf8-util",
        ":validator_pb",
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
        "//cpp/htmlparser:atom",
        "//cpp/htmlparser:atomutil",
        "//cpp/htmlparser:defer",
        "//cpp/htmlparser:node",
        "//cpp/htmlparser:parser",
        "//cpp/htmlparser:strings",
        "//cpp/htmlparser:url",
        "//cpp/htmlparser/css:amp4ads-parse-css",
        "//cpp/htmlparser/css:parse-css",
        "//cpp/htmlparser/css:parse_css_cc_proto",
        "//cpp/htmlparser/validators:json",
        "//:validator_cc_proto",
    ],
)

cc_library(
    name = "validator",
    hdrs = [
        "validator.h",
    ],
    copts = ["-std=c++17"],
    deps = [
        ":validator-internal",
        "//cpp/htmlparser/css:parse-css",
        "//:validator_cc_proto",
    ],
    alwayslink = 1,
)

cc_library(
    name = "testing-utils",
    srcs = [
        "testing-utils.cc",
    ],
    hdrs = [
        "testing-utils.h",
    ],
    copts = ["-std=c++17"],
    data = [
        "@amphtml-extensions//:testdata_files",
        "//:testdata_files",
    ],
    deps = [
        ":error-formatter",
        "@com_google_absl//absl/strings",
        "//cpp/htmlparser:fileutil",
        "//cpp/htmlparser:strings",
        "//:validator_cc_proto",
    ],
)

cc_binary(
    name = "update-tests",
    srcs = ["update-tests.cc"],
    copts = ["-std=c++17"],
    deps = [
        ":testing-utils",
        ":validator",
    ],
)

cc_test(
    name = "validator_test",
    srcs = ["validator_test.cc"],
    shard_count = 2,
    deps = [
        ":testing-utils",
        ":validator",
        ":validator_pb",
        "@com_google_absl//absl/container:flat_hash_map",
        "@com_google_absl//absl/container:flat_hash_set",
        "@com_google_absl//absl/strings",
        "@com_google_googletest//:gtest_main",
        "//cpp/htmlparser/css:parse_css_cc_proto",
        "//:validator_cc_proto",
    ],
)

bzl_library(
    name = "embed_data_bzl",
    srcs = ["embed_data.bzl"],
    visibility = ["//visibility:private"],
)
