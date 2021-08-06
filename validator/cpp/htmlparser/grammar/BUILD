load("@rules_cc//cc:defs.bzl", "cc_library")

package(default_visibility = ["//visibility:public"])

licenses(["notice"])

cc_library(
    name = "tablebuilder",
    srcs = [
        "tablebuilder.cc",
    ],
    hdrs = [
        "tablebuilder.h",
    ],
    deps = [
        "@htmlparser//:defer",
        "@htmlparser//:fileutil",
        "@htmlparser//:strings",
    ],
)
