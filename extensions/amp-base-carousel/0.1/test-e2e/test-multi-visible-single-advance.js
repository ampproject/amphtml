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

import {getNextArrow, getPrevArrow, getSlides, sleep} from './helpers';

describes.endtoend(
  'AMP carousel advancing with multiple visible',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/multi-visible-single-advance.amp.html',
    environments: ['single'],
  },
  async function (env) {
    let controller;
    let prevArrow;
    let nextArrow;

    function rect(el) {
      return controller.getElementRect(el);
    }

    beforeEach(async () => {
      controller = env.controller;
      nextArrow = await getNextArrow(controller);
      prevArrow = await getPrevArrow(controller);
    });

    it('should not go forward past end and it should be able to go back correctly', async () => {
      const slideCount = 7;
      const slidesInView = 3;
      const slides = await getSlides(controller);

      // Click `next` to get to the end
      for (let i = 0; i < slideCount - slidesInView; i++) {
        await controller.click(nextArrow);
        // Need to sleep due to amp-base-carousel buffering clicks
        await sleep(1000);
      }

      let slideRect = await rect(slides[slideCount - slidesInView]);
      // Check that last 3 slides are in view
      // Less than 5 for flakiness that comes from `controller.getElementRect()`
      await expect(slideRect['x']).to.be.lessThan(5);

      // Check that arrows are correctly enabled/disabled
      await expect(controller.getElementProperty(nextArrow, 'disabled')).to.be
        .true;
      await expect(controller.getElementProperty(prevArrow, 'disabled')).to.be
        .false;

      // Click `prev` the correct number of times to take us back to first slide.
      for (let i = 0; i < slideCount - slidesInView; i++) {
        await controller.click(prevArrow);
        await sleep(1000);
      }

      slideRect = await rect(slides[0]);
      // Check that last 3 slides are in view
      // Less than 5 for flakiness that comes from `controller.getElementRect()`
      await expect(slideRect['x']).to.be.lessThan(5);

      // Check that arrows are correctly enabled/disabled
      await expect(controller.getElementProperty(nextArrow, 'disabled')).to.be
        .false;
      await expect(controller.getElementProperty(prevArrow, 'disabled')).to.be
        .true;
    });
  }
);
