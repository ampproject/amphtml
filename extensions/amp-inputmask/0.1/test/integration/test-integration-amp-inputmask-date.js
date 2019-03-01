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

import {simulateKeyboardInteraction} from './utils';

const config = describe.configure().retryOnSaucelabs().ifChrome();
config.skip('amp-inputmask', () => {
  const {testServerPort} = window.ampTestRuntimeConfig;

  describes.integration('attributes', {
    body: `
    <form method="post" action-xhr="http://localhost:${testServerPort}/form/post" target="_blank">
      <input name="birthday" mask="date-mm-dd-yyyy" value="02/29">
    </form>
  `,
    extensions: ['amp-form', 'amp-inputmask'],
  }, env => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    describe('date attribute', () => {
      it('should allow entering incomplete years', () => {
        const input = doc.querySelector('[name="birthday"]');

        return simulateKeyboardInteraction(win, input, '2').then(() => {
          expect(input.value).to.equal('02/29/2');
        });
      });

      it('should allow entering valid leap years', () => {
        const input = doc.querySelector('[name="birthday"]');

        return simulateKeyboardInteraction(win, input, '2')
            .then(() => simulateKeyboardInteraction(win, input, '0'))
            .then(() => simulateKeyboardInteraction(win, input, '1'))
            .then(() => simulateKeyboardInteraction(win, input, '2'))
            .then(() => {
              expect(input.value).to.equal('02/29/2012');
            });
      });

      it('should prevent entering non-leap years', () => {
        const input = doc.querySelector('[name="birthday"]');

        return simulateKeyboardInteraction(win, input, '2')
            .then(() => simulateKeyboardInteraction(win, input, '0'))
            .then(() => simulateKeyboardInteraction(win, input, '1'))
            .then(() => simulateKeyboardInteraction(win, input, '3'))
            .then(() => {
              expect(input.value).to.equal('02/29/201');
            });
      });
    });
  });
});
