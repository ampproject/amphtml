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

import {createElementWithAttributes} from '../../../../src/dom';
import {AmpA4A} from '../amp-a4a';
import {
  maybeExecuteRealTimeConfig_,
  validateRtcConfig_,
  RTC_ERROR_ENUM,
  MAX_RTC_CALLOUTS,
} from '../real-time-config-manager';
import {Xhr} from '../../../../src/service/xhr-impl';
import {parseUrl} from '../../../../src/url';
// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import '../../../amp-ad/0.1/amp-ad';

describes.realWin('RealTimeConfigManager', {amp: true}, env => {
  let element;
  let a4aElement;
  let sandbox;
  let rtcManager;
  let fetchJsonStub;

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
    doc.body.appendChild(element);
    fetchJsonStub = sandbox.stub(Xhr.prototype, 'fetchJson');
    a4aElement = new AmpA4A(element);

  });

  afterEach(() => {
    sandbox.restore();
  });

  function setFetchJsonStubBehavior(params, response, opt_status) {
    const status = opt_status || 200;
    const textFunction = () => {
      return Promise.resolve(JSON.stringify(response));
    };
    fetchJsonStub.withArgs(params).returns(Promise.resolve({
      status,
      text: textFunction,
    }));
  }

  function testGoodRtcResponse(rtcResponse, callout, calloutResponse) {
    expect(rtcResponse.rtcResponse).to.deep.equal(calloutResponse);
    expect(rtcResponse.callout).to.equal(callout);
    expect(Number.isInteger(rtcResponse.rtcTime)).to.be.true;
  }

  function testBadRtcResponse(rtcResponse, callout, error) {
    expect(rtcResponse.rtcResponse).to.not.be.ok;
    expect(rtcResponse.callout).to.equal(callout);
    expect(rtcResponse.error).to.equal(error);
    expect(Number.isInteger(rtcResponse.rtcTime)).to.be.true;
  }

  function setRtcConfig(rtcConfig) {
    element.setAttribute('prerequest-callouts', JSON.stringify(rtcConfig));
  }

  describe('#maybeExecuteRealTimeConfig_', () => {
    beforeEach(() => {});

    it('should send RTC callouts for all specified URLS without macros', () => {
      const urls = [
        'https://www.1.com/',
        'https://www.2.com/',
        'https://www.3.com/',
        'https://www.4.com/',
        'https://www.5.com/',
      ];
      const rtcCalloutResponses = [
        {'response1': {'fooArray': ['foo']}},
        {'response2': {'test': 'test2'}},
        {'response3': {'apple': 'banana'}},
        {'response4': {'animalArray': ['cat', 'dog'],
                       'foodObject': {'apple': true, 'car': false}}},
        {'response5': [1, 2, 3]}
      ];
      const rtcConfig = {
        urls,
        'timeoutMillis': 500};
      setRtcConfig(rtcConfig);
      for (const i in urls) {
        setFetchJsonStubBehavior(urls[i], rtcCalloutResponses[i]);
      }
      const rtcResponsePromiseArray = maybeExecuteRealTimeConfig_(a4aElement);
      return rtcResponsePromiseArray.then(rtcResponseArray => {
        expect(fetchJsonStub.callCount).to.equal(5);
        rtcResponseArray.forEach((rtcResponse, i) => {
          expect(fetchJsonStub.calledWith(urls[i]));
          expect(rtcResponse.rtcResponse).to.deep.equal(rtcCalloutResponses[i]);
          expect(rtcResponse.callout).to.equal(urls[i]);
        });
      });
    });

    it('should send only 5 RTC callouts for all specified URLS without macros', () => {
      const urls = [
        'https://www.1.com/',
        'https://www.2.com/',
        'https://www.3.com/',
        'https://www.4.com/',
        'https://www.5.com/',
        'https://www.6.com/',
        'https://www.7.com/',
      ];
      const rtcCalloutResponses = [
        {'response1': {'fooArray': ['foo']}},
        {'response2': {'test': 'test2'}},
        {'response3': {'apple': 'banana'}},
        {'response4': {'animalArray': ['cat', 'dog'],
                       'foodObject': {'apple': true, 'car': false}}},
        {'response5': [1, 2, 3]},
        {'response6': "WILL NEVER SEE"},
        {'response5': "WILL NEVER SEE"}
      ];
      const rtcConfig = {
        urls,
        'timeoutMillis': 500};
      setRtcConfig(rtcConfig);
      for (const i in urls) {
        setFetchJsonStubBehavior(urls[i], rtcCalloutResponses[i]);
      }
      const rtcResponsePromiseArray = maybeExecuteRealTimeConfig_(a4aElement);
      return rtcResponsePromiseArray.then(rtcResponseArray => {
        expect(fetchJsonStub.callCount).to.equal(5);
        for (let i = 0; i < 5; i++) {
          expect(fetchJsonStub.calledWith(urls[i])).to.be.true;
          testGoodRtcResponse(rtcResponseArray[i], urls[i], rtcCalloutResponses[i]);
        }
        expect(fetchJsonStub.neverCalledWith(urls[5])).to.be.true;
        testBadRtcResponse(rtcResponseArray[5], urls[5],
                           RTC_ERROR_ENUM.MAX_CALLOUTS_EXCEEDED);
        expect(fetchJsonStub.neverCalledWith(urls[6])).to.be.true;
        testBadRtcResponse(rtcResponseArray[6], urls[6],
                           RTC_ERROR_ENUM.MAX_CALLOUTS_EXCEEDED);
      });
    });

    it('should send RTC callouts to inflated publisher URLs', () => {
      const urls = [
        'https://www.1.com/',
        'https://www.2.com/?slot_id=SLOT_ID&page_id=PAGE_ID',
        'https://www.3.com/?slot_id=SLOT_ID&foo_id=FOO_ID'
      ];
      const inflatedUrls = [
        'https://www.1.com/',
        'https://www.2.com/?slot_id=1&page_id=2',
        'https://www.3.com/?slot_id=1&foo_id=3'
      ];
      const rtcCalloutResponses = [
        {'response1': {'fooArray': ['foo']}},
        {'response2': {'test': 'test2'}},
        {'response3': {'apple': 'banana'}},
      ];
      const customMacros = {
        SLOT_ID: 1,
        PAGE_ID: () => 2,
        FOO_ID: () => 3
      };
      const rtcConfig = {urls};
      setRtcConfig(rtcConfig);
      for (const i in urls) {
        setFetchJsonStubBehavior(inflatedUrls[i], rtcCalloutResponses[i]);
      }
      const rtcResponsePromiseArray = maybeExecuteRealTimeConfig_(a4aElement, customMacros);
      return rtcResponsePromiseArray.then(rtcResponseArray => {
        expect(fetchJsonStub.callCount).to.equal(3);
        rtcResponseArray.forEach((rtcResponse, i) => {
          expect(fetchJsonStub.calledWith(inflatedUrls[i])).to.be.true;
          expect(rtcResponse.rtcResponse).to.deep.equal(rtcCalloutResponses[i]);
          expect(rtcResponse.callout).to.equal(inflatedUrls[i]);
        });
      });
    });
    it('should send RTC callouts to inflated vendor URLs', () => {
      const vendors = {
        'fAkeVeNdOR': {SLOT_ID: 1, PAGE_ID: 2}
      };
      const inflatedVendorUrls = [
        'https://www.fake.qqq/slot_id=1&page_id=3&foo_id=4'
      ];
      const rtcCalloutResponses = [
        {'response1': {'fooArray': ['foo']}},
      ];
      const customMacros = {
        PAGE_ID: () => 3,
        FOO_ID: () => 4
      };
      const rtcConfig = {vendors};
      setRtcConfig(rtcConfig);
      setFetchJsonStubBehavior(inflatedVendorUrls[0], rtcCalloutResponses[0]);
      const rtcResponsePromiseArray = maybeExecuteRealTimeConfig_(a4aElement, customMacros);
      return rtcResponsePromiseArray.then(rtcResponseArray => {
        expect(fetchJsonStub.callCount).to.equal(1);
        rtcResponseArray.forEach((rtcResponse, i) => {
          expect(fetchJsonStub.calledWith(inflatedVendorUrls[i])).to.be.true;
          expect(rtcResponse.rtcResponse).to.deep.equal(rtcCalloutResponses[i]);
          expect(rtcResponse.callout).to.equal(Object.keys(vendors)[0].toLowerCase());
        });
      });
    });
    it('should send RTC callouts to inflated publisher and vendor URLs', () => {});
    it('should favor publisher URLs over vendor URLs', () => {});
    it('should not send more than one RTC callout to the same url', () => {
      const urls = [
        'https://www.1.com/',
        'https://www.1.com/',
      ];
      const rtcCalloutResponses = [
        {'response1': {'fooArray': ['foo']}},
        {'response1': {'fooArray': ['foo']}},
      ];
      const rtcConfig = {
        urls,
        'timeoutMillis': 500};
      setRtcConfig(rtcConfig);
      for (const i in urls) {
        setFetchJsonStubBehavior(urls[i], rtcCalloutResponses[i]);
      }
      const rtcResponsePromiseArray = maybeExecuteRealTimeConfig_(a4aElement);
      return rtcResponsePromiseArray.then(rtcResponseArray => {
        expect(fetchJsonStub.callCount).to.equal(1);
        expect(fetchJsonStub.calledWith(urls[0]));
        testGoodRtcResponse(rtcResponseArray[0], urls[0], rtcCalloutResponses[0]);
        testBadRtcResponse(rtcResponseArray[1], urls[1], RTC_ERROR_ENUM.DUPLICATE_URL);
      });
    });
    it('should not send an RTC callout to an insecure url', () => {});
    it('should catch errors due to network failure', () => {});
    it('should not send RTC callout to unknown vendor', () => {});
  });

  describe('#validateRtcConfig', () => {
    let validatedRtcConfig;
    afterEach(() => {
      element.removeAttribute('prerequest-callouts');
    });

    it('should return parsed rtcConfig for valid rtcConfig', () => {
      const rtcConfig = {
        'vendors': {'fakeVendor': {'SLOT_ID': '1', 'PAGE_ID': '1'},
          'nonexistent-vendor': {'SLOT_ID': '1'},
          'fakeVendor2': {'SLOT_ID': '1'}},
        'urls': ['https://localhost:4443/posts?slot_id=SLOT_ID',
          'https://broken.zzzzzzz'],
        'timeoutMillis': 500};
      setRtcConfig(rtcConfig);
      validatedRtcConfig = validateRtcConfig_(element);
      expect(validatedRtcConfig).to.be.ok;
      expect(validatedRtcConfig).to.deep.equal(rtcConfig);
    });

    it('should return null if prerequest-callouts not specified', () => {
      validatedRtcConfig = validateRtcConfig_(element);
      expect(validatedRtcConfig).to.be.null;
    });

    // Test various misconfigurations that are missing vendors or urls.
    [{'timeoutMillis': 500}, {'vendors': {}}, {'urls': []},
     {'vendors': {}, 'urls': []},
     {'vendors': 'incorrect', 'urls': 'incorrect'}].forEach(rtcConfig => {
       it('should return null for rtcConfig missing required values', () => {
         setRtcConfig(rtcConfig);
         validatedRtcConfig = validateRtcConfig_(element);
         expect(validatedRtcConfig).to.be.null;
       });
     });

    it('should return false for bad JSON rtcConfig', () => {
      const rtcConfig = '{"urls" : ["https://google.com"]';
      element.setAttribute('prerequest-callouts', rtcConfig);
      validatedRtcConfig = validateRtcConfig_(element);
      expect(validatedRtcConfig).to.be.null;
    });

  });

  describe('#maybeInflateAndAddUrl', () => {
    let url;
    let expandedUrl;
    let macros;
    it('should add url without macros', () => {
      url = 'https://www.example.com/biz?a=1';
      macros = {};
      rtcManager.maybeInflateAndAddUrl(url, macros);
      expect(rtcManager.calloutUrls.length).to.equal(1);
      expect(rtcManager.calloutUrls[0]).to.equal(url);
    });

    it('should inflate and add url with macros', () => {
      url = 'https://www.example.com/a?r_id=R_ID&h_id=H_ID';
      macros = {R_ID: '6', H_ID: '13'};
      expandedUrl = 'https://www.example.com/a?r_id=6&h_id=13';
      rtcManager.maybeInflateAndAddUrl(url, macros);
      expect(rtcManager.calloutUrls.length).to.equal(1);
      expect(rtcManager.calloutUrls[0]).to.equal(expandedUrl);
    });

    it('should not add insecure url', () => {
      url = 'http://www.example.com/a?r_id=R_ID&h_id=H_ID';
      macros = {R_ID: '6', H_ID: '13'};
      rtcManager.maybeInflateAndAddUrl(url, macros);
      expect(rtcManager.calloutUrls.length).to.equal(0);
    });

    it('should not add broken url', () => {
      url = 'https://wa][~a.com';
      macros = {R_ID: '6', H_ID: '13'};
      rtcManager.maybeInflateAndAddUrl(url, macros);
      expect(rtcManager.calloutUrls.length).to.equal(0);
    });

    it('should ignore incorrect macros', () => {
      url = 'https://www.example.com/a?r_id=R_ID&h_id=H_ID';
      expandedUrl = 'https://www.example.com/a?r_id=2&h_id=H_ID';
      macros = {WRONG: '6', MACRO: '13', R_ID: '2'};
      rtcManager.maybeInflateAndAddUrl(url, macros);
      expect(rtcManager.calloutUrls.length).to.equal(1);
      expect(rtcManager.calloutUrls[0]).to.equal(expandedUrl);
    });
  });
});
