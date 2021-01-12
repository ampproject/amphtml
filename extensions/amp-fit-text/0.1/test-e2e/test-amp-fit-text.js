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
        'font-size': '20px',
      });
    });

    it.only('should recalculate font size after box size change', async () => {
      const contentButton = await controller.findElement('#test5_button');
      const contentDiv = await selectContentDiv('test5');

      const originalFontSize = parseInt(
        await controller.getElementCssValue(contentDiv, 'font-size'),
        10
      );
      const originalWidth = await controller.getElementCssValue(
        contentDiv,
        'width'
      );

      await expect(originalWidth).to.equal('100px');

      await controller.click(contentButton);
      const updatedFontSize = parseInt(
        await controller.getElementCssValue(contentDiv, 'font-size'),
        10
      );
      const updatedWidth = await controller.getElementCssValue(
        contentDiv,
        'width'
      );
      await expect(updatedWidth).to.equal('200px');

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
