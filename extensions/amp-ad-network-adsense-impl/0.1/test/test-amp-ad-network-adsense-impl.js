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
  ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME,
  AdSenseAmpAutoAdsHoldoutBranches,
} from '../../../../ads/google/adsense-amp-auto-ads';
import {AmpAd} from '../../../amp-ad/0.1/amp-ad';
import {
  AmpAdNetworkAdsenseImpl,
  resetSharedState,
} from '../amp-ad-network-adsense-impl';
import {AmpAdUIHandler} from '../../../amp-ad/0.1/amp-ad-ui'; // eslint-disable-line no-unused-vars
import {
  AmpAdXOriginIframeHandler, // eslint-disable-line no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {Services} from '../../../../src/services';
import {
  addAttributesToElement,
  createElementWithAttributes,
} from '../../../../src/dom';
import {
  forceExperimentBranch,
  toggleExperiment,
} from '../../../../src/experiments';

function createAdsenseImplElement(attributes, doc, opt_tag) {
  const tag = opt_tag || 'amp-ad';
  const element = createElementWithAttributes(doc, tag, {
    'type': 'adsense',
  });
  return addAttributesToElement(element, attributes);
}

describes.realWin('amp-ad-network-adsense-impl', {
  amp: {
    extensions: ['amp-ad', 'amp-ad-network-adsense-impl'],
    // runtimeOn: true,
  },
}, env => {
  let win, doc, ampdoc, viewer;
  let impl;
  let element;
  let isResponsiveStub;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    sandbox.stub(
        AmpAdNetworkAdsenseImpl.prototype, 'getSigningServiceNames').callsFake(
        () => {
          return ['google'];
        });
    viewer = win.services.viewer.obj;
    sandbox.stub(viewer, 'getReferrerUrl').callsFake(
        () => Promise.resolve('https://acme.org/'));
    element = createAdsenseImplElement({
      'data-ad-client': 'ca-adsense',
      'width': '320',
      'height': '50',
      'data-experiment-id': '8675309',
    }, doc);
    sandbox.stub(element, 'tryUpgrade_').callsFake(() => {});
    doc.body.appendChild(element);
    impl = new AmpAdNetworkAdsenseImpl(element);
    impl.win['goog_identity_prom'] = Promise.resolve({});
    isResponsiveStub = sandbox.stub(impl, 'isResponsive_');
  });

  /**
   * Instantiates element and impl, adding the former to the document of the
   * iframe.
   * @param {!{width, height, type}} config
   */
  function createImplTag(config) {
    config.type = 'adsense';
    element = createElementWithAttributes(doc, 'amp-ad', config);
    // To trigger CSS styling.
    element.setAttribute('data-a4a-upgrade-type',
        'amp-ad-network-adsense-impl');
    // Used to test styling which is targetted at first iframe child of
    // amp-ad.
    const iframe = doc.createElement('iframe');
    element.appendChild(iframe);
    sandbox.stub(element, 'tryUpgrade_').callsFake(() => {});
    doc.body.appendChild(element);
    impl = new AmpAdNetworkAdsenseImpl(element);
    impl.buildCallback();
    element.classList.remove('i-amphtml-notbuilt');
    impl.iframe = iframe;
  }

  describe('#isValidElement', () => {
    it('should be valid', () => {
      expect(impl.isValidElement()).to.be.true;
    });
    it('should be valid (responsive)', () => {
      isResponsiveStub.callsFake(() => true);
      element.setAttribute('data-full-width', 'true');
      element.setAttribute('height', '320');
      element.setAttribute('width', '100vw');
      expect(impl.isValidElement()).to.be.true;
    });
    it('should NOT be valid (responsive with wrong height)', () => {
      isResponsiveStub.callsFake(() => true);
      element.setAttribute('data-full-width', 'true');
      element.setAttribute('height', '666');
      element.setAttribute('width', '100vw');
      expect(impl.isValidElement()).to.be.false;
    });
    it('should NOT be valid (responsive with wrong width)', () => {
      isResponsiveStub.callsFake(() => true);
      element.setAttribute('data-full-width', 'true');
      element.setAttribute('height', '320');
      element.setAttribute('width', '666');
      expect(impl.isValidElement()).to.be.false;
    });
    it('should NOT be valid (responsive with missing data-full-width)', () => {
      isResponsiveStub.callsFake(() => true);
      element.setAttribute('height', '320');
      element.setAttribute('width', '100vw');
      expect(impl.isValidElement()).to.be.false;
    });
    it('should NOT be valid (impl tag name)', () => {
      element = createAdsenseImplElement({'data-ad-client': 'ca-adsense'},
          doc, 'amp-ad-network-adsense-impl');
      impl = new AmpAdNetworkAdsenseImpl(element);
      expect(impl.isValidElement()).to.be.false;
    });
    it('should NOT be valid (missing ad client)', () => {
      element.setAttribute('data-ad-client', '');
      element.setAttribute('type', 'adsense');
      expect(impl.isValidElement()).to.be.false;
    });
    it('should be valid (amp-embed)', () => {
      element = createAdsenseImplElement({'data-ad-client': 'ca-adsense'},
          doc, 'amp-embed');
      impl = new AmpAdNetworkAdsenseImpl(element);
      expect(impl.isValidElement()).to.be.true;
    });
  });

  describe('#extractSize', () => {
    let preloadExtensionSpy;

    beforeEach(() => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'width': '200',
        'height': '50',
        'type': 'adsense',
        'layout': 'fixed',
      });
      impl = new AmpAdNetworkAdsenseImpl(element);
      sandbox.stub(impl, 'getAmpDoc').callsFake(() => ampdoc);
      const extensions = Services.extensionsFor(impl.win);
      preloadExtensionSpy = sandbox.spy(extensions, 'preloadExtension');
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
      expect(preloadExtensionSpy.withArgs('amp-analytics')).to.not.be.called;
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
      expect(preloadExtensionSpy.withArgs('amp-analytics')).to.be.called;
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
      element = createElementWithAttributes(doc, 'amp-ad', {
        'width': '200',
        'height': '50',
        'type': 'adsense',
      });
      impl = new AmpAdNetworkAdsenseImpl(element);
      sandbox.stub(impl, 'getAmpDoc').callsFake(() => ampdoc);
      sandbox.stub(env.ampdocService, 'getAmpDoc').callsFake(() => ampdoc);
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

  describe('centering', () => {

    function verifyCss(iframe) {
      expect(iframe).to.be.ok;
      const style = win.getComputedStyle(iframe);
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
            createElementWithAttributes(doc, 'amp-sticky-ad', {
              'layout': 'nodisplay',
            });
      ampStickyAd.appendChild(element);
      doc.body.appendChild(ampStickyAd);
      return impl.getAdUrl().then(adUrl => {
        expect(adUrl).to.contain('act=sa');
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
      element.setAttribute('data-language', 'lxz');
      return impl.getAdUrl().then(url => {
        [
          /^https:\/\/googleads\.g\.doubleclick\.net\/pagead\/ads/,
          /(\?|&)adk=\d+(&|$)/,
          /(\?|&)is_amp=3(&|$)/,
          /(\?|&)amp_v=%24internalRuntimeVersion%24(&|$)/,
          /(\?|&)client=ca-adsense(&|$)/,
          /(\?|&)format=\d+x\d+(&|$)/,
          /(\?|&)iu=some_slot(&|$)/,
          /(\?|&)output=html(&|$)/,
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
          /(\?|&)hl=lxz(&|$)/,
          /(\?|&)url=https?%3A%2F%2F[a-zA-Z0-9.:%]+(&|$)/,
          /(\?|&)top=localhost(&|$)/,
          /(\?|&)ref=https%3A%2F%2Facme.org%2F(&|$)/,
          /(\?|&)dtd=\d+(&|$)/,
        ].forEach(regexp => expect(url).to.match(regexp));
      });
      it('sets rafmt for responsive', () => {
        element.setAttribute('data-ad-slot', 'some_slot');
        element.setAttribute('data-auto-format', 'rspv');
        return impl.getAdUrl().then(url => {
          expect(url).to.match(/(\?|&)ramft=13(&|$)/);
        });
      });
    });

    // Not using arrow function here because otherwise the way closure behaves
    // prevents me from calling this.timeout(5000).
    it('with multiple slots', function() {
      // When run locally, this test tends to exceed 2000ms timeout.
      this.timeout(10000);
      // Reset counter for purpose of this test.
      delete win['ampAdGoogleIfiCounter'];
      const elem1 = createAdsenseImplElement({
        'data-ad-client': 'ca-adsense',
        'width': '320',
        'height': '50',
        'data-experiment-id': '8675309',
      }, doc);
      doc.body.appendChild(elem1);
      const elem2 = createAdsenseImplElement({
        'data-ad-client': 'ca-adsense',
        'width': '320',
        'height': '50',
        'data-experiment-id': '8675309',
        'data-ad-slot': 'slotname_foo',
      }, doc, 'amp-ad');
      doc.body.appendChild(elem2);
      const elem3 = createAdsenseImplElement({
        'data-ad-client': 'ca-not-adsense',
        'width': '320',
        'height': '50',
        'data-experiment-id': '8675309',
      }, doc, 'amp-ad');
      doc.body.appendChild(elem3);
      const impl1 = new AmpAdNetworkAdsenseImpl(elem1);
      const impl2 = new AmpAdNetworkAdsenseImpl(elem2);
      const impl3 = new AmpAdNetworkAdsenseImpl(elem3);
      toggleExperiment(impl1.win, 'as-use-attr-for-format', true);
      return impl1.getAdUrl().then(adUrl1 => {
        expect(adUrl1).to.match(/pv=2/);
        expect(adUrl1).to.not.match(/prev_fmts/);
        expect(adUrl1).to.not.match(/prev_slotnames/);
        expect(adUrl1).to.match(/ifi=1/);
        return impl2.getAdUrl().then(adUrl2 => {
          expect(adUrl2).to.match(/pv=1/);
          expect(adUrl2).to.match(/prev_fmts=320x50/);
          expect(adUrl2).to.not.match(/prev_slotnames/);
          expect(adUrl2).to.match(/ifi=2/);
          return impl3.getAdUrl().then(adUrl3 => {
            expect(adUrl3).to.match(/pv=2/);
            // By some quirk of the test infrastructure, when this test
            // is ran individually, each added slot after the first one
            // has a bounding rectangle of 0x0. The important thing to
            // test here is the number of previous formats.
            expect(adUrl3).to.match(
                /prev_fmts=(320x50%2C320x50|320x50%2C0x0)/);
            expect(adUrl3).to.match(/prev_slotnames=slotname_foo/);
            expect(adUrl3).to.match(/ifi=3/);
          });
        });
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
      createImplTag({
        width: '300',
        height: '150',
      });
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

  describe('#buildCallback', () => {

    const VIEWPORT_WIDTH = 375;
    const VIEWPORT_HEIGHT = 667;

    let iframe;

    function constructImpl(config) {
      iframe = env.win.document.createElement('iframe');

      config.type = 'adsense';
      element = createElementWithAttributes(doc, 'amp-ad', config);
      element.appendChild(iframe);
      document.body.appendChild(element);
      impl = new AmpAdNetworkAdsenseImpl(element);
      impl.element.style.display = 'block';
      impl.element.style.position = 'relative';
      impl.element.style.top = '101vh';

      // Fix the viewport to a consistent size to that the test doesn't depend
      // on the actual browser window opened.
      impl.getViewport().getSize =
          () => ({width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT});
    }

    it('should do nothing for non-responsive', () => {
      constructImpl({
        width: '320',
        height: '150',
      });
      expect(impl.buildCallback()).to.be.undefined;
    });

    it('should schedule a resize for responsive', () => {
      constructImpl({
        width: '100vw',
        height: '100',
        'data-auto-format': 'rspv',
      });

      const callback = impl.buildCallback();
      expect(callback).to.exist;

      // The returned promise fails for some reason.
      return callback.then(() => {
        expect(element.offsetHeight).to.equal(300);
        expect(element.offsetWidth).to.equal(VIEWPORT_WIDTH);
      });
    });
  });

  describe('#onLayoutMeasure', () => {

    const VIEWPORT_WIDTH = 375;
    const VIEWPORT_HEIGHT = 667;

    // Nested elements to contain the ad. (container contains the ad, and
    // containerContainer contains that container.)
    let containerContainer, container;
    let iframe;

    function buildImpl(config) {
      // Create an element with horizontal margins for the ad to break out of.
      containerContainer.style.marginLeft = '5px';
      containerContainer.style.marginRight = '9px';

      // Create an element with horizontal margins for the ad to break out of.
      container.style.marginLeft = '19px';
      container.style.marginRight = '25px';

      config.type = 'adsense';
      config['data-ad-client'] = 'ca-pub-1234';

      element = createElementWithAttributes(doc, 'amp-ad', config);
      iframe = doc.createElement('iframe');

      element.appendChild(iframe);
      container.appendChild(element);
      containerContainer.appendChild(container);
      doc.body.appendChild(containerContainer);

      impl = new AmpAdNetworkAdsenseImpl(element);
      impl.element.style.display = 'block';
      impl.element.style.position = 'relative';
      impl.element.style.top = '150vh';

      // Stub out vsync tasks to run immediately.
      impl.getVsync().run = (vsyncTaskSpec, vsyncState) => {
        vsyncTaskSpec.measure(vsyncState);
        vsyncTaskSpec.mutate(vsyncState);
      };

      // Fix the viewport to a consistent size to that the test doesn't depend
      // on the actual browser window opened.
      impl.getViewport().getSize =
          () => ({width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT});

      return impl.buildCallback();
    }

    beforeEach(() => {
      viewer.toggleRuntime(); // Turn runtime on for these tests.
    });

    afterEach(() => {
      viewer.toggleRuntime(); // Turn runtime off again.

      if (containerContainer != null && containerContainer.parentNode != null) {
        containerContainer.parentNode.removeChild(containerContainer);
      }
      doc.body.style.direction = '';
    });

    it('should change left margin for responsive', () => {
      containerContainer = doc.createElement('div');
      container = doc.createElement('div');
      return buildImpl({
        width: '100vw',
        height: '150',
        'data-auto-format': 'rspv',
      }).then(() => {
        impl.onLayoutMeasure();
        // Left margin is 19px from container and 5px from body.
        expect(element.style.marginLeft).to.be.equal('-24px');
        expect(element.style.marginRight).to.be.equal('');
      });
    });

    it('should change right margin for responsive in RTL', () => {
      containerContainer = doc.createElement('div');
      container = doc.createElement('div');
      doc.body.style.direction = 'rtl'; // todo: revert

      return buildImpl({
        width: '100vw',
        height: '150',
        'data-auto-format': 'rspv',
      }).then(() => {
        impl.onLayoutMeasure();
        // Right margin is 9px from containerContainer and 25px from container.
        // TODO(charliereams): In the test harness it is also offset by 15px due
        // to strange scrollbar behaviour. Figure out how to disable this.
        expect(element.style.marginRight).to.be.equal('-49px');
        expect(element.style.marginLeft).to.be.equal('');
      });
    });
  });

  describe('#getResponsiveHeightForContext', () => {
    it('should request 100px height for very small viewports', () => {
      expect(
          AmpAdNetworkAdsenseImpl.getResponsiveHeightForContext_(
              {width: 100, height: 667}))
          .to.be.equal(100);
    });

    it('should request 6:5 aspect ratio for normal viewport (iPhone 5)', () => {
      expect(
          AmpAdNetworkAdsenseImpl.getResponsiveHeightForContext_(
              {width: 320, height: 568}))
          .to.be.equal(267);
    });

    it('should request 300px height for wide viewports', () => {
      expect(
          AmpAdNetworkAdsenseImpl.getResponsiveHeightForContext_(
              {width: 500, height: 667}))
          .to.be.equal(300);
    });
  });

  describe('#delayAdRequestEnabled', () => {
    it('should return true', () => {
      expect(AmpAdNetworkAdsenseImpl.prototype.delayAdRequestEnabled())
          .to.be.true;
    });
  });
});
