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
import {AmpAd3PImpl} from '../../../amp-ad/0.1/amp-ad-3p-impl';
import {
  AmpA4A,
  RENDERING_TYPE_HEADER,
  XORIGIN_MODE,
} from '../../../amp-a4a/0.1/amp-a4a';
import {createIframePromise} from '../../../../testing/iframe';
import {
  installExtensionsService,
} from '../../../../src/service/extensions-impl';
import {Services} from '../../../../src/services';
import {
  AmpAdNetworkDoubleclickImpl,
  getNetworkId,
  constructSRABlockParameters,
  TFCD,
  resetSraStateForTesting,
  resetRtcStateForTesting,
} from '../amp-ad-network-doubleclick-impl';
import {
  DOUBLECLICK_A4A_EXPERIMENT_NAME,
  DOUBLECLICK_EXPERIMENT_FEATURE,
} from '../doubleclick-a4a-config';
import {
  MANUAL_EXPERIMENT_ID,
} from '../../../../ads/google/a4a/traffic-experiments';
import {EXPERIMENT_ATTRIBUTE} from '../../../../ads/google/a4a/utils';
import {utf8Encode} from '../../../../src/utils/bytes';
import {BaseElement} from '../../../../src/base-element';
import {createElementWithAttributes} from '../../../../src/dom';
import {
  toggleExperiment,
  forceExperimentBranch,
} from '../../../../src/experiments';
import {layoutRectLtwh} from '../../../../src/layout-rect';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {Xhr, FetchResponseHeaders} from '../../../../src/service/xhr-impl';
import {dev} from '../../../../src/log';
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

  describe('#extractCreativeAndSignature', () => {
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

  describe('#SRA enabled', () => {
    let fixture;

    beforeEach(() => {
      return createIframePromise().then(f => {
        setupForAdTesting(f);
        fixture = f;
      });
    });

    it('should be disabled by default', () => {
      const element = createElementWithAttributes(
          fixture.doc, 'amp-ad', {
            type: 'doubleclick',
            height: 320,
            width: 50,
          });
      fixture.doc.body.appendChild(element);
      const impl = new AmpAdNetworkDoubleclickImpl(element);
      expect(impl.useSra).to.be.false;
    });

    it('should force refresh off when enabled', () => {
      const metaElement = createElementWithAttributes(fixture.doc, 'meta', {
        name: 'amp-ad-doubleclick-sra',
      });
      fixture.doc.head.appendChild(metaElement);
      const element = createElementWithAttributes(
          fixture.doc, 'amp-ad', {
            type: 'doubleclick',
            height: 320,
            width: 50,
          });
      fixture.doc.body.appendChild(element);
      const impl = new AmpAdNetworkDoubleclickImpl(element);
      expect(impl.useSra).to.be.true;
      impl.layoutCallback();
      expect(impl.refreshManager_).to.be.null;
    });

    it('should be enabled if meta tag present', () => {
      const metaElement = createElementWithAttributes(fixture.doc, 'meta', {
        name: 'amp-ad-doubleclick-sra',
      });
      fixture.doc.head.appendChild(metaElement);
      const element = createElementWithAttributes(
          fixture.doc, 'amp-ad', {
            type: 'doubleclick',
            height: 320,
            width: 50,
          });
      fixture.doc.body.appendChild(element);
      const impl = new AmpAdNetworkDoubleclickImpl(element);
      expect(impl.useSra).to.be.true;
    });
  });

  describe('#SRA AMP creative unlayoutCallback', () => {
    let impl;

    beforeEach(() => {
      return createIframePromise().then(f => {
        setupForAdTesting(f);
        const element = createElementWithAttributes(
            f.doc, 'amp-ad', {
              type: 'doubleclick',
              height: 320,
              width: 50,
              'data-a4a-upgrade-type': 'amp-ad-network-doubleclick-impl',
            });
        f.doc.body.appendChild(element);
        const iframe = createElementWithAttributes(
            f.doc, 'iframe', {
              src: 'https://foo.com',
              height: 320,
              width: 50,
            });
        element.appendChild(iframe);
        impl = new AmpAdNetworkDoubleclickImpl(element);
      });
    });

    it('should not remove if not SRA', () => {
      expect(impl.shouldUnlayoutAmpCreatives()).to.be.false;
    });

    it('should remove if SRA and has frame', () => {
      impl.useSra = true;
      expect(impl.shouldUnlayoutAmpCreatives()).to.be.true;
    });
  });

  describe('#constructSRABlockParameters', () => {
    let fixture;

    beforeEach(() => {
      return createIframePromise().then(f => {
        setupForAdTesting(f);
        fixture = f;
      });
    });

    it('should combine for SRA request', () => {
      const targeting1 = {
        cookieOptOut: 1,
        categoryExclusions: 'sports',
        targeting: {foo: 'bar', names: ['x', 'y', 'z']},
      };
      targeting1[TFCD] = 'some_tfcd';
      const config1 = {
        type: 'doubleclick',
        height: 320,
        width: 50,
        'data-slot': '/1234/abc/def',
        'json': JSON.stringify(targeting1),
      };
      const element1 =
        createElementWithAttributes(fixture.doc, 'amp-ad', config1);
      const impl1 = new AmpAdNetworkDoubleclickImpl(element1);
      element1.setAttribute(EXPERIMENT_ATTRIBUTE, MANUAL_EXPERIMENT_ID);
      sandbox.stub(impl1, 'generateAdKey_').withArgs('50x320').returns('13579');
      impl1.populateAdUrlState();
      const targeting2 = {
        cookieOptOut: 1,
        categoryExclusions: 'food',
        targeting: {hello: 'world'},
      };
      targeting2[TFCD] = 'some_other_tfcd';
      const config2 = {
        type: 'doubleclick',
        height: 300,
        width: 250,
        'data-slot': '/1234/def/xyz',
        'json': JSON.stringify(targeting2),
      };
      const element2 =
        createElementWithAttributes(fixture.doc, 'amp-ad', config2);
      const impl2 = new AmpAdNetworkDoubleclickImpl(element2);
      sandbox.stub(impl2, 'generateAdKey_').withArgs('250x300').returns('2468');
      element2.setAttribute(EXPERIMENT_ATTRIBUTE, MANUAL_EXPERIMENT_ID);
      impl2.populateAdUrlState();
      expect(constructSRABlockParameters([impl1, impl2])).to.jsonEqual({
        'iu_parts': '1234,abc,def,xyz',
        'enc_prev_ius': '0/1/2,0/2/3',
        adks: '13579,2468',
        'prev_iu_szs': '50x320,250x300',
        'prev_scp':
          'foo=bar&names=x,y,z&excl_cat=sports|hello=world&excl_cat=food',
        co: '1',
        adtest: 'on',
        tfcd: 'some_tfcd',
        eid: MANUAL_EXPERIMENT_ID,
      });
    });
  });

  describe('#initiateSraRequests', () => {
    let fixture;
    let xhrMock;

    function createA4aSraInstance(networkId) {
      const doc = fixture.doc;
      const element =
        createElementWithAttributes(doc, 'amp-ad', {
          type: 'doubleclick',
          height: 320,
          width: 50,
          'data-slot': `/${networkId}/abc/def`,
        });
      element.getAmpDoc = () => {
        const ampdocService = Services.ampdocServiceFor(doc.defaultView);
        return ampdocService.getAmpDoc(element);
      };
      element.isBuilt = () => {return true;};
      element.getLayoutBox = () => {
        return layoutRectLtwh(0, 0, 200, 50);
      };
      element.getPageLayoutBox = () => {
        return element.getLayoutBox.apply(element, arguments);
      };
      element.getIntersectionChangeEntry = () => {return null;};
      doc.body.appendChild(element);
      const impl = new AmpAdNetworkDoubleclickImpl(element);
      impl.useSra = true;
      return impl;
    }

    function generateSraXhrMockCall(
        validInstances, networkId, responses, opt_xhrFail, opt_allInvalid) {
      dev().assert(validInstances.length > 1);
      dev().assert(!(opt_xhrFail && opt_allInvalid));
      // Start with nameframe method, SRA will override to use safeframe.
      const headers = {};
      headers[RENDERING_TYPE_HEADER] = XORIGIN_MODE.NAMEFRAME;
      // Assume all implementations have same data slot.
      const iuParts = encodeURIComponent(
          validInstances[0].element.getAttribute('data-slot').split(/\//)
        .splice(1).join());
      const xhrWithArgs = xhrMock.withArgs(
          sinon.match(
              new RegExp('^https:\/\/securepubads\\.g\\.doubleclick\\.net' +
            `\/gampad\/ads\\?iu_parts=${iuParts}&enc_prev_ius=`)),
          {
            mode: 'cors',
            method: 'GET',
            credentials: 'include',
          });
      if (opt_xhrFail) {
        xhrWithArgs.returns(Promise.reject(
            new TypeError('some random network error')));
      } else if (opt_allInvalid) {
        xhrWithArgs.throws(new Error('invalid should not make xhr!'));
      } else {
        xhrWithArgs.returns(Promise.resolve({
          arrayBuffer: () => { throw new Error('Expected SRA!'); },
          bodyUsed: false,
          text: () => {
            let slotDataString = '';
            responses.forEach(slot => {
              slotDataString +=
                `${JSON.stringify(slot.headers)}\n${slot.creative}\n`;
            });
            return Promise.resolve(slotDataString);
          },
          headers: new FetchResponseHeaders({
            getResponseHeader(name) {
              return headers[name];
            },
          }),
        }));
      }
    }

    function generateNonSraXhrMockCall(impl, creative) {
      // Start with nameframe method, SRA will override to use safeframe.
      const headers = {};
      headers[RENDERING_TYPE_HEADER] = XORIGIN_MODE.NAMEFRAME;
      const iu = encodeURIComponent(impl.element.getAttribute('data-slot'));
      const urlRegexp = new RegExp(
        '^https:\/\/securepubads\\.g\\.doubleclick\\.net' +
        `\/gampad\/ads\\?iu=${iu}&`);
      xhrMock.withArgs(
          sinon.match(urlRegexp),
          {
            mode: 'cors',
            method: 'GET',
            credentials: 'include',
          }).returns(Promise.resolve({
            arrayBuffer: () => utf8Encode(creative),
            bodyUsed: false,
            headers: new FetchResponseHeaders({
              getResponseHeader(name) {
                return headers[name];
              },
            }),
            text: () => {
              throw new Error('should not be SRA!');
            },
          }));
    }

    /**
     * Tests SRA behavior by creating multiple doubleclick instances with the
     * following dimensions: networkId, number of instances, number of
     * invalid instances (meaning isValidElement returns false), and if SRA
     * XHR should fail.  Generates expected behaviors including XHR
     * requests, layoutCallback iframe state, and collapse.
     *
     * @param {!Array<number|{{
     *    networkId:number,
     *    instances:number,
     *    xhrFail:boolean|undefined,
     *    invalidInstances:number}}>} items
     */
    function executeTest(items) {
      // Store if XHR will fail by networkId.
      const networkXhrFailure = {};
      // Store if all elements for a given network are invalid.
      const networkValidity = {};
      const doubleclickInstances = [];
      const attemptCollapseSpy =
        sandbox.spy(BaseElement.prototype, 'attemptCollapse');
      let expectedAttemptCollapseCalls = 0;
      items.forEach(network => {
        if (typeof network == 'number') {
          network = {networkId: network, instances: 1};
        }
        dev().assert(network.instances || network.invalidInstances);
        const createInstances = (instanceCount, invalid) => {
          for (let i = 0; i < instanceCount; i++) {
            const impl = createA4aSraInstance(network.networkId);
            doubleclickInstances.push(impl);
            sandbox.stub(impl, 'isValidElement').returns(!invalid);
            if (invalid) {
              impl.element.setAttribute('data-test-invalid', 'true');
            }
          }
        };
        createInstances(network.instances);
        createInstances(network.invalidInstances, true);
        networkValidity[network.networkId] =
          network.invalidInstances && !network.instances;
        networkXhrFailure[network.networkId] = !!network.xhrFail;
        expectedAttemptCollapseCalls += network.xhrFail ? network.instances : 0;
      });
      const grouping = {};
      const groupingPromises = {};
      doubleclickInstances.forEach(impl => {
        const networkId = getNetworkId(impl.element);
        (grouping[networkId] || (grouping[networkId] = []))
            .push(impl);
        (groupingPromises[networkId] || (groupingPromises[networkId] = []))
            .push(Promise.resolve(impl));
      });
      sandbox.stub(AmpAdNetworkDoubleclickImpl.prototype, 'groupSlotsForSra')
          .returns(Promise.resolve(groupingPromises));
      let idx = 0;
      const layoutCallbacks = [];
      const getLayoutCallback = (impl, creative, isSra, noRender) => {
        impl.buildCallback();
        impl.onLayoutMeasure();
        return impl.layoutCallback().then(() => {
          if (noRender) {
            expect(impl.iframe).to.not.be.ok;
            return;
          }
          expect(impl.iframe).to.be.ok;
          const name = impl.iframe.getAttribute('name');
          if (isSra) {
            // Expect safeframe.
            expect(name).to.match(
                new RegExp(`^\\d+-\\d+-\\d+;\\d+;${creative}`));
          } else {
            // Expect nameframe render.
            expect(JSON.parse(name).creative).to.equal(creative);
          }
        });
      };
      Object.keys(grouping).forEach(networkId => {
        const validInstances = grouping[networkId].filter(impl =>
          impl.element.getAttribute('data-test-invalid') != 'true');
        const isSra = validInstances.length > 1;
        const sraResponses = [];
        validInstances.forEach(impl => {
          const creative = `slot${idx++}`;
          if (isSra) {
            sraResponses.push({creative, headers: {slot: idx}});
          } else {
            generateNonSraXhrMockCall(impl, creative);
          }
          layoutCallbacks.push(getLayoutCallback(
              impl, creative, isSra,
              networkXhrFailure[networkId] ||
            impl.element.getAttribute('data-test-invalid') == 'true'));
        });
        if (isSra) {
          generateSraXhrMockCall(validInstances, networkId, sraResponses,
              networkXhrFailure[networkId], networkValidity[networkId]);
        }
      });
      return Promise.all(layoutCallbacks).then(() => expect(
          attemptCollapseSpy.callCount).to.equal(expectedAttemptCollapseCalls));
    }

    beforeEach(() => {
      return createIframePromise().then(f => {
        setupForAdTesting(f);
        fixture = f;
        xhrMock = sandbox.stub(Xhr.prototype, 'fetch');
        const xhrMockJson = sandbox.stub(Xhr.prototype, 'fetchJson');
        sandbox.stub(AmpA4A.prototype,
            'getSigningServiceNames').returns(['google']);
        xhrMockJson.withArgs(
            'https://cdn.ampproject.org/amp-ad-verifying-keyset.json',
            {
              mode: 'cors',
              method: 'GET',
              ampCors: false,
              credentials: 'omit',
            }).returns(
            Promise.resolve({keys: []}));
        // TODO(keithwrightbos): remove, currently necessary as amp-ad
        // attachment causes 3p impl to load causing errors to be thrown.
        sandbox.stub(AmpAd3PImpl.prototype, 'unlayoutCallback');
      });
    });

    afterEach(() => {
      resetSraStateForTesting();
    });

    it('should not use SRA if single slot', () => executeTest([1234]));

    it('should not use SRA if single slot, multiple networks',
        () => executeTest([1234, 4567]));

    it('should correctly use SRA for multiple slots',
        () => executeTest([1234, 1234]));

    it('should not send SRA request if slots are invalid',
        () => executeTest([{networkId: 1234, invalidInstances: 2}]));

    it('should send SRA request if more than 1 slot is valid', () =>
      executeTest([{networkId: 1234, instances: 2, invalidInstances: 2}]));

    it('should not send SRA request if only 1 slot is valid', () =>
      executeTest([{networkId: 1234, instances: 1, invalidInstances: 2}]));

    it('should handle xhr failure by not sending subsequent request',
        () => executeTest([{networkId: 1234, instances: 2, xhrFail: true}]));

    it('should handle mixture of xhr and non xhr failures', () => executeTest(
        [{networkId: 1234, instances: 2, xhrFail: true}, 4567, 4567]));

    it('should correctly use SRA for multiple slots. multiple networks',
        () => executeTest([1234, 4567, 1234, 4567]));

    it('should handle mixture of all possible scenarios', () => executeTest(
        [1234, 1234, 101, {networkId: 4567, instances: 2, xhrFail: true}, 202,
        {networkId: 8901, instances: 3, invalidInstances: 1}]));
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

  describe('#RTC', () => {
    let impl;
    let xhrMock;

    function mockRtcExecution(rtcResponse, element, opt_textFunction) {
      impl = new AmpAdNetworkDoubleclickImpl(element);
      let textFunction = () => {
        return Promise.resolve(JSON.stringify(rtcResponse));
      };
      textFunction = opt_textFunction || textFunction;
      xhrMock.returns(
          Promise.resolve({
            redirected: false,
            status: 200,
            text: textFunction,
          })
      );
      impl.populateAdUrlState();
      return impl.executeRtc_();
    }

    function setRtcConfig(rtcConfigJson) {
      const rtcConf = document.getElementById('amp-rtc');
      rtcConf.innerText = JSON.stringify(rtcConfigJson);
    }

    beforeEach(() => {
      resetRtcStateForTesting();
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        element = createElementWithAttributes(document, 'amp-ad', {
          'width': '200',
          'height': '50',
          'type': 'doubleclick',
          'layout': 'fixed',
        });
        const rtcConf = createElementWithAttributes(
            document, 'script',
            {type: 'application/json', id: 'amp-rtc'});
        rtcConf.innerHTML = JSON.stringify({
          endpoint: 'https://example-publisher.com/rtc/',
        });
        document.head.appendChild(rtcConf);
        xhrMock = sandbox.stub(Xhr.prototype, 'fetchJson');

      });
    });

    afterEach(() => {
      impl = null;
      xhrMock = null;
      resetRtcStateForTesting();
      const rtcConf = document.getElementById('amp-rtc');
      document.head.removeChild(rtcConf);
    });

    it('should add just targeting to impl', () => {
      const targeting = {'sport': 'baseball'};
      const jsonTargeting = {
        targeting,
      };
      return mockRtcExecution({
        targeting,
      }, element).then(() => {
        expect(impl.jsonTargeting_).to.deep.equal(jsonTargeting);
      });
    });

    it('should add just categoryExclusions to impl', () => {
      const categoryExclusions = {'sport': 'baseball'};
      const jsonTargeting = {
        categoryExclusions,
      };
      return mockRtcExecution({
        categoryExclusions,
      }, element).then(() => {
        expect(impl.jsonTargeting_).to.deep.equal(jsonTargeting);
      });
    });

    it('should add targeting and categoryExclusions to impl', () => {
      const targeting = {'sport': 'baseball'};
      const categoryExclusions = {'age': '18-25'};
      const jsonTargeting = {
        targeting,
        categoryExclusions,
      };
      return mockRtcExecution({
        targeting,
        categoryExclusions,
      }, element).then(() => {
        expect(impl.jsonTargeting_).to.deep.equal(jsonTargeting);
      });
    });

    it('should deep merge targeting and categoryExclusions from amp-ad', () => {
      const rtcResponse = {
        targeting: {'food': {
          'kids': ['chicken fingers', 'pizza']},
          'sports': 'baseball'},
        categoryExclusions: {'age': '18-25'}};
      const contextualTargeting =
      '{"targeting": {"food": {"kids": "fries", "adults": "cheese"}}}';
      const jsonTargeting = {
        targeting: {
          'food': {
            'kids': ['chicken fingers', 'pizza'],
            'adults': 'cheese',
          },
          'sports': 'baseball'},
        categoryExclusions: {'age': '18-25'}};
      element = createElementWithAttributes(document, 'amp-ad', {
        'width': '200',
        'height': '50',
        'type': 'doubleclick',
        'layout': 'fixed',
        'json': contextualTargeting,
      });
      return mockRtcExecution(rtcResponse, element).then(() => {
        expect(impl.jsonTargeting_).to.deep.equal(jsonTargeting);
      });
    });

    it('should send two RTC callouts per page with SWR', () => {
      const rtcResponse = {
        targeting: {'food': {
          'kids': ['chicken fingers', 'pizza']},
          'sports': 'baseball'},
        categoryExclusions: {'age': '18-25'}};
      let contextualTargeting =
      '{"targeting": {"food": {"kids": "fries", "adults": "cheese"}}}';
      element = createElementWithAttributes(document, 'amp-ad', {
        'width': '200',
        'height': '50',
        'type': 'doubleclick',
        'layout': 'fixed',
        'json': contextualTargeting,
      });
      mockRtcExecution(rtcResponse, element);

      contextualTargeting =
      '{"targeting": {"food": {"adults": "wine"}}}';
      const secondElement = createElementWithAttributes(
          document, 'amp-ad', {
            'width': '200',
            'height': '50',
            'type': 'doubleclick',
            'layout': 'fixed',
            'json': contextualTargeting,
          });
      return mockRtcExecution(rtcResponse, secondElement).then(() => {
        expect(xhrMock).to.be.calledTwice;
      });
    });

    it('should send one RTC callout per page with SWR disabled', () => {
      setRtcConfig({
        'endpoint': 'https://example-publisher.com/rtc/',
        'disableStaleWhileRevalidate': true,
      });
      const rtcResponse = {
        targeting: {'food': {
          'kids': ['chicken fingers', 'pizza']},
          'sports': 'baseball'},
        categoryExclusions: {'age': '18-25'}};
      let contextualTargeting =
      '{"targeting": {"food": {"kids": "fries", "adults": "cheese"}}}';
      element = createElementWithAttributes(document, 'amp-ad', {
        'width': '200',
        'height': '50',
        'type': 'doubleclick',
        'layout': 'fixed',
        'json': contextualTargeting,
      });
      mockRtcExecution(rtcResponse, element);

      contextualTargeting =
      '{"targeting": {"food": {"adults": "wine"}}}';
      const secondElement = createElementWithAttributes(
          document, 'amp-ad', {
            'width': '200',
            'height': '50',
            'type': 'doubleclick',
            'layout': 'fixed',
            'json': contextualTargeting,
          });
      return mockRtcExecution(rtcResponse, secondElement).then(() => {
        expect(xhrMock).to.be.calledOnce;
      });
    });

    it('should not send RTC if url invalid', () => {
      const rtcConf = document.getElementById('amp-rtc');
      rtcConf.innerText = '{'
          + '"endpoint": "http://example-publisher.com/rtc/",'
          + '"sendAdRequestOnFailure": false'
          + '}';

      const targeting = {'sport': 'baseball'};
      return mockRtcExecution({
        targeting,
      }, element).then(() => {
        expect(xhrMock).to.not.be.called;
      });
    });

    it('should resolve on empty RTC response', () => {
      return mockRtcExecution('', element).then(() => {
        // All that we are expecting here is that a Promise.reject doesn't
        // bubble up
      }).catch(() => {
        expect(false).to.be.true;
      });
    });

    it('should resolve on RTC failure if specified', () => {
      const badRtcResponse = 'wrong: "unparseable}';
      const jsonFunc = () => {
        return Promise.resolve(JSON.parse(badRtcResponse));
      };
      return mockRtcExecution(badRtcResponse, element, jsonFunc).then(() => {
        // All that we are expecting here is that a Promise.reject doesn't
        // bubble up
      }).catch(() => {
        expect(false).to.be.true;
      });
    });

    it('should reject on RTC failure if specified', () => {
      setRtcConfig({
        'endpoint': 'https://example-publisher.com/rtc/',
        'sendAdRequestOnFailure': false,
      });
      const badRtcResponse = 'wrong: "unparseable}';
      const jsonFunc = () => {
        return Promise.resolve(JSON.parse(badRtcResponse));
      };
      return mockRtcExecution(badRtcResponse, element, jsonFunc).then(() => {
        expect(false).to.be.true;
      }).catch(err => {
        expect(err.match(/Unexpected token/)).to.be.ok;
      });
    });

    it('should bypass caching if specified', () => {
      setRtcConfig({
        'endpoint': 'https://example-publisher.com/rtc/',
        'sendAdRequestOnFailure': true,
        'disableStaleWhileRevalidate': true,
      });

      const targeting = {'sport': 'baseball'};
      return mockRtcExecution({targeting}, element).then(() => {
        expect(xhrMock).to.be.calledOnce;
      });
    });

    it('should timeout slow response, then do not send without RTC', () => {
      setRtcConfig({
        'endpoint': 'https://example-publisher.com/rtc/',
        'sendAdRequestOnFailure': false,
      });
      const targeting = {'sport': 'baseball'};
      impl = new AmpAdNetworkDoubleclickImpl(element);

      xhrMock.returns(
          Services.timerFor(window).promise(1200).then(() => {
            return Promise.resolve({
              redirected: false,
              status: 200,
              json: () => {
                return Promise.resolve({targeting});
              },
            });
          }));
      impl.populateAdUrlState();
      return impl.executeRtc_().then(() => {
        // this then block should never run.
        expect(true).to.be.false;
      }).catch(err => {
        // Have to get substring, because the error message has
        // three 0 width blank space characters added to it
        // automatically by the log constructor.
        expect(err.substring(0, 7)).to.equal('timeout');
      });
    });

    it('should timeout slow response, then send without RTC', () => {
      setRtcConfig({
        'endpoint': 'https://example-publisher.com/rtc/',
      });
      const targeting = {'sport': 'baseball'};

      impl = new AmpAdNetworkDoubleclickImpl(element);

      xhrMock.returns(
          Services.timerFor(window).promise(1200).then(() => {
            return Promise.resolve({
              redirected: false,
              status: 200,
              json: () => {
                return Promise.resolve({targeting});
              },
            });
          }));
      impl.populateAdUrlState();
      return impl.executeRtc_().then(result => {
        expect(result.artc).to.equal(-1);
        expect(result.ati).to.equal(3);
      }).catch(() => {
        // Should not error.
        expect(true).to.be.false;
      });
    });
  });
});
