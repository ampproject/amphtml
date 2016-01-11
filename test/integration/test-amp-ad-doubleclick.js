/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {createFixtureIframe, pollForLayout, poll} from
    '../../testing/iframe';
import {timer} from
    '../../src/timer';

describe('Rendering of one ad', () => {
  let fixture;
  beforeEach(() => {
    return createFixtureIframe('test/fixtures/doubleclick.html', 3000)
      .then(f => {
        fixture = f;
      });
  });

  it('ad should create an iframe loaded', function() {
    this.timeout(20000);
    let iframe;
    let ampAd;
    return pollForLayout(fixture.win, 1, 5500).then(function() {
      expect(fixture.doc.querySelectorAll('iframe')).to.have.length(1);
      iframe = fixture.doc.querySelector('iframe');
      ampAd = iframe.parentElement;
      expect(iframe.src).to.contain('categoryExclusion');
      expect(iframe.src).to.contain('health');
      expect(iframe.src).to.contain('tagForChildDirectedTreatment');
      expect(iframe.src).to.match(/http\:\/\/localhost:9876\/base\/dist\.3p\//);
      return timer.promise(10);
    }).then(() => {
      return poll('frame to load', () => {
        return iframe.contentWindow && iframe.contentWindow.document &&
            iframe.contentWindow.document.getElementById('c');
      });
    }).then(unusedCanvas => {
      return poll('3p JS to load.', () => iframe.contentWindow.context);
    }).then(context => {
      expect(context.data.tagForChildDirectedTreatment).to.be.false;
      expect(context.data.categoryExclusion).to.be.equal('health');
      expect(context.data.targeting).to.be.jsonEqual(
          {sport: ['rugby', 'cricket']});
      return poll('main ad JS is injected', () => {
        return iframe.contentWindow.document.querySelector(
            'script[src="https://www.googletagservices.com/tag/js/gpt.js"]');
      });
    }).then(unusedCanvas => {
      const win = iframe.contentWindow;
      return poll('GPT loaded', () => {
        return win.googletag && win.googletag.pubads && win.googletag.pubads();
      });
    }).then(pubads => {
      const canvas = iframe.contentWindow.document.querySelector('#c');
      expect(pubads.get('page_url')).to.equal(
          'http://localhost:9876/doubleclick.html');
      const slot = canvas.slot;
      expect(slot).to.not.be.null;
      expect(slot.getCategoryExclusions()).to.jsonEqual(['health']);
      expect(slot.getTargeting('sport')).to.jsonEqual(['rugby', 'cricket']);
      return poll(
          'ad iframe to be initialized. Means that an actual ad was loaded.',
          () => {
            return canvas.querySelector(
                '[id="google_ads_iframe_/4119129/mobile_ad_banner_0"]');
          }, null, 5000);
    }).then(unusedAdIframe => {
      expect(iframe.getAttribute('width')).to.equal('320');
      expect(iframe.getAttribute('height')).to.equal('50');
      return poll('Creative id transmitted. Ad fully rendered.', () => {
        return ampAd.getAttribute('creative-id');
      }, null, 15000);
    }).then(creativeId => {
      expect(creativeId).to.match(/^dfp-/);
    });
  });
});
