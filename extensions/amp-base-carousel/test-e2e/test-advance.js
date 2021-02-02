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

const pageWidth = 500;
const pageHeight = 800;

describes.endtoend(
  'amp-base-carousel:0.1 - advance',
  {
    fixture: 'amp-base-carousel/advance.amp.html',
    experiments: ['amp-base-carousel'],
    environments: ['single'],
    initialRect: {width: pageWidth, height: pageHeight},

    versions: {
      '0.1': {},
      '1.0': {},
    },
  },
  async (env) => {
    let ctrl;

    beforeEach(() => {
      ctrl = ctrlHelpers(env);
      ctrl.maybeSwitchToShadow();
    });

    // TODO(micajuine-ho, #24195): This test is flaky during CI.
    it.skip('should move forwards once', async () => {
      const nextArrow = await ctrl.getNextArrow();
      const prevArrow = await ctrl.getPrevArrow();

      await ctrl.click(nextArrow);

      // Wait for render with updated active slide.
      await ctrl.sleep(500);

      await expect(ctrl.css(prevArrow, 'opacity')).to.equal('1');
      await expect(ctrl.css(nextArrow, 'opacity')).to.equal('1');

      const slides = await ctrl.getSlides();
      const slideOne = await ctrl.rect(slides[0]);
      const slideTwo = await ctrl.rect(slides[1]);

      await expect(slideOne['x']).to.be.lessThan(0);
      await expect(slideTwo['x']).to.be.at.least(0);
    });
  }
);
