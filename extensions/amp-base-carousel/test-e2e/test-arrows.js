/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/** The total number of slides in the carousel */
const SLIDE_COUNT = 7;

describes.endtoend(
  'amp-base-carousel:0.1 - arrows with custom arrows',
  {
    fixture: 'amp-base-carousel/custom-arrows.amp.html',
    environments: ['single', 'viewer-demo'],

    versions: {
      '0.1': {
        experiments: [
          'amp-base-carousel',
          'layers',
          'amp-lightbox-gallery-base-carousel',
        ],
      },
      '1.0': {
        experiments: ['bento-carousel'],
      },
    },
  },
  async (env) => {
    let ctrl;

    beforeEach(() => {
      ctrl = ctrlHelpers(env);
      ctrl.maybeSwitchToShadow();
    });

    afterEach(() => ctrl.maybeSwitchToLight());

    it('should go to the next slide', async () => {
      const nextArrow = await ctrl.getNextArrowSlot();
      const secondSlide = await ctrl.getSlide(1);

      await ctrl.click(nextArrow);
      await expect(ctrl.rect(secondSlide)).to.include({
        'x': 0,
      });
    });

    it('should go to the previous slide', async () => {
      const prevArrow = await ctrl.getPrevArrowSlot();
      const lastSlide = await ctrl.getSlide(SLIDE_COUNT - 1);

      await ctrl.click(prevArrow);
      await expect(ctrl.rect(lastSlide)).to.include({
        'x': 0,
      });
    });
  }
);
