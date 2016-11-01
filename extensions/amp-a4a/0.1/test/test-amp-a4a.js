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

import {AmpA4A, RENDERING_TYPE_HEADER} from '../amp-a4a';
import {Xhr} from '../../../../src/service/xhr-impl';
import {Viewer} from '../../../../src/service/viewer-impl';
import {ampdocServiceFor} from '../../../../src/ampdoc';
import {base64UrlDecodeToBytes} from '../../../../src/utils/base64';
import {cancellation} from '../../../../src/error';
import {createIframePromise} from '../../../../testing/iframe';
import {data as minimumAmp} from './testdata/minimum_valid_amp.reserialized';
import {data as regexpsAmpData} from './testdata/regexps.reserialized';
import {
  data as validCSSAmp,
} from './testdata/valid_css_at_rules_amp.reserialized';
import {data as testFragments} from './testdata/test_fragments';
import {data as expectations} from './testdata/expectations';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {a4aRegistry} from '../../../../ads/_a4a-config';
import '../../../../extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import * as sinon from 'sinon';

const XHR_URL = 'http://iframe.localhost:' + location.port +
      '/test/fixtures/served/iframe.html?args';

class MockA4AImpl extends AmpA4A {
  getAdUrl() {
    return Promise.resolve(XHR_URL);
  }

  extractCreativeAndSignature(responseArrayBuffer, responseHeaders) {
    return Promise.resolve({
      creative: responseArrayBuffer,
      signature: responseHeaders.has('X-Google-header') ?
          base64UrlDecodeToBytes(responseHeaders.get('X-Google-header')) : null,
    });
  }
}


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
  let viewerWhenVisibleMock;
  let mockResponse;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    xhrMock = sandbox.stub(Xhr.prototype, 'fetch');
    xhrMockJson = sandbox.stub(Xhr.prototype, 'fetchJson');
    xhrMockJson.withArgs(
        'https://cdn.ampproject.org/amp-ad-verifying-keyset.json',
        {mode: 'cors', method: 'GET'})
    .returns(Promise.resolve({keys: [JSON.parse(validCSSAmp.publicKey)]}));
    viewerWhenVisibleMock = sandbox.stub(Viewer.prototype, 'whenFirstVisible');
    viewerWhenVisibleMock.returns(Promise.resolve());
    mockResponse = {
      arrayBuffer: function() {
        return Promise.resolve(stringToArrayBuffer(validCSSAmp.reserialized));
      },
      bodyUsed: false,
      headers: new Headers(),
      catch: callback => callback(),
    };
    mockResponse.headers.append('X-Google-header', validCSSAmp.signature);
  });

  afterEach(() => {
    sandbox.restore();
  });

  function stringToArrayBuffer(str) {
    return new TextEncoder('utf-8').encode(str);
  }

  function createA4aElement(doc) {
    const element = doc.createElement('amp-a4a');
    element.getAmpDoc = () => {
      const ampdocService = ampdocServiceFor(doc.defaultView);
      return ampdocService.getAmpDoc(element);
    };
    doc.body.appendChild(element);
    return element;
  }

  function verifyNonAMPRender(a4a) {
    a4a.onAmpCreativeRender = () => {
      assert.fail('AMP creative should never have rendered!');
    };
  }

  /**
   *
   * @param {!Window} win
   * @param {!Element} element
   */
  function isStyleVisible(win, element) {
    return win.getComputedStyle(element).getPropertyValue('visibility') ==
        'visible';
  }

  describe('ads are visible', () => {
    let a4aElement;
    let a4a;
    let fixture;
    beforeEach(() => {
      xhrMock.withArgs(XHR_URL, {
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
      mockResponse.headers.delete('X-Google-header');
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
        expect(isStyleVisible(fixture.win, child)).to.be.true;
      });
    });

    it('for cached content iframe rendering case', () => {
      verifyNonAMPRender(a4a);
      // Make sure there's no signature, so that we go down the 3p iframe path.
      mockResponse.headers.delete('X-Google-header');
      fixture.doc.body.appendChild(a4aElement);
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        // Force vsync system to run all queued tasks, so that DOM mutations
        // are actually completed before testing.
        a4a.vsync_.runScheduledTasks_();
        const child = a4aElement.querySelector('iframe[src]');
        expect(child).to.be.ok;
        expect(isStyleVisible(fixture.win, child)).to.be.true;
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
        expect(isStyleVisible(fixture.win, child)).to.be.true;
        const a4aBody = child.contentDocument.body;
        expect(a4aBody).to.be.ok;
        expect(isStyleVisible(fixture.win, a4aBody)).to.be.true;
      });
    });
  });

  describe('#renderViaSafeFrame', () => {
    // This is supposed to be an end-to-end test, but there seems to be an
    // AMP initialization or upgrade issue somewhere, so the
    // fixture.addElement() step fails with a 'element.build does not exist'
    // error.  Skip this until we sort out how to properly do an E2E.
    it.skip('should render a single AMP ad in a friendly iframe', () => {
      xhrMock.withArgs(XHR_URL, {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
        requireAmpResponseSourceOrigin: true,
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        a4aRegistry['mock'] = () => {return true;};
        // const extensionsMock = sandbox.mock(extensionsFor(fixture.win));
        // extensionsMock.expects('loadElementClass')
        //     .withExactArgs('amp-ad-network-mock-impl')
        //     .returns(Promise.resolve(MockA4AImpl))
        //     .once();
        const ampAdElement = doc.createElement('amp-a4a');
        ampAdElement.setAttribute('width', 200);
        ampAdElement.setAttribute('height', 50);
        ampAdElement.setAttribute('type', 'mock');
        // const ampAd = new MockA4AImpl(ampAdElement);
        return fixture.addElement(ampAdElement);
        // return ampAd.upgradeCallback().then(baseElement => {
        //   extensionsMock.verify();
        //   expect(ampAdElement.getAttribute('data-a4a-upgrade-type')).to.equal(
        //       'amp-ad-network-mock-impl');
        //   return fixture.addElement(ampAdElement).then(element => {
        //     expect(element).to.not.be.null;
        //   });
        // });
      });
    });

    it('should attach a SafeFrame when header is set', () => {
      // Make sure there's no signature, so that we go down the 3p iframe path.
      mockResponse.headers.delete('X-Google-header');
      // If rendering type is safeframe, we SHOULD attach a SafeFrame.
      mockResponse.headers.append(RENDERING_TYPE_HEADER, 'safeframe');
      xhrMock.withArgs(XHR_URL, {
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
        mockResponse.headers.delete('X-Google-header');
        // If rendering type is anything but safeframe, we SHOULD NOT attach a
        // SafeFrame.
        mockResponse.headers.append(RENDERING_TYPE_HEADER, headerVal);
        xhrMock.withArgs(XHR_URL, {
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
                XHR_URL);
          });
        });
      });
    });

    it('should not use SafeFrame if creative is A4A', () => {
      // Set safeframe header, but it should be ignored when a signature
      // exists and validates.
      mockResponse.headers.append(RENDERING_TYPE_HEADER, 'safeframe');
      xhrMock.withArgs(XHR_URL, {
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
      xhrMock.withArgs(XHR_URL, {
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
      xhrMock.withArgs(XHR_URL, {
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
                .equal(XHR_URL +
                       '&__amp_source_origin=about%3Asrcdoc');
            expect(a4a.rendered_).to.be.true;
          });
        });
      });
    });
    it('should not leak full response to rendered dom', () => {
      xhrMock.withArgs(XHR_URL, {
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
          return Promise.resolve(stringToArrayBuffer(fullResponse));
        };
        // Return value from `#extractCreativeAndSignature` is a sub-doc of
        // the full response.  To validate this test, comment out the following
        // statement and verify that test fails, with full response spliced in
        // to shadow doc.
        sandbox.stub(a4a, 'extractCreativeAndSignature').returns(
            Promise.resolve({
              creative: stringToArrayBuffer(validCSSAmp.reserialized),
              signature: base64UrlDecodeToBytes(validCSSAmp.signature),
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
          expect(iframe.src.indexOf(XHR_URL)).to.equal(0);
          expect(isStyleVisible(fixture.win, iframe)).to.be.true;
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
          expect(iframe.src.indexOf(XHR_URL)).to.equal(0);
          expect(isStyleVisible(fixture.win, iframe)).to.be.true;
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
          expect(iframe.src.indexOf(XHR_URL)).to.equal(0);
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
    function getAmpAdMetadata(metaDataObj) {
      return AmpA4A.prototype.getAmpAdMetadata_(
        '<script type="application/json" amp-ad-metadata>' +
        JSON.stringify(metaDataObj) + '</script>');
    }
    it('Invalid/missing body offsets', () => {
      expect(getAmpAdMetadata({})).to.be.null;
      expect(getAmpAdMetadata({bodyUtf16CharOffsets: []})).to.be.null;
      expect(getAmpAdMetadata({bodyUtf16CharOffsets: [123, 'def']})).to.be.null;
      expect(getAmpAdMetadata(
        {bodyUtf16CharOffsets: [123, 345, 'def']})).to.be.null;
    });
    it('Invalid css offsets', () => {
      expect(getAmpAdMetadata(
        {bodyUtf16CharOffsets: [123, 345]})).to.not.be.null;
      expect(getAmpAdMetadata(
        {bodyUtf16CharOffsets: [123, 345],
         cssUtf16CharOffsets: []})).to.be.null;
      expect(getAmpAdMetadata(
        {bodyUtf16CharOffsets: [123, 345],
        cssUtf16CharOffsets: ['def', 123]})).to.be.null;
      expect(getAmpAdMetadata(
        {bodyUtf16CharOffsets: [123, 345],
        cssUtf16CharOffsets: [123, 123, 'def']})).to.be.null;
    });
    // TODO: more tests!
    it('should parse metadata out of regexpsAmpData', () => {
      const actual = getAmpAdMetadata({
        bodyUtf16CharOffsets: [1393, 1860],
        cssUtf16CharOffsets: [135, 579],
        customElementExtensions: ['amp-vine', 'amp-vine', 'amp-vine'],
        bodyAttributes: 'style=\'border:1;display:block\'',
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {href: 'https://fonts.com/css?helloworld'},
        ],
      });
      const expected = {
        bodyUtf16CharOffsets: [1393, 1860],
        cssUtf16CharOffsets: [135, 579],
        bodyAttributes: 'style=\'border:1;display:block\'',
        customElementExtensions: ['amp-vine', 'amp-vine', 'amp-vine'],
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {href: 'https://fonts.com/css?helloworld'},
        ],
      };
      expect(actual).to.deep.equal(expected);
    });
  });

  describe('#maybeRenderAmpAd_', () => {
    function buildCreativeArrayBuffer() {
      const baseTestDoc = testFragments.minimalDocOneStyle;
      const offsets = {
        cssUtf16CharOffsets: [
          baseTestDoc.indexOf('<style>') + '<style>'.length,
          baseTestDoc.indexOf('</style>'),
        ],
        bodyUtf16CharOffsets: [
          baseTestDoc.indexOf('<body>') + '<body>'.length,
          baseTestDoc.indexOf('</body>'),
        ],
      };
      const splicePoint = offsets.bodyUtf16CharOffsets[1];
      return stringToArrayBuffer(baseTestDoc.slice(0, splicePoint) +
          '<script type="application/json" amp-ad-metadata>' +
          JSON.stringify(offsets) + '</script>' +
          baseTestDoc.slice(splicePoint));
    }
    it('should not render AMP natively', () => {
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const a4a = new AmpA4A(a4aElement);
        a4a.adUrl_ = 'http://foo.com';
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
            expect(iframe.src.indexOf('http://foo.com')).to.equal(0);
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
        const bytes = buildCreativeArrayBuffer();
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
              s => { return s.innerHTML == 'p { background: green }'; }),
              'Some style is "background: green"').to.be.true;
          expect(frameDoc.body.innerHTML.trim()).to.equal('<p>some text</p>');
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
        const bytes = buildCreativeArrayBuffer();
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

  describe('#formatBody_', () => {
    it('handles full reserialized minimum AMP doc', () => {
      const metaData = AmpA4A.prototype.getAmpAdMetadata_(
          minimumAmp.reserialized);
      expect(metaData).to.not.be.null;
      expect(AmpA4A.prototype.formatBody_(minimumAmp.reserialized, metaData))
          .to.equal(expectations.minimumDocBodyFormatted);
    });

    it('handles full reserialized regexp AMP doc', () => {
      const metaData = AmpA4A.prototype.getAmpAdMetadata_(regexpsAmpData);
      expect(metaData).to.not.be.null;
      expect(AmpA4A.prototype.formatBody_(regexpsAmpData, metaData)).to
        .equal(expectations.regexpDocBodyFormatted);
    });
  });

  describe('#formatCSSBlock_', () => {
    it('skips empty CSS blocks', () => {
      expect(AmpA4A.prototype.formatCSSBlock_('', {})).to.equal('');
    });

    it('handles empty CSS offsets list gracefully', () => {
      const creative = 'div { background-color: red }';
      const metaData = {
        cssUtf16CharOffsets: [0, creative.length],
        cssReplacementRanges: [],
      };
      expect(AmpA4A.prototype.formatCSSBlock_(creative, metaData)).to.equal(
        'div { background-color: red }');
    });

    it('should rewrite CSS from validCSSAmp', () => {
      const metaData = AmpA4A.prototype.getAmpAdMetadata_(
          validCSSAmp.reserialized);
      expect(AmpA4A.prototype.formatCSSBlock_(validCSSAmp.reserialized,
                                              metaData))
        .to.equal(expectations.validCssDocCssBlockFormatted);
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
        xhrMock.withArgs(XHR_URL, {
          mode: 'cors',
          method: 'GET',
          credentials: 'include',
          requireAmpResponseSourceOrigin: true,
        }).returns(Promise.resolve(mockResponse));
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.not.be.null;
        return a4a.adPromise_.then(() => {
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
