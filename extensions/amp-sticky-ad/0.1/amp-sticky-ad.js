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

    const children = this.getRealChildren();
    user.assert((children.length == 1 && children[0].tagName == 'AMP-AD'),
        'amp-sticky-ad must have a single amp-ad child');
    /** @const @private {!Element} */
    this.ad_ = children[0];

    /** @private @const {!Viewport} */
    this.viewport_ = this.getViewport();

    /** @const @private {!Vsync} */
    this.vsync_ = this.getVsync();

    /** @const @private {!Unlisten}
     * On viewport scroll, check requirements for amp-stick-ad to display.
     */
    this.onScrollListener_ =
        this.viewport_.onScroll(() => this.displayAfterScroll());
  }

  /** @override */
  layoutCallback() {
    this.isExperimentOn_ = isExperimentOn(this.getWin(), TAG);
    if (!this.isExperimentOn_) {
      dev.warn(TAG, `TAG ${TAG} disabled`);
      return Promise.resolve();
    }
    return Promise.resolve();
  }

  /** @private
   * The listener function that listen on onScroll event and
   * show sticky ad when user scroll at least one viewport and
   * there is at least one more viewport available.
   */
  displayAfterScroll() {
    this.scrollTop_ = this.viewport_.getScrollTop();
    this.scrollHeight_ = this.viewport_.getScrollHeight();
    this.viewportHeight_ = this.viewport_.getSize().height;
    // TODO(zhouyx): When calculate 'has scrolled through at least 1 viewport'
    // do we want to count height from top or from initial position?
    // Will assume user start from `this.scrollTop_ = 0` here. Need
    // to figure out later.

    // Check user has scrolled at least one viewport from init position.
    if (this.viewportHeight_ < this.scrollTop_) {
      const remainHeight = this.scrollHeight_
          - this.scrollTop_ - this.viewportHeight_;
      if (remainHeight < this.viewportHeight_) {
        // TODO(zhouyx): Figure if early unlisten is needed earlier
        // if scrollHeight is less than 2*viewportHeight.
        this.onScrollListener_();
        this.onScrollListener_ = null;
        return;
      }
      this.deferMutate(() => {
        setStyles(this.element, {
          'display': 'block',
        });
        this.viewport_.addToFixedLayer(this.element);
        this.scheduleLayout(this.ad_);
        // Unlisten to onScroll event
        this.onScrollListener_();
        this.onScrollListener_ = null;
      });
    }
  }
}

AMP.registerElement('amp-sticky-ad', AmpStickyAd, CSS);
