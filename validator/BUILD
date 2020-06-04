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
