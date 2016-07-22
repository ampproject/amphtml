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

### Slack and mailing list

Please join our [announcements mailing list](https://groups.google.com/forum/#!forum/amphtml-announce). This is a curated, low volume list for announcements about breaking changes and similar issues in AMP.

We discuss implementation issues on [amphtml-discuss@googlegroups.com](https://groups.google.com/forum/#!forum/amphtml-discuss).

For more immediate feedback, [sign up for our Slack](https://docs.google.com/forms/d/1wAE8w3K5preZnBkRk-MD1QkX8FmlRDxd_vs4bFSeJlQ/viewform?fbzx=4406980310789882877).

### Starter issues

We're curating a [list of GitHub "starter issues"](https://github.com/ampproject/amphtml/issues?q=is%3Aopen+is%3Aissue+label%3Astarter) of small to medium complexity that are great to jump into development on AMP.

If you have any questions, feel free to ask on the issue or join us on [Slack](https://docs.google.com/forms/d/1wAE8w3K5preZnBkRk-MD1QkX8FmlRDxd_vs4bFSeJlQ/viewform?fbzx=4406980310789882877)!

### Installation

1. Install [NodeJS](https://nodejs.org).
2. In the repo directory, run `npm i` command to install the required npm packages.
3. run `sudo npm i -g gulp` command to install gulp in your local bin folder ('/usr/local/bin/' on Mac).
4. `edit /etc/hosts` and map `ads.localhost` and `iframe.localhost` to `127.0.0.1`.
<pre>
  127.0.0.1               ads.localhost iframe.localhost
</pre>

### Build & Test

| Command                       | Description                                                           |
| ----------------------------- | --------------------------------------------------------------------- |
| **`gulp`**                    | Runs "watch" and "serve". Use this for standard local dev.            |
| `gulp dist`                   | Builds production binaries.                                           |
| `gulp dist --fortesting`      | Indicates the production binaries are used for local testing. Without this ads, tweets and similar use cases are expected to break locally when using minified sources.|
| `gulp lint`                   | Validates against Google Closure Linter.                              |
| `gulp lint --watch`           | Watches for changes in files, Validates against Google Closure Linter.|
| `gulp lint --fix`             | Fixes simple lint warnings/errors automatically.                      |
| `gulp build`                  | Builds the AMP library.                                               |
| `gulp build` --css-only       | Builds only the embedded css into js files for the AMP library.       |
| `gulp clean`                  | Removes build output.                                                 |
| `gulp css`                    | Recompile css to build directory.                                     |
| `gulp extensions`             | Build AMP Extensions.                                                 |
| `gulp watch`                  | Watches for changes in files, re-build.                               |
| `gulp test`                   | Runs tests in Chrome.                                                 |
| `gulp test --verbose`         | Runs tests in Chrome with logging enabled.                            |
| `gulp test --nobuild`         | Runs tests without re-build.                                          |
| `gulp test --watch`           | Watches for changes in files, runs corresponding test(s) in Chrome.   |
| `gulp test --watch --verbose` | Same as "watch" with logging enabled.                                 |
| `gulp test --saucelabs`       | Runs test on saucelabs (requires [setup](#saucelabs)).                |
| `gulp test --safari`          | Runs tests in Safari.                                                 |
| `gulp test --firefox`         | Runs tests in Firefox.                                                |
| `gulp test --files=<test-files-path-glob>`         | Runs specific test files.                                                |
| `gulp serve`                  | Serves content in repo root dir over http://localhost:8000/. Examples live in http://localhost:8000/examples.build/          |
| `npm run ava` | Run node tests for tasks and offline/node code using [ava](https://github.com/avajs/ava). |


#### Saucelabs

Running tests on Sauce Labs requires an account. You can get one by signing up for [Open Sauce](https://saucelabs.com/opensauce/). This will provide you with a user name and access code that you need to add to your `.bashrc` or equivalent like this:

```
export SAUCE_USERNAME=sauce-labs-user-name
export SAUCE_ACCESS_KEY=access-key
```

Also for local testing, download [saucelabs connect](https://docs.saucelabs.com/reference/sauce-connect/) (If you are having trouble, downgrade to 4.3.10) and establish a tunnel by running the `sc` before running tests.

If your pull request contains JS or CSS changes and it does not change the build system, it will be automatically built and tested on [Travis](https://travis-ci.org/ampproject/amphtml/builds). After the travis run completes, the result will be logged to your PR.

If a test flaked on a pull request you can ask a project owner to restart the tests for you. Use [`this.retries(x)`](https://mochajs.org/#retry-tests) as the last resort.

### Manual testing

#### Examples

The content in the `examples` directory can be reached at: http://localhost:8000/examples.build/

For each example there are 3 files:

- Original name: This points to prod. This file would not reflect your local changes.
- `.max.html` points to your local unminified AMP. You want to use this during normal dev.
- `.min.html` points to a local minified AMP. This is closer to the prod setup. Only available after running `gulp dist`.


#### Document proxy

AMP ships with a local proxy for testing production AMP documents with the local JS version.

For any public AMP document like: http://output.jsbin.com/pegizoq/quiet

You can access is with the local JS at

- normal sources: http://localhost:8000/max/output.jsbin.com/pegizoq/quiet
- minified: http://localhost:8000/min/output.jsbin.com/pegizoq/quiet

If the origin resource is on HTTPS, the URLs are http://localhost:8000/max/s/output.jsbin.com/pegizoq/quiet and http://localhost:8000/min/s/output.jsbin.com/pegizoq/quiet

#### Chrome extension

For testing documents on arbitrary URLs with your current local version of the AMP runtime we created a [Chrome extension](testing/local-amp-chrome-extension/README.md).

#### Deploying AMP on Cloud for testing on devices

For deploying and testing local AMP builds on [HEROKU](https://www.heroku.com/) , please follow the steps outlined in this [document](https://docs.google.com/document/d/1LOr8SEBEpLkqnFjzTNIZGi2VA8AC8_aKmDVux6co63U/edit?usp=sharing).

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

Beyond that the core AMP library and builtin elements should aim for very wide browser support and we accept fixes for all browsers with market share greater than 1 percent.

In particular, we try to maintain "it might not be perfect but isn't broken"-support for the Android 4.0 system browser and Chrome 28+ on phones.

## Eng docs

- [Life of an AMP *](https://docs.google.com/document/d/1WdNj3qNFDmtI--c2PqyRYrPrxSg2a-93z5iX0SzoQS0/edit#)
- [AMP Layout system](spec/amp-html-layout.md)

We also recommend scanning the [spec](spec/). The non-element part should help understand some of the design aspects.

## [Code of conduct](CODE_OF_CONDUCT.md)
