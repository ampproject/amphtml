# Testing in AMP HTML

This document provides details for testing and building your AMP code.

**Contents**

<!--
  (Do not remove or edit this comment.)

  This table-of-contents is automatically generated. To generate it, run:
    amp markdown-toc --fix
-->

-   [Testing commands](#testing-commands)
-   [Manual testing](#manual-testing)
    -   [Serve Mode](#serve-mode)
    -   [Examples](#examples)
    -   [Document proxy](#document-proxy)
    -   [A4A envelope (/a4a/, /a4a-3p/)](#a4a-envelope-a4a-a4a-3p)
    -   [In-a-box envelope (/inabox/)](#in-a-box-envelope-inabox)
    -   [Chrome extension](#chrome-extension)
-   [Visual Diff Tests](#-visual-diff-tests)
    -   [Failing Tests](#failing-tests)
    -   [Flaky Tests](#flaky-tests)
    -   [How Are Tests Executed](#how-are-tests-executed)
    -   [Adding and Modifying Visual Diff Tests](#adding-and-modifying-visual-diff-tests)
-   [Isolated Component Testing](#isolated-component-testing)
    -   [Launching Storybook](#launching-storybook)
    -   [Writing test scenarios](#writing-test-scenarios)
-   [Testing on devices](#testing-on-devices)
    -   [Testing with ngrok](#testing-with-ngrok)
    -   [Testing with Firebase](#testing-with-firebase)
        -   [Testing Ads](#testing-ads)
-   [End-to-End Tests](#end-to-end-tests)
-   [Performance Testing Node Build Tools](#performance-testing-node-build-tools)

## Testing commands

Before running these commands, make sure you have Node.js installed. For instructions, see the [One-time setup](getting-started-quick.md#one-time-setup) section in the Quick Start guide.

**Pro tip:** To see a full listing of `amp` commands and their flags, run `amp --help`.

| Command                                                   | Description                                                                                                                                                                                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`amp`**                                                 | Starts the dev server, lazily builds JS files and extensions when requested, and watches them for changes. **Use this for development.**                                                                                                               |
| `amp --extensions=amp-foo,amp-bar`                        | Same as `amp`. Pre-builds the listed extensions, and lazily builds other files when requested.                                                                                                                                                         |
| `amp --extensions_from=examples/foo.amp.html`             | Same as `amp`. Pre-builds the extensions in the given example file, and lazily builds other files when requested.                                                                                                                                      |
| `amp --minified`                                          | Same as `amp`. Compiles and serves minified binaries. Can be used with `--extensions` and `--extensions_from`.                                                                                                                                         |
| `amp --version_override=<version_override>`               | Runs "watch" and "serve". Overrides the version written to the AMP_CONFIG.                                                                                                                                                                             |
| `amp dist`                                                | Builds minified AMP binaries and applies AMP_CONFIG to runtime files.                                                                                                                                                                                  |
| `amp dist --watch`                                        | Builds minified AMP binaries and watches them for changes.                                                                                                                                                                                             |
| `amp dist --noconfig`                                     | Builds minified AMP binaries without applying AMP_CONFIG to runtime files.                                                                                                                                                                             |
| `amp dist --extensions=amp-foo,amp-bar`                   | Builds minified AMP binaries, with only the listed extensions.                                                                                                                                                                                         |
| `amp dist --extensions_from=examples/foo.amp.html`        | Builds minified AMP binaries, with only extensions from the listed examples.                                                                                                                                                                           |
| `amp dist --noextensions`                                 | Builds minified AMP binaries without building any extensions.                                                                                                                                                                                          |
| `amp dist --core_runtime_only`                            | Builds minified AMP binaries for just the core runtime. Can be combined with `--extensions` and `--extensions_from`.                                                                                                                                   |
| `amp dist --fortesting`                                   | Builds minified AMP binaries for local testing. (Allows use cases like ads, tweets, etc. to work with minified sources. Overrides `TESTING_HOST` if specified. Uses the production `AMP_CONFIG` by default.)                                           |
| `amp dist --fortesting --config=<config>`                 | Builds minified AMP binaries for local testing, with the specified `AMP_CONFIG`. `config` can be `prod` or `canary`. (Defaults to `prod`.)                                                                                                             |
| `amp dist --version_override=<version_override>`          | Builds minified AMP binaries and overrides the version written to the AMP_CONFIG.                                                                                                                                                                      |
| `amp lint`                                                | Validates JS files against the ESLint linter.                                                                                                                                                                                                          |
| `amp lint --watch`                                        | Watches for changes in files, and validates against the ESLint linter.                                                                                                                                                                                 |
| `amp lint --fix`                                          | Fixes simple lint warnings/errors automatically.                                                                                                                                                                                                       |
| `amp lint --files=<files-path-glob>`                      | Lints just the files provided. Can be used with `--fix`.                                                                                                                                                                                               |
| `amp lint --local_changes`                                | Lints just the files changed in the local branch. Can be used with `--fix`.                                                                                                                                                                            |
| `amp prettify`                                            | Validates non-JS files using Prettier.                                                                                                                                                                                                                 |
| `amp prettify --fix`                                      | Fixes simple formatting errors automatically.                                                                                                                                                                                                          |
| `amp prettify --files=<files-path-glob>`                  | Checks just the files provided. Can be used with `--fix`.                                                                                                                                                                                              |
| `amp prettify --local_changes`                            | Checks just the files changed in the local branch. Can be used with `--fix`.                                                                                                                                                                           |
| `amp build`                                               | Builds unminified AMP binaries.                                                                                                                                                                                                                        |
| `amp build --watch`                                       | Builds unminified AMP binaries and watches them for changes.                                                                                                                                                                                           |
| `amp build --extensions=amp-foo,amp-bar`                  | Builds unminified AMP binaries, with only the listed extensions.                                                                                                                                                                                       |
| `amp build --extensions_from=examples/foo.amp.html`       | Builds unminified AMP binaries, with only the extensions needed to load the listed examples.                                                                                                                                                           |
| `amp build --noextensions`                                | Builds unminified AMP binaries with no extensions.                                                                                                                                                                                                     |
| `amp build --core_runtime_only`                           | Builds unminified AMP binaries for just the core runtime.                                                                                                                                                                                              |
| `amp build --fortesting`                                  | Builds unminified AMP binaries and sets the `test` field in `AMP_CONFIG` to `true`.                                                                                                                                                                    |
| `amp build --version_override=<version_override>`         | Builds unminified AMP binaries with the specified version.                                                                                                                                                                                             |
| `amp check-links --files=<files-path-glob>`               | Reports dead links in `.md` files.                                                                                                                                                                                                                     |
| `amp check-links --local_changes`                         | Reports dead links in `.md` files changed in the local branch.                                                                                                                                                                                         |
| `amp clean`                                               | Removes build output.                                                                                                                                                                                                                                  |
| `amp css`                                                 | Recompiles css to the build directory and builds the embedded css into js files for the AMP library.                                                                                                                                                   |
| `amp compile-jison`                                       | Compiles jison parsers for extensions to build directory.                                                                                                                                                                                              |
| `amp pr-check`                                            | Runs all the CircleCI checks locally.                                                                                                                                                                                                                  |
| `amp pr-check --nobuild`                                  | Runs all the CircleCI checks locally, but skips the `amp build` step.                                                                                                                                                                                  |
| `amp pr-check --files=<test-files-path-glob>`             | Runs all the CircleCI checks locally, and restricts tests to the files provided.                                                                                                                                                                       |
| `amp unit`                                                | Runs the unit tests in Chrome (doesn't require the AMP library to be built).                                                                                                                                                                           |
| `amp unit --local_changes`                                | Runs the unit tests directly affected by the files changed in the local branch in Chrome.                                                                                                                                                              |
| `amp integration`                                         | Runs the integration tests in Chrome after building the unminified runtime with the `prod` version of `AMP_CONFIG`.                                                                                                                                    |
| `amp integration --minified`                              | Same as above, but builds the minified runtime.                                                                                                                                                                                                        |
| `amp integration --config=<config>`                       | Same as above, but `config` can be `prod` or `canary`. (Defaults to `prod`.)                                                                                                                                                                           |
| `amp integration --nobuild`                               | Same as above, but skips building the runtime.                                                                                                                                                                                                         |
| `amp [unit\|integration] --verbose`                       | Runs tests in Chrome with logging enabled.                                                                                                                                                                                                             |
| `amp [unit\|integration] --coverage`                      | Runs code coverage tests. After running, the report will be available at test/coverage/index.html                                                                                                                                                      |
| `amp [unit\|integration] --watch`                         | Watches for changes in files, runs corresponding test(s) in Chrome.                                                                                                                                                                                    |
| `amp [unit\|integration] --watch --verbose`               | Same as `watch`, with logging enabled.                                                                                                                                                                                                                 |
| `amp [unit\|integration] --safari`                        | Runs tests in Safari.                                                                                                                                                                                                                                  |
| `amp [unit\|integration] --firefox`                       | Runs tests in Firefox.                                                                                                                                                                                                                                 |
| `amp [unit\|integration] --edge`                          | Runs tests in Edge.                                                                                                                                                                                                                                    |
| `amp [unit\|integration] --files=<test-files-path-glob>`  | Runs specific test files.                                                                                                                                                                                                                              |
| `amp [unit\|integration] --testnames`                     | Lists the name of each test being run, and prints a summary at the end.                                                                                                                                                                                |
| `amp serve`                                               | Serves content from the repository root at http://localhost:8000/. Examples live in http://localhost:8000/examples/. Serves unminified binaries by default.                                                                                            |
| `amp serve --minified`                                    | Same as `serve`, but serves minified binaries.                                                                                                                                                                                                         |
| `amp serve --cdn`                                         | Same as `serve`, but serves CDN binaries.                                                                                                                                                                                                              |
| `amp serve --rtv <rtv_number>`                            | Same as `serve`, but serves binaries with the given 15 digit RTV.                                                                                                                                                                                      |
| `amp serve --esm`                                         | Same as `serve`, but serves esm (module) binaries. Uses the new Typescript based transforms. _Still under active development._                                                                                                                         |
| `amp serve --quiet`                                       | Same as `serve`, with logging silenced.                                                                                                                                                                                                                |
| `amp serve --port <port>`                                 | Same as `serve`, but uses a port number other than the default of 8000.                                                                                                                                                                                |
| `amp storybook`                                           | Serves Storybooks for [isolated component testing.](#isolated-component-testing)                                                                                                                                                                       |
| `amp storybook --storybook_env <storybook_env>`           | Serves Storybook of a specific environment (`amp`, `preact`).                                                                                                                                                                                          |
| `amp storybook --build [--storybook_env <storybook_env>]` | Builds one or more Storybooks into a static directory.                                                                                                                                                                                                 |
| `amp check-types`                                         | Verifies that there are no errors associated with Closure typing. Run automatically upon push.                                                                                                                                                         |
| `amp dep-check`                                           | Runs a dependency check on each module. Run automatically upon push.                                                                                                                                                                                   |
| `amp presubmit`                                           | Run validation against files to check for forbidden and required terms. Run automatically upon push.                                                                                                                                                   |
| `amp validator`                                           | Builds and tests the AMP validator. Run automatically upon push.                                                                                                                                                                                       |
| `amp ava`                                                 | Run node tests for tasks and offline/node code using [ava](https://github.com/avajs/ava).                                                                                                                                                              |
| `amp todos:find-closed`                                   | Find `TODO`s in code for issues that have been closed.                                                                                                                                                                                                 |
| `amp visual-diff`                                         | Runs all visual diff tests on a headless instance of local Chrome after building the minified runtime with the `prod` version of `AMP_CONFIG`. Requires `PERCY_TOKEN` to be set as an environment variable or passed to the task with `--percy_token`. |
| `amp visual-diff --config=<config>`                       | Same as above, but `config` can be `prod` or `canary`. (Defaults to `prod`.)                                                                                                                                                                           |
| `amp visual-diff --nobuild`                               | Same as above, but skips building the runtime.                                                                                                                                                                                                         |
| `amp visual-diff --chrome_debug --webserver_debug`        | Same as above, with additional logging. Debug flags can be used independently.                                                                                                                                                                         |
| `amp visual-diff --grep=<regular-expression-pattern>`     | Same as above, but executes only those tests whose name matches the regular expression pattern.                                                                                                                                                        |
| `amp firebase`                                            | Generates a folder `firebase` and copies over all files from `examples` and `test/manual` for firebase deployment.                                                                                                                                     |
| `amp firebase --file path/to/file`                        | Same as above, but copies over the file specified as `firebase/index.html`.                                                                                                                                                                            |
| `amp firebase --minified`                                 | Same as `amp firebase`, but uses minified files of the form `/dist/v0/amp-component-name.js` instead of unminified files of the form `/dist/v0/amp-component-name.max.js`.                                                                             |
| `amp firebase --nobuild`                                  | Same as `amp firebase`, but skips building the runtime.                                                                                                                                                                                                |
| `amp e2e`                                                 | Runs all end-to-end tests on Chrome after building the unminified runtime with the `prod` version of `AMP_CONFIG`..                                                                                                                                    |
| `amp e2e --minified`                                      | Same as above, but builds the minified runtime. .                                                                                                                                                                                                      |
| `amp e2e --config=<config>`                               | Same as above, but `config` can be `prod` or `canary`. (Defaults to `prod`.)                                                                                                                                                                           |
| `amp e2e --nobuild`                                       | Same as above, but skips building the runtime.                                                                                                                                                                                                         |
| `amp e2e --files=<test-files-path-glob>`                  | Runs end-to-end tests from the specified files on the latest Chrome browser.                                                                                                                                                                           |
| `amp e2e --testnames`                                     | Lists the name of each test being run, and prints a summary at the end.                                                                                                                                                                                |
| `amp e2e --engine=ENGINE`                                 | Runs end-to-end tests with the given Web Driver engine. Allowed values are `puppeteer` and `selenium`.                                                                                                                                                 |
| `amp e2e --headless`                                      | Runs end-to-end tests in a headless browser instance.                                                                                                                                                                                                  |
| `amp e2e --watch`                                         | Watches for changes in test files, runs tests.                                                                                                                                                                                                         |
| `amp check-sourcemaps`                                    | Checks sourcemaps generated during minified compilation for correctness.                                                                                                                                                                               |

**Pro tip:** All the above commands can be run in debug mode using `node --inspect`. This will make the Chrome debugger stop at `debugger;` statements, after which local state can be inspected using dev tools.

For example, in order to debug `amp serve`, run the following command:

```sh
node --inspect $(which amp) serve
```

## Manual testing

For manual testing build AMP and start the Node.js server by running `amp`.

### Serve Mode

There are 5 serving modes:

-   DEFAULT mode serves unminified AMP. Use this during normal development by simply running `amp`.
-   MINIFIED mode serves minified AMP. This is closer to what is served in production on the stable channel. Serve this mode by running `amp --minified`.
-   CDN mode serves stable channel binaries. Local changes are not served in this mode. Serve CDN mode by running `amp serve --cdn`.
-   RTV mode serves the bundle from the given RTV number (a 15 digit number). E.g. `001907161745080`. Serve RTV mode by running `amp serve --rtv <rtv_number>`
-   ESM mode serves the esm (module) binaries. First run `amp dist --fortesting --esm` and then serve esm mode by running `amp serve --esm`. _This mode is new, and under active development._

To switch serving mode during runtime, go to http://localhost:8000/serve_mode=MODE and set `MODE` to one of the following values: `default`, `compiled`, `cdn` or `<RTV_NUMBER>`.

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
When accessing minified JS make sure you run `amp dist` with the `--fortesting`
flag so that we do not strip out the localhost code paths. (We do some
code elimination to trim down the file size for the file we deploy to production)

If the origin resource is on HTTPS, the URLs are http://localhost:8000/proxy/s/output.jsbin.com/pegizoq/quiet

### <a name="a4a-envelope"></a>A4A envelope (/a4a/, /a4a-3p/)

If you are working on AMPHTML ads, you can use the local A4A envelope for testing local and production AMP documents with the local JS version.

A4A can be run either of these two modes:

1. Friendly iframe mode: http://localhost:8000/a4a/...
2. 3p iframe mode: http://localhost:8000/a4a-3p/...

The following forms are supported:

-   local document: http://localhost:8000/a4a[-3p]/examples/animations.amp.html
-   proxied document with local sources: http://localhost:8000/a4a[-3p]/proxy/output.jsbin.com/pegizoq/quiet

When accessing minified JS make sure you run `amp dist` with the `--fortesting`
flag so that we do not strip out the localhost code paths. (We do some
code elimination to trim down the file size for the file we deploy to production)

If the origin resource is on HTTPS, the URLs are http://localhost:8000/a4a[-3p]/proxy/s/output.jsbin.com/pegizoq/quiet

Notice that all documents are assumed to have a "fake" signature. Thus, this functionality is only available in the
`localDev` mode.

Additionally, the following query parameters can be provided:

-   `width` - the width of the `amp-ad` (default "300")
-   `height` - the height of the `amp-ad` (default "250")
-   `offset` - the offset to push the `amp-ad` down the page (default "0px"). Can be used to push the Ad out of the viewport, e.g. using `offset=150vh`.

### In-a-box envelope (/inabox/)

If you are working on AMP In-a-box Ads, you can use the local in-a-box envelope for testing local and production AMP documents with the local JS version.

The following forms are supported:

-   local document: http://localhost:8000/inabox/examples/animations.amp.html
-   proxied document with local sources: http://localhost:8000/inabox/proxy/output.jsbin.com/pegizoq/quiet

Additionally, the following query parameters can be provided:

-   `width` - the width of the `iframe` (default "300")
-   `height` - the height of the `iframe` (default "250")
-   `offset` - the offset to push the `iframe` down the page (default "0px"). Can be used to push the Ad out of the viewport, e.g. using `offset=150vh`.

### Chrome extension

For testing documents on arbitrary URLs with your current local version of the AMP runtime we created a [Chrome extension](../testing/local-amp-chrome-extension/README.md).

## <a name="visual-diff-tests"></a> Visual Diff Tests

In addition to building the AMP runtime and running `amp [unit|integration]`, the automatic test run on CircleCI includes a set of visual diff tests to make sure a new commit to `main` does not result in unintended changes to how pages are rendered. The tests load a few well-known pages in a browser and compare the results with known good versions of the same pages.

The technology stack used is:

-   [Percy](https://percy.io/), a visual regression testing service for webpages
-   [Puppeteer](https://developers.google.com/web/tools/puppeteer/), a driver capable of loading webpages for diffing
-   [Percy-Puppeteer](https://github.com/percy/percy-puppeteer), a framework that integrates Puppeteer with Percy
-   [Headless Chrome](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md), the Chrome/Chromium browser in headless mode

The [`ampproject/amphtml`](https://github.com/ampproject/amphtml) repository on GitHub is linked to the [Percy project](https://percy.io/ampproject/amphtml) of the same name. You will see a check called `percy/amphtml` on your PR. If your PR results in visual diff(s), clicking on the `details` link will show you the snapshots with the diffs highlighted.

### Failing Tests

When a test run fails due to visual diffs being present, click the `details` link next to `percy/amphtml` in your PR and examine the results. By default, Percy highlights the changes between snapshots in red. Clicking on the new snapshot will show it in its raw form. If the diffs indicate a problem that is likely to be due to your PR, you can try running the visual diffs locally in order to debug (see section below). However, if you are sure that the problem is not due to your PR, you may click the green `Approve` button on Percy to approve the snapshots and unblock your PR from being merged.

### Flaky Tests

If a Percy test flakes and you would like to trigger a rerun, you can't do that from within Percy. Instead, from your PR on GitHub, click on the `details` link next to `CircleCI PR Check` and then click on `Visual Diff Tests` to load the CircleCI run for your PR. On the job page, click the `Rerun workflow from start` button to rerun just that job, which will generate a fresh visual diff build on Percy.

### How Are Tests Executed

Visual diff tests are defined in the [`visual-tests.jsonc`](../test/visual-diff/visual-tests.jsonc), see file for the configurations of each test. When running, the visual diff test runner does the following for each test case:

-   Navgates to the defined page using a headless Chrome browser
-   Waits for the page to finish loading, both by verifying idle network connections and lack of loader animations
-   If defined, waits until the appropriate CSS selectors appear/disappear from the page
-   If defined, waits an arbitrary amount of time (e.g., for components that have time-delayed mutations)
-   If defined, executes any custom interaction test code
-   Uploads a snapshot of the page's DOM (converted to an HTML string) to the Percy service

When all snapshots finish uploading, Percy will process the visual diffs and report back to GitHub as a pull request status. Percy renders the snapshots in their own browsers and take a screenshot. If the new screenshot differs from the previously approved screenshot you will get a visual highlighting of where that difference lies.

Percy DOES NOT by default run JavaScript, so the same DOM snapshot will be used in displaying mobile and desktop versions of the page. This means that if your page looks different between these two device types, it should be able to do that using CSS only.

### Adding and Modifying Visual Diff Tests

See [Adding and Modifying Visual Diff Tests](./writing-visual-diff-tests.md).

## Isolated Component Testing

To speed up development and testing of components, it is advised to use [Storybook](https://storybook.js.org/). This allows you to write "stories", which are renderable test scenarios.

Stories can show configuration controls for manual testing of component parameters. They also provide tools to audit accessibility, test layouts that change according to viewport size, among other features.

> 📖 Storybook documentation: [What's a Story?](https://storybook.js.org/docs/react/get-started/whats-a-story)

### Launching Storybook

You may launch the `preact` Storybook by running:

```sh
amp storybook
```

You may launch a specific environment by providing `--storybook_env`:

-   **`preact`**

    ```sh
    amp storybook --storybook_env=preact
    ```

-   **`react`**

    ```sh
    amp storybook --storybook_env=react
    ```

    > Launching the **`react`** environment requires component bundles. You should ensure that they're present in `extensions/**/dist` directories beforehand, by running `amp build --extensions=...` for all Bento components.

-   **`amp`**

    ```sh
    amp storybook --storybook_env=amp
    ```

    > Launching the **`amp`** environment also initiates the build-and-serve task that's normally launched using the [`amp` command](#testing-commands). This provides an additional server on `localhost:8000`.

### Writing test scenarios

Test scenarios (stories) are located inside a component's directory. Their filename suffix determines whether they run on the `amp` environment, or on the `preact` and `react` environments:

-   **`preact`** Stories end with `.js`:

    `extensions/amp-example/0.1/storybook/Basic.js`

-   **`react`** Stories use the same files as **`preact`**.

-   **`amp`** Stories end with `.amp.js`:

    `extensions/amp-example/0.1/storybook/Basic.amp.js`

Read more about [Writing Stories](https://storybook.js.org/docs/guides/guide-preact/#step-4-write-your-stories) in the official [Storybook documentation](https://storybook.js.org/docs/). Make sure to also follow our own [Style Recommendations](../build-system/tasks/storybook/README.md#style-recommendations)

## Testing on devices

### Testing with ngrok

It's much faster to debug with local build (`amp` + `http://localhost:8000/`). In Chrome you can use [DevTools port forwarding](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/local-server). However, iOS Safari does not give a similar option. Instead, you can use [ngrok](https://ngrok.com/). Just [download](https://ngrok.com/download) the ngrok binary for your platform and run it like this:

```sh
ngrok http 8000
```

Once started, the ngrok will print URLs for both `http` and `https`. E.g. `http://73774d8c.ngrok.io/` and `https://73774d8c.ngrok.io/`. These URLs can be used to debug on iOS and elsewhere.

### Testing with Firebase

For deploying and testing local AMP builds on [Firebase](https://firebase.google.com/), install firebase and initialize firebase within this directory\* (a `firebase` folder can be generated with the command, `amp firebase`).

```sh
npm install -g firebase-tools
firebase login
firebase init
amp firebase
firebase deploy
```

-   When initializing firebase within the directory via `firebase init`, make sure to select the following options when asked:

*   "Which Firebase CLI features do you want to setup for this folder?" select `Hosting: Configure and deploy Firebase Hosting sites`.
*   "What do you want to use as your public directory?" enter `firebase`.
*   "Select a default Firebase project for this directory:" select your project name if it's already created, otherwise choose `[don't setup a new project]` and add one later.
    -   Note: If you haven't already, you will have to create a project via the [Firebase Console](https://console.firebase.google.com) after you are done initializing and before you deploy. Once you create the project, you can make it active in your CLI with `firebase use your-project-name` or give it an alias by selecting your project after running `firebase use --add`.
*   "Configure as a single-page app (rewrite all urls to /index.html)?" select `n`.

`amp firebase` will generate a `firebase` folder and copy over all files from `dist`, `examples` and `test/manual`. It will rewrite all urls in the copied files to point to the local versions of AMP (i.e. the ones copied from `dist` to `firebase/dist`). When you initialize firebase, you should set the `firebase` `public` directory to `firebase`. This way `firebase deploy` will just directly copy and deploy the contents of the generated `firebase` folder. As an example, your `firebase.json` file can look something like this:

```json
{
  "hosting": {
    "public": "firebase",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

If you are only testing a single file, you can use `amp firebase --file=path/to/my/file.amp.html` to avoid copying over all of `test/manual` and `examples`. It will copy over the specified file to `firebase/index.html`, which simplifies debugging.

After deploying, you can access your project publicly at its hosting URL `https://your-project-name.firebaseapp.com`.

Additionally, you can create multiple projects and switch between them in the CLI using `firebase use your-project-name`.

#### Testing Ads

Testing ads in deployed demos requires allowlisting of 3p urls. You can do this by adding your intended deployment hostname as an environment variable `AMP_TESTING_HOST` and using the `fortesting` flag. For example:

```sh
export AMP_TESTING_HOST="my-project.firebaseapp.com"
amp firebase --fortesting
firebase deploy
```

This will write "my-project.firebaseapp.com" as a third party url to relevant attributes in `AMP_CONFIG`, which is prepended to `amp.js` and `integration.js` files in the firebase folder. If you're curious about how this is done, feel free to inspect `build-system/tasks/firebase.js`.

## End-to-End Tests

You can run and create E2E tests locally during development. Currently tests only run on Chrome, but support for additional browsers is underway. These tests have not been added to our CI build yet - but they will be added soon.

Run all tests with:

```sh
amp e2e
```

The task will kick off `amp build` and then `amp serve` before running the tests. To skip building the runtime, use `--nobuild`.

[Consult the E2E testing documentation](../build-system/tasks/e2e/README.md) to learn how to create your own end-to-end tests.

## Performance Testing Node Build Tools

You can create flamecharts for any node process used by the build system by leveraging `0x`.

Here's an example for `amp dist`:

```sh
npx 0x -o node_modules/.bin/amp dist
```

Important to note is `0x` will automatically create a flamechart and a serving folder locally within the repository, please don't add them to PRs!
