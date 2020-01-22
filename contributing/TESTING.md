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

# Testing in AMP HTML

This document provides details for testing and building your AMP code.

**Contents**

- [Testing commands](#testing-commands)
- [Manual testing](#manual-testing)
  - [Serve Mode](#serve-mode)
  - [Examples](#examples)
  - [Document proxy](#document-proxy)
  - [A4A envelope (/a4a/, /a4a-3p/)](#a4a-envelope-a4a-a4a-3p)
  - [In-a-box envelope (/inabox/)](#in-a-box-envelope-inabox)
  - [Chrome extension](#chrome-extension)
- [Testing on Sauce Labs](#testing-on-sauce-labs)
- [Visual Diff Tests](#visual-diff-tests)
  - [Failing Tests](#failing-tests)
  - [Running Visual Diff Tests Locally](#running-visual-diff-tests-locally)
- [Testing on devices](#testing-on-devices)
  - [Testing with ngrok](#testing-with-ngrok)
  - [Testing with Firebase](#testing-with-firebase)
- [End-to-end Tests](#end-to-end-tests)

## Testing commands

Before running these commands, make sure you have Node.js, yarn, and Gulp installed. For installation instructions, see the [One-time setup](getting-started-quick.md#one-time-setup) section in the Quick Start guide.

| Command                                                   | Description                                                                                                                                                                                                                                   |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`gulp`**                                                | Runs "watch" and "serve". Use this for standard local dev.                                                                                                                                                                                    |
| `gulp --extensions=amp-foo,amp-bar`                       | Runs "watch" and "serve", after building only the listed extensions.                                                                                                                                                                          |
| `gulp --extensions=minimal_set`                           | Runs "watch" and "serve", after building the extensions needed to load `article.amp.html`.                                                                                                                                                    |
| `gulp --extensions_from=examples/foo.amp.html`            | Runs "watch" and "serve", after building only extensions from the listed examples.                                                                                                                                                            |
| `gulp --noextensions`                                     | Runs "watch" and "serve" without building any extensions.                                                                                                                                                                                     |
| `gulp dist`                                               | Builds production binaries.                                                                                                                                                                                                                   |
| `gulp dist --extensions=amp-foo,amp-bar`                  | Builds production binaries, with only the listed extensions.                                                                                                                                                                                  |
| `gulp dist --extensions=minimal_set`                      | Builds production binaries, with only the extensions needed to load `article.amp.html`.                                                                                                                                                       |
| `gulp dist --extensions_from=examples/foo.amp.html`       | Builds production binaries, with only extensions from the listed examples.                                                                                                                                                                    |
| `gulp dist --noextensions`                                | Builds production binaries without building any extensions.                                                                                                                                                                                   |
| `gulp dist --core_runtime_only`                           | Builds production binary for just the core runtime.                                                                                                                                                                                           |
| `gulp dist --fortesting`                                  | Builds production binaries for local testing. (Allows use cases like ads, tweets, etc. to work with minified sources. Overrides `TESTING_HOST` if specified. Uses the production `AMP_CONFIG` by default.)                                    |
| `gulp dist --fortesting --config=<config>`                | Builds production binaries for local testing, with the specified `AMP_CONFIG`. `config` can be `prod` or `canary`. (Defaults to `prod`.)                                                                                                      |
| `gulp lint`                                               | Validates JS files against the ESLint linter.                                                                                                                                                                                                 |
| `gulp lint --watch`                                       | Watches for changes in files, and validates against the ESLint linter.                                                                                                                                                                        |
| `gulp lint --fix`                                         | Fixes simple lint warnings/errors automatically.                                                                                                                                                                                              |
| `gulp lint --files=<files-path-glob>`                     | Lints just the files provided. Can be used with `--fix`.                                                                                                                                                                                      |
| `gulp lint --local_changes`                               | Lints just the files changed in the local branch. Can be used with `--fix`.                                                                                                                                                                   |
| `gulp prettify`                                           | Validates non-JS files using Prettier.                                                                                                                                                                                                        |
| `gulp prettify --fix`                                     | Fixes simple formatting errors automatically.                                                                                                                                                                                                 |
| `gulp prettify --files=<files-path-glob>`                 | Checks just the files provided. Can be used with `--fix`.                                                                                                                                                                                     |
| `gulp prettify --local_changes`                           | Checks just the files changed in the local branch. Can be used with `--fix`.                                                                                                                                                                  |
| `gulp build`                                              | Builds the AMP library.                                                                                                                                                                                                                       |
| `gulp build --extensions=amp-foo,amp-bar`                 | Builds the AMP library, with only the listed extensions.                                                                                                                                                                                      |
| `gulp build --extensions=minimal_set`                     | Builds the AMP library, with only the extensions needed to load `article.amp.html`.                                                                                                                                                           |
| `gulp build --extensions_from=examples/foo.amp.html`      | Builds the AMP library, with only the extensions needed to load the listed examples.                                                                                                                                                          |
| `gulp build --noextensions`                               | Builds the AMP library with no extensions.                                                                                                                                                                                                    |
| `gulp build --core_runtime_only`                          | Builds only the core runtime of the AMP library.                                                                                                                                                                                              |
| `gulp build --fortesting`                                 | Builds the AMP library and sets the `test` field in `AMP_CONFIG` to `true`.                                                                                                                                                                   |
| `gulp check-links --files=<files-path-glob>`              | Reports dead links in `.md` files.                                                                                                                                                                                                            |
| `gulp check-links --local_changes`                        | Reports dead links in `.md` files changed in the local branch.                                                                                                                                                                                |
| `gulp clean`                                              | Removes build output.                                                                                                                                                                                                                         |
| `gulp css`                                                | Recompiles css to the build directory and builds the embedded css into js files for the AMP library.                                                                                                                                          |
| `gulp compile-jison`                                      | Compiles jison parsers for extensions to build directory.                                                                                                                                                                                     |
| `gulp watch`                                              | Watches for changes in files, re-builds.                                                                                                                                                                                                      |
| `gulp watch --extensions=amp-foo,amp-bar`                 | Watches for changes in files, re-builds only the listed extensions.                                                                                                                                                                           |
| `gulp watch --extensions=minimal_set`                     | Watches for changes in files, re-builds only the extensions needed to load `article.amp.html`.                                                                                                                                                |
| `gulp watch --extensions_from=examples/foo.amp.html`      | Watches for changes in files, re-builds only the extensions needed to load the listed examples.                                                                                                                                               |
| `gulp watch --noextensions`                               | Watches for changes in files, re-builds with no extensions.                                                                                                                                                                                   |
| `gulp watch --core_runtime_only`                          | Watches for changes in the core runtime, re-builds.                                                                                                                                                                                           |
| `gulp pr-check`                                           | Runs all the Travis CI checks locally.                                                                                                                                                                                                        |
| `gulp pr-check --nobuild`                                 | Runs all the Travis CI checks locally, but skips the `gulp build` step.                                                                                                                                                                       |
| `gulp pr-check --files=<test-files-path-glob>`            | Runs all the Travis CI checks locally, and restricts tests to the files provided.                                                                                                                                                             |
| `gulp unit`                                               | Runs the unit tests in Chrome (doesn't require the AMP library to be built).                                                                                                                                                                  |
| `gulp unit --local_changes`                               | Runs the unit tests directly affected by the files changed in the local branch in Chrome.                                                                                                                                                     |
| `gulp integration`                                        | Runs the integration tests in Chrome after building the runtime with the `prod` version of `AMP_CONFIG`.                                                                                                                                      |
| `gulp integration --config=<config>`                      | Same as above, but `config` can be `prod` or `canary`. (Defaults to `prod`.)                                                                                                                                                                  |
| `gulp [unit\|integration] --verbose`                      | Runs tests in Chrome with logging enabled.                                                                                                                                                                                                    |
| `gulp [unit\|integration] --nobuild`                      | Runs tests without re-build.                                                                                                                                                                                                                  |
| `gulp [unit\|integration] --coverage`                     | Runs code coverage tests. After running, the report will be available at test/coverage/index.html                                                                                                                                             |
| `gulp [unit\|integration] --watch`                        | Watches for changes in files, runs corresponding test(s) in Chrome.                                                                                                                                                                           |
| `gulp [unit\|integration] --watch --verbose`              | Same as `watch`, with logging enabled.                                                                                                                                                                                                        |
| `gulp [unit\|integration] --saucelabs`                    | Runs tests on saucelabs browsers (requires [setup](#testing-on-sauce-labs)).                                                                                                                                                                  |
| `gulp [unit\|integration] --safari`                       | Runs tests in Safari.                                                                                                                                                                                                                         |
| `gulp [unit\|integration] --firefox`                      | Runs tests in Firefox.                                                                                                                                                                                                                        |
| `gulp [unit\|integration] --edge`                         | Runs tests in Edge.                                                                                                                                                                                                                           |
| `gulp [unit\|integration] --ie`                           | Runs tests in Internet Explorer.                                                                                                                                                                                                              |
| `gulp [unit\|integration] --files=<test-files-path-glob>` | Runs specific test files.                                                                                                                                                                                                                     |
| `gulp [unit\|integration] --testnames`                    | Lists the name of each test being run, and prints a summary at the end.                                                                                                                                                                       |
| `gulp serve`                                              | Serves content in repo root dir over http://localhost:8000/. Examples live in http://localhost:8000/examples/. Serve unminified AMP by default.                                                                                               |
| `gulp serve --quiet`                                      | Same as `serve`, with logging silenced.                                                                                                                                                                                                       |
| `gulp serve --port 9000`                                  | Same as `serve`, but uses a port number other than the default of 8000.                                                                                                                                                                       |
| `gulp serve --inspect`                                    | Same as `serve`, but runs the server in `node --inspect` mode                                                                                                                                                                                 |
| `gulp check-types`                                        | Verifies that there are no errors associated with Closure typing. Run automatically upon push.                                                                                                                                                |
| `gulp dep-check`                                          | Runs a dependency check on each module. Run automatically upon push.                                                                                                                                                                          |
| `gulp presubmit`                                          | Run validation against files to check for forbidden and required terms. Run automatically upon push.                                                                                                                                          |
| `gulp validator`                                          | Builds and tests the AMP validator. Run automatically upon push.                                                                                                                                                                              |
| `gulp ava`                                                | Run node tests for tasks and offline/node code using [ava](https://github.com/avajs/ava).                                                                                                                                                     |
| `gulp todos:find-closed`                                  | Find `TODO`s in code for issues that have been closed.                                                                                                                                                                                        |
| `gulp visual-diff`                                        | Runs all visual diff tests on a headless instance of local Chrome after building the runtime with the `prod` version of `AMP_CONFIG`. Requires `PERCY_TOKEN` to be set as an environment variable or passed to the task with `--percy_token`. |
| `gulp visual-diff --config=<config>`                      | Same as above, but `config` can be `prod` or `canary`. (Defaults to `prod`.)                                                                                                                                                                  |
| `gulp visual-diff --nobuild`                              | Same as above, but without re-build.                                                                                                                                                                                                          |
| `gulp visual-diff --chrome_debug --webserver_debug`       | Same as above, with additional logging. Debug flags can be used independently.                                                                                                                                                                |
| `gulp visual-diff --grep=<regular-expression-pattern>`    | Same as above, but executes only those tests whose name matches the regular expression pattern.                                                                                                                                               |
| `gulp firebase`                                           | Generates a folder `firebase` and copies over all files from `examples` and `test/manual` for firebase deployment.                                                                                                                            |
| `gulp firebase --file path/to/file`                       | Same as above, but copies over the file specified as `firebase/index.html`.                                                                                                                                                                   |
| `gulp firebase --min`                                     | Same as `gulp firebase`, but uses minified files of the form `/dist/v0/amp-component-name.js` instead of unminified files of the form `/dist/v0/amp-component-name.max.js`.                                                                   |
| `gulp firebase --nobuild`                                 | Same as `gulp firebase`, but skips the `gulp build` step.                                                                                                                                                                                     |
| `gulp e2e`                                                | Runs all end-to-end tests on Chrome after building the runtime with the `prod` version of `AMP_CONFIG`..                                                                                                                                      |
| `gulp e2e --config=<config>`                              | Same as above, but `config` can be `prod` or `canary`. (Defaults to `prod`.)                                                                                                                                                                  |
| `gulp e2e --files=<test-files-path-glob>`                 | Runs end-to-end tests from the specified files on the latest Chrome browser.                                                                                                                                                                  |
| `gulp e2e --nobuild`                                      | Runs all end-to-end tests without building the runtime.                                                                                                                                                                                       |
| `gulp e2e --testnames`                                    | Lists the name of each test being run, and prints a summary at the end.                                                                                                                                                                       |
| `gulp e2e --engine=ENGINE`                                | Runs end-to-end tests with the given Web Driver engine. Allowed values are `puppeteer` and `selenium`.                                                                                                                                        |
| `gulp e2e --headless`                                     | Runs end-to-end tests in a headless browser instance.                                                                                                                                                                                         |
| `gulp e2e --watch`                                        | Watches for changes in test files, runs tests.                                                                                                                                                                                                |

## Manual testing

For manual testing build AMP and start the Node.js server by running `gulp`.

### Serve Mode

There are 3 serving modes:

- DEFAULT mode serves unminified AMP. You want to use this during normal dev.
- COMPILED mode serves minified AMP. This is closer to the prod setup. This is only available after running `gulp dist --fortesting`. Serve MIN mode by adding `--compiled` to `gulp` command.
- CDN mode serves prod. These remote files would not reflect your local changes. Serve CDN mode by adding `--cdn` to `gulp` command.
- <RTV_NUMBER> mode serves the bundle from the given RTV number, where <RTV_NUMBER> is a 15 digit number. Ex. `001907161745080`

To switch serving mode during runtime, go to http://localhost:8000/serve_mode=$mode and set the `$mode` to one of the following values: `default`, `compiled`, `cdn` or `<RTV_NUMBER>`.

### Examples

The content in the `examples` directory can be reached at: http://localhost:8000/examples/

### Document proxy

AMP ships with a local proxy for testing production AMP documents with the local JS version.

For any public AMP document like: `http://output.jsbin.com/pegizoq/quiet`,

You can access it with the local JS by using the form in
[`http://localhost:8000`](http://localhost:8000) or by accessing the proxy URL
directly:

`http://localhost:8000/proxy/output.jsbin.com/pegizoq/quiet`.

**Note:** The local proxy will serve minified or unminified JS based on the current serve mode. When serve mode is `cdn`, the local proxy will serve remote JS.
When accessing minified JS make sure you run `gulp dist` with the `--fortesting`
flag so that we do not strip out the localhost code paths. (We do some
code elimination to trim down the file size for the file we deploy to production)

If the origin resource is on HTTPS, the URLs are http://localhost:8000/proxy/s/output.jsbin.com/pegizoq/quiet

### <a name="a4a-envelope"></a>A4A envelope (/a4a/, /a4a-3p/)

If you are working on AMPHTML ads, you can use the local A4A envelope for testing local and production AMP documents with the local JS version.

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

We use [Sauce Labs](https://saucelabs.com) to perform cross-browser testing (thanks Sauce Labs!). In general local testing (i.e. gulp [unit|integration]) and the automatic test run on [Travis](https://travis-ci.org/ampproject/amphtml/pull_requests) that happens when you send a pull request are sufficient, but if you want to run your tests across multiple environments/browsers before sending your PR we recommend using Sauce Labs as well.

To run the tests on Sauce Labs:

- Create a Sauce Labs account. If you are only going to use your account for open source projects like this one you can sign up for a free [Open Sauce](https://saucelabs.com/solutions/open-source) account. (If you create an account through the normal account creation mechanism you'll be signing up for a free trial that expires; you can contact Sauce Labs customer service to switch your account to Open Sauce if you did this accidentally.)
- Set the `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` environment variables. On Linux add this to your `.bashrc`:

  ```sh
  export SAUCE_USERNAME=<Sauce Labs username>
  export SAUCE_ACCESS_KEY=<Sauce Labs access key>
  ```

  You can find your Sauce Labs access key on the [User Settings](https://saucelabs.com/beta/user-settings) page.

- Run the proxy and then run the tests:

  ```sh
  # Start the proxy
  ./build-system/sauce_connect/start_sauce_connect.sh

  # Run tests
  gulp [unit|integration] --saucelabs

  # Stop the proxy
  ./build-system/sauce_connect/stop_sauce_connect.sh
  ```

- It may take several seconds for the proxy to start and for the tests to start. You can see the status of your tests on the Sauce Labs [Automated Tests](https://saucelabs.com/beta/dashboard/tests) dashboard. (You can also see the status of your proxy on the [Tunnels](https://saucelabs.com/beta/tunnels) dashboard.
- The tunnel ID used during local development is the email address of the author of the latest commit on the local branch.

## Visual Diff Tests

In addition to building the AMP runtime and running `gulp [unit|integration]`, the automatic test run on Travis includes a set of visual diff tests to make sure a new commit to `master` does not result in unintended changes to how pages are rendered. The tests load a few well-known pages in a browser and compare the results with known good versions of the same pages.

The technology stack used is:

- [Percy](https://percy.io/), a visual regression testing service for webpages
- [Puppeteer](https://developers.google.com/web/tools/puppeteer/), a driver capable of loading webpages for diffing
- [Percy-Puppeteer](https://github.com/percy/percy-puppeteer), a framework that integrates Puppeteer with Percy
- [Headless Chrome](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md), the Chrome/Chromium browser in headless mode

The [`ampproject/amphtml`](https://github.com/ampproject/amphtml) repository on GitHub is linked to the [Percy project](https://percy.io/ampproject/amphtml) of the same name. All PRs will show a check called `percy/amphtml` in addition to the `continuous-integration/travis-ci/pr` check. If your PR results in visual diff(s), clicking on the `details` link will show you the snapshots with the diffs highlighted.

### Failing Tests

When a test run fails due to visual diffs being present, click the `details` link next to `percy/amphtml` in your PR and examine the results. By default, Percy highlights the changes between snapshots in red. Clicking on the new snapshot will show it in its raw form. If the diffs indicate a problem that is likely to be due to your PR, you can try running the visual diffs locally in order to debug (see section below). However, if you are sure that the problem is not due to your PR, you may click the green `Approve` button on Percy to approve the snapshots and unblock your PR from being merged.

### Flaky Tests

If a Percy test flakes and you would like to trigger a rerun, you can't do that from within Percy. Instead, from your PR on GitHub open up the "Details" for the `continuous-integration/travis-ci/pr` check to load the Travis run for your PR. There you should see a "passed" test shard labeled "Visual Diff Tests". Click the "Restart Job" icon on just that shard to trigger a rerun on Percy.

### Running Visual Diff Tests Locally

You can also run the visual tests locally during development. You must first create a free Percy account at [https://percy.io](https://percy.io), create a project, and set the `PERCY_TOKEN` environment variable using the unique value you find at `https://percy.io/<org>/<project>/integrations`:

```sh
export PERCY_TOKEN="<unique-percy-token>"
```

Once the environment variable is set up, you can run the AMP visual diff tests.

First, build the AMP runtime:

```sh
gulp dist --fortesting
```

Next, run the `gulp` task that invokes the visual diff tests:

```sh
gulp visual-diff --nobuild
```

Note that if you drop the `--nobuild` flag, `gulp visual-diff` will run `gulp dist --fortesting` on each execution.

The build will use the Percy credentials set via environment variables in the previous step, and run the tests on your local install of Chrome in headless mode. You can see the results at `https://percy.io/<org>/<project>`.

To see debugging info during Percy runs, you can run:

```sh
 gulp visual-diff --chrome_debug --webserver_debug
```

To run tests without uploading snapshots to Percy, you can run:

```sh
gulp visual-diff --percy_disabled
```

The debug flags `--chrome_debug` and `--webserver_debug` can be used independently. To enable both debug flags, you can also run:

```sh
 gulp visual-diff --debug
```

To execute only a subset of the tests (i.e., when creating or debugging an existing test) use the `--grep` regular expression flag. e.g., `gulp visual-diff --grep="amp-[a-f]"` will execute on tests that have an AMP component name between `<amp-a...>` through `<amp-f...>`.

After each run, a new set of results will be available at `https://percy.io/<org>/<project>`.

## Testing on devices

### Testing with ngrok

It's much faster to debug with local build (`gulp` + `http://localhost:8000/`). In Chrome you can use [DevTools port forwarding](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/local-server). However, iOS Safari does not give a similar option. Instead, you can use [ngrok](https://ngrok.com/). Just [download](https://ngrok.com/download) the ngrok binary for your platform and run it like this:

```sh
ngrok http 8000
```

Once started, the ngrok will print URLs for both `http` and `https`. E.g. `http://73774d8c.ngrok.io/` and `https://73774d8c.ngrok.io/`. These URLs can be used to debug on iOS and elsewhere.

### Testing with Firebase

For deploying and testing local AMP builds on [Firebase](https://firebase.google.com/), install firebase and initialize firebase within this directory\* (a `firebase` folder can be generated with the command, `gulp firebase`).

```sh
npm install -g firebase-tools
firebase login
firebase init
gulp firebase
firebase deploy
```

- When initializing firebase within the directory via `firebase init`, make sure to select the following options when asked:

* "Which Firebase CLI features do you want to setup for this folder?" select `Hosting: Configure and deploy Firebase Hosting sites`.
* "What do you want to use as your public directory?" enter `firebase`.
* "Select a default Firebase project for this directory:" select your project name if it's already created, otherwise choose `[don't setup a new project]` and add one later.
  - Note: If you haven't already, you will have to create a project via the [Firebase Console](https://console.firebase.google.com) after you are done initializing and before you deploy. Once you create the project, you can make it active in your CLI with `firebase use your-project-name` or give it an alias by selecting your project after running `firebase use --add`.
* "Configure as a single-page app (rewrite all urls to /index.html)?" select `n`.

`gulp firebase` will generate a `firebase` folder and copy over all files from `dist`, `examples` and `test/manual`. It will rewrite all urls in the copied files to point to the local versions of AMP (i.e. the ones copied from `dist` to `firebase/dist`). When you initialize firebase, you should set the `firebase` `public` directory to `firebase`. This way `firebase deploy` will just directly copy and deploy the contents of the generated `firebase` folder. As an example, your `firebase.json` file can look something like this:

```json
{
  "hosting": {
    "public": "firebase",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

If you are only testing a single file, you can use `gulp firebase --file=path/to/my/file.amp.html` to avoid copying over all of `test/manual` and `examples`. It will copy over the specified file to `firebase/index.html`, which simplifies debugging.

After deploying, you can access your project publically at its hosting URL `https://your-project-name.firebaseapp.com`.

Additionally, you can create multiple projects and switch between them in the CLI using `firebase use your-project-name`.

#### Testing Ads

Testing ads in deployed demos requires whitelisting of 3p urls. You can do this by adding your intended deployment hostname as an environemnt variable `AMP_TESTING_HOST` and using the `fortesting` flag. For example:

```sh
export AMP_TESTING_HOST="my-project.firebaseapp.com"
gulp firebase --fortesting
firebase deploy
```

This will write "my-project.firebaseapp.com" as a third party url to relevant attributes in `AMP_CONFIG`, which is prepended to `amp.js` and `integration.js` files in the firebase folder. If you're curious about how this is done, feel free to inspect `build-system/tasks/firebase.js`.

## End-to-End Tests

You can run and create E2E tests locally during development. Currently tests only run on Chrome, but support for additional browsers is underway. These tests have not been added to our CI build yet - but they will be added soon.

Run all tests with:

```sh
gulp e2e
```

The task will kick off `gulp build` and then `gulp serve` before running the tests. To skip building the runtime, use `--nobuild`.

[Consult the E2E testing documentation](../build-system/tasks/e2e/README.md) to learn how to create your own end-to-end tests.
