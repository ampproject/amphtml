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

import {getNextArrow, getPrevArrow, sleep} from './helpers';

describes.endtoend(
  'amp-base-carousel:0.1 - mixed length carousel arrows',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/no-arrows.amp.html',
    environments: ['single'],
  },
  async function (env) {
    let controller;
    let prevArrow;
    let nextArrow;

    beforeEach(async () => {
      controller = env.controller;

      nextArrow = await getNextArrow(controller);
      prevArrow = await getPrevArrow(controller);
    });

    it('should not have arrows when at start or end', async () => {
      await expect(controller.getElementCssValue(prevArrow, 'opacity')).to.equal('0');
      await expect(controller.getElementCssValue(nextArrow, 'opacity')).to.equal('1');

      // click next
      await controller.click(nextArrow);
      await sleep(500);
      
      await expect(controller.getElementCssValue(prevArrow, 'opacity')).to.equal('1');
      await expect(controller.getElementCssValue(nextArrow, 'opacity')).to.equal('0');
      
      // click back
      await controller.click(prevArrow);
      await sleep(500);
      
      await expect(controller.getElementCssValue(prevArrow, 'opacity')).to.equal('0');
      await expect(controller.getElementCssValue(nextArrow, 'opacity')).to.equal('1');
    });
  }
);
