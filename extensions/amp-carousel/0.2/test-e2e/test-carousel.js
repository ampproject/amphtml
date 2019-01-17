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

import 'babel-regenerator-runtime';
import * as describes from '../../../../testing/e2e/describes-e2e';

describes.endtoend('AMP carousel', {
  engines: ['selenium'],
}, async env => {
  const slottedClass = 'i-amphtml-carousel-slotted';

  let controller;

  async function getSlide(n) {
    return await controller.findElementXPath(
        `//amp-carousel//div[contains(@class, "${slottedClass}")][${n + 1}]`);
  }

  beforeEach(async() => {
    controller = env.controller;

    // Enable the amp-carousel-v2 and layers experiments.
    await controller.navigateTo(
        'http://localhost:8000/test/manual/amp-carousel-0-2/enable-experiment.html');
    await controller.findElement('.msg-div');

    await controller.navigateTo(
        'http://localhost:8000/test/manual/amp-carousel-0-2/basic.amp.html');
  });

  it('should distribute slides', async() => {
    // Having the 7th slide means we have all the previous ones too.
    await getSlide(6);
  });
});
