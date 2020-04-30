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

import {Key} from '../../../../build-system/tasks/e2e/functional-test-controller';
import sleep from 'sleep-promise';

describes.endtoend(
  'amp story bookend',
  {
    testUrl: 'http://localhost:8000/test/manual/amp-story/amp-story.amp.html',
    // TODO(estherkim): implement mobile emulation on Firefox when available on geckodriver
    browsers: ['chrome'],
    environments: ['single'],
    deviceName: 'iPhone X', // bookend appears only on mobile
  },
  async (env) => {
    /** @type {SeleniumWebDriverController} */
    let controller;

    beforeEach(async () => {
      controller = env.controller;

      // ensure story is loaded
      await expect(controller.findElement('amp-story.i-amphtml-story-loaded'))
        .to.exist;

      // ensure page is in mobile emulation mode
      const story = await controller.findElement('amp-story');
      await expect(await story.getElement().getAttribute('desktop')).to.be.null;
    });

    it('should display bookend at the end of the story', async () => {
      await goToBookend();
      await expect(
        controller.findElement(
          'amp-story-bookend.i-amphtml-story-draggable-drawer-open'
        )
      ).to.exist;
    });

    it('should copy the link using the bookend share menu', async () => {
      await goToBookend();

      const shadowHost = await controller.findElement(
        '.i-amphtml-story-draggable-drawer-content > div'
      );
      await controller.switchToShadowRoot(shadowHost);

      const getLinkButton = await controller.findElement(
        'div.i-amphtml-story-share-icon.i-amphtml-story-share-icon-link'
      );

      // give shadow dom half a second to be interactable
      await sleep(500);
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

    async function goToBookend() {
      const story = await controller.findElement('amp-story');
      await controller.click(story);
      await controller.click(story);
      await controller.click(story);
    }
  }
);
