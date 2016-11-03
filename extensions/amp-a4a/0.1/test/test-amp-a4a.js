/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
  MockA4AImpl,
  TEST_URL,
  SIGNATURE_HEADER,
} from './utils';
import {AmpA4A, RENDERING_TYPE_HEADER} from '../amp-a4a';
import {Xhr} from '../../../../src/service/xhr-impl';
import {Viewer} from '../../../../src/service/viewer-impl';
import {ampdocServiceFor} from '../../../../src/ampdoc';
import {cancellation} from '../../../../src/error';
import {createIframePromise} from '../../../../testing/iframe';
import {
  data as validCSSAmp,
} from './testdata/valid_css_at_rules_amp.reserialized';
import {data as testFragments} from './testdata/test_fragments';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {base64UrlDecodeToBytes} from '../../../../src/utils/base64';
import {utf8Encode} from '../../../../src/utils/bytes';
import {resetScheduledElementForTesting} from '../../../../src/custom-element';
import '../../../../extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import * as sinon from 'sinon';

/**
 * Create a promise for an iframe that has a super-minimal mock AMP environment
 * in it.
 *
 * @return {!Promise<{
 *   win: !Window,
 *   doc: !Document,
 *   iframe: !Element,
 *   addElement: function(!Element):!Promise
 * }>
 */
function createAdTestingIframePromise() {
  return createIframePromise().then(fixture => {
    installDocService(fixture.win, /* isSingleDoc */ true);
    const doc = fixture.doc;
    // TODO(a4a-cam@): This is necessary in the short term, until A4A is
    // smarter about host document styling.  The issue is that it needs to
    // inherit the AMP runtime style element in order for shadow DOM-enclosed
    // elements to behave properly.  So we have to set up a minimal one here.
    const ampStyle = doc.createElement('style');
    ampStyle.setAttribute('amp-runtime', 'scratch-fortesting');
    doc.head.appendChild(ampStyle);
    return fixture;
  });
}


describe('amp-a4a', () => {
  let sandbox;
  let xhrMock;
  let xhrMockJson;
  let getSigningServiceNamesMock;
  let viewerWhenVisibleMock;
  let mockResponse;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    xhrMock = sandbox.stub(Xhr.prototype, 'fetch');
    xhrMockJson = sandbox.stub(Xhr.prototype, 'fetchJson');
    getSigningServiceNamesMock = sandbox.stub(AmpA4A.prototype,
        'getSigningServiceNames');
    getSigningServiceNamesMock.returns(['google']);
    xhrMockJson.withArgs(
        'https://cdn.ampproject.org/amp-ad-verifying-keyset.json',
        {mode: 'cors', method: 'GET'})
    .returns(Promise.resolve({keys: [JSON.parse(validCSSAmp.publicKey)]}));
    viewerWhenVisibleMock = sandbox.stub(Viewer.prototype, 'whenFirstVisible');
    viewerWhenVisibleMock.returns(Promise.resolve());
    mockResponse = {
      arrayBuffer: function() {
        return utf8Encode(validCSSAmp.reserialized);
      },
      bodyUsed: false,
      headers: new Headers(),
      catch: callback => callback(),
    };
    mockResponse.headers.append(SIGNATURE_HEADER, validCSSAmp.signature);
  });

  afterEach(() => {
    sandbox.restore();
    resetScheduledElementForTesting(window, 'amp-a4a');
  });

  function createA4aElement(doc) {
    const element = doc.createElement('amp-a4a');
    element.getAmpDoc = () => {
      const ampdocService = ampdocServiceFor(doc.defaultView);
      return ampdocService.getAmpDoc(element);
    };
    doc.body.appendChild(element);
    return element;
  }

  function buildCreativeString(opt_additionalInfo) {
    const baseTestDoc = testFragments.minimalDocOneStyle;
    const offsets = opt_additionalInfo || {};
    offsets.ampRuntimeUtf16CharOffsets = [
      baseTestDoc.indexOf('<style amp4ads-boilerplate'),
      baseTestDoc.lastIndexOf('</script>') + '</script>'.length,
    ];
    const splicePoint = baseTestDoc.indexOf('</body>');
    return baseTestDoc.slice(0, splicePoint) +
        '<script type="application/json" amp-ad-metadata>' +
        JSON.stringify(offsets) + '</script>' +
        baseTestDoc.slice(splicePoint);
  }

  function buildCreativeArrayBuffer() {
    return utf8Encode(buildCreativeString());
  }

  function verifyNonAMPRender(a4a) {
    a4a.onAmpCreativeRender = () => {
      assert.fail('AMP creative should never have rendered!');
    };
  }

  describe('ads are visible', () => {
    let a4aElement;
    let a4a;
    let fixture;
    beforeEach(() => {
      xhrMock.withArgs(TEST_URL, {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
        requireAmpResponseSourceOrigin: true,
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createAdTestingIframePromise().then(f => {
        fixture = f;
        a4aElement = createA4aElement(fixture.doc);
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        a4a = new MockA4AImpl(a4aElement);
        return fixture;
      });
    });

    it('for SafeFrame rendering case', () => {
      verifyNonAMPRender(a4a);
      // Make sure there's no signature, so that we go down the 3p iframe path.
      mockResponse.headers.delete(SIGNATURE_HEADER);
      // If rendering type is safeframe, we SHOULD attach a SafeFrame.
      mockResponse.headers.append(RENDERING_TYPE_HEADER, 'safeframe');
      fixture.doc.body.appendChild(a4aElement);
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        // Force vsync system to run all queued tasks, so that DOM mutations
        // are actually completed before testing.
        a4a.vsync_.runScheduledTasks_();
        const child = a4aElement.querySelector('iframe[name]');
        expect(child).to.be.ok;
        expect(child).to.be.visible;
      });
    });

    it('for cached content iframe rendering case', () => {
      verifyNonAMPRender(a4a);
      // Make sure there's no signature, so that we go down the 3p iframe path.
      mockResponse.headers.delete(SIGNATURE_HEADER);
      fixture.doc.body.appendChild(a4aElement);
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        // Force vsync system to run all queued tasks, so that DOM mutations
        // are actually completed before testing.
        a4a.vsync_.runScheduledTasks_();
        const child = a4aElement.querySelector('iframe[src]');
        expect(child).to.be.ok;
        expect(child).to.be.visible;
      });
    });

    it('for A4A friendly iframe rendering case', () => {
      fixture.doc.body.appendChild(a4aElement);
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        // Force vsync system to run all queued tasks, so that DOM mutations
        // are actually completed before testing.
        a4a.vsync_.runScheduledTasks_();
        const child = a4aElement.querySelector('iframe[srcdoc]');
        expect(child).to.be.ok;
        expect(child).to.be.visible;
        const a4aBody = child.contentDocument.body;
        expect(a4aBody).to.be.ok;
        expect(a4aBody).to.be.visible;
      });
    });
  });

  describe('#renderViaSafeFrame', () => {

    it('should attach a SafeFrame when header is set', () => {
      // Make sure there's no signature, so that we go down the 3p iframe path.
      mockResponse.headers.delete(SIGNATURE_HEADER);
      // If rendering type is safeframe, we SHOULD attach a SafeFrame.
      mockResponse.headers.append(RENDERING_TYPE_HEADER, 'safeframe');
      xhrMock.withArgs(TEST_URL, {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
        requireAmpResponseSourceOrigin: true,
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        const a4a = new MockA4AImpl(a4aElement);
        verifyNonAMPRender(a4a);
        doc.body.appendChild(a4aElement);
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          // Force vsync system to run all queued tasks, so that DOM mutations
          // are actually completed before testing.
          a4a.vsync_.runScheduledTasks_();
          const child = a4aElement.querySelector('iframe[name]');
          expect(child).to.be.ok;
          expect(child.getAttribute('src')).to.have.string('safeframe');
          expect(child.getAttribute('name')).to.match(/[^;]+;\d+;[\s\S]+/);
        });
      });
    });

    ['', 'client_cache', 'some_random_thing'].forEach(headerVal => {
      it(`should not attach a SafeFrame when header is ${headerVal}`, () => {
        // Make sure there's no signature, so that we go down the 3p iframe path.
        mockResponse.headers.delete(SIGNATURE_HEADER);
        // If rendering type is anything but safeframe, we SHOULD NOT attach a
        // SafeFrame.
        mockResponse.headers.append(RENDERING_TYPE_HEADER, headerVal);
        xhrMock.withArgs(TEST_URL, {
          mode: 'cors',
          method: 'GET',
          credentials: 'include',
          requireAmpResponseSourceOrigin: true,
        }).onFirstCall().returns(Promise.resolve(mockResponse));
        return createAdTestingIframePromise().then(fixture => {
          const doc = fixture.doc;
          const a4aElement = createA4aElement(doc);
          a4aElement.setAttribute('width', 200);
          a4aElement.setAttribute('height', 50);
          a4aElement.setAttribute('type', 'adsense');
          const a4a = new MockA4AImpl(a4aElement);
          verifyNonAMPRender(a4a);
          doc.body.appendChild(a4aElement);
          a4a.onLayoutMeasure();
          return a4a.layoutCallback().then(() => {
            // Force vsync system to run all queued tasks, so that DOM mutations
            // are actually completed before testing.
            a4a.vsync_.runScheduledTasks_();
            const safeChild = a4aElement.querySelector('iframe[name]');
            expect(safeChild).to.not.be.ok;
            const unsafeChild = a4aElement.querySelector('iframe');
            expect(unsafeChild).to.be.ok;
            expect(unsafeChild.getAttribute('src')).to.have.string(
                TEST_URL);
          });
        });
      });
    });

    it('should not use SafeFrame if creative is A4A', () => {
      // Set safeframe header, but it should be ignored when a signature
      // exists and validates.
      mockResponse.headers.append(RENDERING_TYPE_HEADER, 'safeframe');
      xhrMock.withArgs(TEST_URL, {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
        requireAmpResponseSourceOrigin: true,
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        const a4a = new MockA4AImpl(a4aElement);
        doc.body.appendChild(a4aElement);
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          // Force vsync system to run all queued tasks, so that DOM mutations
          // are actually completed before testing.
          a4a.vsync_.runScheduledTasks_();
          const safeChild = a4aElement.querySelector('iframe[name]');
          expect(safeChild).to.not.be.ok;
          const crossDomainChild = a4aElement.querySelector('iframe[src]');
          expect(crossDomainChild).to.not.be.okay;
          const friendlyChild = a4aElement.querySelector('iframe[srcdoc]');
          expect(friendlyChild).to.be.ok;
          expect(friendlyChild.getAttribute('srcdoc')).to.have.string(
              '<html ⚡4ads>');
        });
      });
    });
  });

  describe('#onLayoutMeasure', () => {
    it('should run end-to-end and render in friendly iframe', () => {
      xhrMock.withArgs(TEST_URL, {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
        requireAmpResponseSourceOrigin: true,
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        const a4a = new MockA4AImpl(a4aElement);
        let onAmpCreativeRenderFired = false;
        a4a.onAmpCreativeRender = () => {
          onAmpCreativeRenderFired = true;
        };
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        const extractCreativeAndSignatureSpy = sandbox.spy(
            a4a, 'extractCreativeAndSignature');
        const maybeRenderAmpAdSpy = sandbox.spy(
            a4a, 'maybeRenderAmpAd_');
        doc.body.appendChild(a4aElement);
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.adPromise_.then(() => {
          expect(getAdUrlSpy.calledOnce, 'getAdUrl called exactly once')
              .to.be.true;
          expect(xhrMock.calledOnce,
              'xhr.fetchTextAndHeaders called exactly once').to.be.true;
          expect(extractCreativeAndSignatureSpy.calledOnce,
              'extractCreativeAndSignatureSpy called exactly once').to.be.true;
          expect(maybeRenderAmpAdSpy.calledOnce,
              'maybeRenderAmpAd_ called exactly once').to.be.true;
          expect(a4aElement.getElementsByTagName('iframe').length).to.equal(1);
          const friendlyIframe = a4aElement.querySelector('iframe[srcdoc]');
          expect(friendlyIframe).to.not.be.null;
          expect(friendlyIframe.getAttribute('src')).to.be.null;
          const expectedAttributes = {
            'frameborder': '0', 'allowfullscreen': '',
            'allowtransparency': '', 'scrolling': 'no'};
          Object.keys(expectedAttributes).forEach(key => {
            expect(friendlyIframe.getAttribute(key)).to.equal(
              expectedAttributes[key]);
          });
          // Should not contain v0.js, any extensions, or amp-boilerplate.
          const iframeDoc = friendlyIframe.contentDocument;
          expect(iframeDoc.querySelector('script[src]')).to.not.be.ok;
          expect(iframeDoc.querySelector('script[custom-element]'))
            .to.not.be.ok;
          expect(iframeDoc.querySelector('style[amp-boilerplate]'))
            .to.not.be.ok;
          expect(iframeDoc.querySelector('noscript')).to.not.be.ok;
          // Should contain font link and extension in main document.
          expect(iframeDoc.querySelector(
            'link[href="https://fonts.googleapis.com/css?family=Questrial"]'))
            .to.be.ok;
          expect(doc.querySelector('script[src*="amp-font-0.1"]')).to.be.ok;
          expect(onAmpCreativeRenderFired).to.be.true;
        });
      });
    });
    it('must not be position:fixed', () => {
      xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        const s = doc.createElement('style');
        s.textContent = '.fixed {position:fixed;}';
        doc.head.appendChild(s);
        a4aElement.className = 'fixed';
        const a4a = new MockA4AImpl(a4aElement);
        doc.body.appendChild(a4aElement);
        expect(a4a.onLayoutMeasure.bind(a4a)).to.throw(/fixed/);
      });
    });
    it('#layoutCallback not valid AMP', () => {
      xhrMock.withArgs(TEST_URL, {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
        requireAmpResponseSourceOrigin: true,
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        const a4a = new MockA4AImpl(a4aElement);
        verifyNonAMPRender(a4a);
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        sandbox.stub(a4a, 'extractCreativeAndSignature').returns(
          Promise.resolve({creative: mockResponse.arrayBuffer()}));
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.adPromise_.then(() => {
          expect(getAdUrlSpy.calledOnce, 'getAdUrl called exactly once')
              .to.be.true;
          expect(xhrMock.calledOnce,
              'xhr.fetchTextAndHeaders called exactly once').to.be.true;
          expect(a4aElement.children.length, 'has no children').to.equal(0);
          expect(a4a.rendered_).to.be.false;
          return a4a.layoutCallback().then(() => {
            // Force vsync system to run all queued tasks, so that DOM mutations
            // are actually completed before testing.
            a4a.vsync_.runScheduledTasks_();
            expect(a4aElement.getElementsByTagName('iframe').length)
                .to.equal(1);
            const iframe = a4aElement.getElementsByTagName('iframe')[0];
            expect(iframe.getAttribute('srcdoc')).to.be.null;
            expect(iframe.src, 'verify iframe src w/ origin').to
                .equal(TEST_URL +
                       '&__amp_source_origin=about%3Asrcdoc');
            expect(a4a.rendered_).to.be.true;
          });
        });
      });
    });
    it('should not leak full response to rendered dom', () => {
      xhrMock.withArgs(TEST_URL, {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
        requireAmpResponseSourceOrigin: true,
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        doc.body.appendChild(a4aElement);
        const a4a = new MockA4AImpl(a4aElement);
        const fullResponse = `<html amp>
            <body>
            <div class="forTest"></div>
            <script class="hostile">
            // Some hostile JavaScript
            assert.fail('This code should never be executed!');
            </script>
            <noscript>${validCSSAmp.reserialized}</noscript>
            <script type="application/json" amp-ad-metadata>
            {
               "bodyAttributes" : "",
               "bodyUtf16CharOffsets" : [ 10, 1000000 ],
               "cssUtf16CharOffsets" : [ 0, 0 ]
            }
            </script>
            </body></html>`;
        mockResponse.arrayBuffer = () => {
          return utf8Encode(fullResponse);
        };
        // Return value from `#extractCreativeAndSignature` is a sub-doc of
        // the full response.  To validate this test, comment out the following
        // statement and verify that test fails, with full response spliced in
        // to shadow doc.
        sandbox.stub(a4a, 'extractCreativeAndSignature').returns(
            utf8Encode(validCSSAmp.reserialized).then(c => {
              return {
                creative: c,
                signature: base64UrlDecodeToBytes(validCSSAmp.signature),
              };
            }));
        a4a.onLayoutMeasure();
        let onAmpCreativeRenderFired = false;
        a4a.onAmpCreativeRender = () => {
          onAmpCreativeRenderFired = true;
        };
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.adPromise_.then(() => {
          const friendlyIframe = a4aElement.getElementsByTagName('iframe')[0];
          expect(friendlyIframe).to.be.ok;
          expect(friendlyIframe.getAttribute('srcdoc')).to.be.ok;
          expect(friendlyIframe.src).to.not.be.ok;
          const frameDoc = friendlyIframe.contentDocument;
          expect(frameDoc.querySelector('div[class=forTest]')).to.not.be.ok;
          expect(frameDoc.querySelector('script[class=hostile]')).to.not.be.ok;
          expect(frameDoc.querySelector('style[amp-custom]')).to.be.ok;
          expect(frameDoc.body.innerHTML, 'body content')
              .to.contain('Hello, world.');
          expect(onAmpCreativeRenderFired).to.be.true;
        });
      });
    });
    it('should run end-to-end in the presence of an XHR error', () => {
      xhrMock.onFirstCall().returns(Promise.reject(new Error('XHR Error')));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        const a4a = new MockA4AImpl(a4aElement);
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        verifyNonAMPRender(a4a);
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.layoutCallback().then(() => {
          a4a.vsync_.runScheduledTasks_();
          expect(getAdUrlSpy.calledOnce, 'getAdUrl called exactly once')
              .to.be.true;
          // Verify iframe presence and lack of visibility hidden
          expect(a4aElement.children.length).to.equal(1);
          const iframe = a4aElement.querySelector('iframe[src]');
          expect(iframe).to.be.ok;
          expect(iframe.src.indexOf(TEST_URL)).to.equal(0);
          expect(iframe).to.be.visible;
        });
      });
    });
    it('should handle XHR error when resolves before layoutCallback', () => {
      xhrMock.onFirstCall().returns(Promise.reject(new Error('XHR Error')));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        verifyNonAMPRender(a4a);
        a4a.onLayoutMeasure();
        return a4a.adPromise_.then(() => a4a.layoutCallback().then(() => {
          a4a.vsync_.runScheduledTasks_();
          // Verify iframe presence and lack of visibility hidden
          expect(a4aElement.children.length).to.equal(1);
          const iframe = a4aElement.children[0];
          expect(iframe.tagName).to.equal('IFRAME');
          expect(iframe.src.indexOf(TEST_URL)).to.equal(0);
          expect(iframe).to.be.visible;
        }));
      });
    });
    it('should handle XHR error when resolves after layoutCallback', () => {
      let rejectXhr;
      xhrMock.onFirstCall().returns(new Promise((unusedResolve, reject) => {
        rejectXhr = reject;
      }));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        verifyNonAMPRender(a4a);
        a4a.onLayoutMeasure();
        const layoutCallbackPromise = a4a.layoutCallback();
        rejectXhr(new Error('XHR Error'));
        return layoutCallbackPromise.then(() => {
          a4a.vsync_.runScheduledTasks_();
          // Verify iframe presence and lack of visibility hidden
          expect(a4aElement.children.length).to.equal(1);
          const iframe = a4aElement.children[0];
          expect(iframe.tagName).to.equal('IFRAME');
          expect(iframe.src.indexOf(TEST_URL)).to.equal(0);
          expect(iframe.style.visibility).to.equal('');
        });
      });
    });
    // TODO(tdrl): Go through case analysis in amp-a4a.js#onLayoutMeasure and
    // add one test for each case / ensure that all cases are covered.
  });

  describe('#preconnectCallback', () => {
    it('validate adsense', () => {
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        a4aElement.setAttribute('type', 'adsense');
        const a4a = new AmpA4A(a4aElement);
        //a4a.config = {};
        a4a.buildCallback();
        a4a.preconnectCallback(false);
        const preconnects = doc.querySelectorAll('link[rel=preconnect]');
        expect(preconnects.length).to.equal(2);
        expect(preconnects[0].getAttribute('href')).to
            .equal('https://tpc.googlesyndication.com');
        expect(preconnects[1].getAttribute('href')).to
            .equal('https://googleads.g.doubleclick.net');
      });
    });
  });

  describe('#getAmpAdMetadata_', () => {
    it('should parse metadata', () => {
      const actual = AmpA4A.prototype.getAmpAdMetadata_(buildCreativeString({
        customElementExtensions: ['amp-vine', 'amp-vine', 'amp-vine'],
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {href: 'https://fonts.com/css?helloworld'},
        ],
      }));
      const expected = {
        minifiedCreative: testFragments.minimalDocOneStyleSrcDoc,
        customElementExtensions: ['amp-vine', 'amp-vine', 'amp-vine'],
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {href: 'https://fonts.com/css?helloworld'},
        ],
      };
      expect(actual).to.deep.equal(expected);
    });
    it('should return null if missing ampRuntimeUtf16CharOffsets', () => {
      const baseTestDoc = testFragments.minimalDocOneStyle;
      const splicePoint = baseTestDoc.indexOf('</body>');
      expect(AmpA4A.prototype.getAmpAdMetadata_(
        baseTestDoc.slice(0, splicePoint) +
        '<script type="application/json" amp-ad-metadata></script>' +
        baseTestDoc.slice(splicePoint))).to.be.null;
    });
    it('should return null if invalid extensions', () => {
      expect(AmpA4A.prototype.getAmpAdMetadata_(buildCreativeString({
        customElementExtensions: 'amp-vine',
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {href: 'https://fonts.com/css?helloworld'},
        ],
      }))).to.be.null;
    });
    it('should return null if non-array stylesheets', () => {
      expect(AmpA4A.prototype.getAmpAdMetadata_(buildCreativeString({
        customElementExtensions: ['amp-vine', 'amp-vine', 'amp-vine'],
        customStylesheets: 'https://fonts.googleapis.com/css?foobar',
      }))).to.be.null;
    });
    it('should return null if invalid stylesheet object', () => {
      expect(AmpA4A.prototype.getAmpAdMetadata_(buildCreativeString({
        customElementExtensions: ['amp-vine', 'amp-vine', 'amp-vine'],
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {foo: 'https://fonts.com/css?helloworld'},
        ],
      }))).to.be.null;
    });
    // FAILURE cases here
  });

  describe('#maybeRenderAmpAd_', () => {
    it('should not render AMP natively', () => {
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const a4a = new AmpA4A(a4aElement);
        a4a.adUrl_ = 'https://nowhere.org';
        a4a.maybeRenderAmpAd_ = function() { return Promise.resolve(false); };
        return a4a.maybeRenderAmpAd_().then(rendered => {
          // Force vsync system to run all queued tasks, so that DOM mutations
          // are actually completed before testing.
          a4a.vsync_.runScheduledTasks_();
          expect(rendered).to.be.false;
          expect(a4aElement.shadowRoot).to.be.null;
          expect(a4a.rendered_).to.be.false;
          // Force layout callback which will cause iframe to be attached
          a4a.adPromise_ = Promise.resolve(false);
          return a4a.layoutCallback().then(() => {
            a4a.vsync_.runScheduledTasks_();
            // Verify iframe presence and lack of visibility hidden
            expect(a4aElement.children.length).to.equal(1);
            const iframe = a4aElement.children[0];
            expect(iframe.tagName).to.equal('IFRAME');
            expect(iframe.src.indexOf('https://nowhere.org')).to.equal(0);
            expect(iframe.style.visibility).to.equal('');
          });
        });
      });
    });
    it('should render AMP natively', () => {
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        doc.body.appendChild(a4aElement);
        const a4a = new AmpA4A(a4aElement);
        a4a.adUrl_ = 'https://nowhere.org';
        return buildCreativeArrayBuffer().then(bytes => {
          return a4a.maybeRenderAmpAd_(bytes).then(rendered => {
            expect(rendered).to.be.true;
            // Verify iframe presence.
            expect(a4aElement.children.length).to.equal(1);
            const friendlyIframe = a4aElement.children[0];
            expect(friendlyIframe.tagName).to.equal('IFRAME');
            expect(friendlyIframe.src).to.not.be.ok;
            expect(friendlyIframe.srcdoc).to.be.ok;
            const frameDoc = friendlyIframe.contentDocument;
            const styles = frameDoc.querySelectorAll('style[amp-custom]');
            expect(Array.prototype.some.call(styles,
                s => {
                  return s.innerHTML == 'p { background: green }';
                }),
                'Some style is "background: green"').to.be.true;
            expect(frameDoc.body.innerHTML.trim()).to.equal('<p>some text</p>');
          });
        });
      });
    });

    it('should handle click expansion correctly', () => {
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        doc.body.appendChild(a4aElement);
        const a4a = new AmpA4A(a4aElement);
        a4a.adUrl_ = 'https://nowhere.org';
        return buildCreativeArrayBuffer().then(bytes => {
          return a4a.maybeRenderAmpAd_(bytes).then(() => {
            // Force vsync system to run all queued tasks, so that DOM mutations
            // are actually completed before testing.
            a4a.vsync_.runScheduledTasks_();
            const adBody = a4aElement.querySelector('iframe')
                .contentDocument.querySelector('body');
            let clickHandlerCalled = 0;

            adBody.onclick = function(e) {
              expect(e.defaultPrevented).to.be.false;
              e.preventDefault();  // Make the test not actually navigate.
              clickHandlerCalled++;
            };
            adBody.innerHTML = '<a ' +
                'href="https://f.co?CLICK_X,CLICK_Y,RANDOM">' +
                '<button id="target"><button></div>';
            const button = adBody.querySelector('#target');
            const a = adBody.querySelector('a');
            const ev1 = new Event('click', {bubbles: true});
            ev1.pageX = 10;
            ev1.pageY = 20;
            button.dispatchEvent(ev1);
            expect(a.href).to.equal('https://f.co/?10,20,RANDOM');
            expect(clickHandlerCalled).to.equal(1);

            const ev2 = new Event('click', {bubbles: true});
            ev2.pageX = 111;
            ev2.pageY = 222;
            a.dispatchEvent(ev2);
            expect(a.href).to.equal('https://f.co/?111,222,RANDOM');
            expect(clickHandlerCalled).to.equal(2);

            const ev3 = new Event('click', {bubbles: true});
            ev3.pageX = 666;
            ev3.pageY = 666;
            // Click parent of a tag.
            a.parentElement.dispatchEvent(ev3);
            // Had no effect, because actual link wasn't clicked.
            expect(a.href).to.equal('https://f.co/?111,222,RANDOM');
            expect(clickHandlerCalled).to.equal(3);
          });
        });
      });
    });
  });

  describe('#getPriority', () => {
    it('validate priority', () => {
      expect(AmpA4A.prototype.getPriority()).to.equal(2);
    });
  });

  describe('#unlayoutCallback', () => {
    it('verify state reset', () => {
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        doc.body.appendChild(a4aElement);
        const a4a = new MockA4AImpl(a4aElement);
        xhrMock.withArgs(TEST_URL, {
          mode: 'cors',
          method: 'GET',
          credentials: 'include',
          requireAmpResponseSourceOrigin: true,
        }).returns(Promise.resolve(mockResponse));
        return a4a.onLayoutMeasure(() => {
          expect(a4a.adPromise_).to.not.be.null;
          expect(a4a.element.children.length).to.equal(1);
        });
      });
    });
    it('verify cancelled promise', () => {
      return createAdTestingIframePromise().then(fixture => {
        let whenFirstVisibleResolve = null;
        viewerWhenVisibleMock.returns(new Promise(resolve => {
          whenFirstVisibleResolve = resolve;
        }));
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        const a4a = new MockA4AImpl(a4aElement);
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        const adPromise = a4a.adPromise_;
        // This is to prevent `displayUnlayoutUI` to be called;
        a4a.uiHandler.state = 0;
        a4a.unlayoutCallback();
        // Force vsync system to run all queued tasks, so that DOM mutations
        // are actually completed before testing.
        a4a.vsync_.runScheduledTasks_();
        whenFirstVisibleResolve();
        return adPromise.then(unusedError => {
          assert.fail('cancelled ad promise should not succeed');
        }).catch(reason => {
          expect(getAdUrlSpy.called, 'getAdUrl never called')
              .to.be.false;
          expect(reason).to.deep.equal(cancellation());
        });
      });
    });
  });

  // TODO(tdrl): Other cases to handle for parsing JSON metadata:
  //   - Metadata tag(s) missing
  //   - JSON parse failure
  //   - Tags present, but JSON empty
  // Other cases to handle for CSS reformatting:
  //   - CSS embedded in larger doc
  //   - Multiple replacement offsets
  //   - Erroneous replacement offsets
  // Other cases to handle for body reformatting:
  //   - All
});
