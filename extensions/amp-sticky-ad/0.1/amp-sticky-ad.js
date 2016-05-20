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
import {dev, user} from '../../../src/log';
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

    /**
     * On viewport scroll, check requirements for amp-stick-ad to display.
     * @const @private {!Unlisten}
     */
    this.scrollUnlisten_ =
        this.viewport_.onScroll(() => this.displayAfterScroll_());
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

  /** @override */
  detachedCallback() {
    this.removeOnScrollListener_();
  }

  /**
   * The function that remove listener to viewport onScroll event.
   * @private
   */
  removeOnScrollListener_() {
    if (this.scrollUnlisten_) {
      this.scrollUnlisten_();
      this.scrollUnlisten_ = null;
    }
  }

  /**
   * The listener function that listen on onScroll event and
   * show sticky ad when user scroll at least one viewport and
   * there is at least one more viewport available.
   * @private
   */
  displayAfterScroll_() {
    const scrollTop = this.viewport_.getScrollTop();
    const viewportHeight = this.viewport_.getSize().height;
    const scrollHeight = this.viewport_.getScrollHeight();
    if (scrollHeight < viewportHeight * 2) {
      this.removeOnScrollListener_();
      return;
    }

    // Check user has scrolled at least one viewport from init position.
    if (scrollTop > viewportHeight) {
      this.deferMutate(() => {
        setStyles(this.element, {
          'display': 'block',
        });
        this.viewport_.addToFixedLayer(this.element);
        this.scheduleLayout(this.ad_);
        this.removeOnScrollListener_();
      });
    }
  }
}

AMP.registerElement('amp-sticky-ad', AmpStickyAd, CSS);
