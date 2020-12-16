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

import {getCarousel, getNextArrow, getPrevArrow, getSlide} from './helpers';
import {useStyles} from '../base-carousel.jss';

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'AMP carousel rtl',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/1.0/basic-rtl.amp.html',
    experiments: ['bento-carousel'],
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single'],
  },
  async (env) => {
    const styles = useStyles();

    /** The total number of slides in the carousel */
    const SLIDE_COUNT = 7;
    let controller;

    beforeEach(async () => {
      controller = env.controller;
      const carousel = await getCarousel(controller);
      await controller.switchToShadowRoot(carousel);
    });

    it('should place the second slide to the left', async () => {
      const secondSlide = await getSlide(styles, controller, 1);
      await expect(controller.getElementRect(secondSlide)).to.include({
        left: -pageWidth,
      });
    });

    it('should place the last slide to the right', async () => {
      const lastSlide = await getSlide(styles, controller, SLIDE_COUNT - 1);
      await expect(controller.getElementRect(lastSlide)).to.include({
        left: pageWidth,
      });
    });

    it('should place the arrows correctly', async () => {
      const prevArrow = await getPrevArrow(styles, controller);
      const nextArrow = await getNextArrow(styles, controller);
      await expect(controller.getElementRect(prevArrow)).to.include({
        right: pageWidth,
      });
      await expect(controller.getElementRect(nextArrow)).to.include({
        left: 0,
      });
    });
  }
);
