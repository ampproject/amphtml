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

import {getNextArrow, getPrevArrow, getSlides} from './helpers';
import sleep from 'sleep-promise';

const pageWidth = 500;
const pageHeight = 800;

describes.endtoend(
  'AMP carousel advance',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/advance.amp.html',
    experiments: ['amp-base-carousel'],
    environments: ['single'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  async (env) => {
    let controller;
    let nextArrow;
    let prevArrow;

    function css(handle, name) {
      return controller.getElementCssValue(handle, name);
    }

    function rect(el) {
      return controller.getElementRect(el);
    }

    beforeEach(async () => {
      controller = env.controller;

      nextArrow = await getNextArrow(controller);
    });

    it('should move forwards once', async () => {
      await controller.click(nextArrow);
      await sleep(500);
      prevArrow = await getPrevArrow(controller);
      await expect(css(prevArrow, 'opacity')).to.equal('1');
      await expect(css(nextArrow, 'opacity')).to.equal('1');

      const slides = await getSlides(controller);
      const slideOne = await rect(slides[0]);
      const slideTwo = await rect(slides[1]);

      await expect(slideOne['x']).to.be.lessThan(0);
      await expect(slideTwo['x']).to.be.at.least(0);
    });
  }
);
