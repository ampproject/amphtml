# The AMP HTML runtime.

The AMP HTML runtime implements the [AMP HTML format](spec/amp-html-format.md) and
in particular its [components in form of custom elements](spec/amp-html-components.md).

## Repository Layout
<pre>
  ads/            - Modules implementing specific ad networks used in <amp-ad>
  build-system/   - build infrastructure 
  builtins/       - tags built into the core AMP runtime
      *.md        - documentation for use of the builtin
      *.js        - source code for builtin tag
  css/            - default css 
  examples/       - example AMP HTML files and corresponding assets
  extensions/     - plugins which extend the AMP HTML runtime's core set of tags
  fixtures/       - 
  spec/           - The AMP HTML Specification files
  src/            - source code for the AMP runtime
  test/           - tests for the AMP runtime and builtins
  testing/        - testing infrastructure
</pre>

## Development

### Installation

`npm i`

Map `ads.localhost` and `iframe.localhost` to `127.0.0.1` in your `/etc/hosts` file.

### Build

[![Build Status](https://magnum.travis-ci.com/ampproject/amphtml.svg?token=AmxgqDRzeUjVvqT2oydf&branch=master)](https://magnum.travis-ci.com/ampproject/amphtml)

Builds main binaries for development. Watches and rebuilds as changes are saved.
`gulp`

`gulp minify`
Builds production binaries.

### Test

`gulp test`
Runs tests.

`gulp test --verbose (short name: -v)`
Runs tests with logging enabled.

`gulp test --watch (short name: -w)`
Runs tests for changed files.

`gulp test --watch --verbose (short name: -w -v)`
Runs tests for changed files with logging enabled.

`gulp test --safari`
Runs tests in Safari. It is required to manually test this before sending PR.

`gulp test --firefox`
Runs tests in Firefox. It is required to manually test this before sending PR.

To fix issues with Safari test runner launching multiple instances of the test run
`defaults write com.apple.Safari ApplePersistenceIgnoreState YES`

### Start dev server

Execute in the base dir:

`python -m SimpleHTTPServer`

or:

`npm install http-server -g`

and then:

`http-server -p 8000 -c-1`

Then go to http://localhost:8000/examples/released.amp.html
