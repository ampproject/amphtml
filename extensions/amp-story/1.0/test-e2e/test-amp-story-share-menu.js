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
    browsers: ['chrome', 'firefox'],
    environments: ['single'],
  },
  async env => {
    /** @type {SeleniumWebDriverController} */
    let controller;

    beforeEach(async () => {
      controller = env.controller;
      await expect(
        controller.findElement(
          'a.i-amphtml-story-share-control.i-amphtml-story-button'
        )
      ).to.exist;
    });

    it('should copy the link using the browser share menu', async () => {
      // copy link
      const shareButton = await controller.findElement(
        'a.i-amphtml-story-share-control.i-amphtml-story-button'
      );
      await controller.click(shareButton);
      const getLinkButton = await controller.findElement(
        'div.i-amphtml-story-share-icon.i-amphtml-story-share-icon-link'
      );
      await controller.click(getLinkButton);

      // go to amp bind page with form
      await controller.navigateTo(
        'http://localhost:8000/test/manual/amp-story/input-form.html'
      );

      // paste link
      const input = await controller.findElement('#name-input');
      await controller.type(input, Key.CtrlV);

      // give amp-bind half a second to magic
      await sleep(500);
      const div = await controller.findElement('#name-input-value');
      await expect(controller.getElementText(div)).to.equal(
        'Hello http://localhost:8000/test/manual/amp-story/amp-story.amp.html'
      );
    });
  }
);
