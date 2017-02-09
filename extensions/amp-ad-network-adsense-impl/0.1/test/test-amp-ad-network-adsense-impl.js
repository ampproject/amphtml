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

function createAdsenseImplElement(attributes, opt_doc, opt_tag) {
  const doc = opt_doc || document;
  const tag = opt_tag || 'amp-ad';
  const element = createElementWithAttributes(doc, tag, {
    'type': 'adsense',
  });
  return addAttributesToElement(element, attributes);
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
      'data-ad-client': 'adsense',
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
      'client': 'adsense',
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
          'data-ad-client': 'adsense',
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
    it('should contain amp_ct', () => {
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
          expect(adUrl.indexOf('amp_ct=AMP-STICKY-AD') >= 0).to.be.true;
        });
      });
    });
    // Not using arrow function here because otherwise the way closure behaves
    // prevents me from calling this.timeout(5000).
    it('with multiple slots', function() {
      // When ran locally, this test tends to exceed 2000ms timeout.
      this.timeout(5000);
      return createIframePromise().then(fixture => {
        // Set up the element's underlying infrastructure.
        upgradeOrRegisterElement(fixture.win, 'amp-a4a',
            AmpAdNetworkAdsenseImpl);
        const elem1 = createAdsenseImplElement({
          'data-ad-client': 'adsense',
          'width': '320',
          'height': '50',
          'data-experiment-id': '8675309',
        }, fixture.doc, 'amp-a4a');
        const elem2 = createAdsenseImplElement({
          'data-ad-client': 'adsense',
          'width': '320',
          'height': '50',
          'data-experiment-id': '8675309',
        }, fixture.doc, 'amp-a4a');
        const elem3 = createAdsenseImplElement({
          'data-ad-client': 'not-adsense',
          'width': '320',
          'height': '50',
          'data-experiment-id': '8675309',
        }, fixture.doc, 'amp-a4a');
        return fixture.addElement(elem1).then(addedElem1 => {
          // Create AdsenseImpl instance.
          const impl1 = new AmpAdNetworkAdsenseImpl(addedElem1);
          return impl1.getAdUrl().then(adUrl1 => {
            expect(adUrl1.indexOf('pv=2') >= 0).to.be.true;
            expect(adUrl1.indexOf('prev_fmts') < 0).to.be.true;
            return fixture.addElement(elem2).then(addedElem2 => {
              const impl2 = new AmpAdNetworkAdsenseImpl(addedElem2);
              return impl2.getAdUrl().then(adUrl2 => {
                expect(adUrl2.indexOf('pv=1') >= 0).to.be.true;
                expect(adUrl2.indexOf('prev_fmts=320x50') >= 0).to.be.true;
                return fixture.addElement(elem3).then(addedElem3 => {
                  const impl3 = new AmpAdNetworkAdsenseImpl(addedElem3);
                  return impl3.getAdUrl().then(adUrl3 => {
                    expect(adUrl3.indexOf('pv=2') >= 0).to.be.true;
                    // By some quirk of the test infrastructure, when this test
                    // is ran individually, each added slot after the first one
                    // has a bounding rectangle of 0x0. The important thing to
                    // test here is the number of previous formats.
                    expect(adUrl3.indexOf('prev_fmts=320x50%2C0x0') >= 0 ||
                        adUrl3.indexOf('prev_fmts=320x50%2C320x50') >= 0,
                        adUrl3).to.be.true;
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
      element = createAdsenseImplElement({'data-ad-client': 'adsense'},
          document, 'amp-ad-network-adsense-impl');
      impl = new AmpAdNetworkAdsenseImpl(element);
      expect(impl.isValidElement()).to.be.false;
    });
    it.skip('should be NOT valid (missing ad client)', () => {
      // TODO(taymonbeal): reenable this test after clarifying validation
      element.setAttribute('data-ad-client', '');
      element.setAttribute('type', 'adsense');
      expect(impl.isValidElement()).to.be.false;
    });
    it('should be valid (amp-embed)', () => {
      element = createAdsenseImplElement({'data-ad-client': 'adsense'},
          document, 'amp-embed');
      impl = new AmpAdNetworkAdsenseImpl(element);
      expect(impl.isValidElement()).to.be.true;
    });
  });

  describe('#extractCreativeAndSignature', () => {
    it('without signature', () => {
      return utf8Encode('some creative').then(creative => {
        return expect(impl.extractCreativeAndSignature(
          creative,
          {
            get: function() { return undefined; },
            has: function() { return false; },
          })).to.eventually.deep.equal(
                {creative, signature: null, size: null});
      });
    });
    it('with signature', () => {
      return utf8Encode('some creative').then(creative => {
        return expect(impl.extractCreativeAndSignature(
          creative,
          {
            get: function(name) {
              return name == 'X-AmpAdSignature' ? 'AQAB' : undefined;
            },
            has: function(name) {
              return name === 'X-AmpAdSignature';
            },
          })).to.eventually.deep.equal(
              {creative,
               signature: base64UrlDecodeToBytes('AQAB'),
               size: null});
      });
    });
  });

  describe('#getAdUrl', () => {
    it('returns the right URL', () => {
      new AmpAd(element).upgradeCallback();
      impl.onLayoutMeasure();
      return impl.getAdUrl().then(url => {
        expect(url).to.match(new RegExp(
          '^https://googleads\\.g\\.doubleclick\\.net/pagead/ads' +
          '\\?client=adsense&format=0x0&w=0&h=0&adtest=false' +
          '&adk=[0-9]+&bc=1&pv=1&vis=1&wgl=1' +
          '&prev_fmts=320x50(%2C[0-9]+x[0-9]+)*' +
          '&is_amp=3&amp_v=%24internalRuntimeVersion%24' +
          // Depending on how the test is run, it can get different
          // results.
          '&d_imp=1&dt=[0-9]+&ifi=[0-9]+&adf=[0-9]+' +
          '&c=[0-9]+&output=html&nhd=1&eid=8675309&biw=[0-9]+&bih=[0-9]+' +
          '&adx=-?[0-9]+&ady=-?[0-9]+&u_aw=[0-9]+&u_ah=[0-9]+&u_cd=24' +
          '&u_w=[0-9]+&u_h=[0-9]+&u_tz=-?[0-9]+&u_his=[0-9]+' +
          '&oid=2&brdim=[0-9]+(%2C[0-9]+){9}' +
          '&isw=[0-9]+&ish=[0-9]+' +
          '&url=https?%3A%2F%2F[a-zA-Z0-9.:%]+' +
          '&top=https?%3A%2F%2Flocalhost%3A9876%2F%3Fid%3D[0-9]+' +
          '(&loc=https?%3A%2F%2[a-zA-Z0-9.:%]+)?' +
          '&ref=https?%3A%2F%2Flocalhost%3A9876%2F%3Fid%3D[0-9]+' +
          '&dtd=[0-9]+$'));
      });
    });
  });
});
