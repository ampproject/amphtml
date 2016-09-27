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
  AmpA4A,
  setPublicKeys,
} from '../amp-a4a';
import {base64UrlDecodeToBytes} from '../../../../src/utils/base64';
import {Xhr} from '../../../../src/service/xhr-impl';
import {Viewer} from '../../../../src/service/viewer-impl';
import {cancellation} from '../../../../src/error';
import {createIframePromise} from '../../../../testing/iframe';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {data as minimumAmp} from './testdata/minimum_valid_amp.reserialized';
import {data as regexpsAmpData} from './testdata/regexps.reserialized';
import {
  data as validCSSAmp,
} from './testdata/valid_css_at_rules_amp.reserialized';
import {data as testFragments} from './testdata/test_fragments';
import {data as expectations} from './testdata/expectations';
import '../../../../extensions/amp-ad/0.1/amp-ad-api-handler';
import * as sinon from 'sinon';

class MockA4AImpl extends AmpA4A {
  getAdUrl() {
    return Promise.resolve('https://test.location.org/ad/012345?args');
  }

  extractCreativeAndSignature(responseArrayBuffer, responseHeaders) {
    return Promise.resolve({
      creative: responseArrayBuffer,
      signature: base64UrlDecodeToBytes(responseHeaders.get('X-Google-header')),
    });
  }

  supportsAmpCreativeRender() { return true; }
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
  let viewerForMock;
  let mockResponse;

  setPublicKeys([JSON.parse(validCSSAmp.publicKey)]);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    xhrMock = sandbox.stub(Xhr.prototype, 'fetch');
    viewerForMock = sandbox.stub(Viewer.prototype, 'whenFirstVisible');
    mockResponse = {
      arrayBuffer: function() {
        return Promise.resolve(stringToArrayBuffer(validCSSAmp.reserialized));
      },
      bodyUsed: false,
      headers: {
        get: function(name) {
          const headerValues = {
            'X-Google-header': validCSSAmp.signature,
          };
          return headerValues[name];
        },
      },
    };
  });
  afterEach(() => {
    sandbox.restore();
  });

  function stringToArrayBuffer(str) {
    return new TextEncoder('utf-8').encode(str);
  }

  describe('#onLayoutMeasure', () => {
    it('should run end-to-end and render in shadow root', () => {
      viewerForMock.onFirstCall().returns(Promise.resolve());
      xhrMock.withArgs('https://test.location.org/ad/012345?args', {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
        requireAmpResponseSourceOrigin: true,
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = doc.createElement('amp-a4a');
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        const a4a = new MockA4AImpl(a4aElement);
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        const extractCreativeAndSignatureSpy = sandbox.spy(
            a4a, 'extractCreativeAndSignature');
        const validateAdResponseSpy = sandbox.spy(
            a4a, 'validateAdResponse_');
        const maybeRenderAmpAdSpy = sandbox.spy(
            a4a, 'maybeRenderAmpAd_');
        doc.body.appendChild(a4aElement);
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.adPromise_.then(() => {
          // Force vsync system to run all queued tasks, so that DOM mutations
          // are actually completed before testing.
          a4a.vsync_.runScheduledTasks_();
          expect(getAdUrlSpy.calledOnce, 'getAdUrl called exactly once')
              .to.be.true;
          expect(xhrMock.calledOnce,
              'xhr.fetchTextAndHeaders called exactly once').to.be.true;
          expect(extractCreativeAndSignatureSpy.calledOnce,
              'extractCreativeAndSignatureSpy called exactly once').to.be.true;
          expect(validateAdResponseSpy.calledOnce,
              'validateAdResponse_ called exactly once').to.be.true;
          expect(maybeRenderAmpAdSpy.calledOnce,
              'maybeRenderAmpAd_ called exactly once').to.be.true;
          expect(a4aElement.shadowRoot, 'Shadow root is set').to.not.be.null;
          expect(a4aElement.shadowRoot.querySelector('style'),
              'style tag in shadow root').to.not.be.null;
          expect(a4aElement.shadowRoot.querySelector('amp-ad-body'),
              'amp-ad-body tag in shadow root').to.not.be.null;
          expect(a4aElement.shadowRoot.querySelector('amp-ad-body').innerText,
              'body content').to.contain('Hello, world.');
        });
      });
    });
    it('should run end-to-end w/o shadow DOM support', () => {
      viewerForMock.onFirstCall().returns(Promise.resolve());
      xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = doc.createElement('amp-a4a');
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        const a4a = new MockA4AImpl(a4aElement);
        // Disable shadow dom support.
        sandbox.stub(a4a, 'supportsShadowDom').returns(false);
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.adPromise_.then(() => {
          // Force vsync system to run all queued tasks, so that DOM mutations
          // are actually completed before testing.
          a4a.vsync_.runScheduledTasks_();
          expect(getAdUrlSpy.calledOnce, 'getAdUrl called exactly once')
              .to.be.true;
          expect(xhrMock.calledOnce,
              'xhr.fetchTextAndHeaders called exactly once').to.be.true;
          expect(a4aElement.shadowRoot, 'Shadow root is not set').to.be.null;
          expect(a4aElement.children.length, 'has child').to.equal(1);
          expect(a4aElement.firstChild.src, 'verify iframe src w/ origin').to
              .equal('https://test.location.org/ad/012345?args' +
                     '&__amp_source_origin=about%3Asrcdoc');
          expect(a4a.rendered_).to.be.true;
        });
      });
    });
    it('must not be position:fixed', () => {
      viewerForMock.onFirstCall().returns(Promise.resolve());
      xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = doc.createElement('amp-a4a');
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
    it('#onLayoutMeasure #layoutCallback not valid AMP', () => {
      viewerForMock.onFirstCall().returns(Promise.resolve());
      xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = doc.createElement('amp-a4a');
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        const a4a = new MockA4AImpl(a4aElement);
        // Disable shadow dom support.
        sandbox.stub(a4a, 'supportsShadowDom').returns(false);
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
          expect(a4aElement.shadowRoot, 'Shadow root is not set').to.be.null;
          expect(a4aElement.children.length, 'has no children').to.equal(0);
          expect(a4a.rendered_).to.be.false;
          return a4a.layoutCallback().then(() => {
            // Force vsync system to run all queued tasks, so that DOM mutations
            // are actually completed before testing.
            a4a.vsync_.runScheduledTasks_();
            expect(a4aElement.shadowRoot, 'Shadow root is not set').to.be.null;
            expect(a4aElement.children.length, 'has child').to.equal(1);
            expect(a4aElement.firstChild.src, 'verify iframe src w/ origin').to
                .equal('https://test.location.org/ad/012345?args' +
                       '&__amp_source_origin=about%3Asrcdoc');
            expect(a4a.rendered_).to.be.true;
          });
        });
      });
    });
    it('should not leak full response to rendered dom', () => {
      viewerForMock.onFirstCall().returns(Promise.resolve());
      xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = doc.createElement('amp-a4a');
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
              signature: new Uint8Array([]),
            }));
        sandbox.stub(a4a, 'validateAdResponse_').returns(
            Promise.resolve(stringToArrayBuffer(validCSSAmp.reserialized)));
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.adPromise_.then(() => {
          // Force vsync system to run all queued tasks, so that DOM mutations
          // are actually completed before testing.
          a4a.vsync_.runScheduledTasks_();
          const root = a4aElement.shadowRoot;
          expect(root, 'Shadow root is set').to.not.be.null;
          expect(root.querySelector('div[class=forTest]')).to.not.be.ok;
          expect(root.querySelector('script[class=hostile]')).to.not.be.ok;
          expect(root.querySelector('style[amp-custom]')).to.be.ok;
          expect(root.querySelector('amp-ad-body').innerText, 'body content')
              .to.contain('Hello, world.');
        });
      });
    });
    it('should run end-to-end in the presence of an XHR error', () => {
      viewerForMock.onFirstCall().returns(Promise.resolve());
      xhrMock.onFirstCall().returns(Promise.reject(new Error('XHR Error')));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = doc.createElement('amp-a4a');
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        const a4a = new MockA4AImpl(a4aElement);
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.layoutCallback().then(() => {
          a4a.vsync_.runScheduledTasks_();
          expect(getAdUrlSpy.calledOnce, 'getAdUrl called exactly once')
              .to.be.true;
          // Verify iframe presence and lack of visibility hidden
          expect(a4aElement.children.length).to.equal(1);
          const iframe = a4aElement.children[0];
          expect(iframe.tagName).to.equal('IFRAME');
          expect(iframe.src.indexOf('https://test.location.org')).to.equal(0);
          expect(iframe.style.visibility).to.equal('');
        });
      });
    });
    it('should handle XHR error when resolves before layoutCallback', () => {
      viewerForMock.onFirstCall().returns(Promise.resolve());
      xhrMock.onFirstCall().returns(Promise.reject(new Error('XHR Error')));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = doc.createElement('amp-a4a');
        const a4a = new MockA4AImpl(a4aElement);
        a4a.onLayoutMeasure();
        return a4a.adPromise_.then(() => a4a.layoutCallback().then(() => {
          a4a.vsync_.runScheduledTasks_();
          // Verify iframe presence and lack of visibility hidden
          expect(a4aElement.children.length).to.equal(1);
          const iframe = a4aElement.children[0];
          expect(iframe.tagName).to.equal('IFRAME');
          expect(iframe.src.indexOf('https://test.location.org')).to.equal(0);
          expect(iframe.style.visibility).to.equal('');
        }));
      });
    });
    it('should handle XHR error when resolves after layoutCallback', () => {
      viewerForMock.onFirstCall().returns(Promise.resolve());
      let rejectXhr;
      xhrMock.onFirstCall().returns(new Promise((unusedResolve, reject) => {
        rejectXhr = reject;
      }));
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = doc.createElement('amp-a4a');
        const a4a = new MockA4AImpl(a4aElement);
        a4a.onLayoutMeasure();
        const layoutCallbackPromise = a4a.layoutCallback();
        rejectXhr(new Error('XHR Error'));
        return layoutCallbackPromise.then(() => {
          a4a.vsync_.runScheduledTasks_();
          // Verify iframe presence and lack of visibility hidden
          expect(a4aElement.children.length).to.equal(1);
          const iframe = a4aElement.children[0];
          expect(iframe.tagName).to.equal('IFRAME');
          expect(iframe.src.indexOf('https://test.location.org')).to.equal(0);
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
        const a4aElement = doc.createElement('amp-a4a');
        a4aElement.setAttribute('type', 'adsense');
        const a4a = new AmpA4A(a4aElement);
        a4a.preconnectCallback(false);
        const preconnects = doc.querySelectorAll('link[rel=preconnect]');
        expect(preconnects.length).to.not.equal(0);
        expect(preconnects[0].getAttribute('href')).to
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
        cssReplacementRanges: [[123, 456], [789, 987]],
        bodyAttributes: 'style=\'border:1;display:block\'',
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {href: 'https://fonts.com/css?helloworld'},
        ],
      });
      const expected = {
        bodyUtf16CharOffsets: [1393, 1860],
        cssUtf16CharOffsets: [135, 579],
        cssReplacementRanges: [[123, 456], [789, 987]],
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
        const a4aElement = doc.createElement('amp-a4a');
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
        const a4aElement = doc.createElement('amp-a4a');
        doc.body.appendChild(a4aElement);
        const a4a = new AmpA4A(a4aElement);
        a4a.adUrl_ = 'https://nowhere.org';
        const bytes = buildCreativeArrayBuffer();
        return a4a.maybeRenderAmpAd_(bytes).then(rendered => {
          // Force vsync system to run all queued tasks, so that DOM mutations
          // are actually completed before testing.
          a4a.vsync_.runScheduledTasks_();
          expect(a4aElement.shadowRoot).to.not.be.null;
          expect(rendered).to.be.true;
          const root = a4aElement.shadowRoot;
          expect(root.querySelector('style[amp-runtime]')).to.be.ok;
          const styles = root.querySelectorAll('style[amp-custom]');
          expect(Array.prototype.some.call(styles,
              s => { return s.innerHTML == 'p { background: green }'; }),
              'Some style is "background: green"').to.be.true;
          const adBody = root.querySelector('amp-ad-body');
          expect(adBody).to.be.ok;
          expect(adBody.innerHTML).to.equal('<p>some text</p>');
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

    it('can rewrite CSS text blob', () => {
      const creative = 'body { color: purple }';
      const metaData = {
        cssUtf16CharOffsets: [0, creative.length],
        cssReplacementRanges: [[0, 4]],
      };
      expect(AmpA4A.prototype.formatCSSBlock_(creative, metaData)).to.equal(
        'amp-ad-body { color: purple }');
    });

    it('should rewrite CSS from validCSSAmp', () => {
      const metaData = AmpA4A.prototype.getAmpAdMetadata_(
          validCSSAmp.reserialized);
      expect(AmpA4A.prototype.formatCSSBlock_(validCSSAmp.reserialized,
                                              metaData))
        .to.equal(expectations.validCssDocCssBlockFormatted);
    });
  });

  describe('#relocateFonts_', () => {
    it('should be a no-op when there are no style sheets', () => {
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const metaData = {};
        const a4a = new AmpA4A(doc.createElement('amp-a4a'));
        a4a.relocateFonts_(metaData);
        const hc = doc.head.children;
        for (let i = 0; i < hc.length; i++) {
          const child = hc[i];
          expect(child.tagName).to.not.equal('LINK');
        }
      });
    });

    it('should create head tags with attributes', () => {
      return createAdTestingIframePromise().then(fixture => {
        const doc = fixture.doc;
        const metaData = {
          customStylesheets: [
            {
              href: 'https://fonts.googleapis.com/css?family=Foo',
            },
            {
              href: 'https://fonts.googleapis.com/css?family=Bar',
              media: 'print',
            },
          ],
        };
        const a4a = new AmpA4A(doc.createElement('amp-a4a'));
        a4a.relocateFonts_(metaData);
        const hc = doc.head.children;
        const foundStyles = [false, false];
        for (let i = 0; i < hc.length; i++) {
          const child = hc[i];
          if (child.tagName === 'LINK' && child.hasAttribute('href') &&
              child.getAttribute('href') ===
              'https://fonts.googleapis.com/css?family=Foo') {
            foundStyles[0] = true;
          }
          if (child.tagName === 'LINK' && child.hasAttribute('href') &&
              child.getAttribute('href') ===
              'https://fonts.googleapis.com/css?family=Bar' &&
              child.hasAttribute('media') &&
              child.getAttribute('media') === 'print') {
            foundStyles[1] = true;
          }
        }
        expect(foundStyles[0], 'Doc has font Foo').to.be.true;
        expect(foundStyles[1], 'Doc has font Bar with media: print').to.be.true;
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
          const a4aElement = doc.createElement('amp-a4a');
          a4aElement.setAttribute('width', 200);
          a4aElement.setAttribute('height', 50);
          a4aElement.setAttribute('type', 'adsense');
          doc.body.appendChild(a4aElement);
          const a4a = new MockA4AImpl(a4aElement);
          viewerForMock.returns(Promise.resolve());
          xhrMock.returns(Promise.resolve(mockResponse));
          a4a.onLayoutMeasure();
          expect(a4a.adPromise_).to.not.be.null;
          return a4a.adPromise_.then(() => {
            // Force vsync system to run all queued tasks, so that DOM mutations
            // are actually completed before testing.
            a4a.vsync_.runScheduledTasks_();
            expect(a4a.element.shadowRoot, 'shadowRoot').to.not.be.null;
            expect(a4a.element.shadowRoot.children.length, 'children count')
                .to.not.equal(0);
            a4a.unlayoutCallback();
            a4a.vsync_.runScheduledTasks_();
            expect(a4a.adPromise_).to.be.null;
            expect(a4a.element.shadowRoot.children.length).to.equal(0);
            // call onLayoutMeasure again and verify shadowRoot has children.
            a4a.onLayoutMeasure();
            expect(a4a.adPromise_).to.not.be.null;
            return a4a.adPromise_.then(() => {
              a4a.vsync_.runScheduledTasks_();
              expect(a4a.element.shadowRoot.children.length).to.not.equal(0);
            });
          });
        });
      });
      it('verify cancelled promise', () => {
        return createAdTestingIframePromise().then(fixture => {
          let whenFirstVisibleResolve = null;
          viewerForMock.returns(new Promise(resolve => {
            whenFirstVisibleResolve = resolve;
          }));
          const doc = fixture.doc;
          const a4aElement = doc.createElement('amp-a4a');
          a4aElement.setAttribute('width', 200);
          a4aElement.setAttribute('height', 50);
          a4aElement.setAttribute('type', 'adsense');
          const a4a = new MockA4AImpl(a4aElement);
          const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
          a4a.onLayoutMeasure();
          const adPromise = a4a.adPromise_;
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
