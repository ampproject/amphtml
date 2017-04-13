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
import {createIframePromise} from '../../../../testing/iframe';
import {
  installExtensionsService,
} from '../../../../src/service/extensions-impl';
import {extensionsFor} from '../../../../src/services';
import {AmpAdNetworkDoubleclickImpl} from '../amp-ad-network-doubleclick-impl';
import {base64UrlDecodeToBytes} from '../../../../src/utils/base64';
import {utf8Encode} from '../../../../src/utils/bytes';
import {createElementWithAttributes} from '../../../../src/dom';
import {toggleExperiment} from '../../../../src/experiments';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import * as sinon from 'sinon';

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

describes.sandboxed('amp-ad-network-doubleclick-impl', {}, () => {
  let impl;
  let element;

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
        element = createElementWithAttributes(doc, 'amp-ad', {
          'width': '200',
          'height': '50',
          'type': 'doubleclick',
          'layout': 'fixed',
        });
        impl = new AmpAdNetworkDoubleclickImpl(element);
        impl.size_ = size;
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
                  {creative, signature: null, size});
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
              {creative, signature: base64UrlDecodeToBytes('AQAB'), size});
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
                size,
              });
            expect(loadExtensionSpy.withArgs('amp-analytics')).to.be.called;
            // exact value of ampAnalyticsConfig covered in
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
          'type': 'doubleclick',
        });
        impl = new AmpAdNetworkDoubleclickImpl(element);
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

  describe('#getAdUrl', () => {
    beforeEach(() => {
      const sandbox = sinon.sandbox.create();
      element = document.createElement('amp-ad');
      element.setAttribute('type', 'doubleclick');
      element.setAttribute('data-ad-client', 'adsense');
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
      sandbox.stub(impl, 'getAmpDoc', () => {return document;});
    });

    afterEach(() =>
        toggleExperiment(window, 'dc-use-attr-for-format', false));

    it('returns the right URL', () => {
      new AmpAd(element).upgradeCallback();
      return impl.getAdUrl().then(url => {
        expect(url).to.match(new RegExp(
          '^https://securepubads\\.g\\.doubleclick\\.net/gampad/ads' +
          // Depending on how the test is run, it can get different results.
          '\\?adk=[0-9]+&gdfp_req=1&impl=ifr&sfv=A&sz=320x50' +
          '&u_sd=[0-9]+(&asnt=[0-9]+-[0-9]+)?&isc=(1|0)' +
          '&is_amp=3&amp_v=%24internalRuntimeVersion%24' +
          '&d_imp=1&dt=[0-9]+&ifi=[0-9]+&adf=[0-9]+' +
          '&c=[0-9]+&output=html&nhd=1&biw=[0-9]+&bih=[0-9]+' +
          '&adx=-?[0-9]+&ady=-?[0-9]+&u_aw=[0-9]+&u_ah=[0-9]+&u_cd=24' +
          '&u_w=[0-9]+&u_h=[0-9]+&u_tz=-?[0-9]+&u_his=[0-9]+' +
          '&oid=2&brdim=-?[0-9]+(%2C-?[0-9]+){9}' +
          '&isw=[0-9]+&ish=[0-9]+&pfx=(1|0)' +
          '&url=https?%3A%2F%2F[a-zA-Z0-9.:%]+' +
          '&top=https?%3A%2F%2Flocalhost%3A9876%2F%3Fid%3D[0-9]+' +
          '(&loc=https?%3A%2F%2[a-zA-Z0-9.:%]+)?' +
          '&ref=https?%3A%2F%2Flocalhost%3A9876%2F%3Fid%3D[0-9]+' +
          '&dtd=[0-9]+$'));
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
    it('has correct format when dc-use-attr-for-format is on', () => {
      toggleExperiment(window, 'dc-use-attr-for-format', true);
      new AmpAd(element).upgradeCallback();
      const width = impl.element.getAttribute('width');
      const height = impl.element.getAttribute('height');
      impl.onLayoutMeasure();
      return impl.getAdUrl().then(url =>
        // With exp dc-use-attr-for-format off, we can't test for specific
        // numbers, but we know that the values should be numeric.
        expect(url).to.match(new RegExp(`sz=${width}x${height}`)));
    });
    it('has correct format when width=auto and dc-use-attr-for-format is on',
        () => {
          toggleExperiment(window, 'dc-use-attr-for-format', true);
          element.setAttribute('width', 'auto');
          new AmpAd(element).upgradeCallback();
          expect(impl.element.getAttribute('width')).to.equal('auto');
          impl.onLayoutMeasure();
          return impl.getAdUrl().then(url =>
              // Ensure that "auto" doesn't appear anywhere here:
              expect(url).to.match(/sz=[0-9]+x[0-9]+/));
        });
  });
});
