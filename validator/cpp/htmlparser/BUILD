load("@rules_cc//cc:defs.bzl", "cc_library", "cc_test")

# Requirements:
# clang with c++17 support.
#
# Usage:
# To build the library, use the following bazel command:
#
# bazel build --repo_env=CC=clang --cxxopt='-std=c++17' <build_target>

package(default_visibility = ["//visibility:public"])

licenses(["notice"])

exports_files(["LICENSE"])

cc_library(
    name = "allocator",
    hdrs = [
        "allocator.h",
    ],
)

cc_test(
    name = "allocator_test",
    srcs = [
        "allocator_test.cc",
    ],
    deps = [
        ":allocator",
        "@com_google_googletest//:gtest_main",
    ],
)

# An atom is a name in HTML source. Tag name, attribute names and namespaces.
cc_library(
    name = "atom",
    hdrs = [
        "atom.h",
    ],
)

# Helper functions to convert string to Atom and vice versa.
cc_library(
    name = "atomutil",
    srcs = [
        "atomutil.cc",
    ],
    hdrs = [
        "atomutil.h",
    ],
    deps = [
        ":atom",
        ":hash",
    ],
)

cc_test(
    name = "atomutil_test",
    srcs = [
        "atomutil_test.cc",
    ],
    deps = [
        ":atomutil",
        ":hash",
        "@com_google_googletest//:gtest_main",
    ],
)

# Similar to go lang's defer statement. Defers the execution of statement
# until in which it is decalred goes out of scope.
cc_library(
    name = "defer",
    hdrs = [
        "defer.h",
    ],
)

# Helper library decalres various doctype constants and a utility function to
# parse doctype string and extract various components in it.
cc_library(
    name = "doctype",
    srcs = [
        "doctype.cc",
    ],
    hdrs = [
        "doctype.h",
    ],
    deps = [
        ":node",
        ":strings",
    ],
)

cc_test(
    name = "doctype_test",
    srcs = [
        "doctype_test.cc",
    ],
    deps = [
        ":doctype",
        ":node",
        "@com_google_googletest//:gtest_main",
    ],
)

# Defines error type.
cc_library(
    name = "error",
    srcs = [
        "error.cc",
    ],
    hdrs = [
        "error.h",
    ],
)

cc_library(
    name = "comparators",
    hdrs = [
        "comparators.h",
    ],
)

# File reading and parsing utility.
cc_library(
    name = "fileutil",
    srcs = [
        "fileutil.cc",
    ],
    hdrs = [
        "fileutil.h",
    ],
    deps = [
        ":defer",
        ":strings",
    ],
)

cc_test(
    name = "fileutil_test",
    srcs = [
        "fileutil_test.cc",
    ],
    deps = [
        ":fileutil",
        "@com_google_googletest//:gtest_main",
    ],
)

# Foreign element constants that are in SVG and MathML namespaces.
cc_library(
    name = "foreign",
    srcs = [
        "foreign.cc",
    ],
    hdrs = [
        "foreign.h",
    ],
    deps = [
        ":comparators",
        ":node",
        ":strings",
    ],
)

# Various hashing utility functions.
cc_library(
    name = "hash",
    hdrs = [
        "hash.h",
    ],
)

cc_library(
    name = "logging",
    hdrs = [
        "logging.h",
    ],
)

# Defines token type and token structures, used during tokenization.
cc_library(
    name = "token",
    srcs = [
        "token.cc",
    ],
    hdrs = [
        "token.h",
    ],
    deps = [
        ":atom",
        ":strings",
    ],
)

# Defines node and node stack.
# A node represents a single html element/tag/attribute.
cc_library(
    name = "node",
    srcs = [
        "node.cc",
    ],
    hdrs = [
        "elements.h",
        "node.h",
    ],
    deps = [
        ":atom",
        ":atomutil",
        ":error",
        ":logging",
        ":token",
        "@com_github_glog//:glog",
    ],
)

cc_test(
    name = "node_test",
    srcs = [
        "node_test.cc",
    ],
    deps = [
        ":atom",
        ":document",
        ":node",
        ":parser",
        ":renderer",
        "@com_google_googletest//:gtest_main",
    ],
)

cc_library(
    name = "htmlentities",
    hdrs = [
        "entity.h",
    ],
    deps = [
        ":comparators",
    ],
)

cc_test(
    name = "entity_test",
    srcs = [
        "entity_test.cc",
    ],
    deps = [
        ":htmlentities",
        "@com_google_googletest//:gtest_main",
    ],
)

cc_library(
    name = "document",
    srcs = [
        "document.cc",
    ],
    hdrs = [
        "document.h",
    ],
    deps = [
        ":allocator",
        ":node",
        ":token",
        "@com_google_absl//absl/flags:flag",
    ],
)

cc_library(
    name = "casetable",
    hdrs = [
        "casetable.h",
    ],
    deps = [
        ":comparators",
    ],
)

cc_test(
    name = "casetable_test",
    srcs = [
        "casetable_test.cc",
    ],
    deps = [
        ":casetable",
        ":strings",
        "@com_google_googletest//:gtest_main",
    ],
)

# Parser parses a given html source.
cc_library(
    name = "parser",
    srcs = [
        "parser.cc",
    ],
    hdrs = [
        "parser.h",
    ],
    deps = [
        ":atom",
        ":atomutil",
        ":comparators",
        ":defer",
        ":doctype",
        ":document",
        ":foreign",
        ":logging",
        ":node",
        ":strings",
        ":tokenizer",
        "@com_google_absl//absl/base",
        "@com_google_absl//absl/flags:flag",
        "@com_github_glog//:glog",
    ],
)

cc_test(
    name = "parser_test",
    srcs = [
        "parser_test.cc",
    ],
    deps = [
        ":atom",
        ":atomutil",
        ":node",
        ":parser",
        ":renderer",
        ":token",
        "@com_google_googletest//:gtest_main",
    ],
)

# Renders a node tree to html string.
cc_library(
    name = "renderer",
    srcs = [
        "renderer.cc",
    ],
    hdrs = [
        "renderer.h",
    ],
    deps = [
        ":atomutil",
        ":node",
        ":strings",
    ],
)

cc_test(
    name = "renderer_test",
    srcs = [
        "renderer_test.cc",
    ],
    deps = [
        ":parser",
        ":renderer",
        "@com_google_googletest//:gtest_main",
    ],
)

# String libraries.
cc_library(
    name = "whitespacetable",
    hdrs = [
        "whitespacetable.h",
    ],
)

cc_library(
    name = "strings",
    srcs = [
        "strings.cc",
    ],
    hdrs = [
        "strings.h",
    ],
    deps = [
        ":casetable",
        ":htmlentities",
        ":logging",
        ":whitespacetable",
        "@com_google_absl//absl/base",
        "@com_github_glog//:glog",
    ],
)

cc_test(
    name = "strings_test",
    srcs = [
        "strings_test.cc",
    ],
    deps = [
        ":strings",
        "@com_google_googletest//:gtest_main",
    ],
)

# Tokenizes html text.
cc_library(
    name = "tokenizer",
    srcs = [
        "tokenizer.cc",
    ],
    hdrs = [
        "tokenizer.h",
    ],
    deps = [
        ":atom",
        ":atomutil",
        ":defer",
        ":strings",
        ":token",
    ],
)

cc_test(
    name = "tokenizer_test",
    srcs = [
        "tokenizer_test.cc",
    ],
    deps = [
        ":parser",
        ":token",
        ":tokenizer",
        "@com_google_googletest//:gtest_main",
    ],
)

cc_library(
    name = "url",
    srcs = [
        "url.cc",
    ],
    hdrs = [
        "url.h",
    ],
)

cc_test(
    name = "url_test",
    srcs = [
        "url_test.cc",
    ],
    deps = [
        ":url",
        "@com_google_googletest//:gtest_main",
    ],
)

cc_library(
    name = "testconstants",
    hdrs = [
        "testconstants.h",
    ],
)

filegroup(
    name = "go_test_files",
    srcs = glob(["testdata/go/*.dat"]),
)

filegroup(
    name = "html5lib_test_files",
    srcs = glob(["testdata/tree-construction/*.dat",
                 "testdata/tree-construction/scripted/*.dat"]),
)

cc_test(
    name = "htmldataset_test",
    srcs = [
        "htmldataset_test.cc",
    ],
    data = [
        ":go_test_files",
        ":html5lib_test_files",
    ],
    deps = [
        ":atom",
        ":atomutil",
        ":defer",
        ":fileutil",
        ":node",
        ":parser",
        ":renderer",
        ":strings",
        ":testconstants",
        ":tokenizer",
        "@com_google_googletest//:gtest_main",
    ],
)
