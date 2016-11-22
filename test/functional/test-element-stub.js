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

import {ElementStub, resetLoadingCheckForTests} from '../../src/element-stub';
import {createIframePromise} from '../../testing/iframe';
import '../../extensions/amp-ad/0.1/amp-ad';
import '../../extensions/amp-analytics/0.1/amp-analytics';

describe('test-element-stub', () => {

  let iframe;

  afterEach(() => {
    resetLoadingCheckForTests();
  });

  function getElementStubIframe(name) {
    return createIframePromise().then(f => {
      iframe = f;
      const testElement = iframe.doc.createElement(name);
      testElement.setAttribute('width', '300');
      testElement.setAttribute('height', '250');
      testElement.setAttribute('type', '_ping_');
      testElement.setAttribute('data-aax_size', '300*250');
      testElement.setAttribute('data-aax_pubname', 'abc123');
      testElement.setAttribute('data-aax_src', '302');
      const link = iframe.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', 'blah');
      iframe.doc.head.appendChild(link);
      iframe.doc.getElementById('parent').appendChild(testElement);
    });
  }

  it('insert script for amp-ad when script is not included', () => {
    return getElementStubIframe('amp-ad').then(() => {
      expect(iframe.doc.querySelectorAll('amp-ad')).to.have.length(1);
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
          .to.have.length(0);
      new ElementStub(iframe.doc.body.querySelector('#parent')
          .firstChild);
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
          .to.have.length(1);
    });
  });

  it('insert script for amp-embed when script is not included', () => {
    return getElementStubIframe('amp-embed').then(() => {
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
          .to.have.length(0);
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-embed"]'))
          .to.have.length(0);
      new ElementStub(iframe.doc.body.querySelector('#parent')
          .firstChild);
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-embed"]'))
          .to.have.length(0);
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
          .to.have.length(1);
    });
  });
});
