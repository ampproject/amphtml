# The AMP HTML runtime.

The AMP HTML runtime implements the [AMP HTML format](spec/amp-html-format.md) and
in particular its [components in form of custom elements](spec/amp-html-components.md).

## Development

### Installation

`npm i`

Map `ads.localhost` and `iframe.localhost` to `127.0.0.1` in your `/etc/hosts` file.

### Build

[![Build Status](https://magnum.travis-ci.com/ampproject/amphtml.svg?token=AmxgqDRzeUjVvqT2oydf&branch=master)](https://magnum.travis-ci.com/ampproject/amphtml)

Builds main binaries for development. Watches and rebuilds as changes are saved.
`gulp`

`gulp unit`
Runs tests.

`gulp unit-watch`
Runs tests for changed files.

`gulp unit-watch-verbose`
Runs tests for changed files with logging enabled.

`gulp minify`
Builds production binaries.

### Start dev server

Execute in the base dir:

`python -m SimpleHTTPServer`

or:

`npm install http-server -g`

and then:

`http-server -p 8000 -c-1`

Then go to http://localhost:8000/examples/released.html
