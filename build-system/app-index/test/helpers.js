/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const assert = require('assert');
const {JSDOM} = require('jsdom');


const parseHtmlChunk = htmlStr =>
  (new JSDOM(htmlStr)).window.document.body.firstElementChild;


// JSDom doesn't parse attributes whose names don't follow the spec, so
// our only way to test [attr] values is via regex.
const getBoundAttr = (el, attr) => {
  const match = el./*OK*/outerHTML.match(
    new RegExp(`\\[${attr}\\]="?([^\\s"\\>]+)`), 'g');
  if (match) {
    return match[1];
  }
}


const assertValidAmphtml = (validator, string) => {
  const {errors, status} = validator.validateString(string);
  // Assert errors before so they're output.
  assert.deepStrictEqual(errors, []);
  assert.strictEqual(status, 'PASS');
};


module.exports = {assertValidAmphtml, parseHtmlChunk, getBoundAttr};
