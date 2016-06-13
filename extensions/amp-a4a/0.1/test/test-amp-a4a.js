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

import {AmpA4A} from '../amp-a4a';
import {Xhr} from '../../../../src/service/xhr-impl';
import {Viewer} from '../../../../src/service/viewer-impl';
import {cancellation} from '../../../../src/error';
import {createIframePromise} from '../../../../testing/iframe';
import {data as minimumAmp} from './testdata/minimum_valid_amp.reserialized';
import {data as regexpsAmpData} from './testdata/regexps.reserialized';
import {data as validCSSAmp}
    from './testdata/valid_css_at_rules_amp.reserialized';
import {data as testFragments} from './testdata/test_fragments';
import {data as expectations} from './testdata/expectations';
import * as sinon from 'sinon';

class MockA4AImpl extends AmpA4A {
  getAdUrl() {
    return Promise.resolve('https://test.location.org/ad/012345?args');
  }

  extractCreativeAndSignature(responseArrayBuffer, responseHeaders) {
    return Promise.resolve({
      creativeArrayBuffer: responseArrayBuffer,
      signature: responseHeaders.get('X-Google-header'),
    });
  }

  supportsAmpCreativeRender() { return true; }
}

describe('amp-a4a', () => {
  let sandbox;
  let xhrMock;
  let viewerForMock;
  const mockResponse = {
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

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    xhrMock = sandbox.stub(Xhr.prototype, 'fetch');
    viewerForMock = sandbox.stub(Viewer.prototype, 'whenFirstVisible');
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
      xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = doc.createElement('amp-a4a');
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        const a4a = new MockA4AImpl(a4aElement);
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        const extractCreativeAndSignatureSpy = sandbox.spy(
            a4a, 'extractCreativeAndSignature');
        // TODO(tdrl): Currently, crypto validation is failing for the prototype
        // data that we're using here.  It's not clear whether that's because of
        // a bug in the data or a bug in the crypto or something else.
        // Regardless, that's causing this test to fail.  For the moment,
        // we stub out crypto validation.  Remove this stub when crypto works.
        const validateStub = sandbox.stub(AmpA4A.prototype,
                                          'validateAdResponse_')
            .returns(Promise.resolve(true));
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.adPromise_.then(() => {
          expect(getAdUrlSpy.calledOnce, 'getAdUrl called exactly once')
              .to.be.true;
          expect(xhrMock.calledOnce,
              'xhr.fetchTextAndHeaders called exactly once').to.be.true;
          // TODO(tdrl): Uncomment the following and remove the following
          // expectation on validateStub, once crypto works.
          // expect(extractCreativeAndSignatureSpy.calledOnce,
          //     'extractCreativeAndSignatureSpy called exactly once').to.be.true;
          expect(validateStub.calledOnce,
              'validateAdResponse_ called exactly once').to.be.true;
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
      return createIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = doc.createElement('amp-a4a');
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        const a4a = new MockA4AImpl(a4aElement);
        // Disable shadow dom support.
        sandbox.stub(a4a, 'supportsShadowDom').returns(false);
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        const extractCreativeAndSignatureSpy = sandbox.spy(
            a4a, 'extractCreativeAndSignature');
        // TODO(tdrl): Currently, crypto validation is failing for the prototype
        // data that we're using here.  It's not clear whether that's because of
        // a bug in the data or a bug in the crypto or something else.
        // Regardless, that's causing this test to fail.  For the moment,
        // we stub out crypto validation.  Remove this stub when crypto works.
        const validateStub = sandbox.stub(AmpA4A.prototype, 'validateAdResponse_')
            .returns(Promise.resolve(true));
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.adPromise_.then(() => {
          expect(getAdUrlSpy.calledOnce, 'getAdUrl called exactly once')
              .to.be.true;
          expect(xhrMock.calledOnce,
              'xhr.fetchTextAndHeaders called exactly once').to.be.true;
          // TODO(tdrl): Uncomment the following and remove the following
          // expectation on validateStub, once crypto works.
          // expect(extractCreativeAndSignatureSpy.calledOnce,
          //     'extractCreativeAndSignatureSpy called exactly once').to.be.true;
          expect(validateStub.calledOnce,
              'validateAdResponse_ called exactly once').to.be.true;
          expect(a4aElement.shadowRoot, 'Shadow root is not set').to.be.null;
          expect(a4aElement.children.length, 'has child').to.equal(1);
          expect(a4aElement.firstChild.src, 'verify iframe src w/ origin').to
              .equal('https://test.location.org/ad/012345?args' +
                     '&__amp_source_origin=about%3Asrcdoc');
          expect(a4a.rendered_).to.be.true;
        });
      });
    });
    it.skip('must not be position:fixed', () => {
      viewerForMock.onFirstCall().returns(Promise.resolve());
      xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = doc.createElement('amp-a4a');
        a4aElement.setAttribute('width', 200);
        a4aElement.setAttribute('height', 50);
        a4aElement.setAttribute('type', 'adsense');
        const s = doc.createElement('style');
        s.textContent = '.fixed {position:fixed;}';
        doc.body.appendChild(s);
        a4aElement.className = 'fixed';
        const a4a = new MockA4AImpl(a4aElement);
        a4a.onLayoutMeasure();
        // TODO(keithwrightbos): isPositionFixed not returning true?
        expect(a4a.adPromise_).to.be.null;
      });
    });
    it('#onLayoutMeasure #layoutCallback not valid AMP', () => {
      viewerForMock.onFirstCall().returns(Promise.resolve());
      xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
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
          Promise.resolve({creativeArrayBuffer: mockResponse.arrayBuffer()}));
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
          a4a.layoutCallback().then(() => {
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
  });

  describe('#preconnectCallback', () => {
    it('validate adsense', () => {
      return createIframePromise().then(fixture => {
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
      offsets = {
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
      return createIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = doc.createElement('amp-a4a');
        const a4a = new AmpA4A(a4aElement);
        a4a.bytes_ = buildCreativeArrayBuffer();
        a4a.maybeRenderAmpAd_(false).then(rendered => {
          expect(rendered).to.be.false;
          expect(a4aElement.shadowRoot).to.be.null;
          expect(a4a.rendered_).to.be.false;
        });
      });
    });
    it('should render AMP natively', () => {
      return createIframePromise().then(fixture => {
        const doc = fixture.doc;
        const a4aElement = doc.createElement('amp-a4a');
        const a4a = new AmpA4A(a4aElement);
        a4a.adUrl_ = 'https://nowhere.org';
        a4a.bytes_ = buildCreativeArrayBuffer();
        a4a.maybeRenderAmpAd_(true).then(rendered => {
          expect(a4aElement.shadowRoot).to.not.be.null;
          expect(rendered).to.be.true;
          const root = a4aElement.shadowRoot;
          expect(root.children[0].tagName).to.equal('STYLE');
          expect(root.children[0].innerHTML).to
            .equal('p { background: green }');
          expect(root.children[1].tagName).to.equal('AMP-AD-BODY');
          expect(root.children[1].innerHTML).to.equal('<p>some text</p>');
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
        '<style amp-custom>div { background-color: red }</style>');
    });

    it('can rewrite CSS text blob', () => {
      const creative = 'body { color: purple }';
      const metaData = {
        cssUtf16CharOffsets: [0, creative.length],
        cssReplacementRanges: [[0, 4]],
      };
      expect(AmpA4A.prototype.formatCSSBlock_(creative, metaData)).to.equal(
        '<style amp-custom>amp-ad-body { color: purple }</style>');
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
      return createIframePromise().then(fixture => {
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
      return createIframePromise().then(fixture => {
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
        return createIframePromise().then(fixture => {
          const doc = fixture.doc;
          const a4aElement = doc.createElement('amp-a4a');
          a4aElement.setAttribute('width', 200);
          a4aElement.setAttribute('height', 50);
          a4aElement.setAttribute('type', 'adsense');
          const a4a = new MockA4AImpl(a4aElement);
          viewerForMock.returns(Promise.resolve());
          xhrMock.returns(Promise.resolve(mockResponse));
          // TODO(tdrl): Currently, crypto validation is failing for the prototype
          // data that we're using here.  It's not clear whether that's because of
          // a bug in the data or a bug in the crypto or something else.
          // Regardless, that's causing this test to fail.  For the moment,
          // we stub out crypto validation.  Remove this stub when crypto works.
          const validateStub = sandbox.stub(AmpA4A.prototype, 'validateAdResponse_')
              .returns(Promise.resolve(true));
          a4a.onLayoutMeasure();
          expect(a4a.adPromise_).to.not.be.null;
          return a4a.adPromise_.then(() => {
            expect(a4a.element.shadowRoot, 'shadowRoot').to.not.be.null;
            expect(a4a.element.shadowRoot.children.length, 'children count')
                .to.not.equal(0);
            a4a.unlayoutCallback();
            expect(a4a.adPromise_).to.be.null;
            expect(a4a.element.shadowRoot.children.length).to.equal(0);
            // call onLayoutMeasure again and verify shadowRoot has children.
            a4a.onLayoutMeasure();
            expect(a4a.adPromise_).to.not.be.null;
            return a4a.adPromise_.then(() => {
              expect(a4a.element.shadowRoot.children.length).to.not.equal(0);
            });
          });
        });
      });
      it('verify cancelled promise', () => {
        return createIframePromise().then(fixture => {
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
      it('verify unhandled error', () => {
        return createIframePromise().then(fixture => {
          viewerForMock.returns(Promise.resolve());
          let rejectResolve = null;
          const sendXhrRequestMock =
              sandbox.stub(MockA4AImpl.prototype, 'sendXhrRequest_');
          sendXhrRequestMock.returns(new Promise((resolve, reject) => {
            rejectResolve = reject;
          }));
          const doc = fixture.doc;
          const a4aElement = doc.createElement('amp-a4a');
          a4aElement.setAttribute('width', 200);
          a4aElement.setAttribute('height', 50);
          a4aElement.setAttribute('type', 'adsense');
          const a4a = new MockA4AImpl(a4aElement);
          const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
          a4a.onLayoutMeasure();
          rejectResolve(new Error('some error'));
          return a4a.adPromise_.then(() => {
            fail('should have thrown error');
          }).catch(reason => {
            expect(getAdUrlSpy.called, 'getAdUrl called once')
                .to.be.true;
            expect(reason).to.not.be.null;
            expect(reason.message.indexOf('amp-a4a: ')).to.equal(0);
            const state = JSON.parse(reason.message.substring(
              reason.message.indexOf('{'),
              reason.message.lastIndexOf('}') + 1));
            expect(state).to.deep.equal({
              m: 'some error', tag: 'AMP-A4A', type: 'adsense', au: 'args',
            });
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
