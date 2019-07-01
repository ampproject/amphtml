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

import {AmpEvents} from '../../src/amp-events';
import {
  createFixtureIframe,
  expectBodyToBecomeVisible,
  poll,
} from '../../testing/iframe.js';

describe
  .configure()
  .retryOnSaucelabs()
  .run('Rendering of amp-img', () => {
    const timeout = window.ampTestRuntimeConfig.mochaTimeout;

    let fixture;
    beforeEach(() => {
      return createFixtureIframe('test/fixtures/images.html', 500).then(f => {
        fixture = f;
      });
    });

    it('should show the body in image test', () => {
      return expectBodyToBecomeVisible(fixture.win, timeout);
    });

    it('should be present', () => {
      expect(fixture.doc.querySelectorAll('amp-img')).to.have.length(16);
      // 5 image visible in 500 pixel height. Note that there will be no load
      // event for the inabox image.
      return fixture.awaitEvent(AmpEvents.LOAD_START, 3).then(function() {
        expect(fixture.doc.querySelectorAll('amp-img img[src]')).to.have.length(
          4
        );
      });
    });

    it('should resize and load more elements', () => {
      // Note that there will be no load event for the inabox image.
      const p = fixture.awaitEvent(AmpEvents.LOAD_START, 11).then(function() {
        expect(fixture.doc.querySelectorAll('amp-img img[src]')).to.have.length(
          12
        );
        fixture.iframe.height = 2000;
        fixture.win.dispatchEvent(new fixture.win.Event('resize'));
        return fixture.awaitEvent(AmpEvents.LOAD_START, 13).then(function() {
          expect(
            fixture.doc.querySelectorAll('amp-img img[src]')
          ).to.have.length(14);
        });
      });
      fixture.iframe.height = 1500;
      fixture.win.dispatchEvent(new fixture.win.Event('resize'));
      return p;
    });

    it('should respect media queries', () => {
      return fixture
        .awaitEvent(AmpEvents.LOAD_START, 3)
        .then(() => {
          return new Promise(res => setTimeout(res, 1));
        })
        .then(function() {
          const smallScreen = fixture.doc.getElementById('img3');
          const largeScreen = fixture.doc.getElementById('img3_1');
          expect(smallScreen.className).to.not.match(
            /i-amphtml-hidden-by-media-query/
          );
          expect(largeScreen.className).to.match(
            /i-amphtml-hidden-by-media-query/
          );
          expect(smallScreen.offsetHeight).to.not.equal(0);
          expect(largeScreen.offsetHeight).to.equal(0);
          fixture.iframe.width = 600;
          fixture.win.dispatchEvent(new fixture.win.Event('resize'));
          return fixture.awaitEvent(AmpEvents.LOAD_START, 4).then(function() {
            expect(smallScreen.className).to.match(
              /i-amphtml-hidden-by-media-query/
            );
            expect(largeScreen.className).to.not.match(
              /i-amphtml-hidden-by-media-query/
            );
            expect(smallScreen.offsetHeight).to.equal(0);
            expect(largeScreen.offsetHeight).to.not.equal(0);
          });
        });
    });

    it('should not load image if already present (inabox)', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_START, 3).then(function() {
        const ampImage = fixture.doc.getElementById('img8');
        expect(ampImage).is.ok;
        expect(ampImage.querySelectorAll('img').length).to.equal(1);
      });
    });
  });

// Move IE tests into its own `describe()`
// so that Mocha picks up its 'ifIe()' configuration
describe
  .configure()
  .ifIe()
  .run('Rendering of amp-img - Internet Explorer edge cases', () => {
    let fixture;
    beforeEach(() => {
      return createFixtureIframe('test/fixtures/images-ie.html', 500).then(
        f => {
          fixture = f;
        }
      );
    });

    // IE doesn't support the srcset attribute, so if the developer
    // provides a srcset but no src to amp-img, it should set the src
    // attribute to the first entry in srcset.
    it('should guarantee src if srcset is not supported', () => {
      const imageLoadedPromise = waitForImageToLoad(fixture.doc);
      return imageLoadedPromise.then(() => {
        const ampImg = fixture.doc.getElementById('img4');
        const img = ampImg.querySelector('img[amp-img-id="img4"]');
        expect(img.getAttribute('src')).to.equal('/examples/img/hero@1x.jpg');
      });
    });
  });

function waitForImageToLoad(document) {
  return poll(
    'wait for img4 to load',
    () => {
      const img = document.querySelector('img[amp-img-id="img4"]');
      return img !== null;
    },
    () => {},
    8000
  );
}
