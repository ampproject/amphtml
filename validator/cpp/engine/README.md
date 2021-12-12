# AMPHTML Validator

A C++ AMPHTML Validator for the
[AMPHTML format](https://github.com/ampproject/amphtml/blob/main/README.md).

## Maintainers

The AMPHTML Validator is maintained by the
[AMP Working Group](https://amp.dev/community/working-groups/amp4email/):
[Caching](https://amp.dev/community/working-groups/caching/)

## Building and Testing with Bazel

This code requires C++17. When building with [Bazel](https://bazel.build/)
please use the flag `--cxxopt='-std=c++17'`.

For building, run: `bazel build --cxxopt='-std=c++17' validator`.

For testing, run: `bazel test --cxxopt='-std=c++17' validator_test`.
