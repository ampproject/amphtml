# amphtml-validator Node.js package (Beta!)

## Using the command-line tool (Beta!)

To install this as a command line tool, type `npm install -g amphtml-validator`.

Now let's validate a real AMP HTML page.
```
$ amphtml-validator https://www.ampproject.org/
https://www.ampproject.org/: PASS
```

How about an empty file? Turns out an empty file is not valid AMP.
```
$ echo > empty.html
$ amphtml-validator empty.html
empty.html:1:0 The mandatory tag 'html doctype' is missing or incorrect.
empty.html:1:0 The mandatory tag 'html ⚡ for top-level html' is missing or incorrect. (see https://www.ampproject.org/docs/reference/spec.html#required-markup)
empty.html:1:0 The mandatory tag 'head' is missing or incorrect. (see https://www.ampproject.org/docs/reference/spec.html#required-markup)
...
```

OK, let's try a better starting point. Let's verify that this document is
valid AMP.
```
$ amphtml-validator https://raw.githubusercontent.com/ampproject/amphtml/master/validator/testdata/feature_tests/minimum_valid_amp.html
https://raw.githubusercontent.com/ampproject/amphtml/master/validator/testdata/feature_tests/minimum_valid_amp.html: PASS
```

Great, we download it and edit it. You may use `vim` if you don't like Emacs.
```
$ wget --output-document=hello-amp.html https://raw.githubusercontent.com/ampproject/amphtml/master/validator/testdata/feature_tests/minimum_valid_amp.html
$ amphtml-validator hello-amp.html
hello-amp.html: PASS
$ emacs hello-amp.html
```

## Using the Node.js API (Beta!)

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
