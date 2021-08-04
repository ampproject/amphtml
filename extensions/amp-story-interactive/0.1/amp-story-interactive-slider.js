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
          <div class="i-amphtml-story-interactive-slider-bubble"></div>
          <div
            class="i-amphtml-story-interactive-slider-average-indicator"
          ></div>
          <div class="i-amphtml-story-interactive-slider-average-text">
            Average answer
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * @const @enum {number}
 */
const SliderType = {
  PERCENTAGE: 'percentage',
  EMOJI: 'emoji',
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
    /** @private {!SliderType}  */
    this.sliderType_ = SliderType.PERCENTAGE;
  }

  /** @override */
  displayOptionsData(responseData) {
    const average = this.calculateWeightedAverage_(responseData);
    setImportantStyles(this.rootEl_, {'--average': average + '%'});
  }

  /**
   * @private
   * @param {!Array<!InteractiveOptionType>} responseData
   * @return {number}
   */
  calculateWeightedAverage_(responseData) {
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < responseData.length; i++) {
      numerator += responseData[i].index * responseData[i].count;
      denominator += responseData[i].count;
    }
    if (denominator == 0) {
      return 0;
    }
    return numerator / denominator;
  }

  /** @override*/
  updateComponentWithData(data) {
    this.optionsData_ = this.orderData_(data);
    this.optionsData_.forEach((response) => {
      if (response.selected) {
        this.hasUserSelection_ = true;
        this.mutateElement(() => {
          this.inputEl_.value = response.index;
          this.onDrag_();
          this.onRelease_();
          this.updateToPostSelectionState_(null);
        });
      }
    });
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

    if (this.options_.length > 0) {
      this.sliderType_ = SliderType.EMOJI;
      const emojiWrapper = this.win.document.createElement('span');
      emojiWrapper.textContent = this.options_[0].text;
      this.bubbleEl_.appendChild(emojiWrapper);
    }
    this.rootEl_.setAttribute('type', this.sliderType_);
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

    this.inputEl_.addEventListener(
      'touchmove',
      (event) => event.stopPropagation(),
      true
    );
  }

  /**
   * @private
   */
  onDrag_() {
    const {value} = this.inputEl_;
    if (this.sliderType_ == SliderType.PERCENTAGE) {
      this.bubbleEl_.textContent = value + '%';
    }
    this.rootEl_.classList.add('i-amphtml-story-interactive-mid-selection');
    setImportantStyles(this.rootEl_, {'--fraction': value / 100});
  }

  /**
   * @private
   */
  onRelease_() {
    this.updateToPostSelectionState_();
    this.inputEl_.setAttribute('disabled', '');
    this.rootEl_.classList.remove('i-amphtml-story-interactive-mid-selection');
    this.handleOptionSelection_(Math.round(this.inputEl_.value));
  }

  /**@override */
  getNumberOfOptions() {
    return 101;
  }
}
