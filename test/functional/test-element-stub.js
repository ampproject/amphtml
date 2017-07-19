/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {createElementWithAttributes} from '../../src/dom';

describes.realWin('test-element-stub', {amp: true}, env => {

  let doc;

  beforeEach(() => {
    doc = env.win.document;
  });

  function insertElement(name) {
    const testElement = createElementWithAttributes(doc, name, {
      width: '300',
      height: '250',
      type: '_ping_',
      'data-aax_size': '300*250',
      'data-aax_pubname': 'abc123',
      'data-aax_src': '302',
    });
    doc.body.appendChild(testElement);
  }

  it('insert script for amp-ad when script is not included', () => {
    insertElement('amp-ad');
    expect(doc.head.querySelectorAll('[custom-element="amp-ad"]'))
        .to.have.length(1);
  });

  it('insert script for amp-embed when script is not included', () => {
    insertElement('amp-embed');
    expect(doc.head.querySelectorAll('[custom-element="amp-embed"]'))
        .to.have.length(0);
    expect(doc.head.querySelectorAll('[custom-element="amp-ad"]'))
        .to.have.length(1);
  });

  it('insert script for amp-video when script is not included', () => {
    insertElement('amp-video');
    expect(doc.head.querySelectorAll('[custom-element="amp-video"]'))
        .to.have.length(1);
  });
});
