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

If you just want to validate a page, please see
[our documentation over at ampproject.org](https://www.ampproject.org/docs/guides/validate.html).

## Chrome Extension
Please see [chromeextension/README.md](https://github.com/ampproject/amphtml/blob/master/validator/chromeextension/README.md).

## Visual Studio Code Extension

An extension for Visual Studio Code
[VSCode marketplace](https://marketplace.visualstudio.com/items?itemName=amphtml.amphtml-validator)

## Command Line Tool and Node.js API

Please see [nodejs/README.md](https://github.com/ampproject/amphtml/blob/master/validator/nodejs/README.md).

## Web UI

Please see [webui/README.md](https://github.com/ampproject/amphtml/blob/master/validator/webui/README.md).

## Building a Custom Validator

This is only useful for development - e.g. when making changes to
`engine/validator.js` or when authoring an AMP extension, and it's rough around
the edges. Below are instructions for Linux Ubuntu 14.

## Installation

### Linux

Install these packages using apt-get:

* npm
* openjdk-7-jre
* protobuf-compiler
* python-protobuf
* python2.7

In addition, install Node.js v4.4.2. E.g.,
  [by downloading](https://nodejs.org/en/download/) or
  [by using a package manager](https://nodejs.org/en/download/package-manager/) or
  [by using NVM](https://github.com/creationix/nvm).

### OSX

Dependencies:

* npm
* python 2.7 (should already be installed on OSX)
* [homebrew](https://brew.sh/)
  * protobuf
    ```sh
    brew install protobuf
    mkdir -p /Users/$(whoami)/Library/Python/2.7/lib/python/site-packages
    echo 'import site; site.addsitedir("/usr/local/lib/python2.7/site-packages")' >> /Users/$(whoami)/Library/Python/2.7/lib/python/site-packages/homebrew.pth
    ```

  * openjdk-7-jre
    ```sh
    brew tap caskroom/cask
    brew install Caskroom/cask/java
    ```

### Usage

Then, run `python build.py`. This creates `dist/validator_minified.js`, which is
equivalent to the validator deployed at cdn.ampproject.org. You may now
use the `--validator_js` command line flag to
[amphtml-validator](https://www.ampproject.org/docs/guides/validate.html#command-line-tool) to use this validator.

For use for testing with extensions, you can simply run `python build.py`
to run all of the validator tests in the amphtml repo.
To create/update `validator-*.out` files that are used in the test,
run `python build.py --update_tests`.

```
$ amphtml-validator --validator_js dist/validator_minified.js testdata/feature_tests/several_errors.html
testdata/feature_tests/several_errors.html:23:2 The attribute 'charset' may not appear in tag 'meta name= and content='.
testdata/feature_tests/several_errors.html:26:2 The tag 'script' is disallowed except in specific forms.
testdata/feature_tests/several_errors.html:32:2 The mandatory attribute 'height' is missing in tag 'amp-img'. (see https://www.ampproject.org/docs/reference/amp-img.html)
testdata/feature_tests/several_errors.html:34:2 The attribute 'width' in tag 'amp-ad' is set to the invalid value '100%'. (see https://www.ampproject.org/docs/reference/amp-ad.html)
...
```

### Building on MacOS

*Note: This is for building the validator from source. If you are simply running validator tests for extensions, see the Installation steps instead.*

* Download protobuf with `brew install protobuf` via [homebrew](https://brew.sh/).
* Use pip to `pip install google` and `pip install protobuf`. If you don't have pip, you can get it either via `brew install python` or [get-pip.py](https://bootstrap.pypa.io/get-pip.py).
* If your [npm](https://www.npmjs.com/) is out of date, run `npm i -g npm` to update it.

To verify that you have the necessary prerequisites, run and verify:
```
$ protoc --version
libprotoc 3.5.1
```
and
```
$ python
>>> import google.protobuf
>>>
```
Now `cd amphtml/validator` and run `python build.py`.
