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

import {getCarousel, getNextArrow, getPrevArrow, getSlides} from './helpers';
import {useStyles} from '../base-carousel.jss';
import sleep from 'sleep-promise';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'AMP carousel advancing with multiple visible',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/1.0/multi-visible-single-advance.amp.html',
    experiments: ['amp-base-carousel-bento'],
    environments: ['single'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  async function (env) {
    const styles = useStyles();
    let controller;
    let prevArrow;
    let nextArrow;

    function css(handle, name) {
      return controller.getElementCssValue(handle, name);
    }

    function rect(el) {
      return controller.getElementRect(el);
    }

    beforeEach(async () => {
      controller = env.controller;
      const carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);

      prevArrow = await getPrevArrow(styles, controller);
      nextArrow = await getNextArrow(styles, controller);
    });

    it('should not go forward past end and it should be able to go back correctly', async () => {
      const slideCount = 7;
      const slidesInView = 3;
      const slides = await getSlides(styles, controller);

      // Click `next` as much as possible.
      for (let i = 0; i < slideCount - slidesInView; i++) {
        await controller.click(nextArrow);
        // Need to sleep due to amp-base-carousel buffering clicks
        await sleep(1000);
      }

      // Check that last 3 slides are in view
      const lastSlide = await rect(slides[slideCount - slidesInView]);
      await expect(lastSlide['x']).to.equal(0);

      // Check that arrows are correctly enabled/disabled
      await expect(css(nextArrow, 'opacity')).to.equal('0');
      await expect(css(prevArrow, 'opacity')).to.equal('1');

      // Click `prev` the correct number of times to take us back to first slide.
      for (let i = 0; i < slideCount - slidesInView; i++) {
        await controller.click(prevArrow);
        await sleep(1000);
      }

      // Check that last 3 slides are in view
      const firstSlide = await rect(slides[0]);
      await expect(firstSlide['x']).to.equal(0);

      // Check that arrows are correctly enabled/disabled
      await expect(css(nextArrow, 'opacity')).to.equal('1');
      await expect(css(prevArrow, 'opacity')).to.equal('0');
    });
  }
);
