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

import {
  getCarousel,
  getNextArrowSlot,
  getPrevArrowSlot,
  getSlide,
} from './helpers';
import {useStyles} from '../base-carousel.jss';

/** The total number of slides in the carousel */
const SLIDE_COUNT = 7;

describes.endtoend(
  'AMP carousel arrows with custom arrows',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/1.0/custom-arrows.amp.html',
    experiments: ['bento-carousel'],
    environments: ['single', 'viewer-demo'],
  },
  async function (env) {
    const styles = useStyles();
    let controller;
    let carousel;
    let prevArrow;
    let nextArrow;

    beforeEach(async () => {
      controller = env.controller;
      carousel = await getCarousel(controller);
      nextArrow = await getNextArrowSlot(controller);
      prevArrow = await getPrevArrowSlot(controller);
    });

    afterEach(async () => {
      await controller.switchToLight();
    });

    it('should go to the next slide', async () => {
      await controller.click(nextArrow);
      await controller.switchToShadowRoot(carousel);
      const secondSlide = await getSlide(styles, controller, 1);
      await expect(controller.getElementRect(secondSlide)).to.include({
        'x': 0,
      });
    });

    it('should go to the previous slide', async () => {
      await controller.click(prevArrow);
      await controller.switchToShadowRoot(carousel);
      const lastSlide = await getSlide(styles, controller, SLIDE_COUNT - 1);
      await expect(controller.getElementRect(lastSlide)).to.include({
        'x': 0,
      });
    });
  }
);
