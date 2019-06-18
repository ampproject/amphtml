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
import {AmpAdNetworkDoubleclickImpl} from '../amp-ad-network-doubleclick-impl';
import {RTC_ERROR_ENUM} from '../../../amp-a4a/0.1/real-time-config-manager';
import {RTC_VENDORS} from '../../../amp-a4a/0.1/callout-vendors';
import {Services} from '../../../../src/services';
import {createElementWithAttributes} from '../../../../src/dom';

describes.realWin('DoubleClick Fast Fetch RTC', {amp: true}, env => {
  let impl;
  let element;
  let sandbox;

  beforeEach(() => {
    sandbox = env.sandbox;
    env.win.AMP_MODE.test = true;
    const doc = env.win.document;
    // TODO(a4a-cam@): This is necessary in the short term, until A4A is
    // smarter about host document styling.  The issue is that it needs to
    // inherit the AMP runtime style element in order for shadow DOM-enclosed
    // elements to behave properly.  So we have to set up a minimal one here.
    const ampStyle = doc.createElement('style');
    ampStyle.setAttribute('amp-runtime', 'scratch-fortesting');
    doc.head.appendChild(ampStyle);
    element = createElementWithAttributes(env.win.document, 'amp-ad', {
      'width': '200',
      'height': '50',
      'type': 'doubleclick',
      'layout': 'fixed',
    });
    impl = new AmpAdNetworkDoubleclickImpl(element, env.win.document, env.win);
    impl.populateAdUrlState();
  });

  afterEach(() => {
    sandbox.restore();
    impl = null;
  });

  describe('#mergeRtcResponses_', () => {
    function testMergeRtcResponses(
      rtcResponseArray,
      expectedParams,
      expectedJsonTargeting
    ) {
      const rtcUrlParams = impl.mergeRtcResponses_(rtcResponseArray);
      expect(rtcUrlParams).to.deep.equal(expectedParams);
      expect(impl.jsonTargeting).to.deep.equal(expectedJsonTargeting);
    }

    it('should handle array with undefined', () => {
      const rtcResponseArray = [undefined, null];
      const expectedParams = {'artc': null, 'ati': '', 'ard': ''};
      const expectedJsonTargeting = {};
      testMergeRtcResponses(
        rtcResponseArray,
        expectedParams,
        expectedJsonTargeting
      );
    });

    it('should properly merge RTC responses into jsonTargeting on impl', () => {
      const rtcResponseArray = [
        {
          response: {targeting: {'a': [1, 2, 3], 'b': {c: 'd'}}},
          callout: 'www.exampleA.com',
          rtcTime: 100,
        },
        {
          response: {targeting: {'a': 'foo', 'b': {e: 'f'}}},
          callout: 'www.exampleB.com',
          rtcTime: 500,
        },
        {
          response: {targeting: {'z': [{a: 'b'}, {c: 'd'}], 'b': {c: 'd'}}},
          callout: 'www.exampleC.com',
          rtcTime: 100,
        },
      ];
      const expectedParams = {
        ati: '2,2,2',
        artc: '100,500,100',
        ard: 'www.exampleA.com,www.exampleB.com,www.exampleC.com',
      };
      const expectedJsonTargeting = {
        targeting: {
          'a': 'foo',
          'b': {c: 'd', e: 'f'},
          'z': [{a: 'b'}, {c: 'd'}],
        },
      };
      testMergeRtcResponses(
        rtcResponseArray,
        expectedParams,
        expectedJsonTargeting
      );
    });

    it('should properly merge RTC responses from vendors', () => {
      RTC_VENDORS['TEMP_VENDOR'] = {
        'url': 'https://fakevendor2.biz',
      };
      const rtcResponseArray = [
        {
          response: {targeting: {'a': [1, 2, 3], 'b': {c: 'd'}}},
          callout: 'fakevendor',
          rtcTime: 100,
        },
        {
          response: {targeting: {'a': 'foo', 'b': {e: 'f'}}},
          callout: 'www.exampleB.com',
          rtcTime: 500,
        },
        {
          response: {targeting: {'a': 'bar'}},
          callout: 'TEMP_VENDOR',
          rtcTime: 100,
        },
      ];
      const expectedParams = {
        ati: '2,2,2',
        artc: '100,500,100',
        ard: 'fakevendor,www.exampleB.com,TEMP_VENDOR',
      };
      const expectedJsonTargeting = {
        targeting: {
          'a': 'foo',
          'b': {e: 'f'},
          'a_fakevendor': [1, 2, 3],
          'b_fakevendor': {c: 'd'},
          'a_TEMP_VENDOR': 'bar',
        },
      };
      testMergeRtcResponses(
        rtcResponseArray,
        expectedParams,
        expectedJsonTargeting
      );
    });

    it('should properly merge into existing json', () => {
      element.setAttribute('json', '{"targeting":{"a":"foo"}}');
      impl = new AmpAdNetworkDoubleclickImpl(
        element,
        env.win.document,
        env.win
      );
      impl.populateAdUrlState();
      const rtcResponseArray = [
        {
          response: {targeting: {'a': [1, 2, 3]}},
          callout: 'fakevendor',
          rtcTime: 100,
        },
      ];
      const expectedParams = {
        ati: '2',
        artc: '100',
        ard: 'fakevendor',
      };
      const expectedJsonTargeting = {
        targeting: {'a': 'foo', 'a_fakevendor': [1, 2, 3]},
      };
      testMergeRtcResponses(
        rtcResponseArray,
        expectedParams,
        expectedJsonTargeting
      );
    });

    it('should properly merge into existing categoryExclusions', () => {
      element.setAttribute('json', '{"categoryExclusions": ["sports"]}');
      impl = new AmpAdNetworkDoubleclickImpl(
        element,
        env.win.document,
        env.win
      );
      impl.populateAdUrlState();
      const rtcResponseArray = [
        {
          response: {
            targeting: {'a': [1, 2, 3]},
            categoryExclusions: ['health'],
          },
          callout: 'fakevendor',
          rtcTime: 100,
        },
      ];
      const expectedParams = {
        ati: '2',
        artc: '100',
        ard: 'fakevendor',
      };
      const expectedJsonTargeting = {
        targeting: {'a_fakevendor': [1, 2, 3]},
        categoryExclusions: ['sports', 'health'],
      };
      testMergeRtcResponses(
        rtcResponseArray,
        expectedParams,
        expectedJsonTargeting
      );
    });

    it('should not allow duplicate categoryExclusions', () => {
      element.setAttribute('json', '{"categoryExclusions": ["health"]}');
      impl = new AmpAdNetworkDoubleclickImpl(
        element,
        env.win.document,
        env.win
      );
      impl.populateAdUrlState();
      const rtcResponseArray = [
        {
          response: {categoryExclusions: ['health']},
          callout: 'fakevendor',
          rtcTime: 100,
        },
      ];
      const expectedParams = {
        ati: '2',
        artc: '100',
        ard: 'fakevendor',
      };
      const expectedJsonTargeting = {
        categoryExclusions: ['health'],
      };
      testMergeRtcResponses(
        rtcResponseArray,
        expectedParams,
        expectedJsonTargeting
      );
    });

    Object.keys(RTC_ERROR_ENUM).forEach(errorName => {
      it(`should send correct error value for ${errorName}`, () => {
        const rtcResponseArray = [
          {
            error: RTC_ERROR_ENUM[errorName],
            callout: 'www.exampleA.com',
            rtcTime: 100,
          },
        ];
        const expectedParams = {
          ati: `${RTC_ERROR_ENUM[errorName]}`,
          artc: '100',
          ard: 'www.exampleA.com',
        };
        const expectedJsonTargeting = {};
        testMergeRtcResponses(
          rtcResponseArray,
          expectedParams,
          expectedJsonTargeting
        );
      });
    });

    it('should properly merge mix of success and errors', () => {
      impl.jsonTargeting = {
        targeting: {'abc': [1, 2, 3], 'b': {n: 'm'}, 'a': 'TEST'},
        categoryExclusions: ['sports'],
      };
      const rtcResponseArray = [
        {
          error: RTC_ERROR_ENUM.TIMEOUT,
          callout: 'www.exampleA.com',
          rtcTime: 1500,
        },
        {
          response: {
            targeting: {'a': 'foo', 'b': {e: 'f'}},
            categoryExclusions: ['health'],
          },
          callout: 'VendorFoo',
          rtcTime: 500,
        },
        {
          response: {targeting: {'a': [1, 2, 3], 'b': {c: 'd'}}},
          callout: 'www.exampleB.com',
          rtcTime: 100,
        },
        {
          response: {targeting: {'a': [4, 5, 6], 'b': {x: [1, 2]}}},
          callout: 'VendCom',
          rtcTime: 500,
        },
        {
          error: RTC_ERROR_ENUM.DUPLICATE_URL,
          callout: 'www.exampleB.com',
          rtcTime: 0,
        },
        {
          error: RTC_ERROR_ENUM.NETWORK_FAILURE,
          callout: '3PVend',
          rtcTime: 100,
        },
      ];
      const expectedParams = {
        ati: '10,2,2,2,5,8',
        artc: '1500,500,100,500,0,100',
        ard:
          'www.exampleA.com,VendorFoo,www.exampleB.com,' +
          'VendCom,www.exampleB.com,3PVend',
      };
      const expectedJsonTargeting = {
        targeting: {
          'a': [4, 5, 6],
          'b': {n: 'm', e: 'f', c: 'd', x: [1, 2]},
          abc: [1, 2, 3],
        },
        categoryExclusions: ['sports', 'health'],
      };
      testMergeRtcResponses(
        rtcResponseArray,
        expectedParams,
        expectedJsonTargeting
      );
    });

    it('should return null for empty array', () => {
      expect(impl.mergeRtcResponses_()).to.be.null;
    });
  });

  describe('rewriteRtcKeys', () => {
    it('should rewrite key names if vendor', () => {
      const response = {
        'a': '1',
        'b': '2',
      };
      const rewrittenResponse = {
        'a_fakevendor': '1',
        'b_fakevendor': '2',
      };
      expect(impl.rewriteRtcKeys_(response, 'fakevendor')).to.deep.equal(
        rewrittenResponse
      );
    });

    it('should not rewrite key names if vendor has disableKeyAppend', () => {
      const response = {
        'a': '1',
        'b': '2',
      };
      // fakevendor2 has disableKeyAppend set to true, see callout-vendors.js
      expect(impl.rewriteRtcKeys_(response, 'fakevendor2')).to.deep.equal(
        response
      );
    });

    it('should not rewrite key names if custom url callout', () => {
      const response = {
        'a': '1',
        'b': '2',
      };
      expect(impl.rewriteRtcKeys_(response, 'www.customurl.biz')).to.deep.equal(
        response
      );
    });
  });

  describe('getCustomRealTimeConfigMacros', () => {
    // TODO(bradfrizzell, #18574): Fix failing referrer check and re-enable.
    it.skip('should return correct macros', () => {
      const macros = {
        'data-slot': '5678',
        'height': '50',
        'width': '200',
        'DATA-MULTI-SIZE': '300x50,200x100',
        'data-multi-size-validation': 'true',
        'data-OVERRIDE-width': '250',
        'data-override-HEIGHT': '75',
      };
      const json = {
        'targeting': {'a': '123'},
      };
      element = createElementWithAttributes(env.win.document, 'amp-ad', {
        width: macros['width'],
        height: macros['height'],
        type: 'doubleclick',
        layout: 'fixed',
        'data-slot': macros['data-slot'],
        'data-multi-size': macros['DATA-MULTI-SIZE'],
        'data-multi-size-validation': macros['data-multi-size-validation'],
        'data-override-width': macros['data-OVERRIDE-width'],
        'data-override-height': macros['data-override-HEIGHT'],
        'json': JSON.stringify(json),
      });
      env.win.document.body.appendChild(element);
      Object.defineProperty(env.win.document, 'referrer', {
        value: 'https://www.google.com/',
      });
      const docInfo = Services.documentInfoForDoc(element);
      impl = new AmpAdNetworkDoubleclickImpl(
        element,
        env.win.document,
        env.win
      );
      impl.populateAdUrlState();
      const customMacros = impl.getCustomRealTimeConfigMacros_();
      expect(customMacros.PAGEVIEWID()).to.equal(docInfo.pageViewId);
      expect(customMacros.HREF()).to.equal(env.win.location.href);
      expect(customMacros.TGT()).to.equal(JSON.stringify(json['targeting']));
      Object.keys(macros).forEach(macro => {
        expect(customMacros.ATTR(macro)).to.equal(macros[macro]);
      });
      return Promise.all([
        customMacros.ADCID().then(adcid => {
          expect(adcid).to.not.be.null;
        }),
        customMacros.REFERRER().then(referrer => {
          expect(referrer).to.equal(env.win.document.referrer);
        }),
      ]);
    });

    it('should return the same ADCID on multiple calls', () => {
      element = createElementWithAttributes(env.win.document, 'amp-ad', {
        type: 'doubleclick',
      });
      env.win.document.body.appendChild(element);
      impl = new AmpAdNetworkDoubleclickImpl(
        element,
        env.win.document,
        env.win
      );
      impl.populateAdUrlState();
      const customMacros = impl.getCustomRealTimeConfigMacros_();
      let adcid;
      return customMacros.ADCID().then(adcid1 => {
        adcid = adcid1;
        expect(adcid).to.not.be.null;
        return customMacros.ADCID().then(adcid2 => {
          expect(adcid2).to.equal(adcid);
        });
      });
    });

    it('should respect timeout for adcid', () => {
      element = createElementWithAttributes(env.win.document, 'amp-ad', {
        type: 'doubleclick',
      });
      env.win.document.body.appendChild(element);
      impl = new AmpAdNetworkDoubleclickImpl(
        element,
        env.win.document,
        env.win
      );
      impl.populateAdUrlState();
      const customMacros = impl.getCustomRealTimeConfigMacros_();
      return customMacros.ADCID(0).then(adcid => {
        expect(adcid).to.be.undefined;
      });
    });

    it('should respect timeout for referrer', () => {
      element = createElementWithAttributes(env.win.document, 'amp-ad', {
        type: 'doubleclick',
      });
      env.win.document.body.appendChild(element);
      impl = new AmpAdNetworkDoubleclickImpl(
        element,
        env.win.document,
        env.win
      );
      impl.populateAdUrlState();
      const viewer = Services.viewerForDoc(impl.getAmpDoc());
      sandbox.stub(viewer, 'getReferrerUrl').returns(new Promise(() => {}));
      const customMacros = impl.getCustomRealTimeConfigMacros_();
      return expect(customMacros.REFERRER(0)).to.eventually.be.undefined;
    });

    it('should handle TGT macro when targeting not set', () => {
      const json = {
        'NOTTARGETING': {'a': '123'},
      };
      element = createElementWithAttributes(env.win.document, 'amp-ad', {
        'json': JSON.stringify(json),
      });
      env.win.document.body.appendChild(element);
      impl = new AmpAdNetworkDoubleclickImpl(
        element,
        env.win.document,
        env.win
      );
      impl.populateAdUrlState();
      const customMacros = impl.getCustomRealTimeConfigMacros_();
      expect(customMacros.TGT()).to.equal(JSON.stringify(json['targeting']));
    });
  });
});
