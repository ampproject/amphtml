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
  'amp-ad-exit',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amphtml-ads/amp-ad-exit.amp.html',
    environments: 'amp4ads-preset',
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    // Setting the time explicitly to avoid test flakiness.
    async function setTime(epochTime) {
      await controller.evaluate((time) => {
        window.Date = {
          now: () => time,
        };
        if (window.parent) {
          try {
            window.parent.Date = window.Date;
          } catch (e) {}
        }
      }, epochTime);
    }

    it('product1 clicked without delay', async () => {
      const adDiv = await controller.findElement('#product1');
      await controller.click(adDiv);

      const windows = await controller.getAllWindows();
      await expect(windows.length).to.equal(1);
    });

    it('product1 clicked near the border', async () => {
      const adDiv = await controller.findElement('#product1');
      await setTime(Number.MAX_VALUE);

      await controller.driver
        .actions()
        .move({x: -55, y: -55, origin: adDiv.getElement()})
        .press()
        .release()
        .perform();

      const windows = await controller.getAllWindows();
      await expect(windows.length).to.equal(1);
    });

    it('product1 ad opened', async () => {
      const adDiv = await controller.findElement('#product1');
      await setTime(Number.MAX_VALUE);
      await controller.click(adDiv);

      const windows = await controller.getAllWindows();
      await expect(windows.length).to.equal(2);

      await controller.switchToWindow(windows[1]);
      await expect(await controller.getCurrentUrl()).to.match(
        /^http:\/\/localhost:8000\/\?product1&x=71&y=9[78]&e=Product%201&shouldNotBeReplaced=AMP_VERSION$/
      );
    });

    it('product2 ad opened', async () => {
      const adDiv = await controller.findElement('#product2');
      await setTime(Number.MAX_VALUE);
      await controller.click(adDiv);

      const windows = await controller.getAllWindows();
      await expect(windows.length).to.equal(2);

      await controller.switchToWindow(windows[1]);
      await expect(await controller.getCurrentUrl()).to.match(
        /^http:\/\/localhost:8000\/\?product2&r=0\.\d+$/
      );

      await expect(
        'http://localhost:8000/amp4test/request-bank/e2e/deposit/tracking'
      ).to.have.sentCount(1);
    });

    it('variable target "current" should point to product1 by default', async () => {
      const headline = await controller.findElement('h1');
      await setTime(Number.MAX_VALUE);
      await controller.click(headline);

      const windows = await controller.getAllWindows();
      await expect(windows.length).to.equal(2);

      await controller.switchToWindow(windows[1]);
      await expect(await controller.getCurrentUrl()).to.match(
        /^http:\/\/localhost:8000\/\?product1&x=\d+&y=\d+&e=headline&shouldNotBeReplaced=AMP_VERSION$/
      );
    });

    it('should open product2 after setting varible target', async () => {
      const headline = await controller.findElement('h1');
      const nextButton = await controller.findElement('#next-btn');
      await setTime(Number.MAX_VALUE);
      await controller.click(nextButton);
      await controller.click(headline);

      const windows = await controller.getAllWindows();
      await expect(windows.length).to.equal(2);

      await controller.switchToWindow(windows[1]);
      await expect(await controller.getCurrentUrl()).to.match(
        /^http:\/\/localhost:8000\/\?product2&r=0\.\d+$/
      );
      await expect(
        'http://localhost:8000/amp4test/request-bank/e2e/deposit/tracking'
      ).to.have.sentCount(1);
    });
  }
);
