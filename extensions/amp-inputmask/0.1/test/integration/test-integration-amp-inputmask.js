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

import {poll} from '../../../../../testing/iframe';
import {simulateKeyboardInteraction} from './utils';

const config = describe.configure().retryOnSaucelabs().ifChrome();
config.skip('amp-inputmask', () => {
  const {testServerPort} = window.ampTestRuntimeConfig;

  describes.integration('attributes', {
    body: `
    <form method="post" action-xhr="http://localhost:${testServerPort}/form/post" target="_blank">
      <input name="alphabetic" mask="L">
      <input name="numeric" mask="0">
      <input name="mask-output-test" mask="(A)" mask-output="alphanumeric">
    </form>
  `,
    extensions: ['amp-form', 'amp-inputmask'],
  }, env => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    describe('mask attribute', () => {
      it('should allow input matching the mask', () => {
        const input = doc.querySelector('[name="alphabetic"]');

        return simulateKeyboardInteraction(win, input, 'A').then(() => {
          expect(input.value).to.equal('A');
        });
      });

      it('should prevent input not matching the mask', () => {
        const input = doc.querySelector('[name="numeric"]');

        return simulateKeyboardInteraction(win, input, 'A').then(() => {
          expect(input.value).to.equal('');
        });
      });
    });

    describe('form behavior', () => {
      it('should add hidden input to form before submit', () => {
        const input = doc.querySelector('[name="mask-output-test"]');
        const form = doc.querySelector('form');
        input.value = '(A)';

        const waitForInput =
            poll('hidden input to be added', () => {
              return doc.querySelector('input[type=hidden]');
            }, undefined, 2000, win);

        form.dispatchEvent(new Event('submit'));
        return waitForInput.then(hidden => {
          expect(form.hasAttribute('submit-success')).to.be.false;
          expect(hidden.name).to.equal('mask-output-test-unmasked');
          expect(hidden.value).to.equal('A');
        });
      });
    });
  });
});
