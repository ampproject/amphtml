/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-fit-text-0.1.css';
import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import * as st from '../../../src/style';


/** @private @const {number} */
const LINE_HEIGHT_EM_ = 1.15;


class AmpFitText extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {

    /** @private @const */
    this.content_ = this.element.ownerDocument.createElement('div');
    this.applyFillContent(this.content_);
    this.content_.classList.add('i-amphtml-fit-text-content');
    st.setStyles(this.content_, {zIndex: 2});

    /** @private @const */
    this.contentWrapper_ = this.element.ownerDocument.createElement('div');
    st.setStyles(this.contentWrapper_, {lineHeight: `${LINE_HEIGHT_EM_}em`});
    this.content_.appendChild(this.contentWrapper_);

    /** @private @const */
    this.measurer_ = this.element.ownerDocument.createElement('div');
    // Note that "measurer" cannot be styled with "bottom:0".
    st.setStyles(this.measurer_, {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1,
      visibility: 'hidden',
      lineHeight: `${LINE_HEIGHT_EM_}em`,
    });

    this.getRealChildNodes().forEach(node => {
      this.contentWrapper_.appendChild(node);
    });
    this.measurer_./*OK*/innerHTML = this.contentWrapper_./*OK*/innerHTML;
    this.element.appendChild(this.content_);
    this.element.appendChild(this.measurer_);

    /** @private @const {number} */
    this.minFontSize_ = getLengthNumeral(this.element.getAttribute(
        'min-font-size')) || 6;

    /** @private @const {number} */
    this.maxFontSize_ = getLengthNumeral(this.element.getAttribute(
        'max-font-size')) || 72;
  }

  /** @override */
  prerenderAllowed() {
    return true;
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  layoutCallback() {
    this.updateFontSize_();
    return Promise.resolve();
  }

  /** @private */
  updateFontSize_() {
    const maxHeight = this.element./*OK*/offsetHeight;
    const maxWidth = this.element./*OK*/offsetWidth;
    const fontSize = calculateFontSize_(this.measurer_, maxHeight, maxWidth,
        this.minFontSize_, this.maxFontSize_);
    st.setStyle(this.contentWrapper_, 'fontSize', st.px(fontSize));
    updateOverflow_(this.contentWrapper_, this.measurer_, maxHeight,
        fontSize);
  }
}


/**
 * @param {!Element} measurer
 * @param {number} expectedHeight
 * @param {number} minFontSize
 * @param {number} maxFontSize
 * @return {number}
 * @private  Visible for testing only!
 */
export function calculateFontSize_(measurer, expectedHeight, expectedWidth,
    minFontSize, maxFontSize) {
  maxFontSize++;
  // Binomial search for the best font size.
  while (maxFontSize - minFontSize > 1) {
    const mid = Math.floor((minFontSize + maxFontSize) / 2);
    st.setStyle(measurer, 'fontSize', st.px(mid));
    const height = measurer./*OK*/offsetHeight;
    const width = measurer./*OK*/offsetWidth;
    if (height > expectedHeight || width > expectedWidth) {
      maxFontSize = mid;
    } else {
      minFontSize = mid;
    }
  }
  return minFontSize;
};


/**
 * @param {!Element} content
 * @param {!Element} measurer
 * @param {number} maxHeight
 * @param {number} fontSize
 * @private  Visible for testing only!
 */
export function updateOverflow_(content, measurer, maxHeight, fontSize) {
  st.setStyle(measurer, 'fontSize', st.px(fontSize));
  const overflown = measurer./*OK*/offsetHeight > maxHeight;
  const lineHeight = fontSize * LINE_HEIGHT_EM_;
  const numberOfLines = Math.floor(maxHeight / lineHeight);
  content.classList.toggle('i-amphtml-fit-text-content-overflown', overflown);
  st.setStyles(content, {
    lineClamp: overflown ? numberOfLines : '',
    maxHeight: overflown ? st.px(lineHeight * numberOfLines) : '',
  });
};


AMP.registerElement('amp-fit-text', AmpFitText, CSS);
