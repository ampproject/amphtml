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
  'amp-analytics iframe transport',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amphtml-ads/botguard.a4a.html',
    environments: ['a4a-fie'],
  },
  (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should inject transport iframe in the parent doc', async () => {
      await controller.switchToParent();
      const transportIframe = await controller.findElement('body > iframe');
      await expect(
        controller.getElementAttribute(transportIframe, 'src')
      ).to.equal('https://tpc.googlesyndication.com/b4a/b4a-runner.html');
      await expect(
        controller.getElementAttribute(transportIframe, 'sandbox')
      ).to.equal('allow-scripts allow-same-origin');
      await expect(
        controller.getElementAttribute(transportIframe, 'name')
      ).to.equal(
        '{"scriptSrc":"http://localhost:8000/dist/iframe-transport-client-lib.js","sentinel":"1","type":"bg"}'
      );
      await expect(
        controller.getElementAttribute(transportIframe, 'data-amp-3p-sentinel')
      ).to.equal('1');
    });
  }
);
