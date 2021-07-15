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

import {
  AmpStoryInteractive,
  InteractiveType,
} from './amp-story-interactive-abstract';
import {CSS} from '../../../build/amp-story-interactive-slider-0.1.css';
import {htmlFor} from '#core/dom/static-template';
//import {scopedQuerySelector, scopedQuerySelectorAll} from '#core/dom/query';
import {setImportantStyles} from '#core/dom/style';

/**
 * Generates the template for the slider.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildSliderTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-slider-container">
      <div class="i-amphtml-story-interactive-prompt-container"></div>
      <div class="i-amphtml-story-interactive-slider-input-container">
        <div class="i-amphtml-story-interactive-slider-input-size">
          <input
            class="i-amphtml-story-interactive-slider-input"
            type="range"
            min="0"
            max="100"
            value="0"
          />
          <div class="i-amphtml-story-interactive-slider-bubble">50</div>
        </div>
      </div>
    </div>
  `;
};

export class AmpStoryInteractiveSlider extends AmpStoryInteractive {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element, InteractiveType.SLIDER, [0, 1]);
    /** @private {?Element} bubble containing the current selection of the user while dragging */
    this.bubbleEl_ = null;
    /** @private {?Element} tracks user input */
    this.inputEl_ = null;
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildSliderTemplate(this.element);
    this.bubbleEl_ = this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-slider-bubble'
    );
    this.inputEl_ = this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-slider-input'
    );
    this.attachPrompt_(this.rootEl_);
    return this.rootEl_;
  }

  /** @override */
  buildCallback() {
    return super.buildCallback(CSS);
  }

  /** @override */
  initializeListeners_() {
    super.initializeListeners_();

    this.inputEl_.addEventListener('input', () => {
      this.onDrag_();
    });
    this.inputEl_.addEventListener('change', () => {
      this.onRelease_();
    });
  }

  /**
   * @private
   */
  onDrag_() {
    const {value} = this.inputEl_;
    this.bubbleEl_.textContent = value + '%';
    this.bubbleEl_.classList.add('show');
    setImportantStyles(this.rootEl_, {
      '--pct-0-to-1-decimal': value * 0.01,
    });
  }

  /**
   * @private
   */
  onRelease_() {
    this.updateToPostSelectionState_();
    this.inputEl_.setAttribute('disabled', '');
    this.bubbleEl_.classList.remove('show');
  }
}
