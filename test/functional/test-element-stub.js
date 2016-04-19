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

import {ElementStub, resetAdScriptInsertedOrPresentForTesting,
    calculateAdScriptUrl} from '../../src/element-stub';
import {createIframePromise} from '../../testing/iframe';
import {setModeForTesting, getMode} from '../../src/mode';


describe('test-element-stub', () => {

  let iframe;

  function getElementStubIframe(name) {
    return createIframePromise().then(f => {
      iframe = f;
      testElement = iframe.doc.createElement(name);
      testElement.setAttribute('width', '300');
      testElement.setAttribute('height', '250');
      testElement.setAttribute('type', 'a9');
      testElement.setAttribute('data-aax_size', '300*250');
      testElement.setAttribute('data-aax_pubname', 'abc123');
      testElement.setAttribute('data-aax_src', '302');
      const link = iframe.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', 'blah');
      iframe.doc.head.appendChild(link);
      return iframe.addElement(testElement);
    });
  }

  it('insert script', () => {
    return getElementStubIframe('amp-ad').then(() => {
      resetAdScriptInsertedOrPresentForTesting();
      expect(iframe.doc.querySelectorAll('amp-ad')).to.have.length(1);
      expect(iframe.doc.head.querySelector('[custom-element="amp-ad"]'))
          .to.be.null;
      elementStub = new ElementStub(iframe.doc.body.querySelector('#parent')
          .firstChild);
      expect(iframe.doc.head.querySelector('[custom-element="amp-ad"]'))
          .not.to.be.null;
    });
  });

  it('only insert script once', () => {
    return getElementStubIframe('amp-ad').then(() => {
      resetAdScriptInsertedOrPresentForTesting();
      expect(iframe.doc.querySelectorAll('amp-ad')).to.have.length(1);
      expect(iframe.doc.head.querySelector('[custom-element="amp-ad"]'))
          .to.be.null;
      elementStub = new ElementStub(iframe.doc.body.querySelector('#parent')
          .firstChild);
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
          .to.have.length(1);
      elementStub = new ElementStub(iframe.doc.body.querySelector('#parent')
          .firstChild);
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
          .to.have.length(1);
    });
  });

  it('insert script for amp-embed', () => {
    return getElementStubIframe('amp-embed').then(() => {
      resetAdScriptInsertedOrPresentForTesting();
      expect(iframe.doc.querySelectorAll('amp-embed')).to.have.length(1);
      expect(iframe.doc.head.querySelector('[custom-element="amp-ad"]'))
          .to.be.null;
      expect(iframe.doc.head.querySelector('[custom-element="amp-embed"]'))
          .to.be.null;
      elementStub = new ElementStub(iframe.doc.body.querySelector('#parent')
          .firstChild);
      expect(iframe.doc.head.querySelector('[custom-element="amp-embed"]'))
          .to.be.null;
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
          .to.have.length(1);
    });
  });

  it('should not insert when script exists in head', () => {
    return getElementStubIframe('amp-ad').then(() => {
      resetAdScriptInsertedOrPresentForTesting();
      const ampAdScript = iframe.doc.createElement('script');
      ampAdScript.setAttribute('custom-element', 'amp-ad');
      scriptSrc = 'http://localhost:8000/dist/v0/amp-ad-0.1.max.js';
      expect(iframe.doc.head.querySelector('[custom-element="amp-ad"]'))
          .to.be.null;
      iframe.doc.head.appendChild(ampAdScript);
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
          .to.have.length(1);
      elementStub = new ElementStub(iframe.doc.body.querySelector('#parent')
          .firstChild);
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
          .to.have.length(1);
    });
  });

  it('script should get correct attributes', () => {
    return getElementStubIframe('amp-ad').then(() => {
      resetAdScriptInsertedOrPresentForTesting();
      expect(iframe.doc.head.querySelector('[custom-element="amp-ad"]'))
          .to.be.null;
      elementStub = new ElementStub(iframe.doc.body.querySelector('#parent')
          .firstChild);
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
          .to.have.length(1);
      const script = iframe.doc.head.querySelector(
          '[custom-element="amp-ad"]');
      expect(script.getAttribute('data-script')).to.equal('amp-ad');
      expect(script.getAttribute('async')).to.equal('');
    });
  });

  describe('get correct script source', () => {
    it('with local mode normal pathname', () => {
      resetAdScriptInsertedOrPresentForTesting();
      setModeForTesting({localDev: true});
      expect(getMode().localDev).to.be.true;
      const script = calculateAdScriptUrl('examples.build/ads.amp.html');
      expect(script).to.equal('https://cdn.ampproject.org/v0/amp-ad-0.1.js');
    });

    it('with local mode min pathname', () => {
      resetAdScriptInsertedOrPresentForTesting();
      setModeForTesting({localDev: true});
      expect(getMode().localDev).to.be.true;
      const script = calculateAdScriptUrl('examples.build/ads.amp.min.html');
      expect(script).to.equal('http://localhost:8000/dist/v0/amp-ad-0.1.js');
    });

    it('with local mode max pathname', () => {
      resetAdScriptInsertedOrPresentForTesting();
      setModeForTesting({localDev: true});
      expect(getMode().localDev).to.be.true;
      const script = calculateAdScriptUrl('examples.build/ads.amp.max.html');
      expect(script).to.equal(
          'http://localhost:8000/dist/v0/amp-ad-0.1.max.js');
    });

    it('with remote mode', () => {
      resetAdScriptInsertedOrPresentForTesting();
      setModeForTesting({localDev: false, version: 123});
      expect(getMode().localDev).to.be.false;
      expect(getMode().version).to.equal(123);
      const script = calculateAdScriptUrl('');
      expect(script).to.equal(
          'https://cdn.ampproject.org/rtv/123/v0/amp-ad-0.1.js');
    });
  });
});
