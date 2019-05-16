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

import {getScrollingElement, getSlide, waitForCarouselImg} from './helpers';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'Vertical AMP carousel',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/' +
      'vertical.amp.html',
    experiments: ['amp-base-carousel', 'layers'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  async env => {
    /** The total number of slides in the carousel */
    const SLIDE_COUNT = 7;
    let controller;

    function prop(el, name) {
      return controller.getElementProperty(el, name);
    }

    function rect(el) {
      return controller.getElementRect(el);
    }

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should render correctly', async () => {
      // We should have space for SLIDE_COUNT - 1 on either side + 1 for the
      // current slide.
      // TODO(sparhami) Chrome has the wrong value here for scrollHeight?
      // const el = await getScrollingElement(controller);
      // await expect(prop(el, 'scrollHeight'))
      //     .to.equal(carouselHeight * (2 * (SLIDE_COUNT - 1) + 1));
      await waitForCarouselImg(controller, 0);
      await controller.takeScreenshot('screenshots/vertical/render.png');
    });

    // TODO(sparhami): unskip
    it.skip('should layout the two adjacent slides', async () => {
      // TODO(sparhami) Verify this is on the right of the 0th slide
      await waitForCarouselImg(controller, 1);
      // TODO(sparhami) Verify this is on the left of the 0th slide
      await waitForCarouselImg(controller, SLIDE_COUNT - 1);
    });

    // TODO(sparhami): unskip
    it.skip('should snap when scrolling', async () => {
      const el = await getScrollingElement(controller);
      const firstSlide = await getSlide(controller, 0);

      // Wait for the first two slides's imgs to load.
      await waitForCarouselImg(controller, 0);
      await waitForCarouselImg(controller, 1);

      const {y: carouselTop} = await rect(el);
      const slideHeight = await prop(firstSlide, 'offsetHeight');
      const scrollTop = await prop(el, 'scrollTop');
      const snappedScrollTop = scrollTop + slideHeight;
      const requestedScrollTop = snappedScrollTop + 1;

      await controller.scroll(el, {top: requestedScrollTop});
      // We should have snapped to the edge of the slide rather than the
      // requested scroll position.
      await expect(rect(firstSlide)).to.include({y: carouselTop - slideHeight});
      await controller.takeScreenshot('screenshots/vertical/snapped.png');
    });

    describe('looping', () => {
      // When resting the last few slides should be translated to the top.
      // Make sure we can move all the way forwards to the last slide and that it
      // is in the right place.
      // TODO(sparhami): unskip
      it.skip('should display slides correctly when moving forwards', async () => {
        const el = await getScrollingElement(controller);
        const lastSlide = await getSlide(controller, SLIDE_COUNT - 1);

        // Wait for the first and last slides to load.
        await waitForCarouselImg(controller, 0);
        await waitForCarouselImg(controller, SLIDE_COUNT - 1);

        // Go to the last slide, wait for scrolling to move.
        const {y: carouselTop} = await rect(el);
        const slideHeight = await prop(lastSlide, 'offsetHeight');
        const restingScrollTop = await prop(el, 'scrollTop');
        await controller.scrollBy(el, {
          top: slideHeight * (SLIDE_COUNT - 1),
        });

        await expect(prop(el, 'scrollLeft')).to.not.equal(restingScrollTop);
        await expect(prop(el, 'scrollTop')).to.equal(restingScrollTop);
        await expect(controller.getElementRect(lastSlide)).to.include({
          y: carouselTop,
          height: slideHeight,
        });
        await controller.takeScreenshot(
          'screenshots/vertical/loop-move-forwards-to-end.png'
        );
      });

      // When resting the first few slides should be translated to the bottom.
      // Make sure we can move all the way backwards to the second slide and that
      // it is in the right place.
      // TODO(sparhami): unskip
      it.skip(
        'should display slides correctly when ' + 'moving backwards',
        async () => {
          const el = await getScrollingElement(controller);
          const secondSlide = await getSlide(controller, 1);

          // Wait for the first and second slides to load.
          await waitForCarouselImg(controller, 0);
          await waitForCarouselImg(controller, 1);

          // Go to the last slide, wait for scrolling to move.
          const {y: carouselTop} = await rect(el);
          const slideHeight = await prop(secondSlide, 'offsetHeight');
          const restingScrollTop = await prop(el, 'scrollTop');
          await controller.scrollBy(el, {
            top: -(slideHeight * (SLIDE_COUNT - 1)),
          });

          await expect(prop(el, 'scrollTop')).to.not.equal(restingScrollTop);
          await expect(prop(el, 'scrollTop')).to.equal(restingScrollTop);
          await expect(controller.getElementRect(secondSlide)).to.include({
            y: carouselTop,
            height: slideHeight,
          });
          await controller.takeScreenshot(
            'screenshots/vertical/loop-move-backwards-to-second.png'
          );
        }
      );
    });
  }
);
