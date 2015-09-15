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

import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import * as st from '../../../src/style';


class AmpFitText extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  isReadyToBuild() {
    return this.element.firstChild != null;
  }

  /** @override */
  buildCallback() {
    var childNodes = this.getRealChildNodes();

    /** @private @const */
    this.content_ = document.createElement('div');
    this.applyFillContent(this.content_);
    this.content_.classList.add('-amp-fit-text-content');
    st.setStyles(this.content_, {zIndex: 2});

    /** @private @const */
    this.measurer_ = document.createElement('div');
    // Note that "measurer" cannot be styled with "bottom:0".
    st.setStyles(this.measurer_, {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
      visibility: 'hidden'
    });

    this.getRealChildNodes().forEach((node) => {
      this.content_.appendChild(node);
    });
    this.measurer_.innerHTML = this.content_.innerHTML;
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
    let min = this.minFontSize_;
    let max = this.maxFontSize_;
    let expectedHeight = this.element.offsetHeight;

    // Binomial search for the best font size.
    while (max - min > 1) {
      let mid = Math.round((min + max) / 2);
      this.measurer_.style.fontSize = st.px(mid);
      let height = this.measurer_.offsetHeight;
      if (height > expectedHeight) {
        max = mid;
      } else {
        min = mid;
      }
    }

    // TODO(dvoytenko): Add ellipsis if the content is still bigger than
    // the available size. Ensure that basic tags are supported when
    // doing the truncation?

    this.content_.style.fontSize = st.px(min);
  }
}

AMP.registerElement('amp-fit-text', AmpFitText, $CSS$);
