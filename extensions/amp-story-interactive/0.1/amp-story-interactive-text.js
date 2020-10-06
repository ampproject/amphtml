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
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';
import {
  AmpStoryInteractive,
  InteractiveType,
} from './amp-story-interactive-abstract';
import {CSS} from '../../../build/amp-story-interactive-text-0.1.css';
import {closest} from '../../../src/dom';
import {dev} from '../../../src/log';
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
        <input class="i-amphtml-story-interactive-input" />
        <div class="i-amphtml-story-interactive-text-response"></div>
        <div class="i-amphtml-story-interacive-text-send">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="black"
            width="18px"
            height="18px"
          ></svg>
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

    this.expanded = false;
  }

  /** @override */
  buildCallback() {
    return super.buildCallback(CSS);
  }

  /** @override */
  buildComponent() {
    this.element.setAttribute('interactive', '');
    this.rootEl_ = buildPollTemplate(this.element);
    this.input = this.rootEl_.querySelector('input');
    this.attachPrompt_(this.rootEl_);
    this.input.placeholder = this.element.getAttribute('placeholder-text');
    this.input.onkeydown = (e) => {
      if (e.key == 'Enter') {
        this.sendText_(this.input.value);
      }
    };
    this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-text-response'
    ).textContent = this.element.getAttribute('response-text');
    const type = this.element.getAttribute('input-type') || 'text';
    if (type == 'number') {
      this.input.setAttribute('inputmode', 'numeric');
      this.input.setAttribute('pattern', '/d*');
    }
    this.input.setAttribute('type', type);
    return this.rootEl_;
  }

  /** @private
   * @return {!Element}
   */
  buildFakeInput_() {
    const html = htmlFor(this.element);
    const fakeInput = html`
      <div style="height:100%;pointer-events:none">
        <input
          type="text"
          readonly="true"
          style="width:0;height:0;left:50%;position:absolute;top:50%;opacity:0"
        />
      </div>
    `;
    const thisPage = closest(dev().assertElement(this.element), (el) => {
      return el.tagName.toLowerCase() === 'amp-story-page';
    });
    thisPage.appendChild(fakeInput);
    return fakeInput;
  }

  /**
   * @override
   */
  layoutCallback() {
    // const sendButton = this.rootEl_.querySelector(
    //   '.i-amphtml-story-interacive-text-send'
    // );
    // sendButton.onclick = () => {
    //   console.log('clicked');
    // };
    // console.log(sendButton.onclick);
    this.rootEl_
      .querySelector('.i-amphtml-story-interactive-input-container')
      .addEventListener(
        'click',
        (unusedEvent) => {
          const fakeInput = this.buildFakeInput_();
          fakeInput.querySelector('input').focus();
          // this.input.focus();
          setTimeout(() => {
            this.input.focus();
            fakeInput.remove();
          }, 500);
        },
        true
      );

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
   * Sends the text and disables responses
   * @private
   */
  sendText_() {
    if (this.input.length == 0) {
      return;
    }
    this.rootEl_.classList.toggle(
      'i-amphtml-story-interactive-can-send',
      false
    );
    this.updateToPostSelectionState_();
    this.input.blur();
    this.input.disabled = true;
    setTimeout(
      () =>
        this.storeService_.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, {
          state: EmbeddedComponentState.HIDDEN,
        }),
      500
    );
  }

  /** @override */
  handleTap_(unusedEvent) {
    console.log('tapped');
  }
}
