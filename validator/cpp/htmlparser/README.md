# HTML Parser

This is an HTML5 compliant parser written in C++.

<!-- copybara:strip_begin -->
## Maintainers

This parser is maintained by [Amaltas Bohra](http://who/amaltas) and [Erwin Mombay](http://who/erwinm)

## Announcements

Please subscribe to [htmlparser-announce@google.com](https://groups.google.com/a/google.com/d/forum/htmlparser-announce)


## Current Status

This parser is stable and is being used by several projects at Google.

<!-- copybara:strip_end -->
## Building and Testing with Bazel

This code requires C++17. When building with [Bazel](https://bazel.build/)
please use the flag `--cxxopt='-std=c++17'`.

For building, run: `bazel build --cxxopt='-std=c++17' parser`.

For testing, run: `bazel test --cxxopt='-std=c++17' parser_test`.
