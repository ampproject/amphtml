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

import {AmpConsent} from '../amp-consent';

describes.realWin('amp-consent', {
  amp: {
    extensions: ['amp-consent'],
  },
}, env => {
  let win;
  let ampdoc;
  let doc;
  beforeEach(() => {
    doc = env.win.doc;
    win = env.win;
    ampdoc = env.ampdoc;
  });

  describe('amp-consent', () => {
    let defaultConfig;
    let consentElement;
    let scriptElement;
    describe('Config', () => {
      let defaultConfig;
      let consentElement;
      let scriptElement;
      beforeEach(() => {
        defaultConfig = {
          'consents': {
            'ABC': {
              'check-consent-href': 'http://localhost:8000/get-consent',
            },
            'DEF': {
              'check-consent-href': 'http://localhost:8000/get-consent',
            },
          },
        };
        consentElement = doc.createElement('amp-consent');
        consentElement.setAttribute('layout', 'nodisplay');
        scriptElement = doc.createElement('script');
        scriptElement.setAttribute('type', 'application/json');
      });
      it.skip('read config', () => {
        scriptElement.textContent = defaultConfig;
        consentElement.appendChild(scriptElement);
        doc.body.appendChild(consentElement);
        const ampConsent = new AmpConsent(consentElement);
        ampConsent.buildCallback();
      });
    });
  });
});
