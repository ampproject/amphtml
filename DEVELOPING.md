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

## Development on AMP HTML

### Mailing list

We discuss implementation issues on [amphtml-discuss@googlegroups.com](https://groups.google.com/forum/#!forum/amphtml-discuss).

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

## Repository Layout
<pre>
  3p/             - Implementation of third party sandbox iframes.
  ads/            - Modules implementing specific ad networks used in <amp-ad>
  build/          - (generated) intermediate generated files
  build-system/   - build infrastructure
  builtins/       - tags built into the core AMP runtime
      *.md        - documentation for use of the builtin
      *.js        - source code for builtin tag
  css/            - default css
  dist/           - (generated) main JS binaries are created here. This is what
                    gets deployed to cdn.ampproject.org.
  dist.3p/        - (generated) JS binaries and HTML files for 3p embeds and ads.
                    This is what gets deployed to 3p.ampproject.net.
  docs/           - documentation
  examples/       - example AMP HTML files and corresponding assets
  examples.build/ - (generated) Same as examples with files pointing to the
                    local AMP.
  extensions/     - plugins which extend the AMP HTML runtime's core set of tags
  spec/           - The AMP HTML Specification files
  src/            - source code for the AMP runtime
  test/           - tests for the AMP runtime and builtins
  testing/        - testing infrastructure
</pre>

## Supported browsers

In general we support the 2 latest versions of major browsers like Chrome, Firefox, Edge, Safari and Opera. We support desktop, phone, tablet and the web view version of these respective browsers.

Beyond that the core AMP library and builtin elements should aim for very wide browser support and accepts fixes for all browsers with market share greater than 1 percent.

In particular, we try to maintain "it might not be perfect but isn't broken"-support for the Android 4.0 system browser and Chrome 28+ on phones.

## Eng docs

- [Life of an AMP *](https://docs.google.com/document/d/1WdNj3qNFDmtI--c2PqyRYrPrxSg2a-93z5iX0SzoQS0/edit#)
- [AMP Layout system](https://docs.google.com/document/d/1YjFk_B6r97CCaQJf2nXRVuBOuNi_3Fn87Zyf1U7Xoz4/edit)

We also recommend scanning the [spec](spec/). The non-element part should help understand some of the design aspects.
