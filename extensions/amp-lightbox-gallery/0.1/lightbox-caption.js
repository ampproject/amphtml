/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {dev} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';

/**
 * @enum {string}
 */
export const OverflowState = {
  NONE: 'none',
  CLIP: 'clip',
  EXPAND: 'expand',
};

/**
 * Manages lightbox captions, handling expansion and collapsing.
 */
export class LightboxCaption {
  /**
   * @param {!Document} doc
   * @param {function(function(), function())} measureMutateElement
   * @return {!LightboxCaption} A LightboxCaption instance.
   */
  static build(doc, measureMutateElement) {
    const el = htmlFor(doc)`
      <div class="i-amphtml-lbg-caption">
        <div class="i-amphtml-lbg-caption-scroll">
          <div class="i-amphtml-lbg-caption-text"></div>
        </div>
        <div class="i-amphtml-lbg-caption-mask"></div>
      </div>`;
    return new LightboxCaption(
      el,
      dev().assertElement(el.querySelector('.i-amphtml-lbg-caption-scroll')),
      dev().assertElement(el.querySelector('.i-amphtml-lbg-caption-text')),
      dev().assertElement(el.querySelector('.i-amphtml-lbg-caption-mask')),
      measureMutateElement
    );
  }

  /**
   * @param {!Element} element
   * @param {!Element} scrollContainer
   * @param {!Element} textContainer
   * @param {!Element} overflowMask
   * @param {function(function(), function())} measureMutateElement
   */
  constructor(
    element,
    scrollContainer,
    textContainer,
    overflowMask,
    measureMutateElement
  ) {
    /** @private @const */
    this.element_ = element;

    /** @private @const */
    this.scrollContainer_ = scrollContainer;

    /** @private @const */
    this.textContainer_ = textContainer;

    /** @private @const */
    this.overflowMask_ = overflowMask;

    /** @private @const */
    this.measureMutateElement_ = measureMutateElement;
  }

  /**
   * @return {!Element} The description box Element.
   */
  getElement() {
    return this.element_;
  }

  /**
   * @param {string} content The content for the caption.
   */
  setContent(content) {
    this.textContainer_./*OK*/ innerText = content;
  }

  /**
   * @param {!OverflowState} state
   */
  setOverflowState(state) {
    this.scrollContainer_.setAttribute('i-amphtml-lbg-caption-state', state);
  }

  /**
   * @return {!OverflowState} state
   */
  getOverflowState() {
    return /** @type {OverflowState} */ (this.scrollContainer_.getAttribute(
      'i-amphtml-lbg-caption-state'
    ));
  }

  /**
   * Gets the `OverflowState` to use,
   * @param {string} overflowState The current overflow state.
   * @param {boolean} overflows Whether or not the description overflows its
   *    container.
   * @param {boolean=} requestExpansion The requested expansion state.
   * @return {!OverflowState} The new state.
   * @private
   */
  nextOverflowState_(overflowState, overflows, requestExpansion) {
    const isExpanded = overflowState == OverflowState.EXPAND;
    const expand =
      requestExpansion !== undefined ? requestExpansion : !isExpanded;
    // If we are already expanded, we know we have some overflow, even if
    // we are not currently "overflowing".
    const hasOverflow = isExpanded || overflows;

    if (!hasOverflow) {
      return OverflowState.NONE;
    }

    return expand ? OverflowState.EXPAND : OverflowState.CLIP;
  }

  /**
   * Toggles the description overflow state.
   * @param {boolean=} requestExpansion If specified, whether the
   *    description should be expanded or collapsed. If not specfied, the
   *    current state is toggled.
   */
  toggleOverflow(requestExpansion) {
    const {scrollContainer_, overflowMask_} = this;
    let descriptionOverflows;

    const measureOverflowState = () => {
      // The height of the description without overflow is set to 4 rem.
      // The height of the overflow mask is set to 1 rem. We allow 3 lines
      // for the description and consider it to have overflow if more than 3
      // lines of text.
      descriptionOverflows =
        scrollContainer_./*OK*/ scrollHeight -
          scrollContainer_./*OK*/ clientHeight >=
        overflowMask_./*OK*/ clientHeight;
    };

    const mutateOverflowState = () => {
      const overflowState = this.getOverflowState();
      const newState = this.nextOverflowState_(
        overflowState,
        descriptionOverflows,
        requestExpansion
      );

      this.setOverflowState(newState);
      if (newState != OverflowState.EXPAND) {
        scrollContainer_./*OK*/ scrollTop = 0;
      }
    };

    this.measureMutateElement_(measureOverflowState, mutateOverflowState);
  }
}
