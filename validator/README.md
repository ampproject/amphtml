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

# AMP HTML ⚡ Validator

A validator for the
[AMP HTML format](https://github.com/ampproject/amphtml/blob/master/README.md).

If you just want to validate a page that you're looking at in your web browser,
add `#development=1` to your URL and look for the validation messages in the
Javascript console. See also
[our documentation over at ampproject.org](https://www.ampproject.org/docs/guides/validate.html).

For the additional choices listed below, install Node.js version 4.X on your
system (tested with v4.4.2). E.g.,
[by downloading](https://nodejs.org/en/download/) or
[by using a package manager](https://nodejs.org/en/download/package-manager/) or
[by using NVM](https://github.com/creationix/nvm).

## Using the command-line tool (Beta!)

* Type `./index.js` in this directory to get started:

```
$ ./index.js testdata/feature_tests/minimum_valid_amp.html
testdata/feature_tests/minimum_valid_amp.html: PASS

$ ./index.js testdata/feature_tests/several_errors.html
testdata/feature_tests/several_errors.html:23:2 The attribute 'charset' may not appear in tag 'meta name= and content='.
testdata/feature_tests/several_errors.html:26:2 The tag 'script' is disallowed except in specific forms.
testdata/feature_tests/several_errors.html:32:2 The mandatory attribute 'height' is missing in tag 'amp-img'. (see https://www.ampproject.org/docs/reference/amp-img.html)
testdata/feature_tests/several_errors.html:34:2 The attribute 'width' in tag 'amp-ad' is set to the invalid value '100%'. (see https://www.ampproject.org/docs/reference/amp-ad.html)
...
```

If you wish to install the Validator as a system command,
install the NPM package manager (e.g. using apt-get in Ubuntu Linux) and
run `npm install -g` in this directory. After that, you may type
`amp-validator` in any directory to invoke the validator.

## Using the web UI (Beta!)

This is a simple web editor which validates AMP HTML documents on the fly.
This feature is new and experimental, feedback is especially welcome.

* Type `./index.js webui` in this directory.
* Point your web browser to http://127.0.0.1:8765/

## Using the NodeJS API (Beta!)

This API is new and still experimental, feedback is especially welcome. We may
try to port to earlier versions of NodeJS if sufficient interest exists.

```js
'use strict';

const ampValidator = require('amp-validator');
ampValidator.getInstance((instance) => {
  const result = instance.validateString('<html>Hello, world</html>');
  ((result.status === 'PASS') ? console.log : console.error)(result.status);
  for (const error of result.errors) {
    let msg = 'line ' + error.line + ', col ' + error.col + ': ' +
        error.message;
    if (error.specUrl !== null) {
      msg += ' (see ' + error.specUrl + ')';
    }
    ((error.severity === 'ERROR') ? console.error : console.warn)(msg);
  }
});
```

## Building a Custom Validator

This is only useful for development - e.g. when making changes to validator.js,
and it's rough aroung the edges. Below are instructions for Linux Ubuntu 14.

Install these packages using apt-get:

* npm
* openjdk-7-jre
* protobuf-compiler
* python-protobuf
* python2.7

In addition, install Node.js version 4.X on your system (tested with v4.4.2). E.g.,
  [by downloading](https://nodejs.org/en/download/) or
  [by using a package manager](https://nodejs.org/en/download/package-manager/) or
  [by using NVM](https://github.com/creationix/nvm).

Then, run `build.py`. This creates `dist/validator_minified.js`, which is
equivalent to the validator deployed at cdn.ampproject.org. You may now
use the `--validator_js` command line flag to `index.js` to use this validator.

```
$ node index.js --validator_js dist/validator_minified.js testdata/feature_tests/several_errors.html
testdata/feature_tests/several_errors.html:23:2 The attribute 'charset' may not appear in tag 'meta name= and content='.
testdata/feature_tests/several_errors.html:26:2 The tag 'script' is disallowed except in specific forms.
testdata/feature_tests/several_errors.html:32:2 The mandatory attribute 'height' is missing in tag 'amp-img'. (see https://www.ampproject.org/docs/reference/amp-img.html)
testdata/feature_tests/several_errors.html:34:2 The attribute 'width' in tag 'amp-ad' is set to the invalid value '100%'. (see https://www.ampproject.org/docs/reference/amp-ad.html)
...
```
