/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs-extra');
var gulp = require('gulp-help')(require('gulp'));
var util = require('gulp-util');


const year = new Date().getFullYear();

function pascalCase(str) {
  return str[0].toUpperCase() + str.slice(1).replace(/-([a-z])/g,
      function(g) { return g[1].toUpperCase(); });
}

function getValidatorFile(name) {
  return `#
# Copyright ${year} The AMP HTML Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the license.
#

tags: {  # ${name}
  html_format: AMP
  tag_name: "SCRIPT"
  spec_name: "${name} extension .js script"
  satisfies: "${name} extension .js script"
  requires: "${name}"
  mandatory_parent: "HEAD"
  unique: true
  extension_unused_unless_tag_present: "${name}"
  attrs: {
    name: "async"
    mandatory: true
    value: ""
  }
  attrs: {
    name: "custom-element"
    mandatory: true
    value: "${name}"
    dispatch_key: true
  }
  attrs: { name: "nonce" }
  attrs: {
    name: "src"
    mandatory: true
    value_regex: "https://cdn\\.ampproject\\.org/v0/${name}-(latest|0\\.1).js"
  }
  attrs: {
    name: "type"
    value: "text/javascript"
  }
  cdata: {
    blacklisted_cdata_regex: {
      regex: "."
      error_message: "contents"
    }
  }
  spec_url: "https://www.ampproject.org/docs/reference/components/${name}"
}
tags: {  # <${name}>
  html_format: AMP
  tag_name: "${name.toUpperCase()}"
  satisfies: "${name}"
  requires: "${name} extension .js script"
  attr_lists: "extended-amp-global"
  spec_url: "https://www.ampproject.org/docs/reference/components/amp-hello-world"
  amp_layout: {
    supported_layouts: RESPONSIVE
  }
}
`;
}

function getMarkdownExtensionFile(name) {
return `<!--
Copyright ${year} The AMP HTML Authors. All Rights Reserved.

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

# <a name="\`${name}\`"></a> \`${name}\`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>FILL THIS IN</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>FILL THIS IN</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/${name}-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>FILL THIS IN</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>FILL THIS IN</td>
  </tr>
</table>

## Behavior

FILL THIS IN. What does this extension do?

## Attributes

FILL THIS IN. Does this extension allow for properties to configure?

## Validation
See [${name} rules](https://github.com/ampproject/amphtml/blob/master/extensions/${name}/validator-${name}.protoascii) in the AMP validator specification.
`;
}

function getJsTestExtensionFile(name) {
  const className = pascalCase(name);
  return `/**
 * Copyright ${year} The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {${className}} from '../${name}';

describes.realWin('${name}', {
  amp: {
    extensions: ['${name}'],
  }
}, env => {

  let win;
  let element;

  beforeEach(() => {
    win = env.win;
    element = win.document.createElement('${name}');
    win.document.body.appendChild(element);
  });

  it('should have hello world when built', () => {
    element.build();
    expect(element.querySelector('div').textContent).to.equal('hello world');
  });
});
`;
}

function getJsExtensionFile(name) {
  const className = pascalCase(name);
  return `/**
 * Copyright ${year} The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Layout} from '../../../src/layout';

export class ${className} extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.myText_ = 'hello world';

    /** @private {!Element} */
    this.container_ = this.win.document.createElement('div');
  }

  /** @override */
  buildCallback() {
    this.container_.textContent = this.myText_;
    this.element.appendChild(this.container_);
    this.applyFillContent(this.container_, /* replacedContent */ true);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }
}

AMP.registerElement('${name}', ${className});
`;
}

function getExamplesFile(name) {
return `<!doctype html>
<html ⚡>
<head>
  <meta charset="utf-8">
  <title>${name} example</title>
  <link rel="canonical" href="amps.html">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <style amp-custom>
    ${name} {
      color: red;
    }
  </style>
  <script async custom-element="${name}" src="https://cdn.ampproject.org/v0/${name}-0.1.js"></script>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
</head>
<body>
  <${name} layout="responsive" width="150" height="80"></${name}>
</body>
</html>
`;
}

function makeExtension() {
  if (!argv.name) {
    util.log(util.colors.red(
        'Error! Please pass in the "--name" flag with a value'));
  }
  const name = argv.name;

  fs.mkdirpSync(`extensions/${name}/0.1/test`);
  fs.writeFileSync(`extensions/${name}/${name}.md`,
      getMarkdownExtensionFile(name));
  fs.writeFileSync(`extensions/${name}/validator-${name}.protoascii`,
      getValidatorFile(name));
  fs.writeFileSync(`extensions/${name}/0.1/${name}.js`,
      getJsExtensionFile(name));
  fs.writeFileSync(`extensions/${name}/0.1/test/test-${name}.js`,
      getJsTestExtensionFile(name));
  fs.writeFileSync(`examples/${name}.amp.html`,
      getExamplesFile(name));
  fs.writeFileSync(`validator/testdata/feature_tests/${name}.html`,
      getExamplesFile(name));
  fs.writeFileSync(`validator/testdata/feature_tests/${name}.out`, 'PASS');
}

gulp.task('make-extension', 'Create an extension skeleton', makeExtension, {
  options: {
    name: '  The name of the extension. Preferable prefixed with `amp-*`',
  }
});
