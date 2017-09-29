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
import {MAX_RTC_CALLOUTS, realTimeConfigManager} from '../real-time-config-manager';
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
      text: textFunction
    }));
  }

  function setRtcConfig(rtcConfig) {
    element.setAttribute('prerequest-callouts', JSON.stringify(rtcConfig));
  }

  describe('#executeRealTimeConfig', () => {
    beforeEach(() => {});

    it('should send RTC callouts for all specified URLS', () => {
      const urls = ['https://www.example.biz/'];
      const rtcConfig = {
        urls,
        'timeoutMillis': 500};
      setRtcConfig(rtcConfig);
      const rtcResponseValues = [{"targeting":{"food":["cheeseburger"]}}];
      for (let i in urls) {
        setFetchJsonStubBehavior(urls[i], rtcResponseValues[i]);
      }
      const rtcResponsePromiseArray = realTimeConfigManager(a4aElement);
      return rtcResponsePromiseArray.then(rtcResponseArray => {
          console.log(JSON.stringify(rtcResponseArray));
      });
    });

    it('', () => {});
  });

  describe('#validateRtcConfig', () => {
    afterEach(() => {
      element.removeAttribute('prerequest-callouts');
    });

    it('should return true for valid rtcConfig', () => {
      const rtcConfig = {
        'vendors': {'fakeVendor': {'SLOT_ID': '1', 'PAGE_ID': '1'},
          'nonexistent-vendor': {'SLOT_ID': '1'},
          'fakeVendor2': {'SLOT_ID': '1'}},
        'urls': ['https://localhost:4443/posts?slot_id=SLOT_ID',
          'https://broken.zzzzzzz'],
        'timeoutMillis': 500};
      setRtcConfig(rtcConfig);
      expect(rtcManager.validateRtcConfig()).to.be.true;
      expect(rtcManager.rtcConfig).to.deep.equal(rtcConfig);
    });

    it('should return false if prerequest-callouts not specified', () => {
      expect(rtcManager.validateRtcConfig()).to.be.false;
      expect(rtcManager.rtcConfig).to.not.be.ok;
    });

    // Test various misconfigurations that are missing vendors or urls.
    [{'timeoutMillis': 500}, {'vendors': {}}, {'urls': []},
     {'vendors': {}, 'urls': []},
     {'vendors': 'incorrect', 'urls': 'incorrect'}].forEach(rtcConfig => {
       it('should return false for rtcConfig missing required values', () => {
         setRtcConfig(rtcConfig);
         expect(rtcManager.validateRtcConfig()).to.be.false;
         expect(rtcManager.rtcConfig).to.not.be.ok;
       });
     });

    it('should return false for bad JSON rtcConfig', () => {
      const rtcConfig = '{"urls" : ["https://google.com"]';
      element.setAttribute('prerequest-callouts', rtcConfig);
      expect(rtcManager.validateRtcConfig()).to.be.false;
      expect(rtcManager.rtcConfig).to.not.be.ok;
    });

  });

  describe('inflateVendorUrls', () => {
    it('', () => {});
    it('', () => {});
  });

  describe('inflatePublisherUrls', () => {
    beforeEach(() => {
      const rtcConfig = {
        'urls': ['https://www.example.biz/posts?slot_id=SLOT_ID'],
        'timeoutMillis': 500};
      setRtcConfig(rtcConfig);
      rtcManager.validateRtcConfig();
    });

    it('should add and inflate urls with macros', () => {
      let macros = {SLOT_ID: '1'};
      rtcManager.inflatePublisherUrls(macros);
      expect(rtcManager.calloutUrls).to.be.ok;
      expect(rtcManager.calloutUrls.length).to.equal(1);
      expect(rtcManager.calloutUrls[0]).to.equal(
          'https://www.example.biz/posts?slot_id=1');
    });
    it('should add urls without macros', () => {
      let macros = null;
      rtcManager.inflatePublisherUrls(macros);
      expect(rtcManager.calloutUrls).to.be.ok;
      expect(rtcManager.calloutUrls.length).to.equal(1);
      expect(rtcManager.calloutUrls[0]).to.equal(
          'https://www.example.biz/posts?slot_id=SLOT_ID');
    });
    it('should not add any URLs if none specified', () => {
      expect(false).to.be.true;
    });
    it('should add urls with and without macros', () => {
      expect(false).to.be.true;
    });
    it('should not add URL if macros invalid', () => {
      expect(false).to.be.true;
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
