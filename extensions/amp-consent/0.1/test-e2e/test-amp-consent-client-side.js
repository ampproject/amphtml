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

/**
 * Test client side and server side
 */
describes.endtoend(
  'amp-consent',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-consent/amp-consent-basic-uses.amp.html',
    experiments: ['amp-consent-geo-override'],
  },
  env => {
    let controller;
    let ui1;
    let ui2;
    let postPromptUi;
    let tillResponded;
    let accepted;
    let autoReject;
    // let requestBank;

    beforeEach(() => {
      controller = env.controller;
    });

    async function findElements() {
      ui1 = await controller.findElement('#ui1');
      ui2 = await controller.findElement('#ui2');
      postPromptUi = await controller.findElement('#postPromptUI');
      tillResponded = await controller.findElement(
        '[data-block-on-consent="_till_responded"]'
      );
      accepted = await controller.findElement(
        '[data-block-on-consent="_till_accepted"]'
      );
      autoReject = await controller.findElement(
        '[data-block-on-consent="_auto_reject"]'
      );
    }

    it('should listen to client side decision', async () => {
      await findElements();

      // Images are either loaded or not loaded
      await expect(
        controller.getElementAttribute(tillResponded, 'class')
      ).to.match(/amp-notbuilt/);
      await expect(controller.getElementAttribute(accepted, 'class')).to.match(
        /amp-notbuilt/
      );
      await expect(
        controller.getElementAttribute(autoReject, 'class')
      ).to.does.not.match(/amp-notbuilt/);

      // Correct prompt is showing
      await expect(controller.getElementProperty(ui1, 'hidden')).to.be.true;
      await expect(controller.getElementProperty(ui2, 'hidden')).to.be.false;

      const acceptButton = await controller.findElement('#accept');
      await controller.click(acceptButton);

      // Prompt UI disappears
      await expect(controller.getElementProperty(ui2, 'hidden')).to.be.true;

      // PostPrompUI appears
      await expect(controller.getElementProperty(postPromptUi, 'hidden')).to.be
        .false;

      // Images load
      await expect(
        controller.getElementAttribute(tillResponded, 'class')
      ).to.does.not.match(/amp-notbuilt/);
      await expect(
        controller.getElementAttribute(accepted, 'class')
      ).to.does.not.match(/amp-notbuilt/);
      await expect(
        controller.getElementAttribute(autoReject, 'class')
      ).to.does.not.match(/amp-notbuilt/);

      // Refresh
      await controller.navigateTo(
        'http://localhost:8000/test/manual/amp-consent/amp-consent-basic-uses.amp.html'
      );

      // Find elements again
      await controller.findElement('#postPromptUI');

      // // Correct prompt is showing
      // await expect(controller.getElementProperty(ui1, 'hidden')).to.be.true;
      // await expect(controller.getElementProperty(ui2, 'hidden')).to.be.true;

      // // PostPrompUI appears
      // await expect(controller.getElementProperty(postPromptUi, 'hidden')).to.be
      //   .false;

      // // Images load
      // await expect(
      //   controller.getElementAttribute(tillResponded, 'class')
      // ).to.does.not.match(/amp-notbuilt/);
      // await expect(
      //   controller.getElementAttribute(accepted, 'class')
      // ).to.does.not.match(/amp-notbuilt/);
      // await expect(
      //   controller.getElementAttribute(autoReject, 'class')
      // ).to.does.not.match(/amp-notbuilt/);
    });
  }
);
