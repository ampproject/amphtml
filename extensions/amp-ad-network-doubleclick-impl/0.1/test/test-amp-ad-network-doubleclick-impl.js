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
        // Next two lines are to ensure that internal parts not relevant for this
        // test are properly set.
        impl.size_ = {width: 200, height: 50};
        impl.iframe = impl.win.document.createElement('iframe');
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
        [
          /^https:\/\/securepubads\.g\.doubleclick\.net\/gampad\/ads/,
          /(\?|&)adk=\d+(&|$)/,
          /(\?|&)gdfp_req=1(&|$)/,
          /(\?|&)impl=ifr(&|$)/,
          /(\?|&)sfv=A(&|$)/,
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
          /(\?|&)brdim=-?[0-9]+(%2C-?[0-9]+){9}(&|$)/,
          /(\?|&)isw=[0-9]+(&|$)/,
          /(\?|&)ish=[0-9]+(&|$)/,
          /(\?|&)pfx=(1|0)(&|$)/,
          /(\?|&)eid=([^&]+%2c)*108809080(%2c[^&]+)*(&|$)/,
          /(\?|&)url=https?%3A%2F%2F[a-zA-Z0-9.:%]+(&|$)/,
          /(\?|&)top=https?%3A%2F%2Flocalhost%3A9876%2F%3Fid%3D[0-9]+(&|$)/,
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

  describe('#unlayoutCallback', () => {
    it('should call #resetSlot, remove child iframe, but keep other children',
        () => {
          return createImplTag({
            width: '300',
            height: '150',
          }).then(() => {
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
});
