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

import {BrowsiUtils} from './BrowsiUtils';
import {sendPublisherAdViewed} from './eventService';

export class BrowsiViewability {
  /**
   * @param {!Element} ad
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
   * **/
  constructor(ad, ampDoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampDoc_ = ampDoc;
    /** @private {IntersectionObserver} */
    this.observer_ = null;
    /** @private number*/
    this.viewableTime_ = 1000;
    /** @private null|Date*/
    this.startTime_ = null;
    /** @private Element*/
    this.ad_ = ad;
    /** @private null|Timer*/
    this.viewabilityInterval_ = null;
    // /** @private boolean */
    // this.viewed_ = false;
    /** @private Object*/
    this.options_ = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    this.observe();
  }

  /**
   * Start observing element
   */
  observe() {
    this.observer_ = new IntersectionObserver(
      this.handleObserveChange.bind(this),
      this.options_
    );
    this.observer_.observe(this.ad_);
  }

  /**
   * Triggered each time the element (ad) is in or out of view according to configurations
   * also fires once when initialized
   * @param {Array} entries
   * */
  handleObserveChange(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!this.startTime_) {
          this.startTime_ = Date.now();
        }
        this.countForViewability();
      } else {
        this.handleNotInView();
      }
    });
  }

  /**
   * Report ad viewed
   */
  reportViewed() {
    this.resetInterval();
    this.observer_.disconnect();
    // this.viewed_ = true;
    const adData = BrowsiUtils.buildAdData(this.ad_, this.ampDoc_, {});
    sendPublisherAdViewed(adData);
  }

  /**
   * Get viewd duration ms
   * @return {number}
   */
  getViewedDuration() {
    return this.startTime_ ? Date.now() - this.startTime_ : -1;
  }

  /**
   * Fired when ad goes out of view
   */
  handleNotInView() {
    this.resetInterval();
    this.startTime_ = null;
  }

  /**
   * Count time in view
   * Fires when ad is in view
   * If view time > 1s => report viewed
   */
  countForViewability() {
    if (!this.viewabilityInterval_) {
      this.viewabilityInterval_ = setInterval(() => {
        if (this.getViewedDuration() > this.viewableTime_) {
          this.reportViewed();
        }
      }, 50);
    }
  }

  /**
   * Reset in view counter
   */
  resetInterval() {
    clearInterval(this.viewabilityInterval_);
    this.viewabilityInterval_ = null;
  }
}
