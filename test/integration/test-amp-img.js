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
import {createCustomEvent} from '../../src/event-helper';
import {
  createFixtureIframe,
  expectBodyToBecomeVisible,
  poll,
} from '../../testing/iframe.js';

describe
  .configure()
  .enableIe()
  .run('Rendering of amp-img', () => {
    const timeout = window.ampTestRuntimeConfig.mochaTimeout;

    let fixture;
    beforeEach(async () => {
      fixture = await createFixtureIframe('test/fixtures/images.html', 500);
    });

<<<<<<< HEAD
    it('should show the body in image test', async () => {
      await expectBodyToBecomeVisible(fixture.win, timeout);
=======
    it.only('should show the body in image test', () => {
      return expectBodyToBecomeVisible(fixture.win, timeout);
>>>>>>> 3911d0c00 (temp)
    });

    it('should be present', async () => {
      expect(fixture.doc.querySelectorAll('amp-img')).to.have.length(16);
      // 5 image visible in 500 pixel height. Note that there will be no load
      // event for the inabox image.
      await fixture.awaitEvent(AmpEvents.LOAD_START, 3);
      expect(fixture.doc.querySelectorAll('amp-img img[src]')).to.have.length(
        4
      );
    });

    it('should resize and load more elements', async () => {
      // Note that there will be no load event for the inabox image.
      fixture.iframe.height = 1500;
      fixture.win.dispatchEvent(createCustomEvent(fixture.win, 'resize', null));
      await fixture.awaitEvent(AmpEvents.LOAD_START, 11);
      expect(fixture.doc.querySelectorAll('amp-img img[src]')).to.have.length(
        12
      );

      fixture.iframe.height = 2000;
      fixture.win.dispatchEvent(createCustomEvent(fixture.win, 'resize', null));
      await fixture.awaitEvent(AmpEvents.LOAD_START, 13);
      expect(fixture.doc.querySelectorAll('amp-img img[src]')).to.have.length(
        14
      );
    });

    it('should respect media queries', async () => {
      await fixture.awaitEvent(AmpEvents.LOAD_START, 3);
      await new Promise((res) => setTimeout(res, 1));

      const smallScreen = fixture.doc.getElementById('img3');
      const largeScreen = fixture.doc.getElementById('img3_1');

      expect(smallScreen.className).to.not.match(
        /i-amphtml-hidden-by-media-query/
      );
      expect(largeScreen.className).to.match(/i-amphtml-hidden-by-media-query/);
      expect(smallScreen.offsetHeight).to.not.equal(0);
      expect(largeScreen.offsetHeight).to.equal(0);

      fixture.iframe.width = 600;
      fixture.win.dispatchEvent(createCustomEvent(fixture.win, 'resize', null));

      await fixture.awaitEvent(AmpEvents.LOAD_START, 4);
      await fixture.awaitEvent(AmpEvents.UNLOAD, 1);

      expect(smallScreen.className).to.match(/i-amphtml-hidden-by-media-query/);
      expect(largeScreen.className).to.not.match(
        /i-amphtml-hidden-by-media-query/
      );
      expect(smallScreen.offsetHeight).to.equal(0);
      expect(largeScreen.offsetHeight).to.not.equal(0);
    });

    it('should not load image if already present (inabox)', async () => {
      await fixture.awaitEvent(AmpEvents.LOAD_START, 3);

      const ampImage = fixture.doc.getElementById('img8');
      expect(ampImage).is.ok;
      expect(ampImage.querySelectorAll('img').length).to.equal(1);
    });
  });

// Move IE tests into its own `describe()`
// so that we can load a different fixture.
describe
  .configure()
  .enableIe()
  .run('Rendering of amp-img', () => {
    let fixture;
    beforeEach(async () => {
      fixture = await createFixtureIframe('test/fixtures/images-ie.html', 500);
    });

    // IE doesn't support the srcset attribute, so if the developer
    // provides a srcset but no src to amp-img, it should set the src
    // attribute to the first entry in srcset.
    describe
      .configure()
      .ifIe()
      .run('srcset support - Internet Explorer edge cases', () => {
        it('should guarantee src if srcset is not supported', async () => {
          await waitForImageToLoad(fixture.doc, 'img[amp-img-id="srcset"]');

          const img = fixture.doc.querySelector(
            '#srcset img[amp-img-id="srcset"]'
          );
          expect(img.getAttribute('src')).to.equal('/examples/img/hero@1x.jpg');
        });
      });

    // IE can't scale SVG images, so intrinsic sizers use a PNG instead.
    describe
      .configure()
      .enableIe()
      .run('intrinsic layout', () => {
        it('renders intrinsic layout with correct size', async () => {
          await waitForImageToLoad(fixture.doc, 'img[amp-img-id="intrinsic"]');

          const ampImg = fixture.doc.getElementById('intrinsic');
          const width = parseInt(ampImg.getAttribute('width'), 10);
          const height = parseInt(ampImg.getAttribute('height'), 10);
          const bounds = ampImg.getBoundingClientRect();

          expect(bounds.width / bounds.height).to.be.closeTo(
            width / height,
            0.001
          );
        });
      });
  });

function waitForImageToLoad(document, selector) {
  return poll(
    'wait for img to load',
    () => {
      const img = document.querySelector(selector);
      return img !== null;
    },
    () => {},
    8000
  );
}
