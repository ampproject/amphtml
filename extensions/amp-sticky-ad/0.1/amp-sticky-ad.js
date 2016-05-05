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
import {vsyncFor} from '../../../src/vsync';

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
    this.viewport_ = this.getViewport();
    if (!this.isExperimentOn_) {
      dev.warn(TAG, `TAG ${TAG} disabled`);
      return;
    }
    this.viewport_ = this.getViewport();
    this.isDisplayed_ = false;
    this.initialScrollTop_ = this.viewport_.getScrollTop();
    this.scrollHeight_ = this.viewport_.getScrollHeight();
    this.viewportHeight_ =  this.viewport_.getSize().height;
    /** @const @private {!Vsync} */
    this.vsync_ = vsyncFor(this.getWin());
    this.viewport_.onScroll(() => {
      console.log("onscroll");
      if(!this.isDisplayed_) {
        console.log("not displayed yet");
        console.log('getScrollTop is ' ,this.viewport_.getScrollTop());
        console.log('initialScrollTop')
        const scrollDist = (this.viewport_.getScrollTop() - this.initialScrollTop_);
        console.log('scrollDist is ', scrollDist);
        if(this.viewportHeight_ < Math.abs(scrollDist)) {
          console.log("should display!");
          // scroll down
          if (scrollDist < 0) {
            console.log('remain space ',this.viewport_.getScrollTop());
            console.log('viewportheight', this.viewportHeight_);
            if(this.viewport_.getScrollTop() < this.viewportHeight_) {
              console.log('not enough space');
              this.initialScrollTop_ = this.viewport_.getScrollTop();
              return;
            }
          } /* scroll up*/else {
            const remainHeight = this.scrollHeight - this.viewport_.getScrollTop()
              - this.viewportHeight;
            if (remainHeight < this.viewportHeight_) {
              this.initialScrollTop_ = this.viewport_.getScrollTop();
              return;
            }
          }
          this.isDisplayed_ = true;
          this.element.style.display = 'block';
          this.vsync_.mutate(() => {
            setStyles(this.element, {
              'display': 'block',
            });
            this.viewport_.addToFixedLayer(this.element);
            this.scheduleLayout(this.getRealChildren());
          });
        }
      }
    });
  }

  layoutCallback() {
    this.isExperimentOn_ = isExperimentOn(this.getWin(), EXPERIMENT);
    if (!this.isExperimentOn_) {
      dev.warn(TAG, `Experiment ${EXPERIMENT} disabled`);
      return Promise.resolve();
    }
    this.scheduleLayout(this.element.firstElementChild);
    this.updateInViewport(this.element.firstElementChild, true);
    return Promise.resolve();
  }
}

AMP.registerElement('amp-sticky-ad', AmpStickyAd, CSS);
