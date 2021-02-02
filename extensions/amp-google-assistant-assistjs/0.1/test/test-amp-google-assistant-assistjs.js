/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-google-assistant-assistjs';

describes.realWin(
  'amp-google-assistant-assistjs',
  {
    amp: {
      extensions: ['amp-google-assistant-assistjs'],
    },
  },
  (env) => {
    var win = env.win;

    let configElement = win.document.createElement('amp-google-assistant-assistjs-config');
    configElement.textContent = '{"devMode": true, "projectId": "aog-assistjs-demos", "hostUrl": "https://toidemo2.web.app"}';
    win.document.body.appendChild(configElement);

    let voiceButtonelement;

    beforeEach(() => {
      voiceButtonElement = win.document.createElement('amp-google-assistant-assistjs-voice-button');
      voiceButtonElement.setAttribute('id', 'voice-button');
      win.document.body.appendChild(voiceButtonElement);
    });

    it('should have hello world when built', () => {
      configElement.build()
      voiceButtonelement.build();
      expect(voiceButtonelement.getAttribute('id')).to.equal('voice button');
    });
  }
);
