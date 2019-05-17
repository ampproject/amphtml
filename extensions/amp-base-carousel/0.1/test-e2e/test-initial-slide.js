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

import {getSlide} from './helpers';

const pageWidth = 600;
const pageHeight = 600;

describes.endtoend(
  'AMP carousel',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-base-carousel/' +
      'initial-slide.amp.html',
    experiments: ['amp-base-carousel', 'layers'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  async env => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    //TODO(spaharmi): fails on all environments
    it.skip('should render with the correct initial slide', async () => {
      const thirdSlide = await getSlide(controller, 2);

      // Normally, resizing would cause the position to change. We're testing
      // that the carousel moves this to the correct position again.
      await expect(controller.getElementRect(thirdSlide)).to.include({
        'x': 0,
        'width': pageWidth,
      });
    });
  }
);
