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

import {getSlides, getSpacers, prop} from './helpers';

describes.endtoend(
  'amp-base-carousel test snap property',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/snap-property.amp.html',
    environments: ['single'],
  },
  async function (env) {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should have snap property on spacers', async () => {
      const slides = await getSlides(controller, '#snap-spacers');
      const spacers = await getSpacers(controller);
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const style = await prop(controller, slide, 'style');
        const keys = Object.keys(style);
        for (let j = 0; j < keys.length; j++) {
          const key = keys[j];
          await expect(style[key]).to.not.equal('scroll-snap-align');
        }
      }

      for (let i = 0; i < spacers.length; i++) {
        const spacer = spacers[i];
        const style = await prop(controller, spacer, 'style');
        const keys = Object.keys(style);
        let found = false;
        for (let j = 0; j < keys.length; j++) {
          const key = keys[j];
          found = found || style[key] === 'scroll-snap-align';
        }
        await expect(found).to.be.true;
      }
    });

    it('should have snap property on slides', async () => {
      const slides = await getSlides(controller, '#snap-slides');
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const style = await prop(controller, slide, 'style');
        const keys = Object.keys(style);
        let found = false;
        for (let j = 0; j < keys.length; j++) {
          const key = keys[j];
          found = found || style[key] === 'scroll-snap-align';
        }
        await expect(found).to.be.true;
      }
    });
  }
);
