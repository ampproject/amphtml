// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import '../../../amp-ad/0.1/amp-ad';
import {
  CONSENT_POLICY_STATE,
  CONSENT_STRING_TYPE,
} from '#core/constants/consent-state';
import {addAttributesToElement, createElementWithAttributes} from '#core/dom';
import {camelCaseToHyphenCase} from '#core/dom/style';
import {utf8Decode, utf8Encode} from '#core/types/string/bytes';
import {toWin} from '#core/window';

import {forceExperimentBranch, toggleExperiment} from '#experiments';
import * as experiments from '#experiments';

import {Services} from '#service';

import {AmpA4A} from '../../../amp-a4a/0.1/amp-a4a';
import {AmpAd} from '../../../amp-ad/0.1/amp-ad';
import {
  AmpAdXOriginIframeHandler, // eslint-disable-line @typescript-eslint/no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {
  AmpAdNetworkAdsenseImpl,
  resetSharedState,
} from '../amp-ad-network-adsense-impl';
import {AD_SIZE_OPTIMIZATION_EXP} from '../responsive-state';

function createAdsenseImplElement(attributes, doc, opt_tag) {
  const tag = opt_tag || 'amp-ad';
  const element = createElementWithAttributes(doc, tag, {
    'type': 'adsense',
  });
  return addAttributesToElement(element, attributes);
}

describes.realWin(
  'amp-ad-network-adsense-impl',
  {
    amp: {
      extensions: ['amp-ad', 'amp-ad-network-adsense-impl'],
    },
  },
  (env) => {
    let win, doc, ampdoc, viewer;
    let impl;
    let element;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;
      env.sandbox
        .stub(AmpAdNetworkAdsenseImpl.prototype, 'getSigningServiceNames')
        .callsFake(() => {
          return ['google'];
        });
      viewer = win.__AMP_SERVICES.viewer.obj;
      env.sandbox
        .stub(viewer, 'getReferrerUrl')
        .callsFake(() => Promise.resolve('https://acme.org/'));
      element = createAdsenseImplElement(
        {
          'data-ad-client': 'ca-adsense',
          'width': '320',
          'height': '50',
          'data-experiment-id': '8675309',
        },
        doc
      );
      env.sandbox.stub(element, 'tryUpgrade_').callsFake(() => {});
      doc.body.appendChild(element);
      impl = new AmpAdNetworkAdsenseImpl(element);
      env.sandbox.stub(Services, 'timerFor').returns({
        timeoutPromise: (unused, promise) => {
          if (promise) {
            return promise;
          }
          return Promise.reject(new Error('No token'));
        },
      });
      env.sandbox
        .stub(impl, 'getIntersectionElementLayoutBox')
        .callsFake(() => {
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

    /**
     * Instantiates element and impl, adding the former to the document of the
     * iframe.
     * @param {!{width, height, type}} config
     */
    function createImplTag(config) {
      config.type = 'adsense';
      element = createElementWithAttributes(doc, 'amp-ad', config);
      // To trigger CSS styling.
      element.setAttribute(
        'data-a4a-upgrade-type',
        'amp-ad-network-adsense-impl'
      );
      // Used to test styling which is targetted at first iframe child of
      // amp-ad.
      const iframe = doc.createElement('iframe');
      element.appendChild(iframe);
      env.sandbox.stub(element, 'tryUpgrade_').callsFake(() => {});
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
        element.setAttribute('data-auto-format', 'rspv');
        element.setAttribute('data-full-width', 'true');
        element.setAttribute('height', '320');
        element.setAttribute('width', '100vw');
        impl = new AmpAdNetworkAdsenseImpl(element);

        expect(impl.isValidElement()).to.be.true;
      });
      it('should NOT be valid (responsive with wrong height)', () => {
        element.setAttribute('data-auto-format', 'rspv');
        element.setAttribute('data-full-width', 'true');
        element.setAttribute('height', '666');
        element.setAttribute('width', '100vw');
        impl = new AmpAdNetworkAdsenseImpl(element);

        expect(impl.isValidElement()).to.be.false;
      });
      it('should NOT be valid (responsive with wrong width)', () => {
        element.setAttribute('data-auto-format', 'rspv');
        element.setAttribute('data-full-width', 'true');
        element.setAttribute('height', '320');
        element.setAttribute('width', '666');
        impl = new AmpAdNetworkAdsenseImpl(element);

        expect(impl.isValidElement()).to.be.false;
      });
      it('should NOT be valid (responsive with missing data-full-width)', () => {
        element.setAttribute('data-auto-format', 'rspv');
        element.setAttribute('height', '320');
        element.setAttribute('width', '100vw');
        impl = new AmpAdNetworkAdsenseImpl(element);

        expect(impl.isValidElement()).to.be.false;
      });
      it('should NOT be valid (impl tag name)', () => {
        element = createAdsenseImplElement(
          {'data-ad-client': 'ca-adsense'},
          doc,
          'amp-ad-network-adsense-impl'
        );
        impl = new AmpAdNetworkAdsenseImpl(element);
        expect(impl.isValidElement()).to.be.false;
      });
      it('should NOT be valid (missing ad client)', () => {
        element.setAttribute('data-ad-client', '');
        element.setAttribute('type', 'adsense');
        impl = new AmpAdNetworkAdsenseImpl(element);

        expect(impl.isValidElement()).to.be.false;
      });
      it('should be valid (amp-embed)', () => {
        element = createAdsenseImplElement(
          {'data-ad-client': 'ca-adsense'},
          doc,
          'amp-embed'
        );
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
        env.sandbox.stub(impl, 'getAmpDoc').callsFake(() => ampdoc);
        const extensions = Services.extensionsFor(impl.win);
        preloadExtensionSpy = env.sandbox.spy(extensions, 'preloadExtension');
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

      it('should consume sandbox header', () => {
        impl.extractSize({
          get(name) {
            switch (name) {
              case 'amp-ff-sandbox':
                return 'true';
              default:
                return undefined;
            }
          },
          has(name) {
            return !!this.get(name);
          },
        });
        expect(impl.sandboxHTMLCreativeFrame()).to.be.true;
      });
    });

    describe('#onNetworkFailure', () => {
      it('should append error parameter', () => {
        const TEST_URL = 'https://somenetwork.com/foo?hello=world&a=b';
        expect(
          impl.onNetworkFailure(new Error('xhr failure'), TEST_URL)
        ).to.jsonEqual({adUrl: TEST_URL + '&aet=n'});
      });
    });

    describe('#onCreativeRender', () => {
      beforeEach(() => {
        element = createElementWithAttributes(doc, 'amp-ad', {
          'width': '200',
          'height': '50',
          'type': 'adsense',
        });
        doc.body.appendChild(element);
        impl = new AmpAdNetworkAdsenseImpl(element);
        impl.getA4aAnalyticsConfig = () => {};
        impl.buildCallback();
        env.sandbox.stub(impl, 'getAmpDoc').callsFake(() => ampdoc);
        env.sandbox
          .stub(env.ampdocService, 'getAmpDoc')
          .callsFake(() => ampdoc);
      });

      [true, false].forEach((exp) => {
        it(
          'injects amp analytics' +
            (exp ? ', trigger immediate disable exp' : ''),
          () => {
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
              get: function (name) {
                if (name == 'X-QQID') {
                  return 'qqid_string';
                }
              },
              has: function (name) {
                if (name == 'X-QQID') {
                  return true;
                }
              },
            };
            // Next two lines are to ensure that internal parts not relevant for
            // this test are properly set.
            impl.size_ = {width: 200, height: 50};
            impl.iframe = impl.win.document.createElement('iframe');
            if (exp) {
              impl.postAdResponseExperimentFeatures['avr_disable_immediate'] =
                '1';
            }
            impl.onCreativeRender(false);
            const ampAnalyticsElement =
              impl.element.querySelector('amp-analytics');
            expect(ampAnalyticsElement).to.be.ok;
            expect(ampAnalyticsElement.CONFIG).jsonEqual(
              impl.ampAnalyticsConfig_
            );
            expect(ampAnalyticsElement.getAttribute('sandbox')).to.equal(
              'true'
            );
            expect(ampAnalyticsElement.getAttribute('trigger')).to.equal(
              exp ? '' : 'immediate'
            );
            expect(impl.ampAnalyticsElement_).to.be.ok;
            // Exact format of amp-analytics element covered in
            // test/unit/test-analytics.js.
            // Just ensure extensions is loaded, and analytics element appended.
          }
        );
      });

      it('should register click listener', () => {
        impl.iframe = impl.win.document.createElement('iframe');
        impl.win.document.body.appendChild(impl.iframe);
        const adBody = impl.iframe.contentDocument.body;
        let clickHandlerCalled = 0;

        adBody.onclick = function (e) {
          expect(e.defaultPrevented).to.be.false;
          e.preventDefault(); // Make the test not actually navigate.
          clickHandlerCalled++;
        };
        adBody.innerHTML =
          '<a ' +
          'href="https://f.co?CLICK_X,CLICK_Y,RANDOM">' +
          '<button id="target"><button></div>';
        const button = adBody.querySelector('#target');
        const a = adBody.querySelector('a');
        const ev1 = new Event('click', {bubbles: true});
        ev1.pageX = 10;
        ev1.pageY = 20;
        env.sandbox.stub(impl, 'getResource').returns({
          getUpgradeDelayMs: () => 1,
        });

        // Make sure the ad iframe (FIE) has a local URL replacements service.
        const urlReplacements = Services.urlReplacementsForDoc(element);
        env.sandbox
          .stub(Services, 'urlReplacementsForDoc')
          .withArgs(a)
          .returns(urlReplacements);

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

        adBody.onclick = function (e) {
          expect(e.defaultPrevented).to.be.false;
          e.preventDefault(); // Make the test not actually navigate.
          clickHandlerCalled++;
        };
        adBody.innerHTML =
          '<a ' +
          'href="https://f.co?CLICK_X,CLICK_Y,RANDOM">' +
          '<button id="target"><button></div>';
        const button = adBody.querySelector('#target');
        const a = adBody.querySelector('a');
        const ev1 = new Event('click', {bubbles: true});
        ev1.pageX = 10;
        ev1.pageY = 20;
        env.sandbox.stub(impl, 'getResource').returns({
          getUpgradeDelayMs: () => 1,
        });
        impl.buildCallback();
        impl.size_ = {width: 123, height: 456};
        impl.onCreativeRender({customElementExtensions: ['amp-ad-exit']});
        button.dispatchEvent(ev1);
        expect(a.href).to.equal('https://f.co/?CLICK_X,CLICK_Y,RANDOM');
        expect(clickHandlerCalled).to.equal(1);
      });

      it('should set iframe id and data-google-query-id attribute', () => {
        impl.buildCallback();
        impl.ifi_ = 3;
        impl.qqid_ = 'abc';
        impl.iframe = impl.win.document.createElement('iframe');
        impl.size_ = {width: 123, height: 456};
        impl.onCreativeRender(null);
        expect(impl.element.getAttribute('data-google-query-id')).to.equal(
          'abc'
        );
        expect(impl.iframe.id).to.equal('google_ads_iframe_3');
      });

      it('should write auto ad size data to localstorage', async () => {
        const storage = await Services.storageForDoc(doc);
        let promiseResolver;
        const savePromise = new Promise((resolve) => {
          promiseResolver = resolve;
        });
        const storageContent = {};
        env.sandbox.stub(storage, 'set').callsFake((key, value) => {
          storageContent[key] = value;
          promiseResolver();
          return Promise.resolve();
        });

        forceExperimentBranch(
          impl.win,
          AD_SIZE_OPTIMIZATION_EXP.branch,
          AD_SIZE_OPTIMIZATION_EXP.experiment
        );
        impl.iframe = {
          contentWindow: window,
          nodeType: 1,
          style: {setProperty: () => {}},
        };
        impl.element.setAttribute('data-ad-client', 'ca-adsense');

        impl.size_ = {width: 123, height: 456};

        impl.onCreativeRender();

        const data = {
          'googMsgType': 'adsense-settings',
          'adClient': 'ca-adsense',
          'enableAutoAdSize': '1',
        };

        win.postMessage(JSON.stringify(data), '*');

        await savePromise;

        expect(storageContent).to.deep.equal({'aas-ca-adsense': true});
      });
    });

    describe('centering', () => {
      function verifyCss(iframe) {
        expect(iframe).to.be.ok;
        const style = win.getComputedStyle(iframe);
        // We expect these set, but the exact dimensions will be determined by the
        // IOb.
        expect(style.width).to.be.ok;
        expect(style.height).to.be.ok;
        // We don't know the exact values by which the frame will be translated,
        // as this can vary depending on whether we use the height/width
        // attributes, or the actual size of the frame. To make this less of a
        // hassle, we'll just match against regexp.
        expect(style.transform).to.equal('none');
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
        allowConsoleError(() =>
          createImplTag({
            layout: 'fixed',
          })
        );
        // Need to call upgradeCallback on AmpAd element to ensure upgrade
        // attribute is set such that CSS is applies.
        new AmpAd(element).upgradeCallback();
        expect(impl.element.getAttribute('width')).to.be.null;
        expect(impl.element.getAttribute('height')).to.be.null;
        verifyCss(impl.iframe);
      });
      it('centers iframe in slot when !height && width', () => {
        allowConsoleError(() =>
          createImplTag({
            width: '300',
            layout: 'fixed',
          })
        );
        // Need to call upgradeCallback on AmpAd element to ensure upgrade
        // attribute is set such that CSS is applies.
        new AmpAd(element).upgradeCallback();
        expect(impl.element.getAttribute('width')).to.equal('300');
        expect(impl.element.getAttribute('height')).to.be.null;
        verifyCss(impl.iframe);
      });
      it('centers iframe in slot when height && !width', () => {
        allowConsoleError(() =>
          createImplTag({
            height: '150',
            layout: 'fixed',
          })
        );
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
        impl.uiHandler = {isStickyAd: () => false};
      });

      afterEach(() => {
        toggleExperiment(
          impl.win,
          'ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME',
          false
        );
      });

      it('should contain act', () => {
        const ampStickyAd = createElementWithAttributes(doc, 'amp-sticky-ad', {
          'layout': 'nodisplay',
        });
        ampStickyAd.appendChild(element);
        doc.body.appendChild(ampStickyAd);
        return impl.getAdUrl().then((adUrl) => {
          expect(adUrl).to.contain('act=sa');
        });
      });

      [
        {noFill: 'true'},
        {noFill: 'ignore', notPresent: true},
        {noFill: 'True'},
      ].forEach(({noFill, notPresent}) => {
        it(
          notPresent
            ? `should not contain aanf for ${noFill}`
            : `should have aanf equal to ${noFill}`,
          () => {
            const ampStickyAd = createElementWithAttributes(
              doc,
              'amp-sticky-ad',
              {
                'layout': 'nodisplay',
              }
            );
            element.setAttribute('data-no-fill', `${noFill}`);
            ampStickyAd.appendChild(element);
            doc.body.appendChild(ampStickyAd);
            return impl.getAdUrl().then((url) => {
              if (notPresent) {
                expect(url).to.not.match(
                  new RegExp(`(\\?|&)aanf=${noFill}(&|$)`)
                );
              } else {
                expect(url).to.match(new RegExp(`(\\?|&)aanf=${noFill}(&|$)`));
              }
            });
          }
        );
      });

      it('formats client properly', () => {
        element.setAttribute('data-ad-client', 'SoMeClient');
        return impl.getAdUrl().then((url) => {
          expect(url).to.match(/\\?client=ca-someclient/);
        });
      });
      it('has correct format when width == "auto"', () => {
        element.setAttribute('width', 'auto');
        expect(impl.element.getAttribute('width')).to.equal('auto');
        return impl.getAdUrl().then((url) =>
          // The values should be numeric.
          expect(url).to.match(/format=\d+x\d+&w=\d+&h=\d+/)
        );
      });
      it('has correct format when height == "auto"', () => {
        element.setAttribute('height', 'auto');
        expect(impl.element.getAttribute('height')).to.equal('auto');
        return impl.getAdUrl().then((url) =>
          // The values should be numeric.
          expect(url).to.match(/format=\d+x\d+&w=\d+&h=\d+/)
        );
      });
      it('has correct format when width and height are specified', () => {
        impl.divertExperiments();
        const width = element.getAttribute('width');
        const height = element.getAttribute('height');
        return impl
          .getAdUrl()
          .then((url) =>
            expect(url).to.match(
              new RegExp(`format=${width}x${height}&w=${width}&h=${height}`)
            )
          );
      });
      it('returns the right URL', () => {
        env.sandbox.stub(impl, 'isXhrAllowed').returns(true);
        element.setAttribute('data-ad-slot', 'some_slot');
        element.setAttribute('data-language', 'lxz');
        return impl.getAdUrl().then((url) => {
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
            /(\?|&)u_cd=(24|30)(&|$)/,
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
          ].forEach((regexp) => expect(url).to.match(regexp));
        });
        it('sets rafmt for responsive', () => {
          element.setAttribute('data-ad-slot', 'some_slot');
          element.setAttribute('data-auto-format', 'rspv');
          return impl.getAdUrl().then((url) => {
            expect(url).to.match(/(\?|&)ramft=13(&|$)/);
          });
        });
        it('sets rafmt for matched content responsive', () => {
          element.setAttribute('data-ad-slot', 'some_slot');
          element.setAttribute('data-auto-format', 'mcrspv');
          return impl.getAdUrl().then((url) => {
            expect(url).to.match(/(\?|&)ramft=15(&|$)/);
          });
        });
        it('sets matched content specific fields', () => {
          element.setAttribute('data-matched-content-ui-type', 'ui');
          element.setAttribute('data-matched-content-rows-num', 'rows');
          element.setAttribute('data-matched-content-columns-num', 'cols');
          return impl.getAdUrl().then((url) => {
            expect(url).to.match(/(\?|&)crui=ui(&|$)/);
            expect(url).to.match(/(\?|&)cr_row=rows(&|$)/);
            expect(url).to.match(/(\?|&)cr_col=cols(&|$)/);
          });
        });
        it('sets appropriate is_amp for canonical', () => {
          env.sandbox.stub(impl, 'isXhrAllowed').returns(false);
          return expect(impl.getAdUrl()).to.eventually.match(
            /(\?|&)is_amp=5(&|$)/
          );
        });
        it('does not set ptt parameter by default', () =>
          expect(impl.getAdUrl()).to.not.eventually.match(/(\?|&)ptt=(&|$)/));
        it('sets ptt parameter', () => {
          forceExperimentBranch(impl.win, 'adsense-ptt-exp', '21068092');
          return expect(impl.getAdUrl()).to.eventually.match(
            /(\?|&)ptt=12(&|$)/
          );
        });
      });

      // Not using arrow function here because otherwise the way closure behaves
      // prevents me from calling this.timeout(5000).
      it('with multiple slots', function () {
        // When run locally, this test tends to exceed 2000ms timeout.
        this.timeout(10000);
        // Reset counter for purpose of this test.
        delete win['ampAdGoogleIfiCounter'];
        const elem1 = createAdsenseImplElement(
          {
            'data-ad-client': 'ca-adsense',
            'width': '320',
            'height': '50',
            'data-experiment-id': '8675309',
          },
          doc
        );
        doc.body.appendChild(elem1);
        const elem2 = createAdsenseImplElement(
          {
            'data-ad-client': 'ca-adsense',
            'width': '320',
            'height': '50',
            'data-experiment-id': '8675309',
            'data-ad-slot': 'slotname_foo',
          },
          doc,
          'amp-ad'
        );
        doc.body.appendChild(elem2);
        const elem3 = createAdsenseImplElement(
          {
            'data-ad-client': 'ca-not-adsense',
            'width': '320',
            'height': '50',
            'data-experiment-id': '8675309',
          },
          doc,
          'amp-ad'
        );
        doc.body.appendChild(elem3);
        const impl1 = new AmpAdNetworkAdsenseImpl(elem1);
        const impl2 = new AmpAdNetworkAdsenseImpl(elem2);
        const impl3 = new AmpAdNetworkAdsenseImpl(elem3);

        impl1.uiHandler = {isStickyAd: () => false};
        impl2.uiHandler = {isStickyAd: () => false};
        impl3.uiHandler = {isStickyAd: () => false};
        return impl1.getAdUrl().then((adUrl1) => {
          expect(adUrl1).to.match(/pv=2/);
          expect(adUrl1).to.not.match(/prev_fmts/);
          expect(adUrl1).to.not.match(/prev_slotnames/);
          expect(adUrl1).to.match(/ifi=1/);
          return impl2.getAdUrl().then((adUrl2) => {
            expect(adUrl2).to.match(/pv=1/);
            expect(adUrl2).to.match(/prev_fmts=\d+?x\d+?/);
            expect(adUrl2).to.not.match(/prev_slotnames/);
            expect(adUrl2).to.match(/ifi=2/);
            return impl3.getAdUrl().then((adUrl3) => {
              expect(adUrl3).to.match(/pv=2/);
              // By some quirk of the test infrastructure, when this test
              // is ran individually, each added slot after the first one
              // has a bounding rectangle of 0x0. The important thing to
              // test here is the number of previous formats.
              expect(adUrl3).to.match(
                /prev_fmts=(\d+?x\d+?%2C\d+?x\d+?|\d+?x\d+?%2C\d+?x\d+?)/
              );
              expect(adUrl3).to.match(/prev_slotnames=slotname_foo/);
              expect(adUrl3).to.match(/ifi=3/);
            });
          });
        });
      });

      it('includes adsense package code when present', () => {
        element.setAttribute('data-package', 'package_code');
        return expect(impl.getAdUrl()).to.eventually.match(
          /pwprc=package_code(&|$)/
        );
      });

      it('should return empty string if unknown consentState', () =>
        expect(
          impl.getAdUrl({consentState: CONSENT_POLICY_STATE.UNKNOWN})
        ).to.eventually.equal(''));

      it('should include npa=1 if unknown consent & explicit npa', () => {
        impl.element.setAttribute('data-npa-on-unknown-consent', 'true');
        return impl
          .getAdUrl({consentState: CONSENT_POLICY_STATE.UNKNOWN})
          .then((url) => {
            expect(url).to.match(/(\?|&)npa=1(&|$)/);
          });
      });

      it('should include npa=1 if insufficient consent', () =>
        impl
          .getAdUrl({consentState: CONSENT_POLICY_STATE.INSUFFICIENT})
          .then((url) => {
            expect(url).to.match(/(\?|&)npa=1(&|$)/);
          }));

      it('should not include not npa, if sufficient consent', () =>
        impl
          .getAdUrl({consentState: CONSENT_POLICY_STATE.SUFFICIENT})
          .then((url) => {
            expect(url).to.not.match(/(\?|&)npa=(&|$)/);
          }));

      it('should not include npa, if not required consent', () =>
        impl
          .getAdUrl({consentState: CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED})
          .then((url) => {
            expect(url).to.not.match(/(\?|&)npa=(&|$)/);
          }));
      it('should include npa=1 if `serveNpaSignal` is found, regardless of consent', () =>
        impl
          .getAdUrl(
            {consentState: CONSENT_POLICY_STATE.SUFFICIENT},
            undefined,
            true
          )
          .then((url) => {
            expect(url).to.match(/(\?|&)npa=1(&|$)/);
          }));

      it('should include npa=1 if `serveNpaSignal` is false & insufficient consent', () =>
        impl
          .getAdUrl(
            {consentState: CONSENT_POLICY_STATE.INSUFFICIENT},
            undefined,
            false
          )
          .then((url) => {
            expect(url).to.match(/(\?|&)npa=1(&|$)/);
          }));

      it('should include gdpr_consent, if TC String is provided', () =>
        impl.getAdUrl({consentString: 'tcstring'}).then((url) => {
          expect(url).to.match(/(\?|&)gdpr_consent=tcstring(&|$)/);
        }));

      it('should include gdpr=1, if gdprApplies is true', () =>
        impl.getAdUrl({gdprApplies: true}).then((url) => {
          expect(url).to.match(/(\?|&)gdpr=1(&|$)/);
        }));

      it('should include gdpr=0, if gdprApplies is false', () =>
        impl.getAdUrl({gdprApplies: false}).then((url) => {
          expect(url).to.match(/(\?|&)gdpr=0(&|$)/);
        }));

      it('should not include gdpr, if gdprApplies is missing', () =>
        impl.getAdUrl({}).then((url) => {
          expect(url).to.not.match(/(\?|&)gdpr=(&|$)/);
        }));

      it('should include addtl_consent', () =>
        impl.getAdUrl({additionalConsent: 'abc123'}).then((url) => {
          expect(url).to.match(/(\?|&)addtl_consent=abc123(&|$)/);
        }));

      it('should not include addtl_consent, if additionalConsent is missing', () =>
        impl.getAdUrl({}).then((url) => {
          expect(url).to.not.match(/(\?|&)addtl_consent=(&|$)/);
        }));

      it('should include us_privacy, if consentStringType matches', () =>
        impl
          .getAdUrl({
            consentStringType: CONSENT_STRING_TYPE.US_PRIVACY_STRING,
            consentString: 'usPrivacyString',
          })
          .then((url) => {
            expect(url).to.match(/(\?|&)us_privacy=usPrivacyString(&|$)/);
            expect(url).to.not.match(/(\?|&)gdpr_consent=/);
          }));

      it('should include gdpr_consent, if consentStringType is not US_PRIVACY_STRING', () =>
        impl
          .getAdUrl({
            consentStringType: CONSENT_STRING_TYPE.TCF_V2,
            consentString: 'gdprString',
          })
          .then((url) => {
            expect(url).to.match(/(\?|&)gdpr_consent=gdprString(&|$)/);
            expect(url).to.not.match(/(\?|&)us_privacy=/);
          }));

      it('should include gdpr_consent, if consentStringType is undefined', () =>
        impl
          .getAdUrl({consentStringType: undefined, consentString: 'gdprString'})
          .then((url) => {
            expect(url).to.match(/(\?|&)gdpr_consent=gdprString(&|$)/);
            expect(url).to.not.match(/(\?|&)us_privacy=/);
          }));

      it('should have spsa and size 1x1 when single page story ad', () => {
        impl.isSinglePageStoryAd = true;
        return impl.getAdUrl().then((url) => {
          expect(url).to.match(/format=1x1/);
          expect(url).to.match(/h=1/);
          expect(url).to.match(/w=1/);
          expect(url).to.match(/spsa=\d+?x\d+?/);
        });
      });

      it('should set spsa param to amp-ad element layout box', () => {
        impl.isSinglePageStoryAd = true;
        return impl.getAdUrl().then((url) => {
          expect(url).to.match(/spsa=320x50/);
        });
      });

      it('should set tfcd parameter if set in shared data', () => {
        impl.uiHandler = {isStickyAd: () => false};
        const consentSharedData = {
          'adsense-tfua': 0,
          'adsense-tfcd': 1,
        };
        return impl.getAdUrl({consentSharedData}).then((url) => {
          expect(url).to.match(/(\?|&)tfua=0(&|$)/);
          expect(url).to.match(/(\?|&)tfcd=1(&|$)/);
        });
      });

      it('should set tfua parameter if set in shared data', () => {
        impl.uiHandler = {isStickyAd: () => false};
        const consentSharedData = {
          'adsense-tfua': 1,
          'adsense-tfcd': 0,
        };
        return impl.getAdUrl({consentSharedData}).then((url) => {
          expect(url).to.match(/(\?|&)tfua=1(&|$)/);
          expect(url).to.match(/(\?|&)tfcd=0(&|$)/);
        });
      });

      describe('SSR experiments', () => {
        it('should include SSR experiments', () => {
          env.sandbox
            .stub(ampdoc, 'getMetaByName')
            .withArgs('amp-usqp')
            .returns('5798237482=45,3579282=0');
          return impl.buildCallback().then(() => {
            impl.getAdUrl().then((url) => {
              expect(url).to.have.string('579823748245!357928200');
            });
          });
        });

        it('should pad value to two chars', () => {
          env.sandbox
            .stub(ampdoc, 'getMetaByName')
            .withArgs('amp-usqp')
            .returns('5798237482=1');
          return impl.buildCallback().then(() => {
            impl.getAdUrl().then((url) => {
              expect(url).to.have.string('579823748201');
            });
          });
        });

        it('should ignore excessively large value', () => {
          env.sandbox
            .stub(ampdoc, 'getMetaByName')
            .withArgs('amp-usqp')
            .returns('5798237482=100');
          impl.buildCallback();
          return impl.getAdUrl().then((url) => {
            expect(url).not.to.have.string('5798237482');
          });
        });

        it('should ignore negative values', () => {
          env.sandbox
            .stub(ampdoc, 'getMetaByName')
            .withArgs('amp-usqp')
            .returns('5798237482=-1');
          impl.buildCallback();
          return impl.getAdUrl().then((url) => {
            expect(url).not.to.have.string('5798237482');
          });
        });

        it('should ignore non-number values', () => {
          env.sandbox
            .stub(ampdoc, 'getMetaByName')
            .withArgs('amp-usqp')
            .returns('5798237482=testing');
          impl.buildCallback();
          return impl.getAdUrl().then((url) => {
            expect(url).not.to.have.string('5798237482');
          });
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
        impl.uiHandler = {applyUnlayoutUI: () => {}, cleanup: () => {}};
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

      it('should call #resetSlot, remove child iframe, but keep other children', () => {
        impl.ampAnalyticsConfig_ = {};
        impl.ampAnalyticsElement_ = doc.createElement('amp-analytics');
        impl.element.appendChild(impl.ampAnalyticsElement_);
        expect(impl.iframe).to.be.ok;
        expect(impl.element.querySelector('iframe')).to.be.ok;
        impl.unlayoutCallback();
        expect(impl.element.querySelector('div[placeholder]')).to.be.ok;
        expect(impl.element.querySelector('div[fallback]')).to.be.ok;
        expect(impl.element.querySelector('iframe')).to.be.null;
        expect(impl.element.querySelectorAll('amp-analytics')).to.have.lengthOf(
          1
        );
        expect(impl.element.querySelector('amp-analytics')).to.equal(
          impl.a4aAnalyticsElement_
        );
        expect(impl.iframe).to.be.null;
        expect(impl.ampAnalyticsConfig_).to.be.null;
        expect(impl.ampAnalyticsElement_).to.be.null;
        expect(impl.element.getAttribute('data-amp-slot-index')).to.equal('1');
      });
    });

    describe('#buildCallback', () => {
      const VIEWPORT_WIDTH = 375;
      const VIEWPORT_HEIGHT = 667;

      let iframe;
      let didAttemptSizeChange;
      let didMeasure;
      let didMutate;

      function constructImpl(config) {
        config.type = 'adsense';
        config['data-ad-client'] = 'ca-adsense';
        element = createElementWithAttributes(doc, 'amp-ad', config);
        iframe = env.win.document.createElement('iframe');
        element.appendChild(iframe);
        doc.body.appendChild(element);
        const impl = new AmpAdNetworkAdsenseImpl(element);
        impl.element.style.display = 'block';
        impl.element.style.position = 'relative';
        impl.element.style.top = '101vh';
        // Fix the viewport to a consistent size to that the test doesn't depend
        // on the actual browser window opened.
        impl.getViewport().getSize = () => ({
          width: VIEWPORT_WIDTH,
          height: VIEWPORT_HEIGHT,
        });
        didAttemptSizeChange = false;
        env.sandbox.stub(element, 'getImpl').returns(
          Promise.resolve({
            attemptChangeSize: () => {
              didAttemptSizeChange = true;
              return Promise.resolve();
            },
          })
        );

        didMeasure = false;
        didMutate = false;
        const vsyncMock = Services.vsyncFor(
          toWin(element.ownerDocument.defaultView)
        );
        env.sandbox.stub(vsyncMock, 'runPromise').callsFake((task, state) => {
          didMeasure = true;
          didMutate = true;
          task.measure(state);
          task.mutate(state);
          return Promise.resolve();
        });

        return impl;
      }

      it('should do nothing for non-responsive', async () => {
        const adsense = constructImpl({
          width: '320',
          height: '150',
        });
        const promise = adsense.buildCallback();
        expect(promise).to.exist;
        await promise;

        expect(didAttemptSizeChange).to.be.false;
        expect(didMeasure).to.be.false;
        expect(didMutate).to.be.false;
      });

      it('should not schedule a resize for desktop container width responsive', async () => {
        const adsense = constructImpl({
          width: '100vw',
          height: '100',
          'data-auto-format': 'rspv',
        });
        // Overwrite the viewport size to be wide viewport one.
        adsense.getViewport().getSize = () => ({
          width: 1400,
          height: 1024,
        });

        const promise = adsense.buildCallback();
        expect(promise).to.exist;
        await promise;

        expect(didAttemptSizeChange).to.be.false;
        expect(didMeasure).to.be.true;
        expect(didMutate).to.be.true;
      });

      it('should schedule a resize for responsive', async () => {
        const adsense = constructImpl({
          width: '100vw',
          height: '100',
          'data-auto-format': 'rspv',
        });

        const promise = adsense.buildCallback();
        expect(promise).to.exist;
        await promise;

        expect(didAttemptSizeChange).to.be.true;
        expect(didMeasure).to.be.false;
        expect(didMutate).to.be.false;
      });

      it('should schedule a resize for matched content responsive', async () => {
        const adsense = constructImpl({
          width: '100vw',
          height: '100',
          'data-auto-format': 'mcrspv',
        });

        const promise = adsense.buildCallback();
        expect(promise).to.exist;
        await promise;
        expect(didAttemptSizeChange).to.be.true;
        expect(didMeasure).to.be.false;
        expect(didMutate).to.be.false;
      });

      describe('for publisher opted in to auto ad size optimization', () => {
        beforeEach(async () => {
          const storage = await Services.storageForDoc(doc);
          const storageContent = {'aas-ca-adsense': true};

          env.sandbox.stub(storage, 'get').callsFake((key) => {
            return Promise.resolve(storageContent[key]);
          });
        });

        it('does nothing if ad unit is responsive already', async () => {
          forceExperimentBranch(
            impl.win,
            AD_SIZE_OPTIMIZATION_EXP.branch,
            AD_SIZE_OPTIMIZATION_EXP.experiment
          );
          const adsense = constructImpl({
            width: '100vw',
            height: '100',
            'data-auto-format': 'mcrspv',
          });
          const promise = adsense.buildCallback();
          expect(promise).to.exist;
          await promise;

          expect(adsense.element.getAttribute('data-auto-format')).to.be.equal(
            'mcrspv'
          );
          expect(didAttemptSizeChange).to.be.true;
        });

        it('upgrades manual ad units to responsive if experiment is enabled', async () => {
          forceExperimentBranch(
            impl.win,
            AD_SIZE_OPTIMIZATION_EXP.branch,
            AD_SIZE_OPTIMIZATION_EXP.experiment
          );
          const adsense = constructImpl({
            width: '320',
            height: '150',
          });
          env.sandbox
            .stub(adsense, 'attemptChangeSize')
            .returns(Promise.resolve());

          const promise = adsense.buildCallback();
          expect(promise).to.exist;
          await promise;

          expect(adsense.element.getAttribute('data-auto-format')).to.be.equal(
            'rspv'
          );
          expect(didAttemptSizeChange).to.be.true;
        });
      });
      describe('for publisher not opted in to auto ad size optimization', () => {
        beforeEach(async () => {
          const storage = await Services.storageForDoc(doc);
          const storageContent = {'aas-ca-adsense': false};

          env.sandbox.stub(storage, 'get').callsFake((key) => {
            return Promise.resolve(storageContent[key]);
          });
        });

        it('does not upgrade manual ad units to responsive if experiment is enabled', async () => {
          forceExperimentBranch(
            impl.win,
            AD_SIZE_OPTIMIZATION_EXP.branch,
            AD_SIZE_OPTIMIZATION_EXP.experiment
          );
          const adsense = constructImpl({
            width: '320',
            height: '150',
          });
          env.sandbox
            .stub(adsense, 'attemptChangeSize')
            .returns(Promise.resolve());

          const promise = adsense.buildCallback();
          expect(promise).to.exist;
          await promise;

          expect(adsense.attemptChangeSize).to.not.be.called;
          expect(adsense.element.hasAttribute('data-auto-format')).to.be.false;
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
          if (vsyncTaskSpec.measure) {
            vsyncTaskSpec.measure(vsyncState);
          }
          if (vsyncTaskSpec.mutate) {
            vsyncTaskSpec.mutate(vsyncState);
          }
        };

        // Fix the viewport to a consistent size to that the test doesn't depend
        // on the actual browser window opened.
        impl.getViewport().getSize = () => ({
          width: VIEWPORT_WIDTH,
          height: VIEWPORT_HEIGHT,
        });

        return impl.buildCallback();
      }

      beforeEach(() => {
        Services.timerFor.restore();
        viewer.toggleRuntime(); // Turn runtime on for these tests.
      });

      afterEach(() => {
        viewer.toggleRuntime(); // Turn runtime off again.

        if (
          containerContainer != null &&
          containerContainer.parentNode != null
        ) {
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
          expect(element.style.marginRight).to.be.equal('-109px');
          expect(element.style.marginLeft).to.be.equal('');
        });
      });
    });

    describe('#delayAdRequestEnabled', () => {
      it('should return 3', () => {
        impl.divertExperiments();
        expect(impl.delayAdRequestEnabled()).to.equal(3);
      });

      it('should respect loading strategy', () => {
        impl.element.setAttribute(
          'data-loading-strategy',
          'prefer-viewability-over-views'
        );
        impl.divertExperiments();
        expect(impl.delayAdRequestEnabled()).to.equal(1.25);
      });
    });

    describe('#preconnect', () => {
      it('should preload nameframe', () => {
        const preconnect = Services.preconnectFor(win);
        env.sandbox.spy(preconnect, 'preload');
        expect(impl.getPreconnectUrls()).to.deep.equal([
          'https://googleads.g.doubleclick.net',
        ]);
        expect(preconnect.preload).to.be.calledOnce;
        expect(preconnect.preload).to.be.calledWithMatch(
          env.sandbox.match.object,
          /nameframe/
        );
      });
    });

    describe('#getConsentPolicy', () => {
      it('should return null', () =>
        expect(AmpAdNetworkAdsenseImpl.prototype.getConsentPolicy()).to.be
          .null);
    });

    describe('#isXhrAllowed', () => {
      beforeEach(() => {
        impl.win = {
          location: {},
        };
      });

      it('should return false on a canonical page', () => {
        impl.win.location.origin = 'https://www.somesite.com';
        expect(impl.isXhrAllowed()).to.be.false;
      });

      it('should return true on a non-canonical page', () => {
        impl.win.location.origin = 'https://www-somesite.cdn.ampproject.org';
        expect(impl.isXhrAllowed()).to.be.true;
      });
    });

    describe('#checksumVerification', () => {
      it('should call super if missing Algorithm header', () => {
        env.sandbox
          .stub(AmpA4A.prototype, 'maybeValidateAmpCreative')
          .returns(Promise.resolve('foo'));
        const creative = '<html><body>This is some text</body></html>';
        const mockHeaders = {
          get: (key) => {
            switch (key) {
              case 'AMP-Verification-Checksum-Algorithm':
                return 'unknown';
              case 'AMP-Verification-Checksum':
                return '2569076912';
              default:
                throw new Error(`unexpected header: ${key}`);
            }
          },
        };
        expect(
          AmpAdNetworkAdsenseImpl.prototype.maybeValidateAmpCreative(
            utf8Encode(creative),
            mockHeaders
          )
        ).to.eventually.equal('foo');
      });

      it('should properly validate checksum', () => {
        const creative = '<html><body>This is some text</body></html>';
        const mockHeaders = {
          get: (key) => {
            switch (key) {
              case 'AMP-Verification-Checksum-Algorithm':
                return 'djb2a-32';
              case 'AMP-Verification-Checksum':
                return '2569076912';
              default:
                throw new Error(`unexpected header: ${key}`);
            }
          },
        };
        return AmpAdNetworkAdsenseImpl.prototype
          .maybeValidateAmpCreative(utf8Encode(creative), mockHeaders)
          .then((result) => {
            expect(result).to.be.ok;
            expect(utf8Decode(result)).to.equal(creative);
          });
      });

      it('should fail validation if invalid checksum', () => {
        const creative = '<html><body>This is some text</body></html>';
        const mockHeaders = {
          get: (key) => {
            switch (key) {
              case 'AMP-Verification-Checksum-Algorithm':
                return 'djb2a-32';
              case 'AMP-Verification-Checksum':
                return '12345';
              default:
                throw new Error(`unexpected header: ${key}`);
            }
          },
        };
        expect(
          AmpAdNetworkAdsenseImpl.prototype.maybeValidateAmpCreative(
            utf8Encode(creative),
            mockHeaders
          )
        ).to.eventually.not.be.ok;
      });
    });

    describe('#letCreativeTriggerRenderStart', () => {
      it('should return true for sticky ad', () => {
        const ampStickyAd = createElementWithAttributes(doc, 'amp-sticky-ad', {
          'layout': 'nodisplay',
        });
        ampStickyAd.appendChild(element);
        doc.body.appendChild(ampStickyAd);
        const letCreativeTriggerRenderStart =
          impl.letCreativeTriggerRenderStart();
        expect(letCreativeTriggerRenderStart).to.equal(true);
      });

      it('should trigger renderStarted on fill msg from sticky ad', () => {
        const ampStickyAd = createElementWithAttributes(doc, 'amp-sticky-ad', {
          'layout': 'nodisplay',
        });
        let promiseResolver;
        const renderPromise = new Promise((resolve) => {
          promiseResolver = resolve;
        });
        ampStickyAd.appendChild(element);
        doc.body.appendChild(ampStickyAd);
        impl.letCreativeTriggerRenderStart();
        impl.renderStarted = () => {
          promiseResolver();
        };
        impl.iframe = {
          contentWindow: window,
          style: {
            'visibility': 'hidden',
            setProperty: (name, value) => {
              impl.iframe.style[camelCaseToHyphenCase(name)] = value;
            },
          },
        };
        win.postMessage('fill_sticky', '*');
        return renderPromise.then(() => {
          expect(impl.iframe.style['visibility']).to.equal('');
        });
      });

      it('should return false for non-sticky ad', () => {
        const ampStickyAd = createElementWithAttributes(
          doc,
          'something-random',
          {
            'layout': 'nodisplay',
          }
        );
        ampStickyAd.appendChild(element);
        doc.body.appendChild(ampStickyAd);
        const letCreativeTriggerRenderStart =
          impl.letCreativeTriggerRenderStart();
        expect(letCreativeTriggerRenderStart).to.equal(false);
      });
    });

    describe('#divertExperiments', () => {
      it('should have correctly formatted experiment map', () => {
        const randomlySelectUnsetExperimentsStub = env.sandbox.stub(
          experiments,
          'randomlySelectUnsetExperiments'
        );
        randomlySelectUnsetExperimentsStub.returns({});
        impl.divertExperiments();
        const experimentMap =
          randomlySelectUnsetExperimentsStub.firstCall.args[1];
        Object.keys(experimentMap).forEach((key) => {
          expect(key).to.be.a('string');
          const {branches} = experimentMap[key];
          expect(branches).to.exist;
          expect(branches).to.be.a('array');
          branches.forEach((branch) => expect(branch).to.be.a('string'));
        });
      });
    });
  }
);
