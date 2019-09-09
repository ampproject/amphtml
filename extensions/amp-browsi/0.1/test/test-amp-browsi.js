/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-browsi';
import {AmpBrowsi} from '../amp-browsi';
import {BrowsiEngagementService} from '../engagement';
import {Prediction} from '../Prediction';
import {createElementWithAttributes} from '../../../../src/dom';

describes.realWin(
  'amp-browsi',
  {
    amp: {
      extensions: ['amp-browsi', 'amp-ad'],
    },
  },
  env => {
    let win, doc;

    // const ads = []; //, amp1, amp2
    let element;
    let browsiAmpElement;
    let ampDoc;

    const pubKey = '98569856';
    const siteKey = 'demo';

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      browsiAmpElement = createBrowsiAmp(doc);
      ampDoc = browsiAmpElement.getAmpDoc();
      const ad = createAmpAd(doc, 'ad1');
      doc.body.appendChild(ad);
    });
    function createAmpAd(doc, id) {
      element = createElementWithAttributes(env.win.document, 'amp-ad', {
        'id': id,
        'width': '200',
        'height': '50',
        'type': 'doubleclick',
        'data-slot': 'demoSlot',
        'layout': 'fixed',
      });
      return element;
    }
    function createBrowsiAmp(doc) {
      const element = doc.createElement('amp-browsi');
      element.setAttribute('pub-key', pubKey);
      element.setAttribute('site-key', siteKey);
      doc.body.appendChild(element);
      browsiAmpElement = new AmpBrowsi(element);
      return browsiAmpElement;
    }

    it('should Get correct publisher ad data', function() {
      browsiAmpElement.collectPublisherData(ampDoc).then(adsData => {
        expect(adsData.length).to.equal(1);
        expect(adsData[0].adUnit).to.equal('demoSlot');
        expect(adsData[0].adType).to.equal('doubleclick');
        expect(adsData[0].adWidth).to.equal('200');
        expect(adsData[0].adHeight).to.equal('50');
        expect(adsData[0].adClasses).to.equal('');
      });
    });

    it('should set browsi rtc-config', function() {
      const predictionService = new Prediction(env.win, pubKey, siteKey);
      const ads = Array.from(predictionService.setRtc());
      expect(ads.length).to.equal(1);
      ads.forEach(ad => {
        const rtcConfig = ad.getAttribute('rtc-config');
        expect(rtcConfig).to.equal(
          `{"vendors": {"browsi": {"BROWSI_ID":${pubKey}_${siteKey}}},"timeoutMillis": 750}`
        );
      });
    });

    it('should send at least one engagement batch event', function() {
      const engagementService = new BrowsiEngagementService(ampDoc);
      engagementService.assignEngagementReports();
      const timeout =
        engagementService.minBatchLength * engagementService.sampleTime + 1;
      setTimeout(function() {
        expect(engagementService.isSentAtLeastOnce()).to.equal(true);
      }, timeout * 1000);
    });
  }
);
