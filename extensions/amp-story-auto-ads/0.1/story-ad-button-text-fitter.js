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

import {Services} from '../../../src/services';
import {px, setStyle, setStyles} from '../../../src/style';

/** @enum {number} From design spec. */
const FontSizes = {
  MIN: 12,
  MAX: 14,
};

export class ButtonTextFitter {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/resources-interface.ResourcesInterface} */
    this.resources_ = Services.resourcesForDoc(ampdoc);

    /** @private {!Document} */
    this.doc_ = ampdoc.win.document;

    /** @private {!Element} */
    this.measurer_ = this.doc_.createElement('div');

    /** @private {number} */
    this.maxHeight_ = 32; // Fixed button height from design spec.

    this.resources_.mutateElement(this.measurer_, () => {
      this.doc_.body.appendChild(this.measurer_);
      setStyles(this.measurer_, {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        visibility: 'hidden',
      });
    });
  }

  /**
   * @param {!Element} pageElement
   * @param {!Element} container
   * @param {string} content
   * @return {Promise<boolean>}
   */
  fit(pageElement, container, content) {
    let success = false;
    return this.resources_
      .mutateElement(container, () => {
        this.measurer_.textContent = content;
        const fontSize = calculateFontSize(
          this.measurer_,
          this.maxHeight_,
          this.getMaxWidth_(pageElement),
          // Less than real min so that we can find text that is too long.
          FontSizes.MIN - 1,
          FontSizes.MAX
        );
        if (fontSize >= FontSizes.MIN) {
          this.updateFontSize_(container, fontSize);
          success = true;
        }
      })
      .then(() => {
        return success;
      });
  }

  /**
   * Called on each button creation, in case of window resize.
   * Page width - (2 x 32px of padding on each side) + (2 x 10px padding on button).
   * @param {!Element} pageElement
   * @return {number}
   * @private
   */
  getMaxWidth_(pageElement) {
    return pageElement./*OK*/ offsetWidth - 84;
  }

  /**
   * @param {!Element} container
   * @param {number} fontSize
   */
  updateFontSize_(container, fontSize) {
    setStyle(container, 'fontSize', px(fontSize));
  }
}

/**
 * Stolen from amp-fit-text.js
 * @param {Element} measurer
 * @param {number} expectedHeight
 * @param {number} expectedWidth
 * @param {number} minFontSize
 * @param {number} maxFontSize
 * @return {number}
 */
function calculateFontSize(
  measurer,
  expectedHeight,
  expectedWidth,
  minFontSize,
  maxFontSize
) {
  maxFontSize++;
  // Binomial search for the best font size.
  while (maxFontSize - minFontSize > 1) {
    const mid = Math.floor((minFontSize + maxFontSize) / 2);
    setStyle(measurer, 'fontSize', px(mid));
    const height = measurer./*OK*/ offsetHeight;
    const width = measurer./*OK*/ offsetWidth;
    if (height > expectedHeight || width > expectedWidth) {
      maxFontSize = mid;
    } else {
      minFontSize = mid;
    }
  }
  return minFontSize;
}
