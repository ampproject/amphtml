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

describes.endtoend(
  'amp-position-observer',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-position-observer/scrollbound-animation.html',
    environments: 'amp4ads-preset',
  },
  async env => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render correctly', async () => {
      let clockHand = await controller.findElement('.clock-hand');

      await expect(controller.getElementRect(clockHand)).to.deep.equal({
        'bottom': 149,
        'height': 39,
        'left': 151,
        'right': 204,
        'top': 110,
        'width': 53,
        'x': 151,
        'y': 110,
      });

      // Scroll parent window by 100px
      await controller.switchToParent();
      const article = await controller.getDocumentElement();
      await controller.scrollBy(article, {top: 100});

      controller
        .findElement('iframe')
        .then(frame => controller.switchToFrame(frame));

      clockHand = await controller.findElement('.clock-hand');
      await expect(controller.getElementRect(clockHand)).to.deep.equal({
        'bottom': 172,
        'height': 60,
        'left': 150,
        'right': 164,
        'top': 112,
        'width': 14,
        'x': 150,
        'y': 112,
      });
    });
  }
);
