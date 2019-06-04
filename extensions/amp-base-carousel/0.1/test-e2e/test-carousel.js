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
  'AMP carousel',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/basic.amp.html',
    experiments: ['amp-base-carousel', 'layers'],
    initialRect: {width: pageWidth, height: pageHeight},
    //TODO(spaharmi): fails on shadow demo
    environments: ['single', 'viewer-demo'],
  },
  async env => {
    /** The total number of slides in the carousel */
    const SLIDE_COUNT = 7;
    let controller;

    function prop(el, name) {
      return controller.getElementProperty(el, name);
    }

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should render correctly', async () => {
      const el = await getScrollingElement(controller);

      // We should have space for SLIDE_COUNT - 1 on either side + 1 for the
      // current slide.
      await expect(prop(el, 'scrollWidth')).to.equal(
        pageWidth * (2 * (SLIDE_COUNT - 1) + 1)
      );
      await waitForCarouselImg(controller, 0);
    });

    it('should layout the two adjacent slides', async () => {
      // TODO(sparhami) Verify this is on the right of the 0th slide
      await waitForCarouselImg(controller, 1);
      // TODO(sparhami) Verify this is on the left of the 0th slide
      await waitForCarouselImg(controller, SLIDE_COUNT - 1);
    });

    it('should snap when scrolling', async () => {
      const el = await getScrollingElement(controller);
      const firstSlide = await getSlide(controller, 0);

      // Wait for the first two slides's imgs to load.
      await waitForCarouselImg(controller, 0);
      await waitForCarouselImg(controller, 1);

      const slideWidth = await prop(firstSlide, 'offsetWidth');
      const scrollLeft = await prop(el, 'scrollLeft');
      const snappedScrollLeft = scrollLeft + slideWidth;
      const requestedScrollLeft = snappedScrollLeft + 1;

      await controller.scroll(el, {left: requestedScrollLeft});
      // We should have snapped to the edge of the slide rather than the
      // requested scroll position.
      await expect(prop(el, 'scrollLeft')).to.equal(snappedScrollLeft);
    });

    it('should reset the window after scroll', async () => {
      const el = await getScrollingElement(controller);
      const firstSlide = await getSlide(controller, 0);

      // Wait for the first two slides's imgs to load.
      await waitForCarouselImg(controller, 0);
      await waitForCarouselImg(controller, 1);

      const slideWidth = await prop(firstSlide, 'offsetWidth');
      const scrollWidth = await prop(el, 'scrollWidth');
      const scrollLeft = await prop(el, 'scrollLeft');
      const snappedScrollLeft = scrollLeft + slideWidth;
      const requestedScrollLeft = snappedScrollLeft + 1;

      await controller.scroll(el, {left: requestedScrollLeft});
      // Wait for the scrolling to settle
      await expect(prop(el, 'scrollLeft')).to.equal(snappedScrollLeft);
      // The new scroll width/left should eventually be the same as before,
      // since the windowing should have been reset around the new element.
      await expect(prop(el, 'scrollWidth')).to.equal(scrollWidth);
      await expect(prop(el, 'scrollLeft')).to.equal(scrollLeft);
    });

    it('should have the correct scroll position when resizing', async () => {
      // Note: 513 seems to be the smallest settable width.
      await controller.setWindowRect({
        width: 800,
        height: 600,
      });

      const firstSlide = await getSlide(controller, 0);

      // Wait for the first two slides's imgs to load.
      await waitForCarouselImg(controller, 0);
      await waitForCarouselImg(controller, 1);
      await expect(controller.getElementRect(firstSlide)).to.include({
        'x': 0,
        'width': 800,
      });

      await controller.setWindowRect({
        width: 900,
        height: 600,
      });

      // Normally, resizing would cause the position to change. We're testing
      // that the carousel moves this to the correct position again.
      await expect(controller.getElementRect(firstSlide)).to.include({
        'x': 0,
        'width': 900,
      });
    });

    describe('looping', () => {
      it('should show the last slide when looping', async () => {
        const el = await getScrollingElement(controller);
        const lastSlide = await getSlide(controller, SLIDE_COUNT - 1);

        // Wait for the first and last slides to load.
        await waitForCarouselImg(controller, 0);
        await waitForCarouselImg(controller, SLIDE_COUNT - 1);

        // Scroll to the previous slide by moving left by the last slide's width.
        const slideWidth = await prop(lastSlide, 'offsetWidth');
        const restingScrollLeft = await prop(el, 'scrollLeft');
        const snappedScrollLeft = restingScrollLeft - slideWidth;
        const requestedScrollLeft = snappedScrollLeft - 1;
        await controller.scroll(el, {left: requestedScrollLeft});

        await expect(prop(el, 'scrollLeft')).to.equal(snappedScrollLeft);
      });

      it('should show the first slide when looping', async () => {
        const el = await getScrollingElement(controller);
        const lastSlide = await getSlide(controller, SLIDE_COUNT - 1);

        // Wait for the first and last slides to load.
        await waitForCarouselImg(controller, 0);
        await waitForCarouselImg(controller, SLIDE_COUNT - 1);

        // Go to the last slide, wait for scrolling to move and window to reset.
        const slideWidth = await prop(lastSlide, 'offsetWidth');
        const restingScrollLeft = await prop(el, 'scrollLeft');
        const lastSlideScrollPos = restingScrollLeft - slideWidth;
        await controller.scroll(el, {left: lastSlideScrollPos});
        await expect(prop(el, 'scrollLeft')).to.equal(lastSlideScrollPos);
        await expect(prop(el, 'scrollLeft')).to.equal(restingScrollLeft);

        // Go to the next slide by moving the slides width to the right.
        const snappedScrollLeft = restingScrollLeft + slideWidth;
        const requestedScrollLeft = snappedScrollLeft + 1;
        await controller.scroll(el, {left: requestedScrollLeft});

        await expect(prop(el, 'scrollLeft')).to.equal(snappedScrollLeft);
      });

      // When resting the last few slides should be translated to the left.
      // Make sure we can move all the way forwards to the last slide and that it
      // is in the right place.
      it('should display slides correctly when moving forwards', async () => {
        const el = await getScrollingElement(controller);
        const lastSlide = await getSlide(controller, SLIDE_COUNT - 1);

        // Wait for the first and last slides to load.
        await waitForCarouselImg(controller, 0);
        await waitForCarouselImg(controller, SLIDE_COUNT - 1);

        // Go to the last slide, wait for scrolling to move.
        const slideWidth = await prop(lastSlide, 'offsetWidth');
        const restingScrollLeft = await prop(el, 'scrollLeft');
        await controller.scrollTo(el, {
          left: slideWidth * (SLIDE_COUNT - 2),
        });

        await expect(prop(el, 'scrollLeft')).to.equal(restingScrollLeft);
        await expect(controller.getElementRect(lastSlide)).to.include({
          x: 0,
          width: slideWidth,
        });
      });

      // When resting the first few slides should be translated to the right.
      // Make sure we can move all the way backwards to the second slide and that
      // it is in the right place.
      it('should display slides correctly when moving backwards', async () => {
        const el = await getScrollingElement(controller);
        const secondSlide = await getSlide(controller, 1);

        // Wait for the first and second slides to load.
        await waitForCarouselImg(controller, 0);
        await waitForCarouselImg(controller, 1);

        // Go to the last slide, wait for scrolling to move.
        const slideWidth = await prop(secondSlide, 'offsetWidth');
        const restingScrollLeft = await prop(el, 'scrollLeft');
        await controller.scrollTo(el, {
          left: -(slideWidth * (SLIDE_COUNT - 2)),
        });

        await expect(prop(el, 'scrollLeft')).to.not.equal(restingScrollLeft);
        await expect(prop(el, 'scrollLeft')).to.equal(restingScrollLeft);
        await expect(controller.getElementRect(secondSlide)).to.include({
          x: 0,
          width: slideWidth,
        });
      });
    });
  }
);
