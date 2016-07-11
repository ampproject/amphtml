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

import {
    createIframePromise,
    doNotLoadExternalResourcesInTest,
} from '../../testing/iframe';
import {setModeForTesting, getMode} from '../../src/mode';
import {resetExtensionScriptInsertedOrPresentForTesting,
    calculateExtensionScriptUrl, insertAmpExtensionScript,}
    from '../../src/insert-extension';
import '../../extensions/amp-ad/0.1/amp-ad';
import '../../extensions/amp-analytics/0.1/amp-analytics';


describe('test-insert-extension', () => {

  let iframe;

  afterEach(() => {
    resetExtensionScriptInsertedOrPresentForTesting();
  });

  function getAdIframe(name) {
    return createIframePromise().then(f => {
      doNotLoadExternalResourcesInTest(f.win);
      iframe = f;
      const testElement = iframe.doc.createElement(name);
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

  function getAnalyticsIframe() {
    return createIframePromise().then(f => {
      iframe = f;
      const testElement = iframe.doc.createElement('amp-analytics');
      return iframe.addElement(testElement);
    });
  }

  it('insert extension script correctly', () => {
    return getAnalyticsIframe().then(() => {
      expect(iframe.doc.head.querySelectorAll(
          '[custom-element="amp-analytics"]')).to.have.length(0);
      insertAmpExtensionScript(iframe.win, 'amp-analytics');
      expect(iframe.doc.head.querySelectorAll(
          '[custom-element="amp-analytics"]')).to.have.length(1);
    });
  });

  it('only insert script once', () => {
    return getAdIframe('amp-ad').then(() => {
      expect(iframe.doc.querySelectorAll('amp-ad')).to.have.length(1);
      expect(iframe.doc.head.querySelectorAll(
          '[custom-element="amp-ad"]')).to.have.length(0);
      insertAmpExtensionScript(iframe.win, 'amp-ad');
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
          .to.have.length(1);
      insertAmpExtensionScript(iframe.win, 'amp-ad');
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
          .to.have.length(1);
    });
  });

  it('should not insert when script exists in head', () => {
    return getAnalyticsIframe().then(() => {
      const ampTestScript = iframe.doc.createElement('script');
      ampTestScript.setAttribute('custom-element', 'amp-analytics');
      expect(iframe.doc.head.querySelectorAll(
          '[custom-element="amp-analytics"]')).to.have.length(0);
      iframe.doc.head.appendChild(ampTestScript);
      expect(iframe.doc.head.querySelectorAll(
          '[custom-element="amp-analytics"]')).to.have.length(1);
      insertAmpExtensionScript(iframe.win, 'amp-analytics');
      expect(iframe.doc.head.querySelectorAll(
          '[custom-element="amp-analytics"]')).to.have.length(1);
    });
  });

  describe('special case for amp-embed', () => {
    it('insert script for amp-embed element asking amp-embed script', () => {
      return getAdIframe('amp-embed').then(() => {
        expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
            .to.have.length(0);
        expect(iframe.doc.head.querySelectorAll('[custom-element="amp-embed"]'))
            .to.have.length(0);
        insertAmpExtensionScript(iframe.win, 'amp-embed');
        expect(iframe.doc.head.querySelectorAll('[custom-element="amp-embed"]'))
            .to.have.length(0);
        expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
            .to.have.length(1);
      });
    });

    it('insert script for amp-embed element asking amp-ad script', () => {
      return getAdIframe('amp-embed').then(() => {
        expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
            .to.have.length(0);
        expect(iframe.doc.head.querySelectorAll('[custom-element="amp-embed"]'))
            .to.have.length(0);
        insertAmpExtensionScript(iframe.win, 'amp-ad');
        expect(iframe.doc.head.querySelectorAll('[custom-element="amp-embed"]'))
            .to.have.length(0);
        expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
            .to.have.length(1);
      });
    });

    it('insert script for amp-ad element asking amp-embed script', () => {
      return getAdIframe('amp-ad').then(() => {
        expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
            .to.have.length(0);
        expect(iframe.doc.head.querySelectorAll('[custom-element="amp-embed"]'))
            .to.have.length(0);
        insertAmpExtensionScript(iframe.win, 'amp-embed');
        expect(iframe.doc.head.querySelectorAll('[custom-element="amp-embed"]'))
            .to.have.length(0);
        expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
            .to.have.length(1);
      });
    });
  });

  it('script should get correct attributes', () => {
    return getAdIframe('amp-ad').then(() => {
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
          .to.have.length(0);
      insertAmpExtensionScript(iframe.win, 'amp-ad');
      expect(iframe.doc.head.querySelectorAll('[custom-element="amp-ad"]'))
          .to.have.length(1);
      const script = iframe.doc.head.querySelector(
          '[custom-element="amp-ad"]');
      expect(script.getAttribute('data-script')).to.equal('amp-ad');
      expect(script.getAttribute('async')).to.equal('');
    });
  });

  describe('get correct script source', () => {
    it('with local mode for testing with compiled js', () => {
      setModeForTesting({localDev: true});
      expect(getMode().localDev).to.be.true;
      const script = calculateExtensionScriptUrl('examples.build/ads.amp.html',
          'amp-ad', true, true);
      expect(script).to.equal('/base/dist/v0/amp-ad-0.1.js');
    });

    it('with local mode for testing without compiled js', () => {
      setModeForTesting({localDev: true});
      expect(getMode().localDev).to.be.true;
      const script = calculateExtensionScriptUrl('examples.build/ads.amp.html',
        'amp-ad', true, false);
      expect(script).to.equal('/base/dist/v0/amp-ad-0.1.max.js');
    });

    it('with local mode normal pathname', () => {
      setModeForTesting({localDev: true});
      expect(getMode().localDev).to.be.true;
      const script = calculateExtensionScriptUrl('examples.build/ads.amp.html',
          'amp-ad');
      expect(script).to.equal('https://cdn.ampproject.org/v0/amp-ad-0.1.js');
    });

    it('with local mode min pathname', () => {
      setModeForTesting({localDev: true});
      expect(getMode().localDev).to.be.true;
      const script = calculateExtensionScriptUrl(
          'examples.build/ads.amp.min.html', 'amp-ad');
      expect(script).to.equal('http://localhost:8000/dist/v0/amp-ad-0.1.js');
    });

    it('with local mode max pathname', () => {
      setModeForTesting({localDev: true});
      expect(getMode().localDev).to.be.true;
      const script = calculateExtensionScriptUrl(
          'examples.build/ads.amp.max.html', 'amp-ad');
      expect(script).to.equal(
          'http://localhost:8000/dist/v0/amp-ad-0.1.max.js');
    });

    it('with remote mode', () => {
      setModeForTesting({localDev: false, version: 123});
      expect(getMode().localDev).to.be.false;
      expect(getMode().version).to.equal(123);
      const script = calculateExtensionScriptUrl('', 'amp-ad');
      expect(script).to.equal(
          'https://cdn.ampproject.org/rtv/123/v0/amp-ad-0.1.js');
    });
  });
});
