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
        "@com_google_absl//absl/strings",
        "//cpp/htmlparser:defer",
        "//cpp/htmlparser:fileutil",
        "//cpp/htmlparser:strings",
    ],
)
