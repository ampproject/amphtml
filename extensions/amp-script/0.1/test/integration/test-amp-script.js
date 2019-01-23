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

import {BrowserController} from '../../../../../testing/test-helper';
import {poll} from '../../../../../testing/iframe';

describe('amp-script', function() {
  let browser;

  describes.integration('basic', {
    /* eslint-disable max-len */
    body: `
      <amp-script layout=container src="/examples/amp-script/hello-world.js"><div class="root"><button id="hello">Insert Hello World!</button></div></amp-script>
    `,
    /* eslint-enable max-len */
    extensions: ['amp-script'],
    experiments: ['amp-script'],
  }, env => {
    beforeEach(() => {
      browser = new BrowserController(env.win);

      env.win['__AMP__EXPERIMENT_TOGGLES']['amp-script'] = true;
    });

    it('should say "hello world"', function*() {
      // TODO: Wait for hydration/interactive.
      yield browser.wait(1000);

      browser.click('button#hello');

      const doc = env.win.document;
      yield poll('Hello World!', () => {
        const h1 = doc.querySelector('h1');
        return h1 && h1.textContent == 'Hello World!';
      });
    });
  });
});
