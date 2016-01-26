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

This is a very first release, rough on the edges. Fasten your seatbelts.

Prerequisite: Linux Ubuntu 14 or similar, or Mac OS X 10.11.x or later

###Mac OS X

See [Building a command-line AMP Validator: Mac OS X](https://github.com/ampproject/amphtml/blob/master/validator/docs/building_a_command_line_amp_validator_for_mac_os_x.md).

###Linux

Install these packages using apt-get:
* npm
* nodejs
* openjdk-7-jre
* protobuf-compiler
* python-protobuf
* python2.7

Then, run `build.py`. It creates `dist/validate`, a script which
can print AMP HTML validation errors to the console.

```
$ dist/validate
usage: validate <file.html>
$ dist/validate testdata/minimum_valid_amp.html
PASS
$ touch empty.html
$ dist/validate empty.html
FAIL
empty.html:1:0 MANDATORY_TAG_MISSING html ⚡ for top-level html (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#ampd)
empty.html:1:0 MANDATORY_TAG_MISSING head (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#crps)
empty.html:1:0 MANDATORY_TAG_MISSING charset utf-8 declaration (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#chrs)
empty.html:1:0 MANDATORY_TAG_MISSING viewport declaration (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#vprt)
empty.html:1:0 MANDATORY_TAG_MISSING mandatory style (js enabled) opacity 0 (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#opacity)
empty.html:1:0 MANDATORY_TAG_MISSING mandatory style (noscript) opacity 1 (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#opacity)
empty.html:1:0 MANDATORY_TAG_MISSING noscript enclosure for mandatory style (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#opacity)
empty.html:1:0 MANDATORY_TAG_MISSING body (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#crps)
empty.html:1:0 MANDATORY_TAG_MISSING amphtml engine v0.js script (see https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#scrpt)
```
