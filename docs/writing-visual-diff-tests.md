# Adding and Modifying Visual Diff Tests

This document provides details for creating new visual diff tests. For other information about visual diff tests see [testing.md](./testing.md#visual-diff-tests).

## One-time Setup

First create a [free BrowserStack account](https://www.browserstack.com/), use it to log into [https://percy.io](https://percy.io), create a project, and set the `PERCY_TOKEN` environment variable using the unique value you find at `https://percy.io/<org>/<project>/integrations`:

```sh
export PERCY_TOKEN="<unique-percy-token>"
```

Once the environment variable is set up, you can run the AMP visual diff tests. You can also pass this token directly to `amp visual-diff --percy_token="<unique-percy-token>"`

## Writing the Test

### Create and register your test

-   Create an AMP document that will be tested under `examples/visual-tests`.
-   Add an entry in the [`test/visual-diff/visual-tests.jsonc`](../test/visual-diff/visual-tests.jsonc) JSON file. Documentation for the various settings are in that file.
    -   Must set fields: `url`, `name`
    -   You will also likely want to set `loading_complete_css` and maybe also `loading_incomplete_css`
    -   Only set `viewport` if your page looks different on mobile vs. desktop, and you intend to create a separate config for each
        -   The `viewport` setting wraps the entire DOM snapshot inside an `<iframe>` before uploading to Percy. Beware of weird iframe behaviors! 🐉
    -   Do not set `enable_percy_javascript` without consulting `@ampproject/wg-infra`
    -   Point `interactive_tests` to a JavaScript file if you would like to add interactions to the page. See examples of existing interactive tests to learn how to write those
-   (For past examples of pull requests that add visual diff tests, see [#17047](https://github.com/ampproject/amphtml/pull/17047), [#17110](https://github.com/ampproject/amphtml/pull/17110))

### Iterate on the test

Now, execute the test in development mode. Use `--grep` to filter down the list of available web pages. The value is a regular expression. e.g., `amp visual-diff --grep="amp-[a-f]"` will execute on tests that have an AMP component name between `<amp-a...>` through `<amp-f...>`.

```sh
amp visual-diff --dev --grep="<regular expression>"
```

Follow the development mode instructions and iterate on the test until you are satisfied.

### Validate the test

Finally, verify that your test displays as expected by executing it on Percy:

```sh
amp visual-diff --grep="<regular expression>"
```

-   When the test finishes executing it will print a URL to Percy where you can inspect the results. It should take about a minute to finish processing.
-   Inspect the build on Percy. If you are not happy with the results, fix your page or code, and repeat.
-   If all is well, approve it. This creates a new baseline on Percy, against which all following builds will be compared.

After approving your test, repeat the `amp visual-diff` command at least 5 more times. If any of the subsequent runs fails with a visual changes, this means that your test is flaky.

### Things to note

-   Flakiness is usually caused by bad `loading_complete_css` configurations. You can repeat `--dev` mode until you find the right mix of complete and incomplete CSS selectors.
-   To see debugging info during Percy runs, you can add `--chrome_debug`, `--webserver_debug`, or `--debug` for both.
