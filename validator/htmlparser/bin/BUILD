load("@rules_cc//cc:defs.bzl", "cc_binary")

package(default_visibility = ["//visibility:public"])

licenses(["notice"])

cc_binary(
    name = "atomgen",
    srcs = [
        "atomgen.cc",
    ],
    data = [
        "@htmlparser//data:amptags.txt",
        "@htmlparser//data:htmlattributes.txt",
        "@htmlparser//data:htmltags.txt",
        "@htmlparser//data:javascriptevents.txt",
    ],
    deps = [
        "@htmlparser//:defer",
        "@htmlparser//:fileutil",
        "@htmlparser//:hash",
        "@htmlparser//:strings",
        "@htmlparser//:token",
    ],
)

cc_binary(
    name = "casetablegen",
    srcs = [
        "casetablegen.cc",
    ],
    data = [
        "@htmlparser//data:CaseFolding.txt",
    ],
    deps = [
        "@htmlparser//:defer",
        "@htmlparser//:fileutil",
    ],
)

cc_binary(
    name = "entitytablegen",
    srcs = [
        "entitytablegen.cc",
    ],
    data = [
        "@htmlparser//data:entities.json",
    ],
    deps = [
        "@htmlparser//:defer",
        "@htmlparser//:fileutil",
        "@htmlparser//:strings",
    ],
)

cc_binary(
    name = "jsongrammargen",
    srcs = [
        "jsongrammargen.cc",
    ],
    data = [
        "@htmlparser//data:jsongrammar.txt",
        "@htmlparser//json:states.h",
    ],
    deps = [
        "@htmlparser//grammar:tablebuilder",
    ],
)
