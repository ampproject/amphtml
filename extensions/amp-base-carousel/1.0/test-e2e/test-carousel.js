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

import {getCarousel, getScrollingElement, getSlide, getSlides} from './helpers';
import {useStyles} from '../base-carousel.jss';

const pageWidth = 800;
const pageHeight = 600;

/** Increase timeout for running on Travis macOS **/
const testTimeout = 30000;

describes.endtoend(
  'AMP carousel',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/1.0/basic.amp.html',
    experiments: ['amp-base-carousel-bento'],
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single', 'viewer-demo'],
  },
  async (env) => {
    /** The total number of slides in the carousel */
    const SLIDE_COUNT = 7;
    let controller;

    const styles = useStyles();

    function prop(el, name) {
      return controller.getElementProperty(el, name);
    }

    beforeEach(async function () {
      controller = env.controller;
      const carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);
    });

    it('should render correctly', async function () {
      this.timeout(testTimeout);
      const el = await getScrollingElement(styles, controller);

      // We should have space for all slides
      await expect(prop(el, 'scrollWidth')).to.equal(pageWidth * SLIDE_COUNT);
    });

    it('should snap when scrolling', async function () {
      this.timeout(testTimeout);
      const el = await getScrollingElement(styles, controller);
      const firstSlide = await getSlide(styles, controller, 0);

      const slideWidth = await prop(firstSlide, 'offsetWidth');
      const scrollLeft = await prop(el, 'scrollLeft');
      const snappedScrollLeft = scrollLeft + slideWidth;
      const requestedScrollLeft = snappedScrollLeft + 1;

      await controller.scrollTo(el, {left: requestedScrollLeft});
      // We should have snapped to the edge of the slide rather than the
      // requested scroll position.
      await expect(prop(el, 'scrollLeft')).to.equal(snappedScrollLeft);
    });

    it('should reset the window after scroll', async function () {
      this.timeout(testTimeout);
      const el = await getScrollingElement(styles, controller);
      const firstSlide = await getSlide(styles, controller, 0);

      const slideWidth = await prop(firstSlide, 'offsetWidth');
      const scrollWidth = await prop(el, 'scrollWidth');
      const scrollLeft = await prop(el, 'scrollLeft');
      const snappedScrollLeft = scrollLeft + slideWidth;
      const requestedScrollLeft = snappedScrollLeft + 1;

      await controller.scrollTo(el, {left: requestedScrollLeft});
      // Wait for the scrolling to settle
      await expect(prop(el, 'scrollLeft')).to.equal(snappedScrollLeft);
      // The new scroll width/left should eventually be the same as before,
      // since the windowing should have been reset around the new element.
      await expect(prop(el, 'scrollWidth')).to.equal(scrollWidth);
      await expect(prop(el, 'scrollLeft')).to.equal(scrollLeft);
    });

    describe('looping', function () {
      it('should show the last slide when looping', async function () {
        this.timeout(testTimeout);
        const el = await getScrollingElement(styles, controller);
        const lastSlide = await getSlide(styles, controller, SLIDE_COUNT - 1);

        // Scroll to the previous slide by moving left by the last slide's width.
        const slideWidth = await prop(lastSlide, 'offsetWidth');
        const restingScrollLeft = await prop(el, 'scrollLeft');
        const snappedScrollLeft = restingScrollLeft - slideWidth;
        const requestedScrollLeft = snappedScrollLeft - 1;
        await controller.scrollTo(el, {left: requestedScrollLeft});

        await expect(prop(el, 'scrollLeft')).to.equal(snappedScrollLeft);
      });

      it('should show the first slide when looping', async function () {
        this.timeout(testTimeout);
        const el = await getScrollingElement(styles, controller);
        const lastSlide = await getSlide(styles, controller, SLIDE_COUNT - 1);

        // Go to the last slide, wait for scrolling to move and window to reset.
        const slideWidth = await prop(lastSlide, 'offsetWidth');
        const restingScrollLeft = await prop(el, 'scrollLeft');
        const lastSlideScrollPos = restingScrollLeft - slideWidth;
        await controller.scrollTo(el, {left: lastSlideScrollPos});
        await expect(prop(el, 'scrollLeft')).to.equal(lastSlideScrollPos);
        await expect(prop(el, 'scrollLeft')).to.equal(restingScrollLeft);

        // Go to the next slide by moving the slides width to the right.
        const snappedScrollLeft = restingScrollLeft + slideWidth;
        const requestedScrollLeft = snappedScrollLeft + 1;
        await controller.scrollTo(el, {left: requestedScrollLeft});

        await expect(prop(el, 'scrollLeft')).to.equal(snappedScrollLeft);
      });

      // Make sure we can move all the way forwards to the last slide and that it
      // is in the right place.
      it('should display slides correctly when moving forwards', async function () {
        this.timeout(testTimeout);
        const el = await getScrollingElement(styles, controller);
        const slides = await getSlides(styles, controller);
        const lastSlide = slides[SLIDE_COUNT - 1];

        // Go to the last slide, wait for scrolling to move.
        const slideWidth = await prop(lastSlide, 'offsetWidth');
        const restingScrollLeft = await prop(el, 'scrollLeft');
        await controller.scrollTo(el, {
          left: slideWidth * SLIDE_COUNT,
        });

        await expect(prop(el, 'scrollLeft')).to.equal(restingScrollLeft);
        await expect(controller.getElementRect(lastSlide)).to.include({
          x: 0,
          width: slideWidth,
        });
      });

      // Make sure we can move all the way backwards and rerender
      it('should display slides correctly when moving backwards', async function () {
        this.timeout(testTimeout);
        const el = await getScrollingElement(styles, controller);
        const secondSlide = await getSlide(styles, controller, 1);

        // Go to the last rendered slide, wait for scrolling to move.
        const slideWidth = await prop(secondSlide, 'offsetWidth');
        const restingScrollLeft = await prop(el, 'scrollLeft');
        await controller.scrollTo(el, {
          left: -(slideWidth * Math.floor(SLIDE_COUNT / 2)),
        });

        // Rerender with last slide in the centered scroll position.
        await expect(prop(el, 'scrollLeft')).to.not.equal(restingScrollLeft);
        await expect(prop(el, 'scrollLeft')).to.equal(restingScrollLeft);
      });
    });
  }
);
