/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import ctrlHelpers from './helpers';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'amp-base-carousel:1.0 - non-looping',
  {
<<<<<<< HEAD:extensions/amp-base-carousel/1.0/test-e2e/test-non-looping.js
    fixture: 'amp-base-carousel/1.0/non-looping.amp.html',
    experiments: ['bento-carousel'],
    environments: ['single', 'viewer-demo'],
=======
    fixture: 'amp-base-carousel/non-looping.amp.html',
>>>>>>> 97be090e6 (Unify test-non-looping):extensions/amp-base-carousel/test-e2e/test-non-looping.js
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single', 'viewer-demo'],
    versions: {
      '0.1': {
        experiments: ['amp-base-carousel', 'layers'],
      },
      '1.0': {
        experiments: ['bento-carousel'],
      },
    },
  },
  async (env) => {
    /** The total number of slides in the carousel */
    const SLIDE_COUNT = 4;
    let ctrl;

    beforeEach(() => {
      ctrl = ctrlHelpers(env);
      ctrl.maybeSwitchToShadow();
    });

    it('should render correctly', async () => {
      const el = await ctrl.getScrollingElement();
      await expect(ctrl.prop(el, 'scrollWidth')).to.equal(
        pageWidth * SLIDE_COUNT
      );
      await ctrl.expectSlideImgLoaded(0);
    });

    it('should snap when scrolling', async () => {
      const el = await ctrl.getScrollingElement();
      const firstSlide = await ctrl.getSlide(0);

      // Ensure the first two slides' imgs loaded
      await ctrl.expectSlideImgLoaded(0);
      await ctrl.expectSlideImgLoaded(1);

      const slideWidth = await ctrl.prop(firstSlide, 'offsetWidth');
      const scrollLeft = await ctrl.prop(el, 'scrollLeft');
      const snappedScrollLeft = scrollLeft + slideWidth;
      const requestedScrollLeft = snappedScrollLeft + 1;

      await ctrl.scrollTo(el, {left: requestedScrollLeft});
      // We should have snapped to the edge of the slide rather than the
      // requested scroll position.
      await expect(ctrl.prop(el, 'scrollLeft')).to.equal(snappedScrollLeft);
    });

    it('should have the correct scroll position when resizing', async () => {
      // Note: 513 seems to be the smallest settable width.
      await ctrl.setWin(800, 600);
      const firstSlide = await ctrl.getSlide(0);

      // Ensure the first two slides' imgs loaded
      await ctrl.expectSlideImgLoaded(0);
      await ctrl.expectSlideImgLoaded(1);

      await expect(ctrl.rect(firstSlide)).to.include({
        'x': 0,
        'width': 800,
      });

      await ctrl.setWin(900, 600);
      // Normally, resizing would cause the position to change. We're testing
      // that the carousel moves this to the correct position again.
      await expect(ctrl.rect(firstSlide)).to.include({
        'x': 0,
        'width': 900,
      });
    });
  }
);
