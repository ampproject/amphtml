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

import {getCarouselById} from './helpers';

describes.endtoend(
  'AMP carousel test default attributes',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/default-attributes.amp.html',
    environments: ['single'],
  },
  async function (env) {
    let controller;
    let carousel;
    let loop;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should add loop="false" when loop is omitted (carousel-1)', async () => {
      carousel = await getCarouselById(controller, 'carousel-1');
      loop = await controller.getElementAttribute(carousel, 'loop');
      await expect(loop).to.be.equal('false');
    });

    it('should keep loop="true" when valid (carousel-2)', async () => {
      carousel = await getCarouselById(controller, 'carousel-2');
      loop = await controller.getElementAttribute(carousel, 'loop');
      await expect(loop).to.equal('true');
    });

    it('should set loop to "false" when invalid (carousel-3)', async () => {
      carousel = await getCarouselById(controller, 'carousel-3');
      loop = await controller.getElementAttribute(carousel, 'loop');
      await expect(loop).to.equal('false');
    });
  }
);
