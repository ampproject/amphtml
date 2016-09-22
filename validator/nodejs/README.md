# amphtml-validator Node.js Package

This package is published and available at
https://www.npmjs.com/package/amphtml-validator.

## Command Line Tool

The `amphtml-validator` command line tool is documented here:
https://www.ampproject.org/docs/guides/validate.html#command-line-tool

## Node.js API (Beta!)

This API is new and still experimental, feedback is especially welcome.

To install, use `npm install amphtml-validator` in your project directory,
or add `amphtml-validator` as a dependency to your package.json.

You may save the following example into a file, e.g., `demo.js`.
```js
'use strict';
var amphtmlValidator = require('amphtml-validator');

amphtmlValidator.getInstance().then(function (validator) {
  var result = validator.validateString('<html>Hello, world.</html>');
  ((result.status === 'PASS') ? console.log : console.error)(result.status);
  for (var ii = 0; ii < result.errors.length; ii++) {
    var error = result.errors[ii];
    var msg = 'line ' + error.line + ', col ' + error.col + ': ' + error.message;
    if (error.specUrl !== null) {
      msg += ' (see ' + error.specUrl + ')';
    }
    ((error.severity === 'ERROR') ? console.error : console.warn)(msg);
  }
});
```

Now try running it:
```
$ node demo.js
FAIL
line 1, col 0: The mandatory attribute '⚡' is missing in tag 'html ⚡ for top-level html'. (see https://www.ampproject.org/docs/reference/spec.html#required-markup)
line 1, col 0: The parent tag of tag 'html ⚡ for top-level html' is '$root', but it can only be '!doctype'. (see https://www.ampproject.org/docs/reference/spec.html#required-markup)
...
```
As expected, this emits errors because the provided string in the example, `<html>Hello, world.</html>` is not a valid AMP HTML document.

## Release Notes
### 1.0.10
* Fixed [#4246: amphtml-validator CLI fails on Mac OS X](https://github.com/ampproject/amphtml/issues/4246).
### 1.0.11
* Added support for AMP4ADS (via --html_format command line flag) and
  argument for validateString function in the API.
