/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  'amp-subscriptions-google',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-subscriptions-google/swg.amp.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('Subscription offers should render correctly', async () => {
      const btn = await controller.findElement('#swg_button');
      // Wait for button to be rendered and ready to click
      await expect(controller.getElementRect(btn)).to.include({
        width: 240,
        height: 40,
      });
      await controller.click(btn);

      // Switch to SwG's outer iFrame
      const outerFrame = await controller.findElement('iframe.swg-dialog');
      await controller.switchToFrame(outerFrame);

      // Switch to SwG's inner iFrame
      const innerFrame = await controller.findElement('iframe');
      await controller.switchToFrame(innerFrame);

      const text = await controller.findElement('.K2Fgzb');
      await expect(text).to.exist;
      await expect(controller.getElementText(text)).to.equal(
        'Subscribe with your Google Account'
      );

      const basicAccessText = await controller.findElement('.amekj');
      await expect(controller.getElementText(basicAccessText)).to.equal(
        'Basic Access!'
      );

      const basicAccessDesc = await controller.findElement('.a02uaf');
      await expect(controller.getElementText(basicAccessDesc)).to.equal(
        'Basic access charged weekly..'
      );

      const basicAccessPrice = await controller.findElement('.mojnzf');
      await expect(controller.getElementText(basicAccessPrice)).to.equal(
        '$1.99/week*'
      );
    });
  }
);
