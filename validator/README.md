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

## Node.js based command line tool and API

Please see (https://github.com/ampproject/amphtml/blob/master/validator/nodejs/README.md).

## Web UI

Please see (https://github.com/ampproject/amphtml/blob/master/validator/webui/README.md).

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
$ node nodejs/index.js --validator_js dist/validator_minified.js testdata/feature_tests/several_errors.html
testdata/feature_tests/several_errors.html:23:2 The attribute 'charset' may not appear in tag 'meta name= and content='.
testdata/feature_tests/several_errors.html:26:2 The tag 'script' is disallowed except in specific forms.
testdata/feature_tests/several_errors.html:32:2 The mandatory attribute 'height' is missing in tag 'amp-img'. (see https://www.ampproject.org/docs/reference/amp-img.html)
testdata/feature_tests/several_errors.html:34:2 The attribute 'width' in tag 'amp-ad' is set to the invalid value '100%'. (see https://www.ampproject.org/docs/reference/amp-ad.html)
...
```
