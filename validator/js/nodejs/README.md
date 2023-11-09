# amphtml-validator Node.js Package

This package is published and available at
https://www.npmjs.com/package/amphtml-validator.

The source code is available at
https://github.com/ampproject/amphtml/tree/main/validator/js/nodejs.

## Command Line Tool

The `amphtml-validator` command line tool is documented here:
https://amp.dev/documentation/guides-and-tutorials/learn/validation-workflow/validate_amp#command-line-tool

## Node.js API

This API is new - feedback is especially welcome.

To install, use `npm install amphtml-validator` in your project directory,
or add `amphtml-validator` as a dependency to your package.json.

You may save the following example into a file, e.g., `demo.js`.

```js
'use strict';
var amphtmlValidator = require('amphtml-validator');

amphtmlValidator.getInstance().then(function (validator) {
  var result = validator.validateString('<html>Hello, world.</html>');
  (result.status === 'PASS' ? console.log : console.error)(result.status);
  for (var ii = 0; ii < result.errors.length; ii++) {
    var error = result.errors[ii];
    var msg =
      'line ' + error.line + ', col ' + error.col + ': ' + error.message;
    if (error.specUrl !== null) {
      msg += ' (see ' + error.specUrl + ')';
    }
    (error.severity === 'ERROR' ? console.error : console.warn)(msg);
  }
});
```

Now try running it:

```sh
$ node demo.js
FAIL
line 1, col 0: The mandatory attribute '⚡' is missing in tag 'html ⚡ for top-level html'. (see https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#required-markup)
line 1, col 0: The parent tag of tag 'html ⚡ for top-level html' is '$root', but it can only be '!doctype'. (see https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml.html#required-markup)
...
```

As expected, this emits errors because the provided string in the example, `<html>Hello, world.</html>` is not a valid AMP HTML document.

The method `validateString` also takes a `htmlFormat` parameter which
would allow applying the validator rules for `AMP4ADS` or `AMP4EMAIL` as well. `validateString(inputString, htmlFormat).

```js
/**
 * Validates the provided inputString; the htmlFormat can be 'AMP' or
 * 'AMP4ADS'; it defaults to 'AMP' if not specified.
 * @param {string} inputString
 * @param {string=} htmlFormat
 * @return {!ValidationResult}
 * @export
 */
```

## Release Notes

### 1.0.35

-   Set default engine to the WebAssembly version validator, which is
    `https://cdn.ampproject.org/v0/validator_wasm.js`.
    [ampproject/amphtml #34213](https://github.com/ampproject/amphtml/pull/34213)

### 1.0.34

-   Updated `colors` dependency version (ampproject/amphtml #31656).

### 1.0.33

-   Update repository location.

### 1.0.32

-   Removal of AMP Actions format as it is deprecated.

### 1.0.31

-   Fix Node API on Node > 12

### 1.0.30

-   Remove engine section from package.json to allow any version of nodejs.

### 1.0.29

-   Reintroduce node v8 support. Supports node v8, v10, v12 and v14.

### 1.0.28

-   Reintroduce node v10 support and introduce node v14 support.

### 1.0.27

-   Removed references to amp.validator.categorizeError.

### 1.0.26

-   Introduce node v12 support and remove node v10 support.

### 1.0.25

-   Broken release, removed.

### 1.0.24

-   Introduce node v10 support and remove node 8 support.

### 1.0.23

-   The amphtml-validator binary now requires the Node.js binary to be called node.
    On systems where the Node.js binary is called nodejs, consider installing
    the nodejs-legacy Debian package or better yet, NVM.

### 1.0.22

-   --html_format=AMP4EMAIL added.

### 1.0.21

-   --html_format=AMP4ADS is no longer experimental.

### 1.0.20

-   Better npm post-install for virtual machines, running debian over windows with SMB shared folder.

### 1.0.19

-   Set correct process exit status for old versions of Node.js (v0.10.25).

### 1.0.18

-   Small tweaks to this file and package.json.

### 1.0.17

-   If the amphtml-validator command is already patched up for Windows, leave it
    alone instead of failing. Relevant if the package has been installed globally
    and now we're performing a local install on top of it.

### 1.0.16

-   `npm install amphtml-validator` (local install) should now work on Windows,
    for `require('amphtml-validator')`.

### 1.0.15

-   Added support for installing on Windows.
    `npm install -g amphtml-validator` should now just work.

### 1.0.13

-   Added newInstance method, a simple API that's not async.

### 1.0.12

-   Added support for --user-agent option.

### 1.0.11

-   Added support for AMP4ADS (via --html_format command line flag) and
    argument for validateString function in the API.

### 1.0.10

-   Fixed [#4246: amphtml-validator CLI fails on Mac OS X](https://github.com/ampproject/amphtml/issues/4246).
