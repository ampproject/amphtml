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

import '../../amp-recaptcha-input';
import {toggleExperiment} from '../../../../../src/experiments';

describe.configure().skipSafari().skipEdge()
    .run('amp-recaptcha-input', function() {
      describes.integration('amp-recaptcha', {
        body: '',
        extensions: ['amp-recaptcha-input'],
      }, env => {

        let win;
        let doc;
        beforeEach(() => {
          win = env.win;
          doc = win.document;
          toggleExperiment(win, 'amp-recaptcha-input', true);
        });

        function getRecaptchaInput() {
          const ampRecaptchaInput = doc.createElement('amp-recaptcha-input');
          ampRecaptchaInput.setAttribute('layout',
              'nodisplay');
          ampRecaptchaInput.setAttribute('data-sitekey',
              '6LebBGoUAAAAAHbj1oeZMBU_rze_CutlbyzpH8VE');
          ampRecaptchaInput.setAttribute('data-action',
              'integration_testing');
          ampRecaptchaInput.setAttribute('data-fortesting',
              'true');
          doc.body.appendChild(ampRecaptchaInput);
          return ampRecaptchaInput.build().then(() => {
            return ampRecaptchaInput.layoutCallback();
          }).then(() => {
            return ampRecaptchaInput;
          });
        }

        it('should be able to message boostrap iframe' +
          ' return a mock token on execute', () => {
          return getRecaptchaInput().then(ampRecaptchaInput => {
            return ampRecaptchaInput.implementation_.getValue().then(token => {
              expect(token).to.be.ok;
            });
          });
        });
      });
    });
