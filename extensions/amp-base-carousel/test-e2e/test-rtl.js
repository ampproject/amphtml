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

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'amp-base-carousel - rtl',
  {
    fixture: 'amp-base-carousel/basic-rtl.amp.html',
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single'],

    versions: {
      '0.1': {
        experiments: ['amp-base-carousel', 'layers'],
      },
      '1.0': {
        experiments: ['bento-carousel'],
      },
    },
  },
  async (env) => {
    let ctrl;
    let arrowMargin;

    /** The total number of slides in the carousel */
    const SLIDE_COUNT = 7;

    beforeEach(() => {
      arrowMargin = env.version == '0.1' ? 12 : 0;

      ctrl = ctrlHelpers(env);
      ctrl.maybeSwitchToShadow();
    });

    it('should place the second slide to the left', async () => {
      const secondSlide = await ctrl.getSlide(1);
      await expect(ctrl.rect(secondSlide)).to.include({
        left: -pageWidth,
      });
    });

    it('should place the last slide to the right', async () => {
      const lastSlide = await ctrl.getSlide(SLIDE_COUNT - 1);
      await expect(ctrl.rect(lastSlide)).to.include({
        left: pageWidth,
      });
    });

    it('should place the arrows correctly', async () => {
      const prevArrow = await ctrl.getPrevArrow();
      const nextArrow = await ctrl.getNextArrow();

      await expect(ctrl.rect(prevArrow)).to.include({
        right: pageWidth - arrowMargin,
      });
      await expect(ctrl.rect(nextArrow)).to.include({
        left: arrowMargin,
      });
    });
  }
);
