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
  'amp-bind',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-bind/' +
      'bind-brightcove.html',
  },
  async env => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    describe('with <amp-brightcove>', () => {
      it('should support binding to data-account', async () => {
        const button = await controller.findElement('#brightcoveButton');
        const iframe = await controller.findElement('#brightcove iframe');

        await expect(
          controller.getElementProperty(iframe, 'src')
        ).to.not.contain('bound');

        await controller.click(button);
        await expect(controller.getElementProperty(iframe, 'src')).to.contain(
          'bound'
        );
      });
    });
  }
);
