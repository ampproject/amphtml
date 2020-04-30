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
  'amp story share menu',
  {
    testUrl: 'http://localhost:8000/test/manual/amp-story/amp-story.amp.html',
    browsers: ['chrome'],
    environments: ['single'],
    deviceName: 'iPhone X',
  },
  async (env) => {
    /** @type {SeleniumWebDriverController} */
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should copy the link using the browser share menu', async () => {
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
        '.i-amphtml-story-share-menu-host'
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
