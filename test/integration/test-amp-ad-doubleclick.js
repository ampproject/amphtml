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

describe('Rendering of one ad', () => {
  let fixture;
  beforeEach(() => {
    return createFixtureIframe('test/fixtures/doubleclick.html', 3000)
      .then(f => {
        fixture = f;
      });
  });

  it('should create an iframe loaded', function() {
    this.timeout(20000);
    let iframe;
    let ampAd;
    const isEdge = navigator.userAgent.match(/Edge/);
    return pollForLayout(fixture.win, 1, 5500).then(() => {
      return poll('frame to be in DOM', () => {
        return fixture.doc.querySelector('iframe');
      });
    }).then(iframeElement => {
      iframe = iframeElement;
      expect(fixture.doc.querySelectorAll('iframe')).to.have.length(1);
      ampAd = iframe.parentElement;
      expect(iframe.src).to.contain('categoryExclusion');
      expect(iframe.src).to.contain('health');
      expect(iframe.src).to.contain('tagForChildDirectedTreatment');
      expect(iframe.src).to.match(/http\:\/\/localhost:9876\/base\/dist\.3p\//);
    }).then(() => {
      return poll('frame to load', () => {
        return iframe.contentWindow && iframe.contentWindow.document &&
            iframe.contentWindow.document.getElementById('c');
      });
    }).then(unusedCanvas => {
      return poll('3p JS to load.', () => iframe.contentWindow.context);
    }).then(context => {
      expect(context.hidden).to.be.false;
      // In some browsers the referrer is empty. But in Chrome it works, so
      // we always check there.
      if (context.referrer !== '' ||
          (navigator.userAgent.match(/Chrome/) && !isEdge)) {
        expect(context.referrer).to.equal('http://localhost:' + location.port +
            '/context.html');
      }
      expect(context.pageViewId).to.be.greaterThan(0);
      expect(context.data.tagForChildDirectedTreatment).to.be.false;
      expect(context.data.categoryExclusion).to.be.equal('health');
      expect(context.data.targeting).to.be.jsonEqual(
          {sport: ['rugby', 'cricket']});
      return poll('main ad JS is injected', () => {
        return iframe.contentWindow.document.querySelector(
            'script[src="https://www.googletagservices.com/tag/js/gpt.js"]');
      });
    }).then(() => {
      return poll('render-start message received', () => {
        return fixture.messages.filter(message => {
          return message.type == 'render-start';
        }).length;
      });
    }).then(() => {
      expect(iframe.style.visibility).to.equal('');
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
    }).then(() => {
      expect(iframe.contentWindow.context.hidden).to.be.false;
      return new Promise(resolve => {
        iframe.contentWindow.addEventListener('amp:visibilitychange', resolve);
        fixture.win.AMP.viewer.visibilityState_ = 'hidden';
        fixture.win.AMP.viewer.onVisibilityChange_();
      });
    }).then(() => {
      expect(iframe.getAttribute('width')).to.equal('320');
      expect(iframe.getAttribute('height')).to.equal('50');
      if (isEdge) { // TODO(cramforce): Get this to pass in Edge
        return;
      }
      return poll('Creative id transmitted. Ad fully rendered.', () => {
        return ampAd.getAttribute('creative-id');
      }, null, 15000);
    }).then(creativeId => {
      if (isEdge) { // TODO(cramforce): Get this to pass in Edge
        return;
      }
      expect(creativeId).to.match(/^dfp-/);
    });
  });
});
