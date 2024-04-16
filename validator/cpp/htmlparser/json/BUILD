load("@rules_cc//cc:defs.bzl", "cc_library", "cc_test")

package(default_visibility = ["//visibility:public"])

licenses(["notice"])

cc_library(
    name = "types",
    srcs = [
        "types.cc",
    ],
    hdrs = [
        "types.h",
    ],
)

cc_test(
    name = "types_test",
    srcs = [
        "types_test.cc",
    ],
    deps = [
        ":types",
        "@com_google_googletest//:gtest_main",
    ],
)

filegroup(
    name = "json_testfiles",
    srcs = glob(["testdata/*.json"]),
)

cc_library(
    name = "json",
    srcs = ["json.cc"],
    hdrs = ["json.h"],
    deps = [
        ":types",
        "@com_google_absl//absl/strings",
        "//cpp/htmlparser:logging",
        "//cpp/htmlparser/validators:json",
    ],
)

cc_test(
    name = "json_test",
    srcs = ["json_test.cc"],
    data = [":json_testfiles"],
    deps = [
        ":json",
        ":types",
        "@com_google_googletest//:gtest_main",
    ],
)
