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

import {
  createFixtureIframe,
  pollForLayout,
  poll,
} from '../../testing/iframe';
import {AmpEvents} from '../../src/amp-events';

describe.configure().retryOnSaucelabs().run('Rendering of one ad', () => {
  let fixture;
  let beforeHref;

  function replaceUrl(win) {
    const path = '/test/fixtures/doubleclick.html?google_glade=0';
    // We pass down the parent URL. So we change that, which we
    // can. We just need to change it back after the test.
    beforeHref = win.parent.location.href;
    win.parent.history.replaceState(null, null, path);
  }

  beforeEach(() => {
    return createFixtureIframe('test/fixtures/doubleclick.html', 3000, win => {
      replaceUrl(win);
    }).then(f => {
      fixture = f;
    });
  });

  afterEach(() => {
    if (beforeHref) {
      fixture.win.parent.history.replaceState(null, null, beforeHref);
    }
  });

  // TODO(lannka, #3561): unmute the test.
  // it.configure().skipEdge().run('should create an iframe loaded', function() {
  it.skip('should create an iframe loaded', function() {
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
      expect(iframe.src).to.contain('categoryExclusions');
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
        expect(context.referrer).to.contain('http://localhost:' + location.port);
      }
      expect(context.pageViewId).to.be.greaterThan(0);
      expect(context.initialLayoutRect).to.be.defined;
      expect(context.initialLayoutRect.top).to.be.defined;
      expect(context.initialIntersection).to.be.defined;
      expect(context.initialIntersection.rootBounds).to.be.defined;
      expect(context.data.tagForChildDirectedTreatment).to.equal(0);
      expect(context.data.categoryExclusions).to.be.jsonEqual(['health']);
      expect(context.data.targeting).to.be.jsonEqual(
          {'amptest': 'true'});
      return poll('main ad JS is injected', () => {
        return iframe.contentWindow.document.querySelector(
            'script[src="https://www.googletagservices.com/tag/js/gpt.js"]');
      }, undefined,  /* timeout */ 5000);
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
          'https://www.example.com/doubleclick.html');
      const slot = canvas.slot;
      expect(slot).to.not.be.null;
      expect(slot.getCategoryExclusions()).to.jsonEqual(['health']);
      expect(slot.getTargeting('amptest')).to.jsonEqual(['true']);
      return poll(
          'ad iframe to be initialized. Means that an actual ad was loaded.',
          () => {
            return canvas.querySelector(
                '[id="google_ads_iframe_/35096353/amptesting/kv_0"]');
          }, null, 5000);
    }).then(() => {
      expect(iframe.contentWindow.context.hidden).to.be.false;
      return new Promise(resolve => {
        iframe.contentWindow.addEventListener(
            AmpEvents.VISIBILITY_CHANGE, resolve);
        fixture.win.AMP.viewer.receiveMessage('visibilitychange', {
          state: 'hidden',
        });
        fixture.win.AMP.viewer.receiveMessage('visibilitychange', {
          state: 'visible',
        });
      });
    }).then(() => {
      expect(iframe.getAttribute('width')).to.equal('300');
      expect(iframe.getAttribute('height')).to.equal('250');
      if (isEdge) { // TODO(cramforce): Get this to pass in Edge
        return;
      }
      return poll('Creative id transmitted. Ad fully rendered.', () => {
        return ampAd.creativeId;
      }, null, 15000);
    }).then(creativeId => {
      if (isEdge) { // TODO(cramforce): Get this to pass in Edge
        return;
      }
      expect(creativeId).to.match(/^dfp-/);
    });
  });
});
