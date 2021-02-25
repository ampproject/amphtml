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
import {Services} from '../../../../src/services';
import {addAttributesToElement} from '../../../../src/dom';

describes.realWin(
  'amp-google-assistant-assistjs',
  {
    amp: {
      extensions: ['amp-google-assistant-assistjs'],
    },
  },
  (env) => {
    let document;
    let configElement;
    let voiceButtonElement;

    beforeEach(() => {
      document = env.win.document;

      const configServiceMock = env.sandbox.mock(
        Services.assistjsConfigServiceForDoc(document)
      );
      configServiceMock
        .expects('getWidgetIframeUrl')
        .withExactArgs('voicebutton')
        .once();

      const frameServiceMock = env.sandbox.mock(
        Services.assistjsFrameServiceForDoc(document)
      );
      frameServiceMock.expects('openMic').once();

      configElement = document.createElement(
        'amp-google-assistant-assistjs-config'
      );
      configElement.innerHTML =
        '<script type="application/json">{"devMode": true, "projectId": "aog-assistjs-demos", "hostUrl": "https://toidemo2.web.app"}</script>';
      addAttributesToElement(configElement, {layout: 'nodisplay'});
      document.body.appendChild(configElement);

      voiceButtonElement = document.createElement(
        'amp-google-assistant-assistjs-voice-button'
      );
      voiceButtonElement.setAttribute('id', 'voice-button');
      document.body.appendChild(voiceButtonElement);
    });

    afterEach(() => {
      document.body.removeChild(configElement);
      document.body.removeChild(voiceButtonElement);
    });

    it('should have id "voice button" when built', () => {
      expect(configElement.getAttribute('layout')).to.equal('nodisplay');
      expect(voiceButtonElement.getAttribute('id')).to.equal('voice-button');
    });
  }
);
