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

import {AmpAd} from '../../../amp-ad/0.1/amp-ad';
import {
  AmpA4A,
  CREATIVE_SIZE_HEADER,
} from '../../../amp-a4a/0.1/amp-a4a';
import {
  AMP_SIGNATURE_HEADER,
  signatureVerifierFor,
} from '../../../amp-a4a/0.1/legacy-signature-verifier';
import {createIframePromise} from '../../../../testing/iframe';
import {
  installExtensionsService,
} from '../../../../src/service/extensions-impl';
import {Services} from '../../../../src/services';
import {
  AmpAdNetworkDoubleclickImpl,
  getNetworkId,
  CORRELATOR_CLEAR_EXP_BRANCHES,
  CORRELATOR_CLEAR_EXP_NAME,
} from '../amp-ad-network-doubleclick-impl';
import {
  DOUBLECLICK_A4A_EXPERIMENT_NAME,
  DOUBLECLICK_EXPERIMENT_FEATURE,
} from '../doubleclick-a4a-config';
import {
  isInExperiment,
} from '../../../../ads/google/a4a/traffic-experiments';
import {
  QQID_HEADER,
} from '../../../../ads/google/a4a/utils';
import {createElementWithAttributes} from '../../../../src/dom';
import {
  toggleExperiment,
  forceExperimentBranch,
} from '../../../../src/experiments';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {Xhr} from '../../../../src/service/xhr-impl';
import {VisibilityState} from '../../../../src/visibility-state';
import * as sinon from 'sinon';

function setupForAdTesting(fixture) {
  installDocService(fixture.win, /* isSingleDoc */ true);
  const doc = fixture.doc;
  doc.win = fixture.win;
  // TODO(a4a-cam@): This is necessary in the short term, until A4A is
  // smarter about host document styling.  The issue is that it needs to
  // inherit the AMP runtime style element in order for shadow DOM-enclosed
  // elements to behave properly.  So we have to set up a minimal one here.
  const ampStyle = doc.createElement('style');
  ampStyle.setAttribute('amp-runtime', 'scratch-fortesting');
  doc.head.appendChild(ampStyle);
}

describes.sandboxed('amp-ad-network-doubleclick-impl', {}, () => {
  let impl;
  let element;

  /**
   * Creates an iframe promise, and instantiates element and impl, adding the
   * former to the document of the iframe.
   * @param {{width, height, type}} config
   * @return The iframe promise.
   */
  function createImplTag(config) {
    config.type = 'doubleclick';
    return createIframePromise().then(fixture => {
      setupForAdTesting(fixture);
      element = createElementWithAttributes(fixture.doc, 'amp-ad', config);
      // To trigger CSS styling.
      element.setAttribute('data-a4a-upgrade-type',
          'amp-ad-network-doubleclick-impl');
      // Used to test styling which is targetted at first iframe child of
      // amp-ad.
      const iframe = fixture.doc.createElement('iframe');
      element.appendChild(iframe);
      document.body.appendChild(element);
      impl = new AmpAdNetworkDoubleclickImpl(element);
      impl.iframe = iframe;
      return fixture;
    });
  }


  describe('#isValidElement', () => {
    beforeEach(() => {
      element = document.createElement('amp-ad');
      element.setAttribute('type', 'doubleclick');
      element.setAttribute('data-ad-client', 'adsense');
      document.body.appendChild(element);
      impl = new AmpAdNetworkDoubleclickImpl(element);
    });

    it('should be valid', () => {
      expect(impl.isValidElement()).to.be.true;
    });
    it('should NOT be valid (impl tag name)', () => {
      element =
        document.createElement('amp-ad-network-doubleclick-impl');
      element.setAttribute('type', 'doubleclick');
      element.setAttribute('data-ad-client', 'doubleclick');
      impl = new AmpAdNetworkDoubleclickImpl(element);
      expect(impl.isValidElement()).to.be.false;
    });
    it.skip('should be NOT valid (missing ad client)', () => {
      // TODO(taymonbeal): reenable this test after clarifying validation
      element.setAttribute('data-ad-client', '');
      element.setAttribute('type', 'doubleclick');
      expect(impl.isValidElement()).to.be.false;
    });
    it('should be valid (amp-embed)', () => {
      element = document.createElement('amp-embed');
      element.setAttribute('type', 'doubleclick');
      element.setAttribute('data-ad-client', 'doubleclick');
      impl = new AmpAdNetworkDoubleclickImpl(element);
      expect(impl.isValidElement()).to.be.true;
    });
  });

  describe('#extractSize', () => {
    let loadExtensionSpy;
    const size = {width: 200, height: 50};

    beforeEach(() => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        doc.win = window;
        element = createElementWithAttributes(doc, 'amp-ad', {
          'width': '200',
          'height': '50',
          'type': 'doubleclick',
          'layout': 'fixed',
        });
        impl = new AmpAdNetworkDoubleclickImpl(element);
        impl.size_ = size;
        installExtensionsService(impl.win);
        const extensions = Services.extensionsFor(impl.win);
        loadExtensionSpy = sandbox.spy(extensions, 'loadExtension');
      });
    });

    it('should not load amp-analytics without an analytics header', () => {
      expect(impl.extractSize({
        get() {
          return undefined;
        },
        has() {
          return false;
        },
      })).to.deep.equal(size);
      expect(loadExtensionSpy.withArgs('amp-analytics')).to.not.be.called;
    });
    it('should load amp-analytics with an analytics header', () => {
      const url = ['https://foo.com?a=b', 'https://blah.com?lsk=sdk&sld=vj'];
      expect(impl.extractSize({
        get(name) {
          switch (name) {
            case 'X-AmpAnalytics':
              return JSON.stringify({url});
            default:
              return undefined;
          }
        },
        has(name) {
          return !!this.get(name);
        },
      })).to.deep.equal(size);
      expect(loadExtensionSpy.withArgs('amp-analytics')).to.be.called;
      // exact value of ampAnalyticsConfig covered in
      // ads/google/test/test-utils.js
    });
  });

  describe('#onNetworkFailure', () => {

    beforeEach(() => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        doc.win = window;
        element = createElementWithAttributes(doc, 'amp-ad', {
          'width': '200',
          'height': '50',
          'type': 'doubleclick',
        });
        impl = new AmpAdNetworkDoubleclickImpl(element);
      });
    });

    it('should append error parameter', () => {
      const TEST_URL = 'https://somenetwork.com/foo?hello=world&a=b';
      expect(impl.onNetworkFailure(new Error('xhr failure'), TEST_URL))
          .to.jsonEqual({adUrl: TEST_URL + '&aet=n'});
    });
  });

  describe('#onCreativeRender', () => {
    beforeEach(() => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        doc.win = window;
        element = createElementWithAttributes(doc, 'amp-ad', {
          'width': '200',
          'height': '50',
          'type': 'doubleclick',
        });
        impl = new AmpAdNetworkDoubleclickImpl(element);
        // Next two lines are to ensure that internal parts not relevant for this
        // test are properly set.
        impl.size_ = {width: 200, height: 50};
        impl.iframe = impl.win.document.createElement('iframe');
        installExtensionsService(impl.win);
        // Temporary fix for local test failure.
        sandbox.stub(impl,
            'getIntersectionElementLayoutBox', () => {
              return {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                width: 320,
                height: 50,
              };
            });
      });
    });

    it('injects amp analytics', () => {
      impl.ampAnalyticsConfig_ = {
        transport: {beacon: false, xhrpost: false},
        requests: {
          visibility1: 'https://foo.com?hello=world',
          visibility2: 'https://bar.com?a=b',
        },
        triggers: {
          continuousVisible: {
            on: 'visible',
            request: ['visibility1', 'visibility2'],
            visibilitySpec: {
              selector: 'amp-ad',
              selectionMethod: 'closest',
              visiblePercentageMin: 50,
              continuousTimeMin: 1000,
            },
          },
          continuousVisibleIniLoad: {
            on: 'ini-load',
            selector: 'amp-ad',
            selectionMethod: 'closest',
          },
          continuousVisibleRenderStart: {
            on: 'render-start',
            selector: 'amp-ad',
            selectionMethod: 'closest',
          },
        },
      };      // To placate assertion.
      impl.responseHeaders_ = {
        get: function(name) {
          if (name == 'X-QQID') {
            return 'qqid_string';
          }
        },
        has: function(name) {
          if (name == 'X-QQID') {
            return true;
          }
        },
      };
      impl.onCreativeRender(false);
      const ampAnalyticsElement = impl.element.querySelector('amp-analytics');
      expect(ampAnalyticsElement).to.be.ok;
      expect(ampAnalyticsElement.CONFIG).jsonEqual(impl.ampAnalyticsConfig_);
      expect(ampAnalyticsElement.getAttribute('sandbox')).to.equal('true');
      expect(impl.ampAnalyticsElement_).to.be.ok;
      // Exact format of amp-analytics element covered in
      // test/functional/test-analytics.js.
      // Just ensure extensions is loaded, and analytics element appended.
    });
  });

  describe('centering', () => {
    const size = {width: '300px', height: '150px'};

    function verifyCss(iframe, expectedSize) {
      expect(iframe).to.be.ok;
      const style = window.getComputedStyle(iframe);
      expect(style.top).to.equal('50%');
      expect(style.left).to.equal('50%');
      expect(style.width).to.equal(expectedSize.width);
      expect(style.height).to.equal(expectedSize.height);
      // We don't know the exact values by which the frame will be translated,
      // as this can vary depending on whether we use the height/width
      // attributes, or the actual size of the frame. To make this less of a
      // hassle, we'll just match against regexp.
      expect(style.transform).to.match(new RegExp(
          'matrix\\(1, 0, 0, 1, -[0-9]+, -[0-9]+\\)'));
    }

    afterEach(() => document.body.removeChild(impl.element));

    it('centers iframe in slot when height && width', () => {
      return createImplTag({
        width: '300',
        height: '150',
      }).then(() => {
        expect(impl.element.getAttribute('width')).to.equal('300');
        expect(impl.element.getAttribute('height')).to.equal('150');
        verifyCss(impl.iframe, size);
      });
    });
    it('centers iframe in slot when !height && !width', () => {
      return createImplTag({
        layout: 'fixed',
      }).then(() => {
        expect(impl.element.getAttribute('width')).to.be.null;
        expect(impl.element.getAttribute('height')).to.be.null;
        verifyCss(impl.iframe, size);
      });
    });
    it('centers iframe in slot when !height && width', () => {
      return createImplTag({
        width: '300',
        layout: 'fixed',
      }).then(() => {
        expect(impl.element.getAttribute('width')).to.equal('300');
        expect(impl.element.getAttribute('height')).to.be.null;
        verifyCss(impl.iframe, size);
      });
    });
    it('centers iframe in slot when height && !width', () => {
      return createImplTag({
        height: '150',
        layout: 'fixed',
      }).then(() => {
        expect(impl.element.getAttribute('width')).to.be.null;
        expect(impl.element.getAttribute('height')).to.equal('150');
        verifyCss(impl.iframe, size);
      });
    });
  });

  describe('#getAdUrl', () => {
    beforeEach(() => {
      const sandbox = sinon.sandbox.create();
      element = document.createElement('amp-ad');
      element.setAttribute('type', 'doubleclick');
      element.setAttribute('data-ad-client', 'doubleclick');
      element.setAttribute('width', '320');
      element.setAttribute('height', '50');
      document.body.appendChild(element);
      impl = new AmpAdNetworkDoubleclickImpl(element);
      // Temporary fix for local test failure.
      sandbox.stub(impl,
          'getIntersectionElementLayoutBox', () => {
            return {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              width: 320,
              height: 50,
            };
          });

      sandbox.stub(impl, 'getAmpDoc', () => {
        document.win = window;
        return document;
      });
      // Reproduced from noopMethods in ads/google/a4a/test/test-utils.js,
      // to fix failures when this is run after 'gulp build', without a 'dist'.
      sandbox.stub(impl, 'getPageLayoutBox', () => {
        return {
          top: 11, left: 12, right: 0, bottom: 0, width: 0, height: 0,
        };
      });
    });

    afterEach(() => {
      toggleExperiment(window, 'dc-use-attr-for-format', false);
      document.body.removeChild(element);
      window['ampAdGoogleIfiCounter'] = 0;
    });

    it('returns the right URL', () => {
      new AmpAd(element).upgradeCallback();
      return impl.getAdUrl().then(url => {
        [
          /^https:\/\/securepubads\.g\.doubleclick\.net\/gampad\/ads/,
          /(\?|&)adk=\d+(&|$)/,
          /(\?|&)gdfp_req=1(&|$)/,
          /(\?|&)impl=ifr(&|$)/,
          /(\?|&)sfv=\d+-\d+-\d+(&|$)/,
          /(\?|&)sz=320x50(&|$)/,
          /(\?|&)u_sd=[0-9]+(&|$)/,
          /(\?|&)is_amp=3(&|$)/,
          /(\?|&)amp_v=%24internalRuntimeVersion%24(&|$)/,
          /(\?|&)d_imp=1(&|$)/,
          /(\?|&)dt=[0-9]+(&|$)/,
          /(\?|&)ifi=[0-9]+(&|$)/,
          /(\?|&)adf=[0-9]+(&|$)/,
          /(\?|&)c=[0-9]+(&|$)/,
          /(\?|&)output=html(&|$)/,
          /(\?|&)nhd=1(&|$)/,
          /(\?|&)biw=[0-9]+(&|$)/,
          /(\?|&)bih=[0-9]+(&|$)/,
          /(\?|&)adx=-?[0-9]+(&|$)/,
          /(\?|&)ady=-?[0-9]+(&|$)/,
          /(\?|&)u_aw=[0-9]+(&|$)/,
          /(\?|&)u_ah=[0-9]+(&|$)/,
          /(\?|&)u_cd=24(&|$)/,
          /(\?|&)u_w=[0-9]+(&|$)/,
          /(\?|&)u_h=[0-9]+(&|$)/,
          /(\?|&)u_tz=-?[0-9]+(&|$)/,
          /(\?|&)u_his=[0-9]+(&|$)/,
          /(\?|&)oid=2(&|$)/,
          /(\?|&)isw=[0-9]+(&|$)/,
          /(\?|&)ish=[0-9]+(&|$)/,
          /(\?|&)pfx=(1|0)(&|$)/,
          /(\?|&)eid=([^&]+%2c)*108809080(%2c[^&]+)*(&|$)/,
          /(\?|&)url=https?%3A%2F%2F[a-zA-Z0-9.:%]+(&|$)/,
          /(\?|&)top=localhost(&|$)/,
          /(\?|&)ref=https?%3A%2F%2Flocalhost%3A9876%2F%3Fid%3D[0-9]+(&|$)/,
          /(\?|&)dtd=[0-9]+(&|$)/,
        ].forEach(regexp => expect(url).to.match(regexp));
      });
    });

    it('handles tagForChildDirectedTreatment', () => {
      element.setAttribute('json', '{"tagForChildDirectedTreatment": 1}');
      new AmpAd(element).upgradeCallback();
      return impl.getAdUrl().then(url => {
        expect(url).to.match(/&tfcd=1&/);
      });
    });

    it('handles categoryExclusions without targeting', () => {
      element.setAttribute('json', '{"categoryExclusions": "sports"}');
      new AmpAd(element).upgradeCallback();
      return impl.getAdUrl().then(url => {
        expect(url).to.match(/&scp=excl_cat%3Dsports&/);
      });
    });

    it('has correct format when height == "auto"', () => {
      element.setAttribute('height', 'auto');
      new AmpAd(element).upgradeCallback();
      expect(impl.element.getAttribute('height')).to.equal('auto');
      impl.onLayoutMeasure();
      return impl.getAdUrl().then(url =>
        // With exp dc-use-attr-for-format off, we can't test for specific
        // numbers, but we know that the values should be numeric.
        expect(url).to.match(/sz=[0-9]+x[0-9]+/));
    });
    it('has correct format when width == "auto"',
        () => {
          element.setAttribute('width', 'auto');
          new AmpAd(element).upgradeCallback();
          expect(impl.element.getAttribute('width')).to.equal('auto');
          impl.onLayoutMeasure();
          return impl.getAdUrl().then(url =>
              // Ensure that "auto" doesn't appear anywhere here:
              expect(url).to.match(/sz=[0-9]+x[0-9]+/));
        });
    it('should add RTC params if RTC is used', () => {
      const rtcConf = createElementWithAttributes(
          document, 'script',
          {type: 'application/json', id: 'amp-rtc'});
      rtcConf.innerHTML = `{
          "endpoint": "https://example-publisher.com/rtc/",
          "sendAdRequestOnFailure": false
          }`;
      document.head.appendChild(rtcConf);
      const rtcResponse = {targeting: {age: '18-24'}};
      const xhrMock = sandbox.stub(Xhr.prototype, 'fetchJson');
      xhrMock.returns(
          Promise.resolve({
            redirected: false,
            status: 200,
            text: () => {
              return Promise.resolve(JSON.stringify(rtcResponse));
            },
          })
      );
      new AmpAd(element).upgradeCallback();
      return impl.getAdUrl().then(url => {
        expect(url).to.match(/(\?|&)artc=[0-9]+(&|$)/);
        expect(url).to.match(
            /(\?|&)ard=example-publisher.com/);
        expect(url).to.match(/(\?|&)ati=2(&|$)/);
      });

    });
    it('should add param artc=-1 if RTC request times out', () => {
      const rtcConf = createElementWithAttributes(
          document, 'script',
          {type: 'application/json', id: 'amp-rtc'});
      rtcConf.innerHTML = `{
          "endpoint": "https://example-publisher.com/rtc/",
          "sendAdRequestOnFailure": false
          }`;
      document.head.appendChild(rtcConf);
      const xhrMock = sandbox.stub(Xhr.prototype, 'fetchJson');
      // never resolve this promise
      const xhrResponse = new Promise(() => {});
      xhrMock.returns(xhrResponse);
      new AmpAd(element).upgradeCallback();
      return impl.getAdUrl().catch(err => {
        expect(err.message.match(/^timeout.*/)).to.be.ok;
      });

    });
    it('has correct format with height/width override',
        () => {
          element.setAttribute('data-override-width', '123');
          element.setAttribute('data-override-height', '456');
          new AmpAd(element).upgradeCallback();
          impl.onLayoutMeasure();
          return impl.getAdUrl().then(url =>
              expect(url).to.contain('sz=123x456&'));
        });
    it('has correct format with height/width override and multiSize',
        () => {
          element.setAttribute('data-override-width', '123');
          element.setAttribute('data-override-height', '456');
          element.setAttribute('data-multi-size', '1x2,3x4');
          element.setAttribute('data-multi-size-validation', 'false');
          new AmpAd(element).upgradeCallback();
          impl.onLayoutMeasure();
          return impl.getAdUrl().then(url =>
              expect(url).to.contain('sz=123x456%7C1x2%7C3x4&'));
        });
    it('has correct format with auto height/width and multiSize',
        () => {
          element.setAttribute('data-override-width', '123');
          element.setAttribute('data-override-height', '456');
          element.setAttribute('data-multi-size', '1x2,3x4');
          element.setAttribute('data-multi-size-validation', 'false');
          new AmpAd(element).upgradeCallback();
          impl.onLayoutMeasure();
          return impl.getAdUrl().then(url =>
              // Ensure that "auto" doesn't appear anywhere here:
              expect(url).to.match(/sz=[0-9]+x[0-9]+%7C1x2%7C3x4&/));
        });
    it('should have the correct ifi numbers - no refresh', function() {
      // When ran locally, this test tends to exceed 2000ms timeout.
      this.timeout(5000);
      // Reset counter for purpose of this test.
      delete window['ampAdGoogleIfiCounter'];
      new AmpAd(element).upgradeCallback();
      return impl.getAdUrl().then(url1 => {
        expect(url1).to.match(/ifi=1/);
        return impl.getAdUrl().then(url2 => {
          expect(url2).to.match(/ifi=2/);
          return impl.getAdUrl().then(url3 => {
            expect(url3).to.match(/ifi=3/);
          });
        });
      });
    });
    it('has correct rc and ifi after refresh', () => {
      // We don't really care about the behavior of the following methods, so
      // we'll just stub them out so that refresh() can run without tripping any
      // unrelated errors.
      sandbox.stub(AmpA4A.prototype, 'initiateAdRequest',
          () => impl.adPromise_ = Promise.resolve());
      const tearDownSlotMock = sandbox.stub(AmpA4A.prototype, 'tearDownSlot');
      tearDownSlotMock.returns(undefined);
      const destroyFrameMock = sandbox.stub(AmpA4A.prototype, 'destroyFrame');
      destroyFrameMock.returns(undefined);
      impl.mutateElement = func => func();
      impl.togglePlaceholder = sandbox.spy();
      impl.getAmpDoc = () => impl.win.document;
      impl.getResource = () => {
        return {
          layoutCanceled: () => {},
        };
      };
      new AmpAd(element).upgradeCallback();
      return impl.getAdUrl().then(url1 => {
        expect(url1).to.not.match(/(\?|&)rc=[0-9]+(&|$)/);
        expect(url1).to.match(/(\?|&)ifi=1(&|$)/);
        return impl.refresh(() => {}).then(() => {
          return impl.getAdUrl().then(url2 => {
            expect(url2).to.match(/(\?|&)rc=1(&|$)/);
            expect(url1).to.match(/(\?|&)ifi=1(&|$)/);
          });
        });
      });
    });
  });

  describe('#unlayoutCallback', () => {
    it('should call #resetSlot, remove child iframe, but keep other children',
        () => {
          return createImplTag({
            width: '300',
            height: '150',
          }).then(() => {
            impl.buildCallback();
            const slotIdBefore = impl.element.getAttribute(
                'data-amp-slot-index');

            impl.layoutMeasureExecuted_ = true;
            impl.uiHandler = {applyUnlayoutUI: () => {}};
            const placeholder = document.createElement('div');
            placeholder.setAttribute('placeholder', '');
            const fallback = document.createElement('div');
            fallback.setAttribute('fallback', '');
            impl.element.appendChild(placeholder);
            impl.element.appendChild(fallback);
            impl.ampAnalyticsConfig_ = {};
            impl.ampAnalyticsElement_ =
                document.createElement('amp-analytics');
            impl.element.appendChild(impl.ampAnalyticsElement_);

            expect(impl.iframe).to.be.ok;
            expect(impl.ampAnalyticsConfig_).to.be.ok;
            expect(impl.element.querySelector('iframe')).to.be.ok;
            expect(impl.element.querySelector('amp-analytics')).to.be.ok;
            impl.unlayoutCallback();
            expect(impl.element.querySelector('div[placeholder]')).to.be.ok;
            expect(impl.element.querySelector('div[fallback]')).to.be.ok;
            expect(impl.element.querySelector('iframe')).to.be.null;
            expect(impl.element.querySelector('amp-analytics')).to.be.null;
            expect(impl.iframe).to.be.null;
            expect(impl.ampAnalyticsConfig_).to.be.null;
            expect(impl.ampAnalyticsElement_).to.be.null;
            expect(impl.element.getAttribute('data-amp-slot-index')).to
                .equal(String(Number(slotIdBefore) + 1));
          });
        });
  });

  describe('#getNetworkId', () => {
    it('should match expectations', () => {
      element = document.createElement('amp-ad');
      const testValues = {
        '/1234/abc/def': '1234',
        '1234/abc/def': '1234',
        '/a1234/abc/def': '',
        'a1234/abc/def': '',
        '789': '789',
        '//789': '',
      };
      Object.keys(testValues).forEach(slotName => {
        element.setAttribute('data-slot', slotName);
        expect(getNetworkId(element)).to.equal(testValues[slotName]);
      });
    });
  });

  describe('#delayAdRequestEnabled', () => {
    let impl;
    beforeEach(() => {
      return createIframePromise().then(f => {
        setupForAdTesting(f);
        impl = new AmpAdNetworkDoubleclickImpl(
          createElementWithAttributes(f.doc, 'amp-ad', {
            type: 'doubleclick',
          }));
      });
    });

    it('should return true if in experiment', () => {
      forceExperimentBranch(impl.win, DOUBLECLICK_A4A_EXPERIMENT_NAME,
          DOUBLECLICK_EXPERIMENT_FEATURE.DELAYED_REQUEST);
      expect(impl.delayAdRequestEnabled()).to.be.true;
    });

    it('should return false if not in experiment', () => {
      expect(impl.delayAdRequestEnabled()).to.be.false;
    });
  });

  describe('#multi-size', () => {
    const arrayBuffer = () => Promise.resolve({
      byteLength: 256,
    });

    /**
     * Calling this function ensures that the enclosing test will behave as if
     * it has an AMP creative.
     */
    function stubForAmpCreative() {
      sandbox.stub(
          signatureVerifierFor(impl.win), 'verify',
          () => Promise.resolve(null));
    }

    function mockSendXhrRequest() {
      return {
        arrayBuffer,
        headers: {
          get(prop) {
            switch (prop) {
              case QQID_HEADER:
                return 'qqid-header';
              case CREATIVE_SIZE_HEADER:
                return '150x50';
              case AMP_SIGNATURE_HEADER:
                return 'fake-sig';
              default:
                return undefined;
            }
          },
          has(prop) {
            return !!this.get(prop);
          },
        },
      };
    }

    beforeEach(() => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        doc.win = window;
        element = createElementWithAttributes(doc, 'amp-ad', {
          'width': '200',
          'height': '50',
          'type': 'doubleclick',
          'layout': 'fixed',
        });
        doc.body.appendChild(element);

        impl = new AmpAdNetworkDoubleclickImpl(element);
        impl.initialSize_ = {width: 200, height: 50};

        // Boilerplate stubbing
        sandbox.stub(impl, 'shouldInitializePromiseChain_', () => true);
        sandbox.stub(impl, 'getAmpDoc', () => {
          document.win = window;
          return document;
        });
        sandbox.stub(impl, 'getPageLayoutBox', () => {
          return {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: 200,
            height: 50,
          };
        });
        sandbox.stub(impl, 'protectedEmitLifecycleEvent_', () => {});
        sandbox.stub(impl, 'attemptChangeSize', (height, width) => {
          impl.element.setAttribute('height', height);
          impl.element.setAttribute('width', width);
          return Promise.resolve();
        });
        sandbox.stub(impl, 'getAmpAdMetadata_', () => {
          return {
            customElementExtensions: [],
            minifiedCreative: '<html><body>Hello, World!</body></html>',
          };
        });
        sandbox.stub(impl, 'updatePriority', () => {});
      });
    });

    it('amp creative - should force iframe to match size of creative', () => {
      stubForAmpCreative();
      sandbox.stub(impl, 'sendXhrRequest', mockSendXhrRequest);
      impl.onLayoutMeasure();
      return impl.layoutCallback().then(() => {
        const iframe = impl.iframe;
        expect(iframe).to.be.ok;
        expect(iframe.getAttribute('style')).to.match(/width: 150/);
        expect(iframe.getAttribute('style')).to.match(/height: 50/);
      });
    });

    it('should force iframe to match size of creative', () => {
      sandbox.stub(impl, 'sendXhrRequest', mockSendXhrRequest);
      impl.onLayoutMeasure();
      return impl.layoutCallback().then(() => {
        const iframe = impl.iframe;
        expect(iframe).to.be.ok;
        expect(iframe.getAttribute('style')).to.match(/width: 150/);
        expect(iframe.getAttribute('style')).to.match(/height: 50/);
      });
    });

    it('amp creative - should force iframe to match size of slot', () => {
      stubForAmpCreative();
      sandbox.stub(impl, 'sendXhrRequest', () => null);
      sandbox.stub(impl, 'renderViaCachedContentIframe_',
          () => impl.iframeRenderHelper_({src: impl.adUrl_, name: 'name'}));
      // This would normally be set in AmpA4a#buildCallback.
      impl.creativeSize_ = {width: 200, height: 50};
      impl.onLayoutMeasure();
      return impl.layoutCallback().then(() => {
        const iframe = impl.iframe;
        expect(iframe).to.be.ok;
        expect(iframe.getAttribute('style')).to.match(/width: 200/);
        expect(iframe.getAttribute('style')).to.match(/height: 50/);
      });
    });

    it('should force iframe to match size of slot', () => {
      sandbox.stub(impl, 'sendXhrRequest', () => null);
      sandbox.stub(impl, 'renderViaCachedContentIframe_',
          () => impl.iframeRenderHelper_({src: impl.adUrl_, name: 'name'}));
      // This would normally be set in AmpA4a#buildCallback.
      impl.creativeSize_ = {width: 200, height: 50};
      impl.onLayoutMeasure();
      return impl.layoutCallback().then(() => {
        const iframe = impl.iframe;
        expect(iframe).to.be.ok;
        expect(iframe.getAttribute('style')).to.match(/width: 200/);
        expect(iframe.getAttribute('style')).to.match(/height: 50/);
      });
    });

    it('should issue an ad request even with bad multi-size data attr', () => {
      stubForAmpCreative();
      sandbox.stub(impl, 'sendXhrRequest', mockSendXhrRequest);
      impl.element.setAttribute('data-multi-size', '201x50');
      impl.onLayoutMeasure();
      return impl.layoutCallback().then(() => {
        expect(impl.adUrl_).to.be.ok;
        expect(impl.adUrl_.length).to.be.ok;
      });
    });
  });

  describe('#correlator clear experiment', () => {
    let onVisibilityChangedHandler;
    let visabilityState;
    let doc;

    beforeEach(() => {
      onVisibilityChangedHandler = null;
      visabilityState = VisibilityState.PAUSED;
      return createIframePromise().then(fixture => {
        doc = fixture.doc;
        const viewer = {
          isVisible: () => true,
          onVisibilityChanged: handler => {
            onVisibilityChangedHandler = handler;
          },
          getVisibilityState: () => visabilityState,
          whenFirstVisible: () => Promise.resolve(),
        };
        sandbox.stub(Services, 'viewerForDoc').returns(viewer);
        element = createElementWithAttributes(doc, 'amp-ad', {
          type: 'doubleclick',
          height: '250',
          width: '320',
        });
        doc.body.appendChild(element);
        impl = new AmpAdNetworkDoubleclickImpl(element);
        impl.win.ampAdPageCorrelator = 12345;
      });
    });

    it('clears if in experiment', () => {
      forceExperimentBranch(impl.win, CORRELATOR_CLEAR_EXP_NAME,
          CORRELATOR_CLEAR_EXP_BRANCHES.EXPERIMENT);
      impl.buildCallback();
      expect(onVisibilityChangedHandler).to.be.ok;
      onVisibilityChangedHandler();
      expect(impl.win.ampAdPageCorrelator).to.not.be.ok;
      expect(isInExperiment(element, CORRELATOR_CLEAR_EXP_BRANCHES.CONTROL))
          .to.be.false;
      expect(isInExperiment(element, CORRELATOR_CLEAR_EXP_BRANCHES.EXPERIMENT))
          .to.be.true;
    });

    it('does not clear if in control', () => {
      forceExperimentBranch(impl.win, CORRELATOR_CLEAR_EXP_NAME,
          CORRELATOR_CLEAR_EXP_BRANCHES.CONTROL);
      impl.buildCallback();
      expect(onVisibilityChangedHandler).to.be.ok;
      onVisibilityChangedHandler();
      expect(impl.win.ampAdPageCorrelator).to.equal(12345);
      expect(isInExperiment(element, CORRELATOR_CLEAR_EXP_BRANCHES.CONTROL))
          .to.be.true;
      expect(isInExperiment(element, CORRELATOR_CLEAR_EXP_BRANCHES.EXPERIMENT))
          .to.be.false;
    });

    it('does not clear if in neither branch', () => {
      forceExperimentBranch(impl.win, CORRELATOR_CLEAR_EXP_NAME, null);
      impl.buildCallback();
      expect(onVisibilityChangedHandler).to.be.ok;
      onVisibilityChangedHandler();
      expect(impl.win.ampAdPageCorrelator).to.equal(12345);
      expect(isInExperiment(element, CORRELATOR_CLEAR_EXP_BRANCHES.CONTROL))
          .to.be.false;
      expect(isInExperiment(element, CORRELATOR_CLEAR_EXP_BRANCHES.EXPERIMENT))
          .to.be.false;
    });

    it('attempts to select into branch', () => {
      impl.buildCallback();
      expect(onVisibilityChangedHandler).to.be.ok;
      onVisibilityChangedHandler();
      expect(
          impl.win.experimentBranches[CORRELATOR_CLEAR_EXP_NAME] !== undefined);
    });

    it('does not attempt to select into branch if SRA', () => {
      impl.useSra = true;
      impl.buildCallback();
      expect(onVisibilityChangedHandler).to.be.ok;
      onVisibilityChangedHandler();
      expect(impl.win.ampAdPageCorrelator).to.equal(12345);
      expect(
          impl.win.experimentBranches[CORRELATOR_CLEAR_EXP_NAME] === undefined);
    });

    it('does not attempt to select into branch if no correlator', () => {
      impl.win.ampAdPageCorrelator = undefined;
      impl.buildCallback();
      expect(onVisibilityChangedHandler).to.be.ok;
      onVisibilityChangedHandler();
      expect(
          impl.win.experimentBranches[CORRELATOR_CLEAR_EXP_NAME] === undefined);
    });

    it('does not attempt to select into branch if not pause', () => {
      visabilityState = VisibilityState.VISIBLE;
      impl.buildCallback();
      expect(onVisibilityChangedHandler).to.be.ok;
      onVisibilityChangedHandler();
      expect(
          impl.win.experimentBranches[CORRELATOR_CLEAR_EXP_NAME] === undefined);
    });

    it('set experiment for second block', () => {
      forceExperimentBranch(impl.win, CORRELATOR_CLEAR_EXP_NAME,
          CORRELATOR_CLEAR_EXP_BRANCHES.EXPERIMENT);
      impl.buildCallback();
      expect(onVisibilityChangedHandler).to.be.ok;
      onVisibilityChangedHandler();
      expect(isInExperiment(element, CORRELATOR_CLEAR_EXP_BRANCHES.EXPERIMENT))
          .to.be.true;
      onVisibilityChangedHandler = null;
      const elem2 = createElementWithAttributes(doc, 'amp-ad', {
        type: 'doubleclick',
        height: '250',
        width: '320',
      });
      doc.body.appendChild(elem2);
      new AmpAdNetworkDoubleclickImpl(elem2).buildCallback();
      expect(onVisibilityChangedHandler).to.not.be.ok;
      expect(isInExperiment(elem2, CORRELATOR_CLEAR_EXP_BRANCHES.EXPERIMENT))
          .to.be.true;
    });
  });
});
