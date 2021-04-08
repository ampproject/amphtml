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

describes.endtoend(
  'amp-tiktok',
  {
    fixture: 'amp-tiktok/0.1/amp-tiktok.html',
    environments: 'ampdoc-preset',
  },
  (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    describe('tiktok component with videoId as src', function () {
      it('resizes if the tiktok element is smaller than the height of the tiktok player', async () => {
        const iframe = await selectContentIframe('tiktok-1');
        const initialIframeRect = await controller.getElementRect(iframe);
        const initialHeight = await initialIframeRect.height;
        // Expect iframe to initialize to default height
        await expect(initialHeight).to.equal(500);

        // 1500ms chosen to allow sufficient time for tiktok to recieve the new height message and resize.
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1500);
        });

        const updatedIframeRect = await controller.getElementRect(iframe);
        const updatedHeight = await updatedIframeRect.height;
        // Expect the iframe to be the full height of the tiktok player
        await expect(updatedHeight).to.be.greaterThan(initialHeight);
      });
    });

    describe('tiktok component with video source link as src', function () {
      it('resizes if the tiktok element is smaller than the height of the tiktok player', async () => {
        const iframe = await selectContentIframe('tiktok-2');
        const initialIframeRect = await controller.getElementRect(iframe);
        const initialHeight = await initialIframeRect.height;
        // Expect iframe to initialize to default height
        await expect(initialHeight).to.equal(500);

        // 1500ms chosen to allow sufficient time for tiktok to recieve the new height message and resize.
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1500);
        });

        const updatedIframeRect = await controller.getElementRect(iframe);
        const updatedHeight = await updatedIframeRect.height;
        // Expect the iframe to be the full height of the tiktok player
        await expect(updatedHeight).to.be.greaterThan(initialHeight);
      });
    });

    describe('tiktok component with blockquote as child', function () {
      it('resizes if the tiktok element is smaller than the height of the tiktok player', async () => {
        const iframe = await selectContentIframe('tiktok-3');
        const initialIframeRect = await controller.getElementRect(iframe);
        const initialHeight = await initialIframeRect.height;
        // Expect iframe to initialize to default height
        await expect(initialHeight).to.equal(500);

        // 1500ms chosen to allow sufficient time for tiktok to recieve the new height message and resize.
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1500);
        });

        const updatedIframeRect = await controller.getElementRect(iframe);
        const updatedHeight = await updatedIframeRect.height;
        // Expect the iframe to be the full height of the tiktok player
        await expect(updatedHeight).to.be.greaterThan(initialHeight);
      });
    });
    async function selectContentIframe(id) {
      return await controller.findElement(`#${id} > iframe`);
    }
  }
);
