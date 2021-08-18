

import {sleep} from './common';

describes.endtoend(
  'amp-consent',
  {
    fixture: 'amp-consent/cmp-interaction.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should restrict fullscreen until user interaction', async function () {
      this.timeout(10000);
      // Await the CMP to load
      await sleep(3000);

      const consentPrompt = await controller.findElement('#ConsentPrompt');

      // Verify that it's not fullscreen
      await expect(
        controller.getElementAttribute(consentPrompt, 'class')
      ).to.not.match(/i-amphtml-consent-ui-iframe-fullscreen/);

      await controller.findElement('iframe').then(async (iframe) => {
        await controller.switchToFrame(iframe);
      });

      // Verify that it's fullscreen
      await controller.click(await controller.findElement('#consent-wrapper'));
      await sleep(1000);
      await controller.switchToParent();
      await expect(
        controller.getElementAttribute(consentPrompt, 'class')
      ).to.match(/i-amphtml-consent-ui-iframe-fullscreen/);

      await controller.findElement('iframe').then(async (iframe) => {
        await controller.switchToFrame(iframe);
      });

      // Close prompt
      await controller.click(await controller.findElement('#d'));
      await controller.switchToParent();
      await expect(
        controller.getElementAttribute(consentPrompt, 'class')
      ).to.not.match(/i-amphtml-consent-ui-iframe-fullscreen/);
    });
  }
);
