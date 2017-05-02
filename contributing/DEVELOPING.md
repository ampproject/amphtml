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

The Quick Start Guide's  [One-time setup](getting-started-quick.md#one-time-setup) has instructions for installing Node.js, Yarn, and Gulp which you'll need before running these commands.

| Command                                                                 | Description                                                           |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **`gulp`**<sup>[[1]](#footnote-1)</sup>                                 | Runs "watch" and "serve". Use this for standard local dev.            |
| `gulp dist`<sup>[[1]](#footnote-1)</sup>                                | Builds production binaries.                                           |
| `gulp dist --fortesting`<sup>[[1]](#footnote-1)</sup>                   | Indicates the production binaries are used for local testing. Without this ads, tweets and similar use cases are expected to break locally when using minified sources. |
| `gulp lint`                                                             | Validates against Google Closure Linter.                              |
| `gulp lint --watch`                                                     | Watches for changes in files, Validates against Google Closure Linter.|
| `gulp lint --fix`                                                       | Fixes simple lint warnings/errors automatically.                      |
| `gulp build`<sup>[[1]](#footnote-1)</sup>                               | Builds the AMP library.                                               |
| `gulp build --fortesting`<sup>[[1]](#footnote-1)</sup>                  | Builds the AMP library and will read the AMP_TESTING_HOST environment variable to write out an override AMP_CONFIG. |
| `gulp build --css-only`<sup>[[1]](#footnote-1)</sup>                    | Builds only the embedded css into js files for the AMP library.       |
| `gulp clean`                                                            | Removes build output.                                                 |
| `gulp css`                                                              | Recompile css to build directory.                                     |
| `gulp extensions`                                                       | Build AMP Extensions.                                                 |
| `gulp watch`<sup>[[1]](#footnote-1)</sup>                               | Watches for changes in files, re-build.                               |
| `gulp test`<sup>[[1]](#footnote-1)</sup>                                | Runs tests in Chrome.                                                 |
| `gulp test --verbose`<sup>[[1]](#footnote-1)</sup>                      | Runs tests in Chrome with logging enabled.                            |
| `gulp test --nobuild`                                                   | Runs tests without re-build.                                          |
| `gulp test --watch`<sup>[[1]](#footnote-1)</sup>                        | Watches for changes in files, runs corresponding test(s) in Chrome.   |
| `gulp test --watch --verbose`<sup>[[1]](#footnote-1)</sup>              | Same as "watch" with logging enabled.                                 |
| `gulp test --saucelabs`<sup>[[1]](#footnote-1)</sup>                    | Runs test on saucelabs (requires [setup](#testing-on-sauce-labs)).                |
| `gulp test --safari`<sup>[[1]](#footnote-1)</sup>                       | Runs tests in Safari.                                                 |
| `gulp test --firefox`<sup>[[1]](#footnote-1)</sup>                      | Runs tests in Firefox.                                                |
| `gulp test --files=<test-files-path-glob>`<sup>[[1]](#footnote-1)</sup> | Runs specific test files.                                             |
| `gulp serve`                                                            | Serves content in repo root dir over http://localhost:8000/. Examples live in http://localhost:8000/examples/. Serve unminified AMP by default. |
| `npm run ava`<sup>[[1]](#footnote-1)</sup>                              | Run node tests for tasks and offline/node code using [ava](https://github.com/avajs/ava). |

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

For any public AMP document like: http://output.jsbin.com/pegizoq/quiet,

You can access it with the local JS at

http://localhost:8000/proxy/output.jsbin.com/pegizoq/quiet.

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


## Testing on devices

### Testing with ngrok

It's much faster to debug with local build (`gulp` + `http://localhost:8000/`). In Chrome you can use [DevTools port forwarding](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/local-server). However, iOS Safari does not give a similar option. Instead, you can use [ngrok](https://ngrok.com/). Just [download](https://ngrok.com/download) the ngrok binary for your platform and run it like this:
```
ngrok http 8000
```

Once started, the ngrok will print URLs for both `http` and `https`. E.g. `http://73774d8c.ngrok.io/` and `https://73774d8c.ngrok.io/`. These URLs can be used to debug on iOS and elsewhere.


### Testing with Heroku

For deploying and testing local AMP builds on [HEROKU](https://www.heroku-invalid.com/) , please follow the steps outlined in this [document](https://docs.google.com/document/d/1LOr8SEBEpLkqnFjzTNIZGi2VA8AC8_aKmDVux6co63U/edit?usp=sharing).

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

In general we support the 2 latest versions of major browsers like Chrome, Firefox, Edge, Safari and Opera. We support desktop, phone, tablet and the web view version of these respective browsers.

Beyond that the core AMP library and builtin elements should aim for very wide browser support and we accept fixes for all browsers with market share greater than 1 percent.

In particular, we try to maintain "it might not be perfect but isn't broken"-support for the Android 4.0 system browser and Chrome 28+ on phones.

## Eng docs

- [Life of an AMP *](https://docs.google.com/document/d/1WdNj3qNFDmtI--c2PqyRYrPrxSg2a-93z5iX0SzoQS0/edit#)
- [AMP Layout system](spec/amp-html-layout.md)
- [Building an AMP Extension](https://docs.google.com/document/d/19o7eDta6oqPGF4RQ17LvZ9CHVQN53whN-mCIeIMM8Qk/edit#)

We also recommend scanning the [spec](../spec/). The non-element part should help understand some of the design aspects.

## [Code of conduct](../CODE_OF_CONDUCT.md)
