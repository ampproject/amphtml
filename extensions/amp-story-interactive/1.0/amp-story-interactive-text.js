/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {
  Action,
  EmbeddedComponentState,
} from '../../amp-story/1.0/amp-story-store-service';
import {
  AmpStoryInteractive,
  InteractiveType,
} from './amp-story-interactive-abstract';
import {CSS} from '../../../build/amp-story-interactive-text-1.0.css';
import {htmlFor} from '../../../src/static-template';
import {setStyle} from '../../../src/style';

/**
 * Generates the template for the poll.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildPollTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-container">
      <div class="i-amphtml-story-interactive-prompt-container"></div>
      <div class="i-amphtml-story-interactive-input-container">
        <textarea
          class="i-amphtml-story-interactive-input"
          rows="1"
          oninput='this.style.height="0px";this.style.height = (this.scrollHeight) + "px"'
        ></textarea>
        <div class="i-amphtml-story-interactive-text-response"></div>
        <div class="i-amphtml-story-interacive-text-send">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="black"
            width="18px"
            height="18px"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </div>
      </div>
    </div>
  `;
};

export class AmpStoryInteractiveText extends AmpStoryInteractive {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element, InteractiveType.TEXT, [0, 0]);
  }

  /** @override */
  buildCallback() {
    return super.buildCallback(CSS);
  }

  /** @override */
  buildComponent() {
    this.element.setAttribute('interactive', '');
    this.rootEl_ = buildPollTemplate(this.element);
    const textArea = this.rootEl_.querySelector('textarea');
    this.attachPrompt_(this.rootEl_);
    textArea.placeholder = this.element.getAttribute('placeholder-text');
    textArea.onkeydown = (e) => {
      if (e.keyCode == 13) {
        this.sendText_(textArea.value);
      }
    };
    textArea.onkeyup = (unusedEvent) => {
      this.toggleSendButton_(textArea.value.length > 0);
    };
    this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-text-response'
    ).textContent = this.element.getAttribute('response-text');
    /iPhone/.test(navigator.platform) &&
      this.rootEl_.classList.add('i-amphtml-story-interative-iphone');
    return this.rootEl_;
  }

  /**
   * @override
   */
  layoutCallback() {
    const sendButton = this.rootEl_.querySelector(
      '.i-amphtml-story-interacive-text-send'
    );
    sendButton.onclick = () => {
      console.log('clicked');
    };
    console.log(sendButton.onclick);
    return super.layoutCallback();
  }

  /**
   * @override
   */
  updateOptionPercentages_(optionsData) {
    if (!optionsData) {
      return;
    }

    const percentages = this.preprocessPercentages_(optionsData);

    percentages.forEach((percentage, index) => {
      const currOption = this.getOptionElements()[index];
      currOption.querySelector(
        '.i-amphtml-story-interactive-option-percentage-text'
      ).textContent = `${percentage}`;
      setStyle(currOption, '--option-percentage', percentages[index] + '%');
    });
  }

  /**
   * Shows or hides the send button
   * @param {string} inputText
   * @param {boolean} toggle
   * @private
   */
  toggleSendButton_(toggle) {
    this.rootEl_.classList.toggle(
      'i-amphtml-story-interactive-can-send',
      toggle
    );
  }

  /**
   * Sends the text and disables responses
   * @param {string} inputText
   * @private
   */
  sendText_(inputText) {
    if (inputText.length == 0) {
      return;
    }
    this.rootEl_.classList.toggle(
      'i-amphtml-story-interactive-can-send',
      false
    );
    this.rootEl_.querySelector('textarea').disabled = true;
    this.storeService_.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, {
      state: EmbeddedComponentState.HIDDEN,
    });
    this.updateToPostSelectionState_();
  }

  /** @override */
  handleTap_(unusedEvent) {
    console.log('tapped');
  }
}
