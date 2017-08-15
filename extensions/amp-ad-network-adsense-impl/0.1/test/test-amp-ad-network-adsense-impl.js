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
  AmpAdNetworkAdsenseImpl,
  resetSharedState,
} from '../amp-ad-network-adsense-impl';
import {
  ADSENSE_A4A_EXPERIMENT_NAME,
  ADSENSE_EXPERIMENT_FEATURE,
} from '../adsense-a4a-config';
import {
  installExtensionsService,
} from '../../../../src/service/extensions-impl';
import {Services} from '../../../../src/services';
import {AmpAdUIHandler} from '../../../amp-ad/0.1/amp-ad-ui'; // eslint-disable-line no-unused-vars
import {
  AmpAdXOriginIframeHandler,    // eslint-disable-line no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {
  createElementWithAttributes,
  addAttributesToElement,
} from '../../../../src/dom';
import {
  toggleExperiment,
  forceExperimentBranch,
} from '../../../../src/experiments';
import {
  ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME,
  AdSenseAmpAutoAdsHoldoutBranches,
} from '../../../../ads/google/adsense-amp-auto-ads';

function createAdsenseImplElement(attributes, doc, opt_tag) {
  const tag = opt_tag || 'amp-ad';
  const element = createElementWithAttributes(doc, tag, {
    'type': 'adsense',
  });
  return addAttributesToElement(element, attributes);
}

describes.realWin('amp-ad-network-adsense-impl', {amp: true}, env => {
  let impl;
  let element;

  /**
   * Instantiates element and impl, adding the former to the document of the
   * iframe.
   * @param {!{width, height, type}} config
   */
  function createImplTag(config) {
    config.type = 'adsense';
    element = createElementWithAttributes(env.win.document, 'amp-ad', config);
    // To trigger CSS styling.
    element.setAttribute('data-a4a-upgrade-type',
        'amp-ad-network-adsense-impl');
    // Used to test styling which is targetted at first iframe child of
    // amp-ad.
    const iframe = env.win.document.createElement('iframe');
    element.appendChild(iframe);
    document.body.appendChild(element);
    impl = new AmpAdNetworkAdsenseImpl(element);
    impl.buildCallback();
    impl.iframe = iframe;
  }


  beforeEach(() => {
    sandbox.stub(AmpAdNetworkAdsenseImpl.prototype, 'getSigningServiceNames',
        () => {
          return ['google'];
        });
    element = createAdsenseImplElement({
      'data-ad-client': 'ca-adsense',
      'width': '320',
      'height': '50',
      'data-experiment-id': '8675309',
    }, env.win.document);
    document.body.appendChild(element);
    impl = new AmpAdNetworkAdsenseImpl(element);
  });

  describe('#isValidElement', () => {
    it('should be valid', () => {
      expect(impl.isValidElement()).to.be.true;
    });
    it('should NOT be valid (impl tag name)', () => {
      element = createAdsenseImplElement({'data-ad-client': 'ca-adsense'},
          env.win.document, 'amp-ad-network-adsense-impl');
      impl = new AmpAdNetworkAdsenseImpl(element);
      expect(impl.isValidElement()).to.be.false;
    });
    it('should be NOT valid (missing ad client)', () => {
      element.setAttribute('data-ad-client', '');
      element.setAttribute('type', 'adsense');
      expect(impl.isValidElement()).to.be.false;
    });
    it('should be valid (amp-embed)', () => {
      element = createAdsenseImplElement({'data-ad-client': 'ca-adsense'},
          env.win.document, 'amp-embed');
      impl = new AmpAdNetworkAdsenseImpl(element);
      // Force test mode to ensure isGoogleAdsA4AValidEnvironment returns
      // true.
      impl.win.AMP_MODE = {test: true};
      expect(impl.isValidElement()).to.be.true;
    });
  });

  describe('#extractSize', () => {
    let loadExtensionSpy;

    beforeEach(() => {
      const doc = env.win.document;
      element = createElementWithAttributes(doc, 'amp-ad', {
        'width': '200',
        'height': '50',
        'type': 'adsense',
        'layout': 'fixed',
      });
      impl = new AmpAdNetworkAdsenseImpl(element);
      installExtensionsService(impl.win);
      const extensions = Services.extensionsFor(impl.win);
      loadExtensionSpy = sandbox.spy(extensions, 'loadExtension');
    });

    it('without analytics', () => {
      impl.extractSize({
        get() {
          return undefined;
        },
        has() {
          return false;
        },
      });
      expect(loadExtensionSpy.withArgs('amp-analytics')).to.not.be.called;
    });
    it('with analytics', () => {
      const url = ['https://foo.com?a=b', 'https://blah.com?lsk=sdk&sld=vj'];
      impl.extractSize({
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
      });
      expect(loadExtensionSpy.withArgs('amp-analytics')).to.be.called;
      // exact value of ampAnalyticsConfig_ covered in
      // ads/google/test/test-utils.js
    });
  });

  describe('#onNetworkFailure', () => {

    it('should append error parameter', () => {
      const TEST_URL = 'https://somenetwork.com/foo?hello=world&a=b';
      expect(impl.onNetworkFailure(new Error('xhr failure'), TEST_URL))
          .to.jsonEqual({adUrl: TEST_URL + '&aet=n'});
    });
  });

  describe('#onCreativeRender', () => {
    beforeEach(() => {
      const doc = env.win.document;
      element = createElementWithAttributes(doc, 'amp-ad', {
        'width': '200',
        'height': '50',
        'type': 'adsense',
      });
      impl = new AmpAdNetworkAdsenseImpl(element);
      installExtensionsService(impl.win);
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
      // Next two lines are to ensure that internal parts not relevant for this
      // test are properly set.
      impl.size_ = {width: 200, height: 50};
      impl.iframe = impl.win.document.createElement('iframe');
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

    function verifyCss(iframe) {
      expect(iframe).to.be.ok;
      const style = window.getComputedStyle(iframe);
      expect(style.top).to.equal('50%');
      expect(style.left).to.equal('50%');
      // We expect these set, but the exact dimensions will be determined by the
      // IOb.
      expect(style.width).to.be.ok;
      expect(style.height).to.be.ok;
      // We don't know the exact values by which the frame will be translated,
      // as this can vary depending on whether we use the height/width
      // attributes, or the actual size of the frame. To make this less of a
      // hassle, we'll just match against regexp.
      expect(style.transform).to.match(new RegExp(
          'matrix\\(1, 0, 0, 1, -[0-9]+, -[0-9]+\\)'));
    }

    afterEach(() => document.body.removeChild(impl.element));

    it('centers iframe in slot when height && width', () => {
      createImplTag({
        width: '300',
        height: '150',
      });
      // Need to call upgradeCallback on AmpAd element to ensure upgrade
      // attribute is set such that CSS is applies.
      new AmpAd(element).upgradeCallback();
      expect(impl.element.getAttribute('width')).to.equal('300');
      expect(impl.element.getAttribute('height')).to.equal('150');
      verifyCss(impl.iframe);
    });
    it('centers iframe in slot when !height && !width', () => {
      createImplTag({
        layout: 'fixed',
      });
      // Need to call upgradeCallback on AmpAd element to ensure upgrade
      // attribute is set such that CSS is applies.
      new AmpAd(element).upgradeCallback();
      expect(impl.element.getAttribute('width')).to.be.null;
      expect(impl.element.getAttribute('height')).to.be.null;
      verifyCss(impl.iframe);
    });
    it('centers iframe in slot when !height && width', () => {
      createImplTag({
        width: '300',
        layout: 'fixed',
      });
      // Need to call upgradeCallback on AmpAd element to ensure upgrade
      // attribute is set such that CSS is applies.
      new AmpAd(element).upgradeCallback();
      expect(impl.element.getAttribute('width')).to.equal('300');
      expect(impl.element.getAttribute('height')).to.be.null;
      verifyCss(impl.iframe);
    });
    it('centers iframe in slot when height && !width', () => {
      createImplTag({
        height: '150',
        layout: 'fixed',
      });
      // Need to call upgradeCallback on AmpAd element to ensure upgrade
      // attribute is set such that CSS is applies.
      new AmpAd(element).upgradeCallback();
      expect(impl.element.getAttribute('width')).to.be.null;
      expect(impl.element.getAttribute('height')).to.equal('150');
      verifyCss(impl.iframe);
    });
  });

  describe('#getAdUrl', () => {

    beforeEach(() => {
      resetSharedState();
    });

    afterEach(() => {
      toggleExperiment(impl.win, 'as-use-attr-for-format', false);
      toggleExperiment(
          impl.win, 'ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME', false);
    });

    it('should contain act', () => {
      const ampStickyAd =
            createElementWithAttributes(env.win.document, 'amp-sticky-ad', {
              'layout': 'nodisplay',
            });
      ampStickyAd.appendChild(element);
      env.win.document.body.appendChild(ampStickyAd);
      return impl.getAdUrl().then(adUrl => {
        expect(adUrl.indexOf('act=sa') >= 0).to.be.true;
      });
    });

    it('formats client properly', () => {
      element.setAttribute('data-ad-client', 'SoMeClient');
      return impl.getAdUrl().then(url => {
        expect(url).to.match(/\\?client=ca-someclient/);
      });
    });
    it('has correct format when width == "auto"', () => {
      element.setAttribute('width', 'auto');
      expect(impl.element.getAttribute('width')).to.equal('auto');
      return impl.getAdUrl().then(url =>
        // With exp as-use-attr-for-format off, we can't test for specific
        // numbers, but we know that the values should be numeric.
        expect(url).to.match(/format=\d+x\d+&w=\d+&h=\d+/));
    });
    it('has correct format when height == "auto"', () => {
      element.setAttribute('height', 'auto');
      expect(impl.element.getAttribute('height')).to.equal('auto');
      return impl.getAdUrl().then(url =>
        // With exp as-use-attr-for-format off, we can't test for specific
        // numbers, but we know that the values should be numeric.
        expect(url).to.match(/format=\d+x\d+&w=\d+&h=\d+/));
    });
    it('has correct format when as-use-attr-for-format is on', () => {
      toggleExperiment(impl.win, 'as-use-attr-for-format', true);
      const width = element.getAttribute('width');
      const height = element.getAttribute('height');
      return impl.getAdUrl().then(url =>
        // With exp as-use-attr-for-format off, we can't test for specific
        // numbers, but we know that the values should be numeric.
        expect(url).to.match(new RegExp(
            `format=${width}x${height}&w=${width}&h=${height}`)));
    });
    it('has correct format when width=auto and as-use-attr-for-format is on',
        () => {
          toggleExperiment(impl.win, 'as-use-attr-for-format', true);
          element.setAttribute('width', 'auto');
          expect(impl.element.getAttribute('width')).to.equal('auto');
          return impl.getAdUrl().then(url =>
              // Ensure that "auto" doesn't appear anywhere here:
              expect(url).to.match(/format=\d+x\d+&w=\d+&h=\d+/));
        });
    it('includes eid when in amp-auto-ads holdout control', () => {
      forceExperimentBranch(impl.win,
          ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME,
          AdSenseAmpAutoAdsHoldoutBranches.CONTROL);
      return impl.getAdUrl().then(url => {
        expect(url).to.match(new RegExp(
            `eid=[^&]*${AdSenseAmpAutoAdsHoldoutBranches.CONTROL}`));
      });
    });
    it('includes eid when in amp-auto-ads holdout experiment', () => {
      forceExperimentBranch(impl.win,
          ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME,
          AdSenseAmpAutoAdsHoldoutBranches.EXPERIMENT);
      return impl.getAdUrl().then(url => {
        expect(url).to.match(new RegExp(
            `eid=[^&]*${AdSenseAmpAutoAdsHoldoutBranches.EXPERIMENT}`));
      });
    });
    it('returns the right URL', () => {
      element.setAttribute('data-ad-slot', 'some_slot');
      return impl.getAdUrl().then(url => {
        [
          /^https:\/\/googleads\.g\.doubleclick\.net\/pagead\/ads/,
          /(\?|&)adk=\d+(&|$)/,
          /(\?|&)is_amp=3(&|$)/,
          /(\?|&)amp_v=%24internalRuntimeVersion%24(&|$)/,
          /(\?|&)client=ca-adsense(&|$)/,
          /(\?|&)format=\d+x\d+(&|$)/,
          /(\?|&)iu=some_slot(&|$)/,
          /(\?|&)w=\d+(&|$)/,
          /(\?|&)h=\d+(&|$)/,
          /(\?|&)d_imp=1(&|$)/,
          /(\?|&)dt=\d+(&|$)/,
          /(\?|&)ifi=\d+(&|$)/,
          /(\?|&)adf=\d+(&|$)/,
          /(\?|&)c=\d+(&|$)/,
          /(\?|&)biw=\d+(&|$)/,
          /(\?|&)bih=\d+(&|$)/,
          /(\?|&)adx=-?\d+(&|$)/,
          /(\?|&)ady=-?\d+(&|$)/,
          /(\?|&)u_aw=\d+(&|$)/,
          /(\?|&)u_ah=\d+(&|$)/,
          /(\?|&)u_cd=24(&|$)/,
          /(\?|&)u_w=\d+(&|$)/,
          /(\?|&)u_h=\d+(&|$)/,
          /(\?|&)u_tz=-?\d+(&|$)/,
          /(\?|&)u_his=\d+(&|$)/,
          /(\?|&)oid=2(&|$)/,
          /(\?|&)isw=\d+(&|$)/,
          /(\?|&)ish=\d+(&|$)/,
          /(\?|&)pfx=(1|0)(&|$)/,
          /(\?|&)url=https?%3A%2F%2F[a-zA-Z0-9.:%]+(&|$)/,
          /(\?|&)top=localhost(&|$)/,
          /(\?|&)ref=https?%3A%2F%2Flocalhost%3A9876%2F%3Fid%3D\d+(&|$)/,
          /(\?|&)dtd=\d+(&|$)/,
        ].forEach(regexp => expect(url).to.match(regexp));
      });
    });

    // Not using arrow function here because otherwise the way closure behaves
    // prevents me from calling this.timeout(5000).
    it('with multiple slots', function() {
      // When ran locally, this test tends to exceed 2000ms timeout.
      this.timeout(5000);
      // Reset counter for purpose of this test.
      delete env.win['ampAdGoogleIfiCounter'];
      const elem1 = createAdsenseImplElement({
        'data-ad-client': 'ca-adsense',
        'width': '320',
        'height': '50',
        'data-experiment-id': '8675309',
      }, env.win.document);
      env.win.document.body.appendChild(elem1);
      const elem2 = createAdsenseImplElement({
        'data-ad-client': 'ca-adsense',
        'width': '320',
        'height': '50',
        'data-experiment-id': '8675309',
      }, env.win.document, 'amp-ad');
      env.win.document.body.appendChild(elem2);
      const elem3 = createAdsenseImplElement({
        'data-ad-client': 'ca-not-adsense',
        'width': '320',
        'height': '50',
        'data-experiment-id': '8675309',
      }, env.win.document, 'amp-ad');
      env.win.document.body.appendChild(elem3);
      const impl1 = new AmpAdNetworkAdsenseImpl(elem1);
      const impl2 = new AmpAdNetworkAdsenseImpl(elem2);
      const impl3 = new AmpAdNetworkAdsenseImpl(elem3);
      toggleExperiment(impl1.win, 'as-use-attr-for-format', true);
      //new AmpAd(elem1).upgradeCallback();
      return impl1.getAdUrl().then(adUrl1 => {
        expect(adUrl1).to.match(/pv=2/);
        expect(adUrl1).to.not.match(/prev_fmts/);
        expect(adUrl1).to.match(/ifi=1/);
        //new AmpAd(elem2).upgradeCallback();
        return impl2.getAdUrl().then(adUrl2 => {
          expect(adUrl2).to.match(/pv=1/);
          expect(adUrl2).to.match(/prev_fmts=320x50/);
          expect(adUrl2).to.match(/ifi=2/);
          //new AmpAd(elem3).upgradeCallback();
          return impl3.getAdUrl().then(adUrl3 => {
            expect(adUrl3).to.match(/pv=2/);
            // By some quirk of the test infrastructure, when this test
            // is ran individually, each added slot after the first one
            // has a bounding rectangle of 0x0. The important thing to
            // test here is the number of previous formats.
            expect(adUrl3).to.match(
                /prev_fmts=(320x50%2C320x50|320x50%2C0x0)/);
            expect(adUrl3).to.match(/ifi=3/);
          });
        });
      });
    });
  });

  describe('#unlayoutCallback', () => {
    it('should call #resetSlot, remove child iframe, but keep other children',
        () => {
          createImplTag({
            width: '300',
            height: '150',
          });
          impl.win.ampAdSlotIdCounter = 1;
          expect(impl.element.getAttribute('data-amp-slot-index')).to.not.be.ok;

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
          expect(impl.element.getAttribute('data-amp-slot-index'))
              .to.equal('1');
        });
  });

  describe('#delayAdRequestEnabled', () => {
    let impl;
    beforeEach(() => {
      impl = new AmpAdNetworkAdsenseImpl(
        createElementWithAttributes(env.win.document, 'amp-ad', {
          type: 'adsense',
        }));
    });

    it('should return true if in experiment', () => {
      forceExperimentBranch(impl.win, ADSENSE_A4A_EXPERIMENT_NAME,
          ADSENSE_EXPERIMENT_FEATURE.DELAYED_REQUEST);
      expect(impl.delayAdRequestEnabled()).to.be.true;
    });

    it('should return false if not in experiment', () => {
      expect(impl.delayAdRequestEnabled()).to.be.false;
    });
  });
});
