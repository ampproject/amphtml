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
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-fit-text/0.1/amp-fit-text.html',
    environments: 'ampdoc-amp4ads-preset',
  },
  (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should render in correct font-size', async () => {
      await verifyElementStyles(await selectContentDiv('test1'), {
        'font-size': '32px',
      });

      await verifyElementStyles(await selectContentDiv('test2'), {
        'font-size': '42px',
        'overflow': 'hidden',
      });

      await verifyElementStyles(await selectContentDiv('test3'), {
        'font-size': '16px',
      });

      await verifyElementStyles(await selectContentDiv('test4'), {
        'font-size': '19px',
      });
    });

    describe('user initiated dom changes cause recalculations', function () {
      it('when box size increases font size should increase', async () => {
        const contentButton = await controller.findElement('#test5_button');
        const contentDiv = await selectContentDiv('test5');

        // Button click increases amp-fit-text box size
        const originalfontsize = parseInt(
          await controller.getElementCssValue(contentDiv, 'font-size'),
          10
        );
        await controller.click(contentButton);
        // wait for the resizeobserver to recognize the changes
        // 90ms chosen so that the wait is less than the throttle value for the resizeobserver.
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 90);
        });
        const updatedfontsize = parseInt(
          await controller.getElementCssValue(contentDiv, 'font-size'),
          10
        );

        await expect(updatedfontsize).to.be.greaterThan(originalfontsize);
      });

      it('when box size decreases font size should decrease', async () => {
        const contentButton = await controller.findElement('#test6_button');
        const contentDiv = await selectContentDiv('test6');

        // Button click decreases amp-fit-text box size
        const originalFontSize = parseInt(
          await controller.getElementCssValue(contentDiv, 'font-size'),
          10
        );
        await controller.click(contentButton);
        // wait for the resizeobserver to recognize the changes
        // 90ms chosen so that the wait is less than the throttle value for the resizeobserver.
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 90);
        });
        const updatedFontSize = parseInt(
          await controller.getElementCssValue(contentDiv, 'font-size'),
          10
        );

        await expect(updatedFontSize).to.be.lessThan(originalFontSize);
      });
    });

    it.only('should recalculate font size after box size change', async () => {
      const contentButton = await controller.findElement('#test5_button');
      const contentDiv = await selectContentDiv('test5');

      const originalFontSize = parseInt(
        await controller.getElementCssValue(contentDiv, 'font-size'),
        10
      );
      await controller.click(contentButton);
      const updatedFontSize = parseInt(
        await controller.getElementCssValue(contentDiv, 'font-size'),
        10
      );
      const updatedWidth = controller.getElementCssValue(contentDiv, 'width');
      await expect(updatedWidth).to.equal('200');

      await expect(updatedFontSize).to.be.greaterThan(originalFontSize);
    });

    async function selectContentDiv(id) {
      return await controller.findElement(
        `#${id} .i-amphtml-fit-text-content > div`
      );
    }

    async function verifyElementStyles(element, styles) {
      for (const name in styles) {
        const value = styles[name];
        await expect(controller.getElementCssValue(element, name)).to.equal(
          value
        );
      }
    }
  }
);
// user initialted dom changes cause recalculatiions

//a11y software modifies dom causes recaluclations
