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
import {scopedQuerySelector, scopedQuerySelectorAll} from '#core/dom/query';

/**
 * Generates the template for the slider.
 *
 * @param {!Element} element
 * @return {!Element}
 */
/**
 * Handles a tap event on the quiz element.
 * @param {Event}
 * @protected
 */
const buildSliderTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-slider-container">
      <div class="i-amphtml-story-interactive-prompt-container"></div>
      <div class="i-amphtml-story-interactive-slider-input-container">
        <div class="i-amphtml-story-interactive-slider-field">
          <div class="i-amphtml-story-interactive-slidervalue">
            0
          </div>
        <div class="i-amphtml-story-interactive-slider-input-size">
          <input
            class="i-amphtml-story-interactive-slider-input"
            type="range"
            min="0"
            max="100"
            value="0"
          />
          <div class="i-amphtml-story-interactive-slider-sliderValue span">
          <span>50</span>
        </div>
          </div>
          <div class="i-amphtml-story-interactive-slidervalue">
            100
          </div>
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
  }
  /** @override */
  buildCallback() {
    return super.buildCallback(CSS);
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildSliderTemplate(this.element);
    this.attachPrompt_(this.rootEl_);
    const sliderValue = scopedQuerySelector(this.rootEl_, 'span');
    const inputSlider = scopedQuerySelector(this.rootEl_, 'input');
    const Slider = scopedQuerySelector(this.rootEl_, 'input');

    this.rootEl_.addEventListener('input', () => {
      console.log('running');
      let value = inputSlider.value;
      sliderValue.textContent = value;
      console.log(sliderValue);
      sliderValue.style.left = value + '%';
      sliderValue.classList.add('show');
      
    });
    function updateSlider(val) {
        Slider.style.setProperty("--percentage", val + "%");
    }
    Slider.addEventListener("input", () => {
        updateSlider(Slider.value);
    });
    return this.rootEl_;
  }
}
