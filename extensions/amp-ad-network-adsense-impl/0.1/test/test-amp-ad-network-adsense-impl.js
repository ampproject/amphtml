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
  installExtensionsService,
} from '../../../../src/service/extensions-impl';
import {extensionsFor} from '../../../../src/services';
import {AmpAdUIHandler} from '../../../amp-ad/0.1/amp-ad-ui'; // eslint-disable-line no-unused-vars
import {
  AmpAdXOriginIframeHandler,    // eslint-disable-line no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {base64UrlDecodeToBytes} from '../../../../src/utils/base64';
import {utf8Encode} from '../../../../src/utils/bytes';
import {createIframePromise} from '../../../../testing/iframe';
import {upgradeOrRegisterElement} from '../../../../src/custom-element';
import {
  createElementWithAttributes,
  addAttributesToElement,
} from '../../../../src/dom';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {toggleExperiment} from '../../../../src/experiments';

function createAdsenseImplElement(attributes, opt_doc, opt_tag) {
  const doc = opt_doc || document;
  const tag = opt_tag || 'amp-ad';
  const element = createElementWithAttributes(doc, tag, {
    'type': 'adsense',
  });
  return addAttributesToElement(element, attributes);
}

function setupForAdTesting(fixture) {
  installDocService(fixture.win, /* isSingleDoc */ true);
  const doc = fixture.doc;
  // TODO(a4a-cam@): This is necessary in the short term, until A4A is
  // smarter about host document styling.  The issue is that it needs to
  // inherit the AMP runtime style element in order for shadow DOM-enclosed
  // elements to behave properly.  So we have to set up a minimal one here.
  const ampStyle = doc.createElement('style');
  ampStyle.setAttribute('amp-runtime', 'scratch-fortesting');
  doc.head.appendChild(ampStyle);
}

describes.sandboxed('amp-ad-network-adsense-impl', {}, () => {
  let impl;
  let element;

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
    });
    document.body.appendChild(element);
    impl = new AmpAdNetworkAdsenseImpl(element);
  });

  afterEach(() => {
  });

  // WARNING: When running this test file in isolation, running more than one
  // of the sub-tests in the following describe yields errors that are not
  // present when this test is ran in aggregate.
  describe('#getAdUrl', () => {

    beforeEach(() => {
      resetSharedState();
    });

    const invariantParams = {
      'client': 'ca-adsense',
      'format': '320x50',
      'w': '320',
      'h': '50',
      'output': 'html',
      'is_amp': '3',
      'eid': '8675309',
    };
    const variableParams = [
      'slotname', 'adk', 'adf', 'ea', 'flash', 'url', 'wg', 'dt', 'bpp', 'bdt',
      'fdt', 'idt', 'shb', 'cbv', 'saldr', 'amp_v', 'correlator', 'frm',
      'ga_vid', 'ga_hid', 'iag', 'icsg', 'nhd', 'dssz', 'mdo', 'mso', 'u_tz',
      'u_his', 'u_java', 'u_h', 'u_w', 'u_ah', 'u_aw', 'u_cd', 'u_nplug',
      'u_nmime', 'dff', 'adx', 'ady', 'biw', 'isw', 'ish', 'ifk', 'oid', 'loc',
      'rx', 'eae', 'pc', 'brdim', 'vis', 'rsz', 'abl', 'ppjl', 'pfx', 'fu',
      'bc', 'ifi', 'dtd',
    ];
    // Skipping this test until all AdSense parameters are standardized, and
    // their implementation in A4A and 3p reach parity.
    it.skip('with single slot', () => {
      return createIframePromise().then(fixture => {
        // Set up the element's underlying infrastructure.
        upgradeOrRegisterElement(fixture.win, 'amp-a4a',
            AmpAdNetworkAdsenseImpl);
        const elem = createAdsenseImplElement({
          'data-ad-client': 'ca-adsense',
          'width': '320',
          'height': '50',
          'data-experiment-id': '8675309',
        }, fixture.doc, 'amp-a4a');
        return fixture.addElement(elem).then(addedElem => {
          // Create AdsenseImpl instance.
          impl = new AmpAdNetworkAdsenseImpl(addedElem);
          // The expected url parameters whose values are known and fixed.
          const urlParams = Object.assign({}, invariantParams, {pv: '2'});
          return impl.getAdUrl().then(adUrl => {
            const queryPairs = adUrl.split('?')[1].split('&');
            const actualQueryParams = {};
            queryPairs.forEach(pair => {
              const pairArr = pair.split('=');
              actualQueryParams[pairArr[0]] = pairArr[1];
            });
            // Check that the fixed url parameters are all contained within the
            // actual query parameters, and that the corresponding known values
            // match.
            for (const name in urlParams) {
              expect(!!actualQueryParams[name],
                  `missing parameter ${name}`)
                  .to.be.true;
              expect(actualQueryParams[name],
                  `parameter ${name} has wrong value`)
                  .to.equal(urlParams[name]);
            }
            // Check that the other url parameters are also contained within the
            // actual query parameters. Remember the ones that aren't for
            // debugging purposes.
            const missingParams = [];
            for (const i in variableParams) {
              const name = variableParams[i];
              if (!actualQueryParams[name]) {
                missingParams.push(name);
              }
            }
            expect(missingParams.length,
                `missing parameters ${missingParams.join(', ')}`)
                .to.equal(0);
            // Check if there are any extraneous actual query parameters.
            // Remember them for debugging purposes.
            const extraneousParams = [];
            for (const name in actualQueryParams) {
              if (!(name in urlParams) && variableParams.indexOf(name) < 0) {
                extraneousParams.push(`${name}=${actualQueryParams[name]}`);
              }
            }
            expect(extraneousParams.length,
                'found extraneous parameters: ' + extraneousParams.join('&'))
                .to.equal(0);
          });
        });
      });
    });
    it('should contain act', () => {
      return createIframePromise().then(fixture => {
        // Set up the element's underlying infrastructure.
        upgradeOrRegisterElement(fixture.win, 'amp-a4a',
            AmpAdNetworkAdsenseImpl);
        const ampStickyAd =
              createElementWithAttributes(fixture.doc, 'amp-sticky-ad', {
                'layout': 'nodisplay',
              });
        ampStickyAd.appendChild(element);
        fixture.doc.body.appendChild(ampStickyAd);
        return impl.getAdUrl().then(adUrl => {
          expect(adUrl.includes('act=sa') === true).to.be.true;
        });
      });
    });
    // Not using arrow function here because otherwise the way closure behaves
    // prevents me from calling this.timeout(5000).
    it('with multiple slots', function() {
      // When ran locally, this test tends to exceed 2000ms timeout.
      this.timeout(5000);
      // Reset counter for purpose of this test.
      delete window['ampAdGoogleIfiCounter'];
      return createIframePromise().then(fixture => {
        // Set up the element's underlying infrastructure.
        upgradeOrRegisterElement(fixture.win, 'amp-a4a',
            AmpAdNetworkAdsenseImpl);
        const elem1 = createAdsenseImplElement({
          'data-ad-client': 'ca-adsense',
          'width': '320',
          'height': '50',
          'data-experiment-id': '8675309',
        }, fixture.doc, 'amp-a4a');
        const elem2 = createAdsenseImplElement({
          'data-ad-client': 'ca-adsense',
          'width': '320',
          'height': '50',
          'data-experiment-id': '8675309',
        }, fixture.doc, 'amp-a4a');
        const elem3 = createAdsenseImplElement({
          'data-ad-client': 'ca-not-adsense',
          'width': '320',
          'height': '50',
          'data-experiment-id': '8675309',
        }, fixture.doc, 'amp-a4a');
        return fixture.addElement(elem1).then(addedElem1 => {
          // Create AdsenseImpl instance.
          const impl1 = new AmpAdNetworkAdsenseImpl(addedElem1);
          return impl1.getAdUrl().then(adUrl1 => {
            expect(adUrl1).to.match(/pv=2/);
            expect(adUrl1).to.not.match(/prev_fmts/);
            expect(adUrl1).to.match(/ifi=1/);
            return fixture.addElement(elem2).then(addedElem2 => {
              const impl2 = new AmpAdNetworkAdsenseImpl(addedElem2);
              return impl2.getAdUrl().then(adUrl2 => {
                expect(adUrl2).to.match(/pv=1/);
                expect(adUrl2).to.match(/prev_fmts=320x50/);
                expect(adUrl2).to.match(/ifi=2/);
                return fixture.addElement(elem3).then(addedElem3 => {
                  const impl3 = new AmpAdNetworkAdsenseImpl(addedElem3);
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
        });
      });
    });
  });

  describe('#isValidElement', () => {
    it('should be valid', () => {
      expect(impl.isValidElement()).to.be.true;
    });
    it('should NOT be valid (impl tag name)', () => {
      element = createAdsenseImplElement({'data-ad-client': 'ca-adsense'},
          document, 'amp-ad-network-adsense-impl');
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
          document, 'amp-embed');
      impl = new AmpAdNetworkAdsenseImpl(element);
      expect(impl.isValidElement()).to.be.true;
    });
  });

  describe('#extractCreativeAndSignature', () => {
    let loadExtensionSpy;

    beforeEach(() => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        element = createElementWithAttributes(doc, 'amp-ad', {
          'width': '200',
          'height': '50',
          'type': 'adsense',
          'layout': 'fixed',
        });
        impl = new AmpAdNetworkAdsenseImpl(element);
        installExtensionsService(impl.win);
        const extensions = extensionsFor(impl.win);
        loadExtensionSpy = sandbox.spy(extensions, 'loadExtension');
      });
    });

    it('without signature', () => {
      return utf8Encode('some creative').then(creative => {
        return impl.extractCreativeAndSignature(
          creative,
          {
            get: function() { return undefined; },
            has: function() { return false; },
          }).then(adResponse => {
            expect(adResponse).to.deep.equal(
                  {creative, signature: null, size: null});
            expect(loadExtensionSpy.withArgs('amp-analytics')).to.not.be.called;
          });
      });
    });
    it('with signature', () => {
      return utf8Encode('some creative').then(creative => {
        return impl.extractCreativeAndSignature(
          creative,
          {
            get: function(name) {
              return name == 'X-AmpAdSignature' ? 'AQAB' : undefined;
            },
            has: function(name) {
              return name === 'X-AmpAdSignature';
            },
          }).then(adResponse => {
            expect(adResponse).to.deep.equal(
              {creative, signature: base64UrlDecodeToBytes('AQAB'),
                size: null});
            expect(loadExtensionSpy.withArgs('amp-analytics')).to.not.be.called;
          });
      });
    });
    it('with analytics', () => {
      return utf8Encode('some creative').then(creative => {
        const url = ['https://foo.com?a=b', 'https://blah.com?lsk=sdk&sld=vj'];
        return impl.extractCreativeAndSignature(
          creative,
          {
            get: function(name) {
              switch (name) {
                case 'X-AmpAnalytics':
                  return JSON.stringify({url});
                case 'X-AmpAdSignature':
                  return 'AQAB';
                default:
                  return undefined;
              }
            },
            has: function(name) {
              return !!this.get(name);
            },
          }).then(adResponse => {
            expect(adResponse).to.deep.equal(
              {
                creative,
                signature: base64UrlDecodeToBytes('AQAB'),
                size: null,
              });
            expect(loadExtensionSpy.withArgs('amp-analytics')).to.be.called;
            // exact value of ampAnalyticsConfig_ covered in
            // ads/google/test/test-utils.js
          });
      });
    });
  });

  describe('#onCreativeRender', () => {
    beforeEach(() => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        element = createElementWithAttributes(doc, 'amp-ad', {
          'width': '200',
          'height': '50',
          'type': 'adsense',
        });
        impl = new AmpAdNetworkAdsenseImpl(element);
        installExtensionsService(impl.win);
      });
    });

    it('injects amp analytics', () => {
      impl.ampAnalyticsConfig_ = {
        'request': 'www.example.com',
        'triggers': {
          'on': 'visible',
        },
      };
      impl.onCreativeRender(false);
      const ampAnalyticsElement = impl.element.querySelector('amp-analytics');
      expect(ampAnalyticsElement).to.be.ok;
      expect(ampAnalyticsElement.CONFIG).jsonEqual(impl.ampAnalyticsConfig_);
      expect(ampAnalyticsElement.getAttribute('sandbox')).to.equal('true');;
      // Exact format of amp-analytics element covered in
      // test/functional/test-analytics.js.
      // Just ensure extensions is loaded, and analytics element appended.
    });
  });

  describe('centering', () => {
    /**
     * Creates an iframe promise, and instantiates element and impl, adding the
     * former to the document of the iframe.
     * @param {{width, height, type}} config
     * @return The iframe promise.
     */
    function createImplTag(config) {
      config.type = 'adsense';
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        element = createElementWithAttributes(fixture.doc, 'amp-ad', config);
        // To trigger CSS styling.
        element.setAttribute('data-a4a-upgrade-type',
            'amp-ad-network-adsense-impl');
        // Used to test styling which is targetted at first iframe child of
        // amp-ad.
        const iframe = fixture.doc.createElement('iframe');
        element.appendChild(iframe);
        document.body.appendChild(element);
        impl = new AmpAdNetworkAdsenseImpl(element);
        return fixture;
      });
    }

    function verifyCss(iframe) {
      expect(iframe).to.be.ok;
      const style = window.getComputedStyle(iframe);
      expect(style.top).to.equal('50%');
      expect(style.left).to.equal('50%');
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
        verifyCss(impl.element.querySelector('iframe'));
      });
    });
    it('centers iframe in slot when !height && !width', () => {
      return createImplTag({
        layout: 'fixed',
      }).then(() => {
        expect(impl.element.getAttribute('width')).to.be.null;
        expect(impl.element.getAttribute('height')).to.be.null;
        verifyCss(impl.element.querySelector('iframe'));
      });
    });
    it('centers iframe in slot when !height && width', () => {
      return createImplTag({
        width: '300',
        layout: 'fixed',
      }).then(() => {
        expect(impl.element.getAttribute('width')).to.equal('300');
        expect(impl.element.getAttribute('height')).to.be.null;
        verifyCss(impl.element.querySelector('iframe'));
      });
    });
    it('centers iframe in slot when height && !width', () => {
      return createImplTag({
        height: '150',
        layout: 'fixed',
      }).then(() => {
        expect(impl.element.getAttribute('width')).to.be.null;
        expect(impl.element.getAttribute('height')).to.equal('150');
        verifyCss(impl.element.querySelector('iframe'));
      });
    });
  });

  describe('#getAdUrl', () => {

    afterEach(() =>
        toggleExperiment(window, 'as-use-attr-for-format', false));


    it('formats client properly', () => {
      element.setAttribute('data-ad-client', 'SoMeClient');
      new AmpAd(element).upgradeCallback();
      impl.onLayoutMeasure();
      return impl.getAdUrl().then(url => {
        expect(url).to.match(/\\?client=ca-someclient/);
      });
    });
    it('returns the right URL', () => {
      new AmpAd(element).upgradeCallback();
      impl.onLayoutMeasure();
      return impl.getAdUrl().then(url => {
        // Regex shortened because of
        // https://github.com/ampproject/amphtml/issues/8635
        expect(url).to.match(new RegExp(
          '^https://googleads\\.g\\.doubleclick\\.net/pagead/ads' +
          '\\?client=ca-adsense&format='));
      });
    });
    it('has correct format when width == "auto"', () => {
      element.setAttribute('width', 'auto');
      new AmpAd(element).upgradeCallback();
      expect(impl.element.getAttribute('width')).to.equal('auto');
      impl.onLayoutMeasure();
      return impl.getAdUrl().then(url =>
        // With exp as-use-attr-for-format off, we can't test for specific
        // numbers, but we know that the values should be numeric.
        expect(url).to.match(/format=[0-9]+x[0-9]+&w=[0-9]+&h=[0-9]+/));
    });
    it('has correct format when height == "auto"', () => {
      element.setAttribute('height', 'auto');
      new AmpAd(element).upgradeCallback();
      expect(impl.element.getAttribute('height')).to.equal('auto');
      impl.onLayoutMeasure();
      return impl.getAdUrl().then(url =>
        // With exp as-use-attr-for-format off, we can't test for specific
        // numbers, but we know that the values should be numeric.
        expect(url).to.match(/format=[0-9]+x[0-9]+&w=[0-9]+&h=[0-9]+/));
    });
    it('has correct format when as-use-attr-for-format is on', () => {
      toggleExperiment(window, 'as-use-attr-for-format', true);
      const width = element.getAttribute('width');
      const height = element.getAttribute('height');
      new AmpAd(element).upgradeCallback();
      impl.onLayoutMeasure();
      return impl.getAdUrl().then(url =>
        // With exp as-use-attr-for-format off, we can't test for specific
        // numbers, but we know that the values should be numeric.
        expect(url).to.match(new RegExp(
            `format=${width}x${height}&w=${width}&h=${height}`)));
    });
    it('has correct format when width=auto and as-use-attr-for-format is on',
        () => {
          toggleExperiment(window, 'as-use-attr-for-format', true);
          element.setAttribute('width', 'auto');
          new AmpAd(element).upgradeCallback();
          expect(impl.element.getAttribute('width')).to.equal('auto');
          impl.onLayoutMeasure();
          return impl.getAdUrl().then(url =>
              // Ensure that "auto" doesn't appear anywhere here:
              expect(url).to.match(/format=[0-9]+x[0-9]+&w=[0-9]+&h=[0-9]+/));
        });
  });
});
