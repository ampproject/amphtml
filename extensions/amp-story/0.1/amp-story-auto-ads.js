/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {StateChangeType} from './navigation-state';
import {dev, user} from '../../../src/log';

// temp before config in passed in
/** @const */
const MIN_INTERVAL = 3;

/** @const */
const MAX_NUMBER = 2;

/** @const */
// const EXPERIMENT = 'amp-story-auto-ad';

/** @const */
const TAG = 'amp-story-auto-ads';

export class AmpStoryAutoAds extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?./amp-story.AmpStory} */
    this.ampStory_ = null;

    /** @private {?./navigation-state.NavigationState} */
    this.navigationState_ = null;

    /** @private {number} */
    this.interactions_ = 0;

    /** @private {!Array} */
    this.adElements_ = [];

    /** @private {number} */
    this.adsPlaced_ = 0;
  }

  /** @override */
  buildCallback() {
    const ampStoryElement = this.element.parentElement;
    user().assert(ampStoryElement.tagName === 'AMP-STORY',
        `<${TAG}> should be child of <amp-story>`);

    ampStoryElement.getImpl().then(impl => {
      this.ampStory_ = impl;
      this.navigationState_ = this.ampStory_.getNavigationState();
      this.navigationState_.observe(this.handleStateChange_.bind(this));
    });
  }


  /** @override */
  isLayoutSupported() {
    return true;
  }


  /** @override */
  layoutCallback() {
    this.schedulePage_();
    return Promise.resolve();
  }

  /**
   * build page and start preloading
   * @private
   */
  schedulePage_() {
    this.fetchData_()
        .then(data => {
          const page = this.makeMockPage(data);
          this.adElements_.push(page);

          this.ampStory_.element.appendChild(page);

          // TODO(ccordry): need to fake distance from page to force load

          page.getImpl().then(impl => {
            this.ampStory_.addPage(impl);
          });
        });
  }

  /**
   * fetch remote data
   * @private
   */
  fetchData_() {
    const id = this.adsPlaced_ + 1;
    const data = `
      <amp-story-grid-layer template="vertical">
      <h1>Ad Page #${id}</h1>
      <p>This is ad #${id} shown in this story.</p>
      </amp-story-grid-layer>
    `;
    return Promise.resolve(data);
  }


  /**
   * temporary to be replaced with real fetching
   */
  makeMockPage(data) {
    const id = this.adsPlaced_ + 1;
    const ampStoryAdPage = document.createElement('amp-story-page');
    ampStoryAdPage.id = `i-amphtml-ad-page-${id}`;
    ampStoryAdPage.setAttribute('ad', '');
    ampStoryAdPage./*OK*/innerHTML = data;
    return ampStoryAdPage;
  }


  /**
   * Get array containing all pages of associated story
   * @private
   */
  handleStateChange_(stateChangeEvent) {
    switch (stateChangeEvent.type) {
      case StateChangeType.ACTIVE_PAGE:
        const {pageIndex, pageId} = stateChangeEvent.value;
        this.handleActivePageChange_(
            dev().assertNumber(pageIndex),
            dev().assertString(pageId));
        break;
    }
  }


  /**
   * @param {number} pageIndex
   * @param {string} pageId
   * @private
   */
  handleActivePageChange_(pageIndex, pageId) {
    this.interactions_++;
    // temp before config in passed in
    if (this.interactions_ > MIN_INTERVAL && !this.allAdsPlaced_()) {
      this.placeAdAfterPage_(pageId);
      this.interactions_ = 0;
    }
  }

  /**
   * @return {boolean}
   * @private
   */
  allAdsPlaced_() {
    return this.adsPlaced_ >= MAX_NUMBER;
  }


  /**
   * Place ad based on user config
   * @param {string} currentPageId
   * @private
   */
  placeAdAfterPage_(currentPageId) {
    // TODO(ccordry) make sure ad is loaded
    const nextAdElement = this.adElements_[this.adElements_.length - 1];

    if (!nextAdElement) {
      return;
    }

    this.ampStory_.insertPage(currentPageId, nextAdElement.id);
    this.adsPlaced_++;

    if (!this.allAdsPlaced_()) {
      this.schedulePage_();
    }
  }
}

AMP.registerElement(TAG, AmpStoryAutoAds);


