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

const {expect} = require('chai');
const {JSDOM} = require('jsdom');


const parseHtmlChunk = htmlStr => {
  const {body} = (new JSDOM(htmlStr)).window.document;
  expect(body.children).to.have.length(1);
  return body.firstElementChild;
};


const boundAttrRe = attr =>
  new RegExp(`\\[${attr}\\]=(("[^"]+")|('[^']+')|([^\\s\\>]+))`);


// JSDom doesn't parse attributes whose names don't follow the spec, so
// our only way to test [attr] values is via regex.
const getBoundAttr = ({outerHTML}, attr) => {
  const match = outerHTML.match(boundAttrRe(attr));
  if (!match) {
    return;
  }
  const [_, valuePart] = match;
  if (valuePart.charAt(0) == '"' ||
      valuePart.charAt(0) == '\'') {
    return valuePart.substring(1, valuePart.length - 1);
  }
  return valuePart;
}


const expectValidAmphtml = (validator, string) => {
  const {errors: errorsAndWarnings, status} = validator.validateString(string);
  const errors = errorsAndWarnings.filter(({severity}) => severity == 'ERROR');

  // Compare with empty array instead of checking `to.be.empty` so
  // validation errors are output as AssertionErrors.
  expect(errors).to.deep.equal([]);
  expect(status).to.equal('PASS');
};


module.exports = {
  expectValidAmphtml,
  getBoundAttr,
  parseHtmlChunk,
};
