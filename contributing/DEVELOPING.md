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

# Development on AMP HTML

## How to get started

Before you start developing in AMP, check out these resources:
* [CONTRIBUTING.md](../CONTRIBUTING.md) has details on various ways you can contribute to the AMP Project.
  * If you're developing in AMP, you should read the [Contributing code](../CONTRIBUTING.md#contributing-code) and [Contributing features](../CONTRIBUTING.md#contributing-features) sections.
  * The [Ongoing participation](../CONTRIBUTING.md#ongoing-participation) section has details on various ways of getting in touch with others in the community including email and Slack.
  * **If you are new to open source projects, Git/GitHub, etc.**, check out the [Tips for new open source contributors](../CONTRIBUTING.md#tips-for-new-open-source-contributors) which includes information on getting help and finding your first bug to work on.
* The [Getting Started Quick Start Guide](getting-started-quick.md) has installation steps and basic instructions for [one-time setup](getting-started-quick.md#one-time-setup), how to [build AMP & run a local server](getting-started-quick.md#build-amp--run-a-local-server) and how to [test AMP](getting-started-quick.md#test-amp).


## Build & Test

For most developers the instructions in the [Getting Started Quick Start Guide](getting-started-quick.md) will be sufficient for building/running/testing during development.  This section provides a more detailed reference.

The Quick Start Guide's  [One-time setup](getting-started-quick.md#one-time-setup) has instructions for installing Node.js, yarn, and Gulp which you'll need before running these commands.

| Command                                                                 | Description                                                           |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **`gulp`**<sup>[[1]](#footnote-1)</sup>                                 | Runs "watch" and "serve". Use this for standard local dev.            |
| `gulp --extensions=<amp-foo,amp-bar>`                                   | Runs "watch" and "serve", after building only the listed extensions.
| `gulp --extensions=minimal_set`                                         | Runs "watch" and "serve", after building the extensions needed to load `article.amp.html`.
| `gulp --noextensions`                                                   | Runs "watch" and "serve" without building any extensions.
| `gulp dist`<sup>[[1]](#footnote-1)</sup>                                | Builds production binaries.                                           |
| `gulp dist --extensions=<amp-foo,amp-bar>`                              | Builds production binaries, with only the listed extensions.
| `gulp dist --extensions=minimal_set`                                    | Builds production binaries, with only the extensions needed to load `article.amp.html`.
| `gulp dist --noextensions`                                              | Builds production binaries without building any extensions.
| `gulp dist --fortesting`<sup>[[1]](#footnote-1)</sup>                   | Builds production binaries for local testing. (Allows use cases like ads, tweets, etc. to work with minified sources. Overrides `TESTING_HOST` if specified. Uses the production `AMP_CONFIG` by default.) |
| `gulp dist --fortesting --config=<config>`<sup>[[1]](#footnote-1)</sup> | Builds production binaries for local testing, with the specified `AMP_CONFIG`. `config` can be `prod` or `canary`. (Defaults to `prod`.) |
| `gulp lint`                                                             | Validates against Google Closure Linter.                              |
| `gulp lint --watch`                                                     | Watches for changes in files, Validates against Google Closure Linter.|
| `gulp lint --fix`                                                       | Fixes simple lint warnings/errors automatically.                      |
| `gulp lint --file=path/to/file.js`                                      | Lints just a single file.                                             |
| `gulp build`<sup>[[1]](#footnote-1)</sup>                               | Builds the AMP library.                                               |
| `gulp build --extensions=<amp-foo,amp-bar>`                             | Builds the AMP library, with only the listed extensions.
| `gulp build --extensions=minimal_set`                                   | Builds the AMP library, with only the extensions needed to load `article.amp.html`.
| `gulp build --noextensions`                                             | Builds the AMP library with no extensions.
| `gulp check-links --files foo.md,bar.md`                                | Reports dead links in `.md` files.                                                 |
| `gulp clean`                                                            | Removes build output.                                                 |
| `gulp css`<sup>[[1]](#footnote-1)</sup>                                 | Recompiles css to build directory and builds the embedded css into js files for the AMP library. |
| `gulp watch`<sup>[[1]](#footnote-1)</sup>                               | Watches for changes in files, re-builds.                               |
| `gulp watch --extensions=<amp-foo,amp-bar>`                             | Watches for changes in files, re-builds only the listed extensions.
| `gulp watch --extensions=minimal_set`                                   | Watches for changes in files, re-builds only the extensions needed to load `article.amp.html`.
| `gulp watch --noextensions`                                             | Watches for changes in files, re-builds with no extensions.
| `gulp pr-check`<sup>[[1]](#footnote-1)</sup>                            | Runs all the Travis CI checks locally.         |
| `gulp pr-check --nobuild`<sup>[[1]](#footnote-1)</sup>                  | Runs all the Travis CI checks locally, but skips the `gulp build` step.         |
| `gulp pr-check --files=<test-files-path-glob>`<sup>[[1]](#footnote-1)</sup>   | Runs all the Travis CI checks locally, and restricts tests to the files provided.  |
| `gulp test`<sup>[[1]](#footnote-1)</sup>                                | Runs tests in Chrome.                                                 |
| `gulp test --verbose`<sup>[[1]](#footnote-1)</sup>                      | Runs tests in Chrome with logging enabled.                            |
| `gulp test --nobuild`                                                   | Runs tests without re-build.                                          |
| `gulp test --coverage`                                                  | Runs code coverage tests. After running, the report will be available at test/coverage/report-html/index.html |
| `gulp test --watch`<sup>[[1]](#footnote-1)</sup>                        | Watches for changes in files, runs corresponding test(s) in Chrome.   |
| `gulp test --watch --verbose`<sup>[[1]](#footnote-1)</sup>              | Same as `watch`, with logging enabled.                                 |
| `gulp test --saucelabs`<sup>[[1]](#footnote-1)</sup>                    | Runs test on saucelabs (requires [setup](#testing-on-sauce-labs)).                |
| `gulp test --safari`<sup>[[1]](#footnote-1)</sup>                       | Runs tests in Safari.                                                 |
| `gulp test --firefox`<sup>[[1]](#footnote-1)</sup>                      | Runs tests in Firefox.                                                |
| `gulp test --files=<test-files-path-glob>`<sup>[[1]](#footnote-1)</sup> | Runs specific test files.                                             |
| `gulp test --testnames`<sup>[[1]](#footnote-1)</sup>                    | Lists the name of each test being run, and prints a summary at the end.  |
| `gulp serve`                                                            | Serves content in repo root dir over http://localhost:8000/. Examples live in http://localhost:8000/examples/. Serve unminified AMP by default. |
| `gulp serve --quiet`                                                    | Same as `serve`, with logging silenced. |
| `gulp serve --port 9000`                                                | Same as `serve`, but uses a port number other than the default of 8000. |
| `gulp check-types`                                                      | Verifies that there are no errors associated with Closure typing. Run automatically upon push.  |
| `gulp dep-check`                                                        | Runs a dependency check on each module. Run automatically upon push.  |
| `gulp presubmit`                                                        | Run validation against files to check for forbidden and required terms. Run automatically upon push.  |
| `gulp validator`                                                        | Builds and tests the AMP validator. Run automatically upon push.  |
| `node build-system/pr-check.js`                                         | Runs all tests that will be run upon pushing a CL.                     |
| `gulp ava`<sup>[[1]](#footnote-1)</sup>                                 | Run node tests for tasks and offline/node code using [ava](https://github.com/avajs/ava). |
| `gulp todos:find-closed`                                                | Find `TODO`s in code for issues that have been closed. |
| `gulp visual-diff`                                                      | Runs all visual diff tests on local Chrome. Requires `gulp build` to have been run. Also requires `PERCY_PROJECT` and `PERCY_TOKEN` to be set as environment variables. |
| `gulp visual-diff --headless`                                           | Same as above, but launches local Chrome in headless mode. |
| `gulp visual-diff --percy_debug --chrome_debug --webserver_debug`       | Same as above, with additional logging. Debug flags can be used independently.  |

<a id="footnote-1">[1]</a> On Windows, this command must be run as administrator.

## Manual testing

For manual testing build AMP and start the Node.js server by running `gulp`.

### Serve Mode
There are 3 serving modes:
- DEFAULT mode serves unminified AMP. You want to use this during normal dev.
- COMPILED mode serves minified AMP. This is closer to the prod setup. This is only available after running `gulp dist --fortesting`. Serve MIN mode by adding `--compiled` to `gulp` command.
- CDN mode serves prod. These remote files would not reflect your local changes. Serve CDN mode by adding `--cdn` to `gulp` command.

To switch serving mode during runtime, go to http://localhost:8000/serve_mode=$mode and set the `$mode` to one of the following values: `default`, `compiled,` or `cdn`.

### Examples

The content in the `examples` directory can be reached at: http://localhost:8000/examples/

### Document proxy

AMP ships with a local proxy for testing production AMP documents with the local JS version.

For any public AMP document like: `http://output.jsbin.com/pegizoq/quiet`,

You can access it with the local JS at

`http://localhost:8000/proxy/output.jsbin.com/pegizoq/quiet`.

**Note** The local proxy will serve minified or unminified JS based on the current serve mode. When serve mode is `cdn`, the local proxy will serve remote JS.
When accessing minified JS make sure you run `gulp dist` with the `--fortesting`
flag so that we do not strip out the localhost code paths. (We do some
code elimination to trim down the file size for the file we deploy to production)

If the origin resource is on HTTPS, the URLs are http://localhost:8000/proxy/s/output.jsbin.com/pegizoq/quiet

### A4A envelope (/a4a/, /a4a-3p/)

If you are working on AMP 4 Ads (A4A), you can use the local A4A envelope for testing local and production AMP documents with the local JS version.

A4A can be run either of these two modes:

1. Friendly iframe mode: http://localhost:8000/a4a/...
2. 3p iframe mode: http://localhost:8000/a4a-3p/...

The following forms are supported:

- local document: http://localhost:8000/a4a[-3p]/examples/animations.amp.html
- proxied document with local sources: http://localhost:8000/a4a[-3p]/proxy/output.jsbin.com/pegizoq/quiet

When accessing minified JS make sure you run `gulp dist` with the `--fortesting`
flag so that we do not strip out the localhost code paths. (We do some
code elimination to trim down the file size for the file we deploy to production)

If the origin resource is on HTTPS, the URLs are http://localhost:8000/a4a[-3p]/proxy/s/output.jsbin.com/pegizoq/quiet

Notice that all documents are assumed to have a "fake" signature. Thus, this functionality is only available in the
`localDev` mode.

Additionally, the following query parameters can be provided:

- `width` - the width of the `amp-ad` (default "300")
- `height` - the height of the `amp-ad` (default "250")
- `offset` - the offset to push the `amp-ad` down the page (default "0px"). Can be used to push the Ad out of the viewport, e.g. using `offset=150vh`.


### In-a-box envelope (/inabox/)

If you are working on AMP In-a-box Ads, you can use the local in-a-box envelope for testing local and production AMP documents with the local JS version.

Make sure to run gulp with `--with_inabox` flag.

The following forms are supported:

- local document: http://localhost:8000/inabox/examples/animations.amp.html
- proxied document with local sources: http://localhost:8000/inabox/proxy/output.jsbin.com/pegizoq/quiet

Additionally, the following query parameters can be provided:

- `width` - the width of the `iframe` (default "300")
- `height` - the height of the `iframe` (default "250")
- `offset` - the offset to push the `iframe` down the page (default "0px"). Can be used to push the Ad out of the viewport, e.g. using `offset=150vh`.


### Chrome extension

For testing documents on arbitrary URLs with your current local version of the AMP runtime we created a [Chrome extension](../testing/local-amp-chrome-extension/README.md).

## Testing on Sauce Labs

In general local testing (i.e. `gulp test`) and the automatic test run on [Travis](https://travis-ci.org/ampproject/amphtml/pull_requests) that happens when you send a pull request are sufficient.  If you want to run your tests across multiple environments/browsers before sending your PR you can use Sauce Labs.

To run the tests on Sauce Labs:

* Create a Sauce Labs account.  If you are only going to use your account for open source projects like this one you can sign up for a free [Open Sauce](https://saucelabs.com/opensauce/) account.  (If you create an account through the normal account creation mechanism you'll be signing up for a free trial that expires; you can contact Sauce Labs customer service to switch your account to Open Sauce if you did this accidentally.)
* Set the `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` environment variables.  On Linux add this to your `.bashrc`:

   ```
   export SAUCE_USERNAME=<Sauce Labs username>
   export SAUCE_ACCESS_KEY=<Sauce Labs access key>
   ```

  You can find your Sauce Labs access key on the [User Settings](https://saucelabs.com/beta/user-settings) page.
* Install the [Sauce Connect Proxy](https://wiki.saucelabs.com/display/DOCS/Setting+Up+Sauce+Connect+Proxy).
* Run the proxy and then run the tests:
   ```
   # start the proxy
   sc

   # after seeing the "Sauce Connect is up" msg, run the tests
   gulp test --saucelabs
   ```
* It may take a few minutes for the tests to start.  You can see the status of your tests on the Sauce Labs [Automated Tests](https://saucelabs.com/beta/dashboard/tests) dashboard.  (You can also see the status of your proxy on the [Tunnels](https://saucelabs.com/beta/tunnels) dashboard.

## Visual Diff Tests

**NOTE:** *We are working on giving all `ampproject/amphtml` committers automatic access to visual diff test results. Until this is in place, you can fill out [this](https://docs.google.com/forms/d/e/1FAIpQLScZma6qVJtYUTqSm4KtiF3Zc-n5ukNe2GXNFqnaHxospsz0sQ/viewform) form, and your request should be approved soon.*

In addition to building the AMP runtime and running `gulp test`, the automatic test run on Travis includes a set of visual diff tests to make sure a new commit to `master` does not result in unintended changes to how pages are rendered. The tests load a few well-known pages in a browser and compare the results with known good versions of the same pages.

The technology stack used is:

- [Percy](https://percy.io/), a visual regression testing service for webpages
- [Capybara](https://percy.io/docs/clients/ruby/capybara-rails), a framework that integrates tests with Percy
- [Poltergeist](https://github.com/teampoltergeist/poltergeist), a driver capable of loading webpages for diffing
- [(Headless) Chrome](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md), the Chrome browser, optionally in headless mode

The [`ampproject/amphtml`](https://github.com/ampproject/amphtml) repository on GitHub is linked to the [Percy project](https://percy.io/ampproject/amphtml) of the same name. All PRs will show a check called `percy/amphtml` in addition to the `continuous-integration/travis-ci/pr` check. If your PR results in visual diff(s), clicking on the `details` link will show you the snapshots with the diffs highlighted.

### Failing Tests

When a test run fails due to visual diffs being present, click the `details` link next to `percy/amphtml` in your PR and examine the results. By default, Percy highlights the changes between snapshots in red. Clicking on the new snapshot will show it in its raw form. If the diffs indicate a problem that is likely to be due to your PR, you can try running the visual diffs locally in order to debug (see section below). However, if you are sure that the problem is not due to your PR, you may click the green `Approve` button on Percy to approve the snapshots and unblock your PR from being merged.

### Running Visual Diff Tests Locally

You can also run the visual tests locally during development. You must first create a free Percy account at [https://percy.io](https://percy.io), create a project, and set the `PERCY_PROJECT` and `PERCY_TOKEN` environment variables using the unique values you find at `https://percy.io/<org>/<project>/settings`. Once the environment variables are set up, you can run the AMP visual diff tests as described below.

First, make sure you have [Ruby](https://www.ruby-lang.org/en/documentation/installation/) installed on your machine if you don't already have it, and download the gems required for local Percy builds:
```
gem install percy-capybara poltergeist selenium-webdriver chromedriver-helper
```
Next, build the AMP runtime and run the gulp task that invokes the visual diff script:
```
gulp build
gulp visual-diff
```
The build will use the Percy credentials set via environment variables in the previous step, and run the tests on your local install of Chrome. You can see the results at `https://percy.io/<org>/<project>`.

To run Chrome in headless mode, use:
```
 gulp visual-diff --headless
```

To see debugging info during Percy runs, you can run:
```
 gulp visual-diff --percy_debug --chrome_debug --webserver_debug
```
The debug flags `--percy_debug`, `--chrome_debug`, and `--webserver_debug` can be used independently. To enable all three debug flags, you can also run:
```
 gulp visual-diff --debug
```
After each run, a new set of results will be available at `https://percy.io/<org>/<project>`.

## Testing on devices

### Testing with ngrok

It's much faster to debug with local build (`gulp` + `http://localhost:8000/`). In Chrome you can use [DevTools port forwarding](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/local-server). However, iOS Safari does not give a similar option. Instead, you can use [ngrok](https://ngrok.com/). Just [download](https://ngrok.com/download) the ngrok binary for your platform and run it like this:
```
ngrok http 8000
```

Once started, the ngrok will print URLs for both `http` and `https`. E.g. `http://73774d8c.ngrok.io/` and `https://73774d8c.ngrok.io/`. These URLs can be used to debug on iOS and elsewhere.


### Testing with Heroku

For deploying and testing local AMP builds on [HEROKU](https://www.heroku.com/) , please follow the steps outlined in this [document](https://docs.google.com/document/d/1LOr8SEBEpLkqnFjzTNIZGi2VA8AC8_aKmDVux6co63U/edit?usp=sharing).

In the meantime you can also use our automatic build on Heroku [link](http://amphtml-nightly.herokuapp.com/), which is normally built with latest head on master branch (please allow delay). The first time load is normally slow due to Heroku's free account throttling policy.

To correctly get ads and third party working when testing on hosted services
you will need set the `AMP_TESTING_HOST` environment variable. (On heroku this
is done through
`heroku config:set AMP_TESTING_HOST=my-heroku-subdomain.herokuapp.com`)


## Repository Layout
<pre>
  3p/             - Implementation of third party sandbox iframes.
  ads/            - Modules implementing specific ad networks used in <amp-ad>
  build/          - (generated) intermediate generated files
  build-system/   - build infrastructure
  builtins/       - tags built into the core AMP runtime
      *.md        - documentation for use of the builtin
      *.js        - source code for builtin tag
  contributing/   - docs for people contributing to the AMP Project
  css/            - default css
  dist/           - (generated) main JS binaries are created here. This is what
                    gets deployed to cdn.ampproject.org.
  dist.3p/        - (generated) JS binaries and HTML files for 3p embeds and ads.
                    This is what gets deployed to 3p.ampproject.net.
  docs/           - documentation about AMP
  examples/       - example AMP HTML files and corresponding assets
  extensions/     - plugins which extend the AMP HTML runtime's core set of tags
  spec/           - The AMP HTML Specification files
  src/            - source code for the AMP runtime
  test/           - tests for the AMP runtime and builtins
  testing/        - testing infrastructure
</pre>

## Supported browsers

In general we support the 2 latest versions of major browsers like Chrome, Firefox, Edge, Safari, Opera, and UC Browser. We support desktop, phone, tablet and the web view version of these respective browsers.

Beyond that the core AMP library and builtin elements should aim for very wide browser support and we accept fixes for all browsers with market share greater than 1 percent.

In particular, we try to maintain "it might not be perfect but isn't broken"-support for the Android 4.0 system browser and Chrome 28+ on phones.

## Eng docs

- [Life of an AMP *](https://docs.google.com/document/d/1WdNj3qNFDmtI--c2PqyRYrPrxSg2a-93z5iX0SzoQS0/edit#)
- [AMP Layout system](../spec/amp-html-layout.md)
- [Building an AMP Extension](building-an-amp-extension.md)

We also recommend scanning the [spec](../spec/). The non-element part should help understand some of the design aspects.

## [Code of conduct](../CODE_OF_CONDUCT.md)
