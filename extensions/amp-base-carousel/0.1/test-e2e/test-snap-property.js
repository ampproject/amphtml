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

import {getSlides, getSpacers} from './helpers';

describes.endtoend(
  'amp-base-carousel - snap property',
  {
    version: '0.1',
    fixture: 'amp-base-carousel/snap-property.amp.html',
    environments: ['single'],
  },
  async function (env) {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should set snap property on spacers', async () => {
      const spacers = await getSpacers(controller);
      for (let i = 0; i < spacers.length; i++) {
        const spacer = spacers[i];
        const styles = await controller.getElementProperty(spacer, 'style');
        await expect(styles).to.contain('scroll-snap-align');
      }
    });

    it('should not set snap property on slides when carousel is looped', async () => {
      const slides = await getSlides(controller, '[loop="true"]');
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const styles = await controller.getElementProperty(slide, 'style');
        await expect(styles).to.not.contain('scroll-snap-align');
      }
    });

    it('should set snap property on slides when carousel is not looped', async () => {
      const slides = await getSlides(controller, '[loop="false"]');
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const styles = await controller.getElementProperty(slide, 'style');
        await expect(styles).to.contain('scroll-snap-align');
      }
    });
  }
);
