import {sleep} from '#testing/helpers';
import {Key} from '#testing/helpers/types';

describes.endtoend(
  'amp story share menu',
  {
    fixture: 'amp-story/amp-story.amp.html',
    browsers: ['chrome'],
    environments: ['single'],
    deviceName: 'iPhone X',
  },
  (env) => {
    /** @type {SeleniumWebDriverController} */
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it.skip('should copy the link using the browser share menu', async () => {
      // copy link
      const systemLayerHost = await controller.findElement(
        '.i-amphtml-system-layer-host'
      );
      await controller.switchToShadowRoot(systemLayerHost);
      const shareButton = await controller.findElement(
        '.i-amphtml-story-share-control'
      );
      await controller.click(shareButton);
      await controller.switchToLight();

      const shareMenuHost = await controller.findElement(
        'amp-story-share-menu'
      );
      await controller.switchToShadowRoot(shareMenuHost);
      const getLinkButton = await controller.findElement(
        '.i-amphtml-story-share-icon-link'
      );
      await controller.click(getLinkButton);
      await controller.switchToLight();

      // paste link
      const input = await controller.findElement('.input-field');
      await controller.click(input);
      await sleep(500);
      await controller.type(input, Key.CtrlV);
      await sleep(500);

      const output = await controller.getElementProperty(input, 'value');
      await expect(output).to.equal(
        'http://localhost:8000/test/manual/amp-story/amp-story.amp.html'
      );
    });
  }
);
