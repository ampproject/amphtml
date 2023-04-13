# HTML Parser

This is an HTML5 compliant parser written in C++.

## Maintainers

This parser is maintained by Amaltas Bohra and Erwin Mombay.

## Current Status

This parser is stable and is being used by several projects at Google.

## Building and Testing with Bazel

This code requires C++17. When building with [Bazel](https://bazel.build/)
please use the flag `--cxxopt='-std=c++17'`.

For building, run: `bazel build --cxxopt='-std=c++17' parser`.

For testing, run: `bazel test --cxxopt='-std=c++17' parser_test`.
