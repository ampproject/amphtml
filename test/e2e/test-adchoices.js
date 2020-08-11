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

const TEST_ENV = (env) => {
  let controller;

  beforeEach(async () => {
    controller = env.controller;
  });

  it('interactions', async () => {
    const infoDiv = await controller.findElement('#spv1');
    await expect(controller.getElementCssValue(infoDiv, 'top')).to.be.equal(
      '-250px'
    );

    const infoBtn = await controller.findElement('#cbb');
    await controller.click(infoBtn);

    await expect(controller.getElementCssValue(infoDiv, 'top')).to.be.equal(
      '0px'
    );

    const whyBtn = await controller.findElement('a#sbtn');
    await controller.click(whyBtn);

    const windows = await controller.getAllWindows();
    await expect(windows.length).to.equal(2);

    const rgx = /\/\?why$/;
    await controller.switchToWindow(windows[0]);
    const url0 = await controller.getCurrentUrl();
    await controller.switchToWindow(windows[1]);
    const url1 = await controller.getCurrentUrl();
    await expect(rgx.test(url0) || rgx.test(url1)).to.be.true;
  });
};

describes.endtoend(
  'ad choices',
  {
    testUrl: 'http://localhost:8000/test/fixtures/e2e/amphtml-ads/text.html',
    browsers: ['chrome'],
    environments: 'amp4ads-preset',
  },
  TEST_ENV
);

describes.endtoend(
  'ad choices',
  {
    testUrl: 'http://localhost:8000/test/fixtures/e2e/amphtml-ads/text.html',
    browsers: ['safari'],
    environments: ['a4a-fie', 'a4a-inabox', 'a4a-inabox-safeframe'],
  },
  TEST_ENV
);
