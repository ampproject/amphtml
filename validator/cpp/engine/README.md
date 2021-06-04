<!---
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

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
