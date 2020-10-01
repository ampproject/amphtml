load("@rules_cc//cc:defs.bzl", "cc_library", "cc_proto_library")
load("@rules_proto//proto:defs.bzl", "proto_library")

package(default_visibility = ["//visibility:public"])

licenses(["notice"])

proto_library(
    name = "validator-proto",
    srcs = ["validator.proto"],
)

cc_proto_library(
    name = "validator_cc_proto",
    deps = [":validator-proto"],
)

filegroup(
    name = "extensions-protoascii-files",
    srcs = [
        "@amphtml-extensions//:extensions/*/validator-*.protoascii",
    ],
)

# <validator rules protoascii>
# The validator rules, stored in a series of .protoascii files.
# This set of rules is what is released to cdn.ampproject.org/v0/validator.js
genrule(
    name = "validator-all-protoascii-gen",
    srcs = [
        "validator-main.protoascii",
        "validator-css.protoascii",
        "@amphtml-extensions//:validator-extensions.protoascii",
    ],
    outs = ["validator.protoascii"],
    cmd = "cat $(SRCS) > $@",
)
# </validator rules all protoascii>

filegroup(
    name = "validator-protoascii",
    srcs = [
        "validator-main.protoascii",
    ],
)
