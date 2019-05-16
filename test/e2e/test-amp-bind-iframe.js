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
      'http://localhost:8000/test/fixtures/e2e/amp-bind/' + 'bind-iframe.html',
  },
  async env => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    describe('with <amp-iframe>', () => {
      it('should support binding to src', async () => {
        const button = await controller.findElement('#iframeButton');
        const ampIframe = await controller.findElement('#ampIframe');
        const iframe = await controller.findElement('#ampIframe iframe');

        const newSrc = 'https://giphy.com/embed/DKG1OhBUmxL4Q';
        await expect(
          controller.getElementAttribute(ampIframe, 'src')
        ).to.not.contain(newSrc);
        await expect(
          controller.getElementProperty(iframe, 'src')
        ).to.not.contain(newSrc);

        await controller.click(button);
        await expect(
          controller.getElementAttribute(ampIframe, 'src')
        ).to.contain(newSrc);
        await expect(controller.getElementProperty(iframe, 'src')).to.contain(
          newSrc
        );
      });
    });
  }
);
