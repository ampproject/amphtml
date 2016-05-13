/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-sticky-ad-0.1.css';
import {Layout} from '../../../src/layout';
import {dev} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {setStyles} from '../../../src/style';

/** @const */
const TAG = 'amp-sticky-ad';

class AmpStickyAd extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    /** @const @private {boolean} */
    this.isExperimentOn_ = isExperimentOn(this.getWin(), TAG);
    if (!this.isExperimentOn_) {
      dev.warn(TAG, `TAG ${TAG} disabled`);
      return;
    }

    // Check `amp-sticky-ad` only have one child with tagName `amp-ad`.
    this.getRealChildren_ = this.getRealChildren();
    if (this.getRealChildren_.length != 1 ||
        this.getRealChildren_[0].tagName != 'AMP-AD') {
      return;
    }

    /** @private @const {!Viewport} */
    this.viewport_ = this.getViewport();

    /** @private {boolean} */
    this.isDisplayed_ = false;

    /** @private {number} */
    this.initialScrollTop_ = null;

    /** @const @private {!Vsync} */
    this.vsync_ = this.getVsync();

    // On viewport scroll, check requirements for amp-stick-ad to display.
    this.viewport_.onScroll(() => this.displayAfterScroll());
  }

  /** @override */
  layoutCallback() {
    this.isExperimentOn_ = isExperimentOn(this.getWin(), TAG);
    if (!this.isExperimentOn_) {
      dev.warn(TAG, `TAG ${TAG} disabled`);
      return Promise.resolve();
    }
    this.scheduleLayout(this.getRealChildren_);
    return Promise.resolve();
  }

  // The sticky ad is shown when user scroll at least one viewport and
  // there is at least one more viewport available.
  displayAfterScroll() {
    if (!this.isDisplayed_) {
      this.scrollTop_ = this.viewport_.getScrollTop();
      this.scrollHeight_ = this.viewport_.getScrollHeight();
      this.viewportHeight_ = this.viewport_.getSize().height;
      if (!this.initialScrollTop_) {
        this.initialScrollTop_ = this.scrollTop_;
      }
      const scrollDist =
          (this.scrollTop_ - this.initialScrollTop_);
      // Check user has scrolled at least one viewport from init position.
      if (this.viewportHeight_ < Math.abs(scrollDist)) {
        if (scrollDist < 0) {
          // In the case of scrolling up.
          if (this.viewport_.getScrollTop() < this.viewportHeight_) {
            // TODO: Discuss on what need to be done when direction changes.
            this.initialScrollTop_ = this.viewport_.getScrollTop();
            return;
          }
        } else {
          // In the case of scrolling down.
          const remainHeight = this.scrollHeight_
              - this.viewport_.getScrollTop() - this.viewportHeight;
          if (remainHeight < this.viewportHeight_) {
            // TODO: Discuss on what need to be done when direction changes.
            this.initialScrollTop_ = this.viewport_.getScrollTop();
            return;
          }
        }
        this.isDisplayed_ = true;
        this.vsync_.mutate(() => {
          setStyles(this.element, {
            'display': 'block',
          });
          this.viewport_.addToFixedLayer(this.element);
          this.scheduleLayout(this.element);
        });
      }
    }
  }
}

AMP.registerElement('amp-sticky-ad', AmpStickyAd, CSS);
