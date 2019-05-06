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

const argv = require('minimist')(process.argv.slice(2));
const colors = require('ansi-colors');
const fs = require('fs-extra');
const log = require('fancy-log');

const year = new Date().getFullYear();

/*eslint "max-len": 0*/

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
  extension_spec: {
    name: "${name}"
    version: "0.1"
    version: "latest"
  }
  attr_lists: "common-extension-attrs"
}
tags: {  # <${name}>
  html_format: AMP
  tag_name: "${name.toUpperCase()}"
  requires_extension: "${name}"
  attr_lists: "extended-amp-global"
  spec_url: "https://amp.dev/documentation/components/${name}"
  amp_layout: {
    supported_layouts: RESPONSIVE
  }
}
`;
}

function getMarkdownExtensionFile(name) {
  return `<!--
  1. Change "category" below to one of:
       ads-analytics
       dynamic-content
       layout
       media
       presentation
       social

  2. Remove any of the "formats" that don't apply.
     You can also add the "ads" and "stories" formats if they apply.

  3. And remove this comment! (no empty lines before "---")
-->
---
$category: presentation
formats:
  - websites
  - email
teaser:
  text: FILL THIS IN.
---
<!--
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

# \`${name}\`

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
    <td><code>&lt;script async custom-element="${name}" src="https://cdn.ampproject.org/v0/${name}-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
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

<table>
  <tr>
    <td width="40%"><strong>data-my-attribute</strong></td>
    <td>FILL THIS IN. This table <strong>must</strong> be written in HTML.</td>
  </tr>
</table>

## Validation
See [${name} rules](https://github.com/ampproject/amphtml/blob/master/extensions/${name}/validator-${name}.protoascii) in the AMP validator specification.
`;
}

function getJsTestExtensionFile(name) {
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

import '../${name}';

describes.realWin('${name}', {
  amp: {
    extensions: ['${name}'],
  },
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

    /** @private {?Element} */
    this.container_ = null;
  }

  /** @override */
  buildCallback() {
    this.container_ = this.element.ownerDocument.createElement('div');
    this.container_.textContent = this.myText_;
    this.element.appendChild(this.container_);
    this.applyFillContent(this.container_, /* replacedContent */ true);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }
}

AMP.extension('${name}', '0.1', AMP => {
  AMP.registerElement('${name}', ${className});
});
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

async function makeExtension() {
  if (!argv.name) {
    log(colors.red(
        'Error! Please pass in the "--name" flag with a value'));
  }
  const {name} = argv;
  const examplesFile = getExamplesFile(name);

  fs.mkdirpSync(`extensions/${name}/0.1/test`);
  fs.writeFileSync(`extensions/${name}/${name}.md`,
      getMarkdownExtensionFile(name));
  fs.writeFileSync(`extensions/${name}/validator-${name}.protoascii`,
      getValidatorFile(name));
  fs.writeFileSync(`extensions/${name}/0.1/${name}.js`,
      getJsExtensionFile(name));
  fs.writeFileSync(`extensions/${name}/0.1/test/test-${name}.js`,
      getJsTestExtensionFile(name));
  fs.writeFileSync(`extensions/${name}/0.1/test/validator-${name}.html`,
      examplesFile);

  const examplesFileValidatorOut = examplesFile.trim().split('\n')
      .map(line => `|  ${line}`)
      .join('\n');

  fs.writeFileSync(`extensions/${name}/0.1/test/validator-${name}.out`,
      ['PASS', examplesFileValidatorOut].join('\n'));

  fs.writeFileSync(`examples/${name}.amp.html`,
      examplesFile);
}

module.exports = {
  makeExtension,
};

makeExtension.description = 'Create an extension skeleton';
makeExtension.flags = {
  name: '  The name of the extension. Preferable prefixed with `amp-*`',
};
