# Requirements:
# clang with c++17 support.
#
# Usage:
# To build the library, use the following bazel command:
#
# bazel build --repo_env=CC=clang --cxxopt='-std=c++17' <build_target>

load("@rules_cc//cc:defs.bzl", "cc_library", "cc_test", "cc_proto_library")
load("@rules_proto//proto:defs.bzl", "proto_library")

package(default_visibility = ["//visibility:public"])

licenses(["notice"])

proto_library(
    name = "parse-css-proto",
    srcs = ["parse-css.proto"],
)

cc_proto_library(
    name = "parse_css_cc_proto",
    deps = [":parse-css-proto"],
)

cc_library(
    name = "parse-css",
    srcs = ["parse-css.cc"],
    hdrs = ["parse-css.h"],
    deps = [
        ":parse_css_cc_proto",
        "@com_github_glog//:glog",
        "@com_google_absl//absl/algorithm:container",
        "@com_google_absl//absl/memory",
        "@com_google_absl//absl/strings",
        "@com_google_absl//absl/types:variant",
        "@htmlparser//:strings",
        "@htmlparser//json:types",
        "@validator//:validator_cc_proto",
    ],
)

proto_library(
    name = "parse-css-urls-proto",
    srcs = ["parse-css-urls.proto"],
)

cc_proto_library(
    name = "parse_css_urls_cc_proto",
    deps = [":parse-css-urls-proto"],
)

cc_library(
    name = "parse-css-urls",
    srcs = ["parse-css-urls.cc"],
    hdrs = ["parse-css-urls.h"],
    deps = [
        ":parse_css_urls_cc_proto",
        "@com_github_glog//:glog",
        "@com_google_absl//absl/algorithm:container",
        "@com_google_absl//absl/memory",
        "@com_google_absl//absl/strings",
        "@com_google_absl//absl/types:variant",
        "@htmlparser//:strings",
        "@validator//:validator_cc_proto",
    ],
)

cc_test(
    name = "parse-css_test",
    srcs = ["parse-css_test.cc"],
    args = ["--suppress_failure_output"],
    deps = [
        ":parse-css",
        ":parse_css_cc_proto",
        "@com_google_absl//absl/strings",
        "@com_google_googletest//:gtest_main",
        "@htmlparser//:strings",
    ],
)

cc_library(
    name = "amp4ads-parse-css",
    srcs = ["amp4ads-parse-css.cc"],
    hdrs = ["amp4ads-parse-css.h"],
    deps = [
        ":parse-css",
        "@com_google_absl//absl/memory",
        "@com_google_absl//absl/strings",
        "@com_github_re2//:re2",
    ],
)

cc_test(
    name = "amp4ads-parse-css_test",
    srcs = ["amp4ads-parse-css_test.cc"],
    deps = [
        ":amp4ads-parse-css",
        ":parse-css",
        "@com_google_absl//absl/strings",
        "@com_google_googletest//:gtest_main",
        "@htmlparser//:strings",
    ],
)

cc_test(
    name = "parse-css-urls_test",
    srcs = ["parse-css-urls_test.cc"],
    args = ["--suppress_failure_output"],
    deps = [
        ":parse-css-urls",
        "@com_google_absl//absl/strings",
        "@com_google_googletest//:gtest_main",
    ],
)
