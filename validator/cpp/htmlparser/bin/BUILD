load("@rules_cc//cc:defs.bzl", "cc_binary")

package(default_visibility = ["//visibility:public"])

licenses(["notice"])

cc_binary(
    name = "atomgen",
    srcs = [
        "atomgen.cc",
    ],
    data = [
        "//cpp/htmlparser/data:amptags.txt",
        "//cpp/htmlparser/data:htmlattributes.txt",
        "//cpp/htmlparser/data:htmltags.txt",
        "//cpp/htmlparser/data:javascriptevents.txt",
    ],
    deps = [
        "//cpp/htmlparser:defer",
        "//cpp/htmlparser:fileutil",
        "//cpp/htmlparser:hash",
        "//cpp/htmlparser:strings",
        "//cpp/htmlparser:token",
    ],
)

cc_binary(
    name = "casetablegen",
    srcs = [
        "casetablegen.cc",
    ],
    data = [
        "//cpp/htmlparser/data:CaseFolding.txt",
    ],
    deps = [
        "//cpp/htmlparser:defer",
        "//cpp/htmlparser:fileutil",
    ],
)

cc_binary(
    name = "entitytablegen",
    srcs = [
        "entitytablegen.cc",
    ],
    data = [
        "//cpp/htmlparser/data:entities.json",
    ],
    deps = [
        "//cpp/htmlparser:defer",
        "//cpp/htmlparser:fileutil",
        "//cpp/htmlparser:strings",
    ],
)

cc_binary(
    name = "validatorgen",
    srcs = [
        "validatorgen.cc",
    ],
    data = [
        "//cpp/htmlparser/data:jsongrammar.txt",
        "//cpp/htmlparser/validators:json.h",
    ],
    deps = [
        "//base",
        "@com_google_absl//absl/flags:flag",
        "@com_google_absl//absl/flags:parse",
        "//cpp/htmlparser/grammar:tablebuilder",
    ],
)
