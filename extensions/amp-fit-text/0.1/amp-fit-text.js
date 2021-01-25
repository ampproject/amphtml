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
import {px, setStyle, setStyles} from '../../../src/style';
import {throttle} from '../../../src/utils/rate-limit';

const TAG = 'amp-fit-text';
const LINE_HEIGHT_EM_ = 1.15;
const RESIZE_THROTTLE_MS = 100;

class AmpFitText extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.content_ = null;

    /** @private {?Element} */
    this.contentWrapper_ = null;

    /** @private {?Element} */
    this.measurer_ = null;

    /** @private {number} */
    this.minFontSize_ = -1;

    /** @private {number} */
    this.maxFontSize_ = -1;

    /** @private {?UnlistenDef} */
    this.resizeObserverUnlistener_ = null;

    /**
     * Synchronously stores updated textContent, but only after it has been
     * updated.
     * @private {string}
     */
    this.textContent_ = '';
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.content_ = this.element.ownerDocument.createElement('div');
    this.applyFillContent(this.content_);
    this.content_.classList.add('i-amphtml-fit-text-content');
    setStyles(this.content_, {zIndex: 2});

    this.contentWrapper_ = this.element.ownerDocument.createElement('div');
    setStyles(this.contentWrapper_, {lineHeight: `${LINE_HEIGHT_EM_}em`});
    this.content_.appendChild(this.contentWrapper_);

    this.measurer_ = this.element.ownerDocument.createElement('div');
    // Note that "measurer" cannot be styled with "bottom:0".
    setStyles(this.measurer_, {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1,
      visibility: 'hidden',
      lineHeight: `${LINE_HEIGHT_EM_}em`,
    });

    this.getRealChildNodes().forEach((node) => {
      this.contentWrapper_.appendChild(node);
    });
    this.updateMeasurerContent_();
    this.element.appendChild(this.content_);
    this.element.appendChild(this.measurer_);

    this.minFontSize_ =
      getLengthNumeral(this.element.getAttribute('min-font-size')) || 6;

    this.maxFontSize_ =
      getLengthNumeral(this.element.getAttribute('max-font-size')) || 72;

    // Make it so that updates to the textContent of the amp-fit-text element
    // actually update the text of the content element.
    Object.defineProperty(this.element, 'textContent', {
      set: (v) => {
        this.textContent_ = v;
        this.mutateElement(() => {
          this.contentWrapper_.textContent = v;
          this.updateMeasurerContent_();
          this.updateFontSize_();
        });
      },
      get: () => {
        return this.textContent_ || this.contentWrapper_.textContent;
      },
    });
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
    if (this.win.ResizeObserver && this.resizeObserverUnlistener_ === null) {
      const observer = new this.win.ResizeObserver(
        throttle(
          this.win,
          () =>
            this.mutateElement(() => {
              this.updateMeasurerContent_();
              this.updateFontSize_();
            }),
          RESIZE_THROTTLE_MS
        )
      );

      observer.observe(this.content_);
      observer.observe(this.measurer_);
      this.resizeObserverUnlistener_ = function () {
        observer.disconnect();
      };
    }
    return this.mutateElement(() => {
      this.updateFontSize_();
    });
  }

  /** @override */
  unlayoutCallback() {
    if (this.resizeObserverUnlistener_ !== null) {
      this.resizeObserverUnlistener_();
      this.resizeObserverUnlistener_ = null;
    }
  }

  /**
   * Copies text from the displayed content to the measurer element.
   */
  updateMeasurerContent_() {
    this.measurer_./*OK*/ innerHTML = this.contentWrapper_./*OK*/ innerHTML;
  }

  /** @private */
  updateFontSize_() {
    const maxHeight = this.content_./*OK*/ offsetHeight;
    const maxWidth = this.content_./*OK*/ offsetWidth;
    const fontSize = calculateFontSize_(
      this.measurer_,
      maxHeight,
      maxWidth,
      this.minFontSize_,
      this.maxFontSize_
    );
    setStyle(this.contentWrapper_, 'fontSize', px(fontSize));
    updateOverflow_(this.contentWrapper_, this.measurer_, maxHeight, fontSize);
  }
}

/**
 * @param {Element} measurer
 * @param {number} expectedHeight
 * @param {number} expectedWidth
 * @param {number} minFontSize
 * @param {number} maxFontSize
 * @return {number}
 * @private  Visible for testing only!
 */
export function calculateFontSize_(
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

/**
 * @param {Element} content
 * @param {Element} measurer
 * @param {number} maxHeight
 * @param {number} fontSize
 * @private  Visible for testing only!
 */
export function updateOverflow_(content, measurer, maxHeight, fontSize) {
  setStyle(measurer, 'fontSize', px(fontSize));
  const overflown = measurer./*OK*/ offsetHeight > maxHeight;
  const lineHeight = fontSize * LINE_HEIGHT_EM_;
  const numberOfLines = Math.floor(maxHeight / lineHeight);
  content.classList.toggle('i-amphtml-fit-text-content-overflown', overflown);
  setStyles(content, {
    lineClamp: overflown ? numberOfLines : '',
    maxHeight: overflown ? px(lineHeight * numberOfLines) : '',
  });
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpFitText, CSS);
});
