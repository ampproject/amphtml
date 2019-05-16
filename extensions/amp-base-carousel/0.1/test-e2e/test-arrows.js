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

import {getNextArrow, getPrevArrow, getSlide} from './helpers';

/** The total number of slides in the carousel */
const SLIDE_COUNT = 7;

describes.endtoend(
  'AMP carousel arrows with custom arrows',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/custom-arrows.amp.html',
    experiments: ['amp-base-carousel', 'layers'],
    //TODO(spaharmi): fails on shadow demo
    environments: ['single', 'viewer-demo'],
  },
  async function(env) {
    let controller;
    let prevArrow;
    let nextArrow;

    beforeEach(async () => {
      controller = env.controller;

      nextArrow = await getNextArrow(controller);
      prevArrow = await getPrevArrow(controller);
    });

    it('should go to the next slide', async () => {
      const secondSlide = await getSlide(controller, 1);

      await controller.click(nextArrow);
      await expect(controller.getElementRect(secondSlide)).to.include({
        'x': 0,
      });
    });

    it('should go to the previous slide', async () => {
      const lastSlide = await getSlide(controller, SLIDE_COUNT - 1);

      await controller.click(prevArrow);
      await expect(controller.getElementRect(lastSlide)).to.include({
        'x': 0,
      });
    });
  }
);
