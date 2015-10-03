<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# AMP HTML ⚡

AMP HTML is a way to build web pages for static content that render with reliable, fast performance. It is our attempt at fixing what many perceive as painfully slow page load times – especially when reading content on the mobile web.

AMP HTML is entirely built on existing web technologies. It achieves reliable performance by restricting some parts of HTML, CSS and JavaScript. These restrictions are enforced with a validator that ships with AMP HTML. To make up for those limitations AMP HTML provides a set of [custom elements](http://www.html5rocks.com/en/tutorials/webcomponents/customelements/) for rich content beyond basic HTML.

For more info how AMP HTML works and some insights into the design, please read our blog post ["Web performance: An intervention"](https://www.ampproject.org/how-it-works/) (which may be the first AMP HTML file you ever see).

We also have a non-technical description of what we are doing on [www.ampproject.org](https://www.ampproject.org).

For further reading see the [AMP HTML format specification](spec/amp-html-format.md) and the [custom element specification](spec/amp-html-components.md).

## Repository Layout
<pre>
  3p              - Implementation of third party sandbox iframes.
  ads/            - Modules implementing specific ad networks used in <amp-ad>
  build-system/   - build infrastructure
  builtins/       - tags built into the core AMP runtime
      *.md        - documentation for use of the builtin
      *.js        - source code for builtin tag
  css/            - default css
  examples/       - example AMP HTML files and corresponding assets
  extensions/     - plugins which extend the AMP HTML runtime's core set of tags
  spec/           - The AMP HTML Specification files
  src/            - source code for the AMP runtime
  test/           - tests for the AMP runtime and builtins
  testing/        - testing infrastructure
</pre>

## Contributing

Please see [the CONTRIBUTING file](CONTRIBUTING.md) before developing for the AMP Project.

### Installation

1. `npm i`
2. `edit /etc/hosts` and map `ads.localhost` and `iframe.localhost` to `127.0.0.1`:
<pre>
  127.0.0.1               ads.localhost iframe.localhost
</pre>

### Build & Test

[![Build Status](https://magnum.travis-ci.com/ampproject/amphtml.svg?token=AmxgqDRzeUjVvqT2oydf&branch=master)](https://magnum.travis-ci.com/ampproject/amphtml)

| Command                       | Description                                                           |
| ----------------------------- | --------------------------------------------------------------------- |
| `gulp`                        | Same as "watch"                                                       |
| `gulp minify`                 | Builds production binaries.                                           |
| `gulp lint`                   | Validates against Google Closure Linter.                              |
| `gulp build`                  | Builds the AMP library.                                               |
| `gulp clean`                  | Removes build output.                                                 |
| `gulp test`                   | Runs tests in Chrome.                                                 |
| `gulp test --verbose`         | Runs tests in Chrome with logging enabled.                            |
| `gulp test --watch`           | Watches for changes in files, runs corresponding test(s) in Chrome.   |
| `gulp test --watch --verbose` | Same as "watch" with logging enabled.                                 |
| `gulp test --safari`          | Runs tests in Safari.                                                 |
| `gulp test --firefox`         | Runs tests in Firefox.                                                |
| `http-server -p 8000 -c-1`    | serves content in current working dir over http://localhost:8000/     |

To fix issues with Safari test runner launching multiple instances of the test, run:
<pre>
  defaults write com.apple.Safari ApplePersistenceIgnoreState YES
</pre>

### Manual testing

For testing documents on arbitrary URLs with your current local version of the AMP runtime we created a [Chrome extension](testing/local-amp-chrome-extension/README.md).
