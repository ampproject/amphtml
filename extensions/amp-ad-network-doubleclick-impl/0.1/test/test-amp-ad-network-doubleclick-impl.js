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

// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import '../../../amp-ad/0.1/amp-ad';
import {
  AMP_SIGNATURE_HEADER,
  VerificationStatus,
} from '../../../amp-a4a/0.1/signature-verifier';
import {
  AmpA4A,
  CREATIVE_SIZE_HEADER,
  XORIGIN_MODE,
  signatureVerifierFor,
} from '../../../amp-a4a/0.1/amp-a4a';
import {AmpAd} from '../../../amp-ad/0.1/amp-ad';
import {
  AmpAdNetworkDoubleclickImpl,
  CORRELATOR_CLEAR_EXP_BRANCHES,
  CORRELATOR_CLEAR_EXP_NAME,
  getNetworkId,
  resetLocationQueryParametersForTesting,
} from '../amp-ad-network-doubleclick-impl';
import {
  DOUBLECLICK_A4A_EXPERIMENT_NAME,
  DOUBLECLICK_EXPERIMENT_FEATURE,
  DOUBLECLICK_UNCONDITIONED_EXPERIMENTS,
  UNCONDITIONED_CANONICAL_FF_HOLDBACK_EXP_NAME,
} from '../doubleclick-a4a-config';
import {SAFEFRAME_ORIGIN} from '../safeframe-host';
import {FriendlyIframeEmbed} from '../../../../src/friendly-iframe-embed';
import {Layout} from '../../../../src/layout';
import {Preconnect} from '../../../../src/preconnect';
import {
  QQID_HEADER,
} from '../../../../ads/google/a4a/utils';
import {Services} from '../../../../src/services';
import {VisibilityState} from '../../../../src/visibility-state';
import {
  addExperimentIdToElement,
  isInExperiment,
} from '../../../../ads/google/a4a/traffic-experiments';
import {createElementWithAttributes} from '../../../../src/dom';
import {
  forceExperimentBranch,
  toggleExperiment,
} from '../../../../src/experiments';
import {utf8Encode} from '../../../../src/utils/bytes';

/**
 * We're allowing external resources because otherwise using realWin causes
 * strange behavior with iframes, as it doesn't load resources that we
 * normally load in prod.
 * We're turning on ampAdCss because using realWin means that we don't
 * inherit that CSS from the parent page anymore.
 */
const realWinConfig = {
  amp: {
    extensions: ['amp-ad-network-doubleclick-impl'],
  },
  ampAdCss: true,
  allowExternalResources: true,
};

const realWinConfigAmpAd = {
  amp: {ampdoc: 'amp-ad'},
  ampAdCss: true,
  allowExternalResources: true,
};

/**
 * Creates an iframe promise, and instantiates element and impl, adding the
 * former to the document of the iframe.
 * @param {{width, height, type}} config
 * @return The iframe promise.
 */
function createImplTag(config, element, impl, env) {
  config.type = 'doubleclick';
  element = createElementWithAttributes(env.win.document, 'amp-ad', config);
  // To trigger CSS styling.
  element.setAttribute('data-a4a-upgrade-type',
      'amp-ad-network-doubleclick-impl');
  // Used to test styling which is targetted at first iframe child of
  // amp-ad.
  const iframe = env.win.document.createElement('iframe');
  element.appendChild(iframe);
  env.win.document.body.appendChild(element);
  impl = new AmpAdNetworkDoubleclickImpl(element);
  impl.iframe = iframe;
  impl.win['goog_identity_prom'] = Promise.resolve({});
  return [element, impl, env];
}

describes.realWin('amp-ad-network-doubleclick-impl', realWinConfig, env => {
  let win, doc, ampdoc;
  let element;
  let impl;

  beforeEach(() => {
    resetLocationQueryParametersForTesting();
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
  });

  afterEach(() => resetLocationQueryParametersForTesting);

  describe('#isValidElement', () => {
    beforeEach(() => {
      element = doc.createElement('amp-ad');
      element.setAttribute('type', 'doubleclick');
      element.setAttribute('data-ad-client', 'adsense');
      doc.body.appendChild(element);
      impl = new AmpAdNetworkDoubleclickImpl(element);
    });

    it('should be valid', () => {
      expect(impl.isValidElement()).to.be.true;
    });
    it('should NOT be valid (impl tag name)', () => {
      element =
          doc.createElement('amp-ad-network-doubleclick-impl');
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
      element = doc.createElement('amp-embed');
      element.setAttribute('type', 'doubleclick');
      element.setAttribute('data-ad-client', 'doubleclick');
      impl = new AmpAdNetworkDoubleclickImpl(element);
      expect(impl.isValidElement()).to.be.true;
    });
  });


  describe('#extractSize', () => {
    let preloadExtensionSpy;
    const size = {width: 200, height: 50};

    beforeEach(() => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'width': '200',
        'height': '50',
        'type': 'doubleclick',
        'layout': 'fixed',
      });
      impl = new AmpAdNetworkDoubleclickImpl(element);
      sandbox.stub(impl, 'getAmpDoc').callsFake(() => ampdoc);
      impl.size_ = size;
      const extensions = Services.extensionsFor(impl.win);
      preloadExtensionSpy = sandbox.spy(extensions, 'preloadExtension');
    });

    it('should ignore creative-size header for fluid response', () => {
      impl.isFluid_ = true;
      impl.element.setAttribute('height', 'fluid');
      const resizeSpy = sandbox.spy(impl, 'attemptChangeSize');
      expect(impl.extractSize({
        get(name) {
          return name == CREATIVE_SIZE_HEADER ? '0x0' : undefined;
        },
        has(name) {
          return name == CREATIVE_SIZE_HEADER;
        },
      })).to.deep.equal({width: 0, height: 0});
      expect(resizeSpy).to.not.be.called;
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
      expect(preloadExtensionSpy.withArgs('amp-analytics')).to.not.be.called;
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
      expect(preloadExtensionSpy.withArgs('amp-analytics')).to.be.called;
      // exact value of ampAnalyticsConfig covered in
      // ads/google/test/test-utils.js
    });

    it('should load delayed impression amp-pixels', () => {
      const fireDelayedImpressionsSpy =
          sandbox.spy(impl, 'fireDelayedImpressions');
      expect(impl.extractSize({
        get(name) {
          switch (name) {
            case 'X-AmpImps':
              return 'https://a.com?a=b,https://b.com?c=d';
            case 'X-AmpRSImps':
              return 'https://c.com?e=f,https://d.com?g=h';
            default:
              return undefined;
          }
        },
        has(name) {
          return !!this.get(name);
        },
      })).to.deep.equal(size);
      expect(fireDelayedImpressionsSpy.withArgs(
          'https://a.com?a=b,https://b.com?c=d')).to.be.calledOnce;
      expect(fireDelayedImpressionsSpy.withArgs(
          'https://c.com?e=f,https://d.com?g=h', true)).to.be.calledOnce;
    });
  });

  describe('#onCreativeRender', () => {
    beforeEach(() => {
      doc.win = env.win;
      element = createElementWithAttributes(doc, 'amp-ad', {
        'width': '200',
        'height': '50',
        'type': 'doubleclick',
      });
      impl = new AmpAdNetworkDoubleclickImpl(element);
      sandbox.stub(impl, 'getAmpDoc').callsFake(() => ampdoc);
      sandbox.stub(env.ampdocService, 'getAmpDoc').callsFake(() => ampdoc);
      // Next two lines are to ensure that internal parts not relevant for this
      // test are properly set.
      impl.size_ = {width: 200, height: 50};
      impl.iframe = impl.win.document.createElement('iframe');
      // Temporary fix for local test failure.
      sandbox.stub(impl, 'getIntersectionElementLayoutBox').callsFake(() => {
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

    [true, false].forEach(exp => {
      it('injects amp analytics' +
        (exp ? ', trigger immediate disable exp' : ''), () => {
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
        };
        // To placate assertion.
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
        if (exp) {
          impl.postAdResponseExperimentFeatures['avr_disable_immediate'] = '1';
        }
        impl.onCreativeRender(false);
        const ampAnalyticsElement = impl.element.querySelector('amp-analytics');
        expect(ampAnalyticsElement).to.be.ok;
        expect(ampAnalyticsElement.CONFIG).jsonEqual(impl.ampAnalyticsConfig_);
        expect(ampAnalyticsElement.getAttribute('sandbox')).to.equal('true');
        expect(ampAnalyticsElement.getAttribute('trigger')).to.equal(
            exp ? '' : 'immediate');
        expect(impl.ampAnalyticsElement_).to.be.ok;
        // Exact format of amp-analytics element covered in
        // test/functional/test-analytics.js.
        // Just ensure extensions is loaded, and analytics element appended.
      });
    });

    it('should register click listener', () => {
      impl.iframe = impl.win.document.createElement('iframe');
      impl.win.document.body.appendChild(impl.iframe);
      const adBody = impl.iframe.contentDocument.body;
      let clickHandlerCalled = 0;

      adBody.onclick = function(e) {
        expect(e.defaultPrevented).to.be.false;
        e.preventDefault(); // Make the test not actually navigate.
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
      sandbox.stub(impl, 'getResource').returns(
          {
            getUpgradeDelayMs: () => 1,
          });
      impl.buildCallback();
      impl.size_ = {width: 123, height: 456};
      impl.onCreativeRender({customElementExtensions: []});
      button.dispatchEvent(ev1);
      expect(a.href).to.equal('https://f.co/?10,20,RANDOM');
      expect(clickHandlerCalled).to.equal(1);
    });

    it('should not register click listener is amp-ad-exit', () => {
      impl.iframe = impl.win.document.createElement('iframe');
      impl.win.document.body.appendChild(impl.iframe);
      const adBody = impl.iframe.contentDocument.body;
      let clickHandlerCalled = 0;

      adBody.onclick = function(e) {
        expect(e.defaultPrevented).to.be.false;
        e.preventDefault(); // Make the test not actually navigate.
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
      sandbox.stub(impl, 'getResource').returns(
          {
            getUpgradeDelayMs: () => 1,
          });
      impl.buildCallback();
      impl.size_ = {width: 123, height: 456};
      impl.onCreativeRender({customElementExtensions: ['amp-ad-exit']});
      button.dispatchEvent(ev1);
      expect(a.href).to.equal('https://f.co/?CLICK_X,CLICK_Y,RANDOM');
      expect(clickHandlerCalled).to.equal(1);
    });
  });

  describe('#getAdUrl', () => {
    beforeEach(() => {
      const sandbox = env.sandbox;
      element = doc.createElement('amp-ad');
      element.setAttribute('type', 'doubleclick');
      element.setAttribute('data-ad-client', 'doubleclick');
      element.setAttribute('width', '320');
      element.setAttribute('height', '50');
      doc.body.appendChild(element);
      impl = new AmpAdNetworkDoubleclickImpl(element);
      // Temporary fix for local test failure.
      sandbox.stub(impl, 'getIntersectionElementLayoutBox').callsFake(() => {
        return {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width: 320,
          height: 50,
        };
      });

      // Reproduced from noopMethods in ads/google/a4a/test/test-utils.js,
      // to fix failures when this is run after 'gulp build', without a 'dist'.
      sandbox.stub(impl, 'getPageLayoutBox').callsFake(() => {
        return {
          top: 11, left: 12, right: 0, bottom: 0, width: 0, height: 0,
        };
      });
    });

    afterEach(() => {
      toggleExperiment(env.win, 'dc-use-attr-for-format', false);
      doc.body.removeChild(element);
      env.win['ampAdGoogleIfiCounter'] = 0;
    });

    it('returns the right URL', () => {
      new AmpAd(element).upgradeCallback();
      addExperimentIdToElement('12345678', element);
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
          /(\?|&)nhd=\d+(&|$)/,
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
          /(\?|&)eid=([^&]+%2C)*12345678(%2C[^&]+)*(&|$)/,
          /(\?|&)url=https?%3A%2F%2F[a-zA-Z0-9.:%-]+(&|$)/,
          /(\?|&)top=localhost(&|$)/,
          /(\?|&)ref=https?%3A%2F%2Flocalhost%3A9876%2F[a-zA-Z0-9.:%-]+(&|$)/,
          /(\?|&)dtd=[0-9]+(&|$)/,
          /(\?|&)vis=[0-5]+(&|$)/,
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

    describe('data-force-safeframe', () => {
      const fsfRegexp = /(\?|&)fsf=1(&|$)/;
      it('handles default', () => expect(
          new AmpAdNetworkDoubleclickImpl(element).getAdUrl())
          .to.eventually.not.match(fsfRegexp));

      it('case insensitive attribute name', () => {
        element.setAttribute('data-FORCE-SafeFraMe', '1');
        return expect(
            new AmpAdNetworkDoubleclickImpl(element).getAdUrl())
            .to.eventually.match(fsfRegexp);
      });

      ['tRuE', 'true', 'TRUE', '1'].forEach(val => {
        it(`valid attribute: ${val}`, () => {
          element.setAttribute('data-force-safeframe', val);
          return expect(new AmpAdNetworkDoubleclickImpl(element).getAdUrl())
              .to.eventually.match(fsfRegexp);
        });
      });

      ['aTrUe', 'trueB', '0', '01', '10', 'false', '', ' true', 'true ',
        ' true '].forEach(val => {
        it(`invalid attribute: ${val}`, () => {
          element.setAttribute('data-force-safeframe', val);
          return expect(new AmpAdNetworkDoubleclickImpl(element).getAdUrl())
              .to.eventually.not.match(fsfRegexp);
        });
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
      impl.buildCallback();
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
          impl.buildCallback();
          impl.onLayoutMeasure();
          return impl.getAdUrl().then(url =>
              // Ensure that "auto" doesn't appear anywhere here:
            expect(url).to.match(/sz=[0-9]+x[0-9]+/));
        });
    it('has correct format with height/width override',
        () => {
          element.setAttribute('data-override-width', '123');
          element.setAttribute('data-override-height', '456');
          new AmpAd(element).upgradeCallback();
          impl.buildCallback();
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
          impl.buildCallback();
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
          impl.buildCallback();
          impl.onLayoutMeasure();
          return impl.getAdUrl().then(url =>
              // Ensure that "auto" doesn't appear anywhere here:
            expect(url).to.match(/sz=[0-9]+x[0-9]+%7C1x2%7C3x4&/));
        });
    it('should have the correct ifi numbers - no refresh', function() {
      // When ran locally, this test tends to exceed 2000ms timeout.
      this.timeout(5000);
      // Reset counter for purpose of this test.
      delete env.win['ampAdGoogleIfiCounter'];
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
    it('should have google_preview parameter', () => {
      sandbox.stub(impl, 'getLocationQueryParameterValue')
          .withArgs('google_preview').returns('abcdef');
      new AmpAd(element).upgradeCallback();
      expect(impl.getAdUrl()).to.eventually.contain('&gct=abcdef');
    });
    it('should cache getLocationQueryParameterValue', () => {
      impl.win = {location: {search: '?foo=bar'}};
      expect(impl.getLocationQueryParameterValue('foo')).to.equal('bar');
      impl.win.location.search = '?foo=bar2';
      expect(impl.getLocationQueryParameterValue('foo')).to.equal('bar');
    });
    // TODO(bradfrizzell, #12476): Make this test work with sinon 4.0.
    it.skip('has correct rc and ifi after refresh', () => {
      // We don't really care about the behavior of the following methods, so
      // we'll just stub them out so that refresh() can run without tripping any
      // unrelated errors.
      sandbox.stub(AmpA4A.prototype, 'initiateAdRequest').callsFake(
          () => impl.adPromise_ = Promise.resolve());
      const tearDownSlotMock = sandbox.stub(AmpA4A.prototype, 'tearDownSlot');
      tearDownSlotMock.returns(undefined);
      const destroyFrameMock = sandbox.stub(AmpA4A.prototype, 'destroyFrame');
      destroyFrameMock.returns(undefined);
      impl.mutateElement = func => func();
      impl.togglePlaceholder = sandbox.spy();
      impl.win.document.win = impl.win;
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
            expect(url2).to.not.match(/(\?|&)frc=1(&|$)/);
          });
        });
      });
    });
    it('has correct frc value', () => {
      impl.fromResumeCallback = true;
      impl.getAdUrl().then(url => {
        expect(url).to.match(/(\?|&)frc=1(&|$)/);
      });
    });
    it('should include identity', () => {
      // Force get identity result by overloading window variable.
      const token = /**@type {!../../../ads/google/a4a/utils.IdentityToken}*/({
        token: 'abcdef', jar: 'some_jar', pucrd: 'some_pucrd',
      });
      impl.win['goog_identity_prom'] = Promise.resolve(token);
      impl.buildCallback();
      return impl.getAdUrl().then(url => {
        [/(\?|&)adsid=abcdef(&|$)/,
          /(\?|&)jar=some_jar(&|$)/,
          /(\?|&)pucrd=some_pucrd(&|$)/].forEach(
            regexp => expect(url).to.match(regexp));
      });
    });
  });

  describe('#unlayoutCallback', () => {
    beforeEach(() => {
      const setup = createImplTag({
        width: '300',
        height: '150',
      }, element, impl, env);
      element = setup[0];
      impl = setup[1];
      env = setup[2];
      impl.buildCallback();
      impl.win.ampAdSlotIdCounter = 1;
      expect(impl.element.getAttribute('data-amp-slot-index')).to.not.be.ok;
      impl.layoutMeasureExecuted_ = true;
      impl.uiHandler = {applyUnlayoutUI: () => {}};
      const placeholder = doc.createElement('div');
      placeholder.setAttribute('placeholder', '');
      const fallback = doc.createElement('div');
      fallback.setAttribute('fallback', '');
      impl.element.appendChild(placeholder);
      impl.element.appendChild(fallback);
      impl.size_ = {width: 123, height: 456};
    });

    it('should reset state to null on non-FIE unlayoutCallback', () => {
      impl.onCreativeRender();
      expect(impl.unlayoutCallback()).to.be.true;
      expect(impl.iframe).is.not.ok;
    });

    it('should not reset state to null on FIE unlayoutCallback', () => {
      impl.onCreativeRender({customElementExtensions: []});
      expect(impl.unlayoutCallback()).to.be.false;
      expect(impl.iframe).is.ok;
    });

    it('should remove FIE if in all exp', () => {
      impl.onCreativeRender({customElementExtensions: []});
      impl.postAdResponseExperimentFeatures['unlayout_exp'] = 'all';
      expect(impl.unlayoutCallback()).to.be.true;
      expect(impl.iframe).is.not.ok;
      expect(impl.isAmpCreative_).to.be.null;
    });

    it('should remove non-FIE if in all exp', () => {
      impl.onCreativeRender();
      impl.postAdResponseExperimentFeatures['unlayout_exp'] = 'all';
      expect(impl.unlayoutCallback()).to.be.true;
      expect(impl.iframe).is.not.ok;
      expect(impl.isAmpCreative_).to.be.null;
    });

    it('should not remove FIE if in remain exp', () => {
      impl.onCreativeRender({customElementExtensions: []});
      impl.postAdResponseExperimentFeatures['unlayout_exp'] = 'remain';
      expect(impl.unlayoutCallback()).to.be.false;
      expect(impl.iframe).is.ok;
    });

    it('should remove rendered non-FIE if in remain exp', () => {
      impl.onCreativeRender();
      impl.postAdResponseExperimentFeatures['unlayout_exp'] = 'remain';
      expect(impl.unlayoutCallback()).to.be.true;
      expect(impl.iframe).is.not.ok;
      expect(impl.isAmpCreative_).to.be.null;
    });

    it('should not destroy ad promise for unrendered if in remain exp', () => {
      impl.onCreativeRender();
      impl.qqid_ = 'abcdef';
      impl.isAmpCreative_ = null;
      impl.postAdResponseExperimentFeatures['unlayout_exp'] = 'remain';
      expect(impl.unlayoutCallback()).to.be.false;
      expect(impl.isAmpCreative_).to.be.null;
    });

    it('should destroy ad promise if ad response not yet received and in ' +
        'remain exp', () => {
      impl.onCreativeRender();
      impl.qqid_ = null;
      impl.isAmpCreative_ = null;
      impl.postAdResponseExperimentFeatures['unlayout_exp'] = 'remain';
      expect(impl.unlayoutCallback()).to.be.true;
      expect(impl.isAmpCreative_).to.be.null;
    });

    it('should call #resetSlot, remove child iframe, but keep other children',
        () => {
          impl.ampAnalyticsConfig_ = {};
          impl.ampAnalyticsElement_ =
             doc.createElement('amp-analytics');
          impl.element.appendChild(impl.ampAnalyticsElement_);
          expect(impl.iframe).to.be.ok;
          expect(impl.element.querySelector('iframe')).to.be.ok;
          impl.unlayoutCallback();
          expect(impl.element.querySelector('div[placeholder]')).to.be.ok;
          expect(impl.element.querySelector('div[fallback]')).to.be.ok;
          expect(impl.element.querySelector('iframe')).to.be.null;
          expect(impl.element.querySelectorAll('amp-analytics'))
              .to.have.lengthOf(1);
          expect(impl.element.querySelector('amp-analytics')).to.equal(
              impl.a4aAnalyticsElement_);
          expect(impl.iframe).to.be.null;
          expect(impl.ampAnalyticsConfig_).to.be.null;
          expect(impl.ampAnalyticsElement_).to.be.null;
          expect(impl.element.getAttribute('data-amp-slot-index'))
              .to.equal('1');
        });
  });

  describe('#getNetworkId', () => {
    let element;
    it('should match expectations', () => {
      element = doc.createElement('amp-ad');
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
    beforeEach(() => {
      impl = new AmpAdNetworkDoubleclickImpl(
          createElementWithAttributes(doc, 'amp-ad', {
            type: 'doubleclick',
          }));
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
    /**
     * Calling this function ensures that the enclosing test will behave as if
     * it has an AMP creative.
     */
    function stubForAmpCreative() {
      sandbox.stub(
          signatureVerifierFor(impl.win), 'verify').callsFake(
          () => Promise.resolve(VerificationStatus.OK));
    }

    function mockSendXhrRequest(size) {
      return {
        arrayBuffer: () => Promise.resolve(utf8Encode(
            '<html><body>Hello, World!</body></html>')),
        headers: {
          get(prop) {
            switch (prop) {
              case QQID_HEADER:
                return 'qqid-header';
              case CREATIVE_SIZE_HEADER:
                return size;
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
      sandbox.stub(impl, 'shouldInitializePromiseChain_').callsFake(() => true);
      sandbox.stub(impl, 'getPageLayoutBox').callsFake(() => {
        return {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width: 200,
          height: 50,
        };
      });
      sandbox.stub(impl, 'protectedEmitLifecycleEvent_').callsFake(() => {});
      sandbox.stub(impl, 'attemptChangeSize').callsFake((height, width) => {
        impl.element.setAttribute('height', height);
        impl.element.setAttribute('width', width);
        return Promise.resolve();
      });
      sandbox.stub(impl, 'getAmpAdMetadata').callsFake(() => {
        return {
          customElementExtensions: [],
          minifiedCreative: '<html><body>Hello, World!</body></html>',
        };
      });
      sandbox.stub(impl, 'updateLayoutPriority').callsFake(() => {});

      env.expectFetch(
          'https://cdn.ampproject.org/amp-ad-verifying-keyset.json',
          {'keys': []});
      env.expectFetch(
          'https://cdn.ampproject.org/amp-ad-verifying-keyset-dev.json',
          {'keys': []});
    });

    it('amp creative - should force iframe to match size of creative', () => {
      stubForAmpCreative();
      sandbox.stub(impl, 'sendXhrRequest').returns(
          mockSendXhrRequest('150x50'));
      // Stub ini load otherwise FIE could delay test
      sandbox./*OK*/stub(FriendlyIframeEmbed.prototype, 'whenIniLoaded')
          .returns(Promise.resolve());
      impl.buildCallback();
      impl.onLayoutMeasure();
      return impl.layoutCallback().then(() => {
        const iframe = impl.iframe;
        expect(iframe).to.be.ok;
        expect(iframe.getAttribute('style')).to.match(/width: 150/);
        expect(iframe.getAttribute('style')).to.match(/height: 50/);
      });
    });

    // TODO(glevitzky, #14336): Fails due to console errors.
    it.skip('should force iframe to match size of creative', () => {
      sandbox.stub(impl, 'sendXhrRequest').returns(
          mockSendXhrRequest('150x50'));
      impl.buildCallback();
      impl.onLayoutMeasure();
      return impl.layoutCallback().then(() => {
        const iframe = impl.iframe;
        expect(iframe).to.be.ok;
        expect(iframe.getAttribute('style')).to.match(/width: 150/);
        expect(iframe.getAttribute('style')).to.match(/height: 50/);
      });
    });

    // TODO(glevitzky, #14336): Fails due to console errors.
    it.skip('amp creative - should force iframe to match size of slot', () => {
      stubForAmpCreative();
      sandbox.stub(impl, 'sendXhrRequest').callsFake(mockSendXhrRequest);
      sandbox.stub(impl, 'renderViaCachedContentIframe_').callsFake(
          () => impl.iframeRenderHelper_({src: impl.adUrl_, name: 'name'}));
      // Stub ini load otherwise FIE could delay test
      sandbox./*OK*/stub(FriendlyIframeEmbed.prototype, 'whenIniLoaded')
          .returns(Promise.resolve());
      // This would normally be set in AmpA4a#buildCallback.
      impl.creativeSize_ = {width: 200, height: 50};
      impl.buildCallback();
      impl.onLayoutMeasure();
      return impl.layoutCallback().then(() => {
        const iframe = impl.iframe;
        expect(iframe).to.be.ok;
        expect(iframe.getAttribute('style')).to.match(/width: 200/);
        expect(iframe.getAttribute('style')).to.match(/height: 50/);
      });
    });

    // TODO(glevitzky, #14336): Fails due to console errors.
    it.skip('should force iframe to match size of slot', () => {
      sandbox.stub(impl, 'sendXhrRequest').callsFake(mockSendXhrRequest);
      sandbox.stub(impl, 'renderViaCachedContentIframe_').callsFake(
          () => impl.iframeRenderHelper_({src: impl.adUrl_, name: 'name'}));
      // This would normally be set in AmpA4a#buildCallback.
      impl.creativeSize_ = {width: 200, height: 50};
      impl.buildCallback();
      impl.onLayoutMeasure();
      return impl.layoutCallback().then(() => {
        const iframe = impl.iframe;
        expect(iframe).to.be.ok;
        expect(iframe.getAttribute('style')).to.match(/width: 200/);
        expect(iframe.getAttribute('style')).to.match(/height: 50/);
      });
    });

    // TODO(glevitzky, #14336): Fails due to console errors.
    it.skip('should issue an ad request even with bad multi-size ' +
        'data attr', () => {
      stubForAmpCreative();
      sandbox.stub(impl, 'sendXhrRequest').callsFake(mockSendXhrRequest);
      impl.element.setAttribute('data-multi-size', '201x50');
      // Stub ini load otherwise FIE could delay test
      sandbox./*OK*/stub(FriendlyIframeEmbed.prototype, 'whenIniLoaded')
          .returns(Promise.resolve());
      impl.buildCallback();
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

    beforeEach(() => {
      onVisibilityChangedHandler = null;
      visabilityState = VisibilityState.PAUSED;
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
      // TODO(jeffkaufman, #13422): this test was silently failing
      // expect(impl.win.experimentBranches[
      //     CORRELATOR_CLEAR_EXP_NAME]).not.to.be.undefined;
    });

    it('does not attempt to select into branch if SRA', () => {
      impl.useSra = true;
      impl.buildCallback();
      expect(onVisibilityChangedHandler).to.be.ok;
      onVisibilityChangedHandler();
      expect(impl.win.ampAdPageCorrelator).to.equal(12345);
      expect(impl.win.experimentBranches[
          CORRELATOR_CLEAR_EXP_NAME]).to.be.undefined;
    });

    it('does not attempt to select into branch if no correlator', () => {
      impl.win.ampAdPageCorrelator = undefined;
      impl.buildCallback();
      expect(onVisibilityChangedHandler).to.be.ok;
      onVisibilityChangedHandler();
      expect(impl.win.experimentBranches[
          CORRELATOR_CLEAR_EXP_NAME]).to.be.undefined;
    });

    it('does not attempt to select into branch if not pause', () => {
      visabilityState = VisibilityState.VISIBLE;
      impl.buildCallback();
      expect(onVisibilityChangedHandler).to.be.ok;
      onVisibilityChangedHandler();
      expect(impl.win.experimentBranches[
          CORRELATOR_CLEAR_EXP_NAME]).to.be.undefined;
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

  describe('shouldPreferentialRenderWithoutCrypto', () => {
    beforeEach(() => {
      element = doc.createElement('amp-ad');
      element.setAttribute('type', 'doubleclick');
      element.setAttribute('data-ad-client', 'adsense');
      doc.body.appendChild(element);
      impl = new AmpAdNetworkDoubleclickImpl(element);
    });

    afterEach(() => {
      doc.body.removeChild(element);
    });

    it('should return true by default', () => {
      expect(impl.shouldPreferentialRenderWithoutCrypto()).to.be.true;
    });

    it('should return false when in canonical holdback experiment', () => {
      forceExperimentBranch(
          impl.win,
          UNCONDITIONED_CANONICAL_FF_HOLDBACK_EXP_NAME,
          DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.CANONICAL_HLDBK_EXP);
      expect(impl.shouldPreferentialRenderWithoutCrypto()).to.be.false;
    });
  });

  describe('#disable safeframe preload experiment', () => {

    const sfPreloadExpName = 'a4a-safeframe-preloading-off';

    beforeEach(() => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        type: 'doubleclick',
        height: '250',
        width: '320',
      });
      doc.body.appendChild(element);
      impl = new AmpAdNetworkDoubleclickImpl(element);
    });

    it('should not preload SafeFrame', () => {
      forceExperimentBranch(impl.win, sfPreloadExpName, '21061136');
      impl.buildCallback();
      expect(isInExperiment(element, '21061135')).to.be.false;
      expect(isInExperiment(element, '21061136')).to.be.true;
      expect(impl.getPreconnectUrls()).to.deep.equal(
          ['https://partner.googleadservices.com']);
    });

    it('should preload SafeFrame', () => {
      forceExperimentBranch(impl.win, sfPreloadExpName, '21061135');
      impl.buildCallback();
      expect(isInExperiment(element, '21061135')).to.be.true;
      expect(isInExperiment(element, '21061136')).to.be.false;
      expect(impl.getPreconnectUrls()).to.deep.equal(
          ['https://partner.googleadservices.com', SAFEFRAME_ORIGIN]);
    });
  });

  describe('Troubleshoot for AMP pages', () => {
    beforeEach(() => {
      element = doc.createElement('amp-ad');
      element.setAttribute('type', 'doubleclick');
      doc.body.appendChild(element);
      impl = new AmpAdNetworkDoubleclickImpl(element);
      impl.troubleshootData_ = {
        adUrl: Promise.resolve('http://www.getmesomeads.com'),
        creativeId: '123',
        lineItemId: '456',
        slotId: 'slotId',
        slotIndex: '0',
      };
    });

    afterEach(() => {
      doc.body.removeChild(element);
    });

    it('should emit post message', () => {
      const slotId = 'slotId';
      env.win = {
        location: {
          href: 'http://localhost:8000/foo?dfpdeb',
          search: '?dfpdeb',
        },
        opener: {
          postMessage: payload => {
            expect(payload).to.be.ok;
            expect(payload.userAgent).to.be.ok;
            expect(payload.referrer).to.be.ok;
            expect(payload.messageType).to.equal('LOAD');

            const gutData = JSON.parse(payload.gutData);
            expect(gutData).to.be.ok;
            expect(gutData.events[0].timestamp).to.be.ok;
            expect(gutData.events[0].slotid).to.equal(slotId + '_0');
            expect(gutData.events[0].messageId).to.equal(4);

            expect(gutData.slots[0].contentUrl).to
                .equal('http://www.getmesomeads.com');
            expect(gutData.slots[0].id).to.equal(slotId + '_0');
            expect(gutData.slots[0].leafAdUnitName).to.equal(slotId);
            expect(gutData.slots[0].domId).to.equal(slotId + '_0');
            expect(gutData.slots[0].creativeId).to.equal('123');
            expect(gutData.slots[0].lineItemId).to.equal('456');
          },
        },
      };
      const postMessageSpy = sandbox.spy(env.win.opener, 'postMessage');
      impl.win = env.win;
      return impl.postTroubleshootMessage().then(() =>
        expect(postMessageSpy).to.be.calledOnce);
    });

    it('should not emit post message', () => {
      env.win = {
        location: {
          href: 'http://localhost:8000/foo',
          search: '',
        },
        opener: {
          postMessage: () => {
            // should never get here
            expect(false).to.be.true;
          },
        },
      };
      impl.win = env.win;
      expect(impl.postTroubleshootMessage()).to.be.null;
    });
  });

  describe('#getNonAmpCreativeRenderingMethod', () => {
    beforeEach(() => {
      element = doc.createElement('amp-ad');
      element.setAttribute('type', 'doubleclick');
      doc.body.appendChild(element);
      impl = new AmpAdNetworkDoubleclickImpl(element);
    });

    afterEach(() => {
      doc.body.removeChild(element);
    });

    it('should return safeframe if fluid', () => {
      impl.isLayoutSupported(Layout.FLUID);
      expect(impl.getNonAmpCreativeRenderingMethod()).to
          .equal(XORIGIN_MODE.SAFEFRAME);
    });

    it('should return safeframe if force safeframe', () => {
      element.setAttribute('data-force-safeframe', '1');
      expect(new AmpAdNetworkDoubleclickImpl(element)
          .getNonAmpCreativeRenderingMethod()).to.equal(XORIGIN_MODE.SAFEFRAME);
    });
  });
});


describes.realWin('additional amp-ad-network-doubleclick-impl',
    realWinConfigAmpAd, env => {
      let doc;
      let impl;
      let element;

      beforeEach(() => {
        doc = env.win.document;
      });

      describe('#onNetworkFailure', () => {

        beforeEach(() => {
          element = createElementWithAttributes(doc, 'amp-ad', {
            'width': '200',
            'height': '50',
            'type': 'doubleclick',
          });
          impl = new AmpAdNetworkDoubleclickImpl(element);
        });

        it('should append error parameter', () => {
          const TEST_URL = 'https://somenetwork.com/foo?hello=world&a=b';
          expect(impl.onNetworkFailure(new Error('xhr failure'), TEST_URL))
              .to.jsonEqual({adUrl: TEST_URL + '&aet=n'});
        });
      });

      // TODO(bradfrizzell, #14336): Fails due to console errors.
      describe.skip('centering', () => {
        const size = {width: '300px', height: '150px'};

        function verifyCss(iframe, expectedSize) {
          expect(iframe).to.be.ok;
          const style = env.win.getComputedStyle(iframe);
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

        afterEach(() => env.win.document.body.removeChild(impl.element));

        it('centers iframe in slot when height && width', () => {
          const setup = createImplTag({
            width: '300',
            height: '150',
          }, element, impl, env);
          element = setup[0];
          impl = setup[1];
          env = setup[2];
          expect(impl.element.getAttribute('width')).to.equal('300');
          expect(impl.element.getAttribute('height')).to.equal('150');
          verifyCss(impl.iframe, size);
        });
        it('centers iframe in slot when !height && !width', () => {
          const setup = createImplTag({
            layout: 'fixed',
          }, element, impl, env);
          element = setup[0];
          impl = setup[1];
          env = setup[2];
          expect(impl.element.getAttribute('width')).to.be.null;
          expect(impl.element.getAttribute('height')).to.be.null;
          verifyCss(impl.iframe, size);
        });
        it('centers iframe in slot when !height && width', () => {
          const setup = createImplTag({
            width: '300',
            layout: 'fixed',
          }, element, impl, env);
          element = setup[0];
          impl = setup[1];
          env = setup[2];
          expect(impl.element.getAttribute('width')).to.equal('300');
          expect(impl.element.getAttribute('height')).to.be.null;
          verifyCss(impl.iframe, size);
        });
        it('centers iframe in slot when height && !width', () => {
          const setup = createImplTag({
            height: '150',
            layout: 'fixed',
          }, element, impl, env);
          element = setup[0];
          impl = setup[1];
          env = setup[2];
          expect(impl.element.getAttribute('width')).to.be.null;
          expect(impl.element.getAttribute('height')).to.equal('150');
          verifyCss(impl.iframe, size);
        });
      });

      describe('#fireDelayedImpressions', () => {
        beforeEach(() => {
          element = createElementWithAttributes(doc, 'amp-ad', {
            'width': '200',
            'height': '50',
            'type': 'doubleclick',
          });
          impl = new AmpAdNetworkDoubleclickImpl(element);
        });

        it('should handle null impressions', () => {
          impl.fireDelayedImpressions(null);
          expect(env.win.document.querySelectorAll('amp-pixel').length)
              .to.equal(0);
        });

        it('should not include non-https', () => {
          impl.fireDelayedImpressions('http://f.com?a=b,https://b.net?c=d');
          expect(env.win.document.querySelectorAll('amp-pixel').length)
              .to.equal(1);
          expect(env.win.document.querySelector(
              'amp-pixel[src="https://b.net?c=d"][referrerpolicy=""]'))
              .to.be.ok;
        });

        it('should append amp-pixel w/o scrubReferer', () => {
          impl.fireDelayedImpressions('https://f.com?a=b,https://b.net?c=d');
          expect(env.win.document.querySelector(
              'amp-pixel[src="https://f.com?a=b"][referrerpolicy=""]'))
              .to.be.ok;
          expect(env.win.document.querySelector(
              'amp-pixel[src="https://b.net?c=d"][referrerpolicy=""]'))
              .to.be.ok;
        });

        it('should append amp-pixel wwith scrubReferer', () => {
          impl.fireDelayedImpressions(
              'https://f.com?a=b,https://b.net?c=d', true);
          expect(env.win.document.querySelector(
              'amp-pixel[src="https://f.com?a=b"]' +
              '[referrerpolicy="no-referrer"]'))
              .to.be.ok;
          expect(env.win.document.querySelector(
              'amp-pixel[src="https://b.net?c=d"]' +
              '[referrerpolicy="no-referrer"]'))
              .to.be.ok;
        });
      });

      describe('#idleRenderOutsideViewport', () => {
        beforeEach(() => {
          element = createElementWithAttributes(doc, 'amp-ad', {
            'width': '200',
            'height': '50',
            'type': 'doubleclick',
          });
          impl = new AmpAdNetworkDoubleclickImpl(element);
          sandbox.stub(impl, 'getResource').returns(
              {whenWithinRenderOutsideViewport: () => Promise.resolve()});
        });

        it('should use experiment value', () => {
          impl.postAdResponseExperimentFeatures['render-idle-vp'] = '4';
          expect(impl.idleRenderOutsideViewport()).to.equal(4);
          expect(impl.isIdleRender_).to.be.true;
        });

        it('should return false if using loading strategy', () => {
          impl.postAdResponseExperimentFeatures['render-idle-vp'] = '4';
          impl.element.setAttribute('data-loading-strategy',
              'prefer-viewability-over-views');
          expect(impl.idleRenderOutsideViewport()).to.be.false;
          expect(impl.isIdleRender_).to.be.false;
        });

        it('should return false if invalid experiment value', () => {
          impl.postAdResponseExperimentFeatures['render-idle-vp'] = 'abc';
          expect(impl.idleRenderOutsideViewport()).to.be.false;
        });

        it('should return 12 if no experiment header', () => {
          expect(impl.idleRenderOutsideViewport()).to.equal(12);
        });
      });

      describe('idle renderNonAmpCreative', () => {

        beforeEach(() => {
          element = createElementWithAttributes(doc, 'amp-ad', {
            'width': '200',
            'height': '50',
            'type': 'doubleclick',
          });
          impl = new AmpAdNetworkDoubleclickImpl(element);
          impl.postAdResponseExperimentFeatures['render-idle-vp'] = '4';
          impl.postAdResponseExperimentFeatures['render-idle-throttle'] =
              'true';
          sandbox.stub(AmpA4A.prototype, 'renderNonAmpCreative')
              .returns(Promise.resolve());
        });

        // TODO(jeffkaufman, #13422): this test was silently failing
        it.skip('should throttle if idle render and non-AMP creative', () => {
          impl.win['3pla'] = 1;
          const startTime = Date.now();
          return impl.renderNonAmpCreative().then(() => {
            expect(Date.now() - startTime).to.be.at.least(1000);
          });
        });

        it('should NOT throttle if idle experiment not enabled', () => {
          impl.win['3pla'] = 1;
          delete impl.postAdResponseExperimentFeatures['render-idle-vp'];
          const startTime = Date.now();
          return impl.renderNonAmpCreative().then(() => {
            expect(Date.now() - startTime).to.be.at.most(50);
          });
        });

        it('should NOT throttle if experiment throttle not enabled', () => {
          impl.win['3pla'] = 1;
          const startTime = Date.now();
          return impl.renderNonAmpCreative().then(() => {
            expect(Date.now() - startTime).to.be.at.most(50);
          });
        });

        it('should NOT throttle if idle render and no previous', () => {
          impl.win['3pla'] = 0;
          const startTime = Date.now();
          return impl.renderNonAmpCreative().then(() => {
            expect(Date.now() - startTime).to.be.at.most(50);
          });
        });
      });

      describe('#preconnect', () => {
        beforeEach(() => {
          element = createElementWithAttributes(doc, 'amp-ad', {
            'width': '200',
            'height': '50',
            'type': 'doubleclick',
          });
          doc.body.appendChild(element);
          impl = new AmpAdNetworkDoubleclickImpl(element);
        });

        it('should preload safeframe', () => {
          const preloadSpy = sandbox.stub(Preconnect.prototype, 'preload');
          // Note that this causes preconnection to tpc.googlesyndication.com
          // due to preloading safeframe.
          expect(impl.getPreconnectUrls()).to.deep.equal(
              ['https://securepubads.g.doubleclick.net/']);
          expect(preloadSpy).to.be.calledOnce;
          expect(preloadSpy.args[0]).to.match(/safeframe/);
        });
      });
    });
