/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

/**
 * TODO: The timeout is increased for cross-light/shadow DOM traversal.
 * This should be removed, but currently without it the tests are flaky.
 **/
const testTimeout = 11500;

describes.endtoend(
  'amp-fit-text',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-fit-text/1.0/amp-fit-text.html',
    environments: 'ampdoc-preset',
    experiments: ['amp-fit-text-v2'],
  },
  (env) => {
    let controller;

    beforeEach(async function () {
      this.timeout(testTimeout);
      controller = env.controller;
    });

    it.skip('should render in correct font-size', async function () {
      await verifyElementStyles(await selectContentDiv('test1'), {
        'font-size': '32px',
      });
    });

    it.skip('should render with overflow', async function () {
      await verifyElementStyles(await selectContentDiv('test2'), {
        'font-size': '42px',
        'overflow': 'hidden',
      });
    });

    it.skip('should render in correct font-size with a lot of text', async function () {
      await verifyElementStyles(await selectContentDiv('test3'), {
        'font-size': '16px',
      });
    });

    it.skip('should account for border dimensions', async function () {
      await verifyElementStyles(await selectContentDiv('test4'), {
        'font-size': '20px',
      });
    });

    async function selectContentDiv(id) {
      const element = await controller.findElement(`#${id}`);
      await controller.switchToShadowRoot(element);
      return await controller.findElement('div > div > div');
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
