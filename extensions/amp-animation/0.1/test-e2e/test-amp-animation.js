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
  'amp-animation',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-animation/simple.html',
    // TODO(powerivq): Reenable for all environments
    environments: 'amp4ads-preset',
  },
  (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('transparency animation should pause and restart', async () => {
      const cancelBtn = await controller.findElement('#cancelBtn');
      await controller.click(cancelBtn);

      const elem = await controller.findElement('#image');
      await expect(controller.getElementCssValue(elem, 'opacity')).to.equal(
        '1'
      );

      const restartBtn = await controller.findElement('#restartBtn');
      await controller.click(restartBtn);
      await expect(controller.getElementCssValue(elem, 'opacity')).to.equal(
        '0'
      );
    });
  }
);
