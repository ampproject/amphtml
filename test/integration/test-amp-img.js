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
  expectBodyToBecomeVisible,
} from '../../testing/iframe.js';
import {AmpEvents} from '../../src/amp-events';

describe.configure().retryOnSaucelabs().run('Rendering of amp-img', function() {
  this.timeout(5000);

  let fixture;
  beforeEach(() => {
    return createFixtureIframe('test/fixtures/images.html', 500).then(f => {
      fixture = f;
    });
  });

  it('should show the body in image test', () => {
    return expectBodyToBecomeVisible(fixture.win);
  });

  it('should be present', () => {
    expect(fixture.doc.querySelectorAll('amp-img')).to.have.length(15);
    // 5 image visible in 500 pixel height.
    return fixture.awaitEvent(AmpEvents.LOAD.START, 3).then(function() {
      expect(fixture.doc.querySelectorAll('amp-img img[src]')).to
          .have.length(3);
    });
  });

  it('should resize and load more elements', () => {
    const p = fixture.awaitEvent(AmpEvents.LOAD.START, 11).then(function() {
      expect(fixture.doc.querySelectorAll('amp-img img[src]'))
          .to.have.length(11);
      fixture.iframe.height = 2000;
      fixture.win.dispatchEvent(new fixture.win.Event('resize'));
      return fixture.awaitEvent(AmpEvents.LOAD.START, 13).then(function() {
        expect(fixture.doc.querySelectorAll('amp-img img[src]'))
            .to.have.length(13);
      });
    });
    fixture.iframe.height = 1500;
    fixture.win.dispatchEvent(new fixture.win.Event('resize'));
    return p;
  });

  it('should respect media queries', () => {
    return fixture.awaitEvent(AmpEvents.LOAD.START, 3).then(function() {
      const smallScreen = fixture.doc.getElementById('img3');
      const largeScreen = fixture.doc.getElementById('img3_1');
      expect(smallScreen.className)
          .to.not.match(/i-amphtml-hidden-by-media-query/);
      expect(largeScreen.className).to.match(/i-amphtml-hidden-by-media-query/);
      expect(smallScreen.offsetHeight).to.not.equal(0);
      expect(largeScreen.offsetHeight).to.equal(0);
      fixture.iframe.width = 600;
      fixture.win.dispatchEvent(new fixture.win.Event('resize'));
      return fixture.awaitEvent(AmpEvents.LOAD.START, 4).then(function() {
        expect(smallScreen.className)
            .to.match(/i-amphtml-hidden-by-media-query/);
        expect(largeScreen.className)
            .to.not.match(/i-amphtml-hidden-by-media-query/);
        expect(smallScreen.offsetHeight).to.equal(0);
        expect(largeScreen.offsetHeight).to.not.equal(0);
      });
    });
  });
});
