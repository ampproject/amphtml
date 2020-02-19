load("@rules_cc//cc:defs.bzl", "cc_library", "cc_test")

package(default_visibility = ["//visibility:public"])

licenses(["notice"])

cc_library(
    name = "states",
    hdrs = [
        "states.h",
    ],
)

cc_library(
    name = "parser",
    srcs = [
        "parser.cc",
    ],
    hdrs = [
        "parser.h",
    ],
    deps = [
        ":states",
    ],
)

cc_test(
    name = "parser_test",
    srcs = [
        "parser_test.cc",
    ],
    deps = [
        ":parser",
        "@com_google_googletest//:gtest_main",
    ],
)

filegroup(
    name = "json_testfiles",
    srcs = glob(["testdata/*.json"]),
)

cc_test(
    name = "jsondataset_test",
    srcs = [
        "jsondataset_test.cc",
    ],
    data = [
        ":json_testfiles",
    ],
    deps = [
        ":parser",
        "@com_google_googletest//:gtest_main",
        "@htmlparser//:defer",
        "@htmlparser//:fileutil",
    ],
)
