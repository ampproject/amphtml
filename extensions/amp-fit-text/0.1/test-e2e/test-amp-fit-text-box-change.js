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
  'amp-fit-text',
  {
    fixture: 'amp-fit-text/0.1/amp-fit-text-box-change.html',
    environments: 'ampdoc-amp4ads-preset',
  },
  (env) => {
    let controller;
    let contentDiv;
    let originalFontSize;

    beforeEach(async () => {
      controller = env.controller;
      contentDiv = await selectContentDiv('recalculate-at-150-150');
      originalFontSize = await getFontSize(controller, contentDiv);
    });

    describe('user initiated dom changes cause recalculations', function () {
      it('when box size increases font size should increase', async () => {
        await controller.click(
          await controller.findElement('#recalculate-resize-200-200')
        );
        // wait for the resizeobserver to recognize the changes
        // 5000ms chosen to allow sufficient time for fit-text to recalculate font sizes.
        //TODO(rebeccanthomas): Update this test to use `waitFor` instead of a promise resolve
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 10000);
        });
        const updatedFontSize = await getFontSize(controller, contentDiv);
        await expect(updatedFontSize).to.be.greaterThan(originalFontSize);
      });

      it('when box size decreases font size should decrease', async () => {
        await controller.click(
          await controller.findElement('#recalculate-resize-100-100')
        );
        // wait for the resizeobserver to recognize the changes
        // 5000ms chosen to allow sufficient time for fit-text to recalculate font sizes.
        //TODO(rebeccanthomas): Update this test to use `waitFor` instead of a promise resolve
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 10000);
        });
        const updatedFontSize = await getFontSize(controller, contentDiv);
        await expect(updatedFontSize).to.be.lessThan(originalFontSize);
      });
    });

    async function getFontSize(controller, element) {
      return parseInt(
        await controller.getElementCssValue(element, 'font-size'),
        10
      );
    }

    async function selectContentDiv(id) {
      return await controller.findElement(
        `#${id} .i-amphtml-fit-text-content > div`
      );
    }
  }
);
