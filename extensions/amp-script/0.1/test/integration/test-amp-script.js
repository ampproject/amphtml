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
import {poll as classicPoll} from '../../../../../testing/iframe';

const TIMEOUT = 10000;

function poll(description, condition, opt_onError) {
  return classicPoll(description, condition, opt_onError, TIMEOUT);
}

describe.configure().skipSinglePass().run('amp-script', function() {
  this.timeout(TIMEOUT);

  let browser, doc, element;

  describes.integration('basic', {
    /* eslint-disable max-len */
    body: `
      <amp-script layout=container src="/examples/amp-script/hello-world.js"><button id="hello">Insert Hello World!</button></amp-script>
    `,
    /* eslint-enable max-len */
    extensions: ['amp-script'],
    experiments: ['amp-script'],
  }, env => {
    beforeEach(() => {
      browser = new BrowserController(env.win);
      doc = env.win.document;
      element = doc.querySelector('amp-script');
    });

    it('should say "hello world"', function*() {
      yield poll('<amp-script> to be hydrated',
          () => element.classList.contains('i-amphtml-hydrated'));

      // Give event listeners in hydration a moment to attach.
      yield browser.wait(100);

      browser.click('button#hello');
      yield poll('Hello World!', () => {
        const h1 = doc.querySelector('h1');
        return h1 && h1.textContent == 'Hello World!';
      });
    });
  });
});
