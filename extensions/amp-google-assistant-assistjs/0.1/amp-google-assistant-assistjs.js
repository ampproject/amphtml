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

/**
 * @fileoverview The extension that brings Assistant capabilities to AMP pages. It includes several custom elements and one
 * shared Assistant Frame service.
 */

import {AmpGoogleAssistantInlineSuggestionBar} from './amp-google-assistant-inline-suggestion-bar';
import {AmpGoogleAssistantVoiceBar} from './amp-google-assistant-voice-bar';
import {AmpGoogleAssistantVoiceButton} from './amp-google-assistant-voice-button';
import {AssistjsConfigService} from './assistjs-config-service';
import {AssistjsFrameService} from './assistjs-frame-service';
import {CSS} from '../../../build/amp-google-assistant-assistjs-0.1.css';
import {Services} from '../../../src/services';

export class AmpGoogleAssistantAssistjsConfig extends AMP.BaseElement {
  /** @override */
  buildCallback() {
    const config = JSON.parse(this.element.textContent);
    Services.assistjsConfigServiceForDoc(this.element).initializeConfigs(
      config
    );
  }
}

AMP.extension('amp-google-assistant-assistjs', '0.1', (AMP) => {
  AMP.registerServiceForDoc('assistjs-config-service', AssistjsConfigService);
  AMP.registerServiceForDoc('assistjs-frame-service', AssistjsFrameService);
  AMP.registerElement(
    'amp-google-assistant-assistjs-config',
    AmpGoogleAssistantAssistjsConfig,
    CSS
  );
  AMP.registerElement(
    'amp-google-assistant-voice-button',
    AmpGoogleAssistantVoiceButton,
    CSS
  );
  AMP.registerElement(
    'amp-google-assistant-voice-bar',
    AmpGoogleAssistantVoiceBar,
    CSS
  );
  AMP.registerElement(
    'amp-google-assistant-inline-suggestion-bar',
    AmpGoogleAssistantInlineSuggestionBar,
    CSS
  );
});
