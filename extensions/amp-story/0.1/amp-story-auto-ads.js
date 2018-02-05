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

/** @const */
// temp before config in passed in
const MIN_INTERVAL = 3;
// const MAX_NUMBER = 3;

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
    this.adIdPointer_ = 0;

    /** @private {?Array} */
    this.pages_ = null;
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

    // TODO(ccordry): move this chunk to layoutCallback
    // TODO(ccordry): need to fake distance from page to force load
    for (let i = 0; i < 2; i++) {
      const mockPage = this.makeMockPage();
      this.adElements_.push(mockPage);
      ampStoryElement.appendChild(mockPage);
    }
  };


  /** @override */
  isLayoutSupported() {
    return true;
  }


  /** @override */
  // layoutCallback() {}


  // temporary to be replaced with real page later
  makeMockPage() {
    const ampStoryAdPage = document.createElement('amp-story-page');
    const id = this.adElements_.length + 1;
    ampStoryAdPage.id = `i-amphtml-ad-page-${id}`;
    ampStoryAdPage.setAttribute('advertisement', '');
    ampStoryAdPage./*OK*/innerHTML = `
      <amp-story-grid-layer template="vertical">
        <h1>Ad Page #${id}</h1>
        <p>This is ad #${id} shown in this story.</p>
      </amp-story-grid-layer>
      `;
    return ampStoryAdPage;
  }


  /**
   * Get array containing all pages of associated story
   * @private
   */
  getPages_() {
    if (!this.pages_) {
      this.pages_ = this.ampStory_.getPages();
    }
    return this.pages_;
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
   * @param {number} unusedPageIndex
   * @param {string} unusedPageId
   * @private
   */
  handleActivePageChange_(unusedPageIndex, unusedPageId) {
    this.interactions_++;
    // temp before config in passed in
    if (this.interactions_ > MIN_INTERVAL) {
      this.placeNextAd_();
      this.interactions_ = 0;
    }
  }


  /**
   * Place ad based on user config
   * @private
   */
  placeNextAd_() {
    // TODO(ccordry) make sure ad is loaded
    const nextAdElement = this.adElements_[this.adIdPointer_];
    const nextAdId = nextAdElement && nextAdElement.id;

    if (!nextAdId) {
      return;
    }

    const pages = this.getPages_();

    // make methods public if necessary once finalized
    const activePage = this.ampStory_.getActivePage();
    const activePageId = activePage.element.id;
    const activePageIndex = this.ampStory_.getPageIndexById_(activePageId);

    const pageBeforeAd = pages[activePageIndex + 1];
    const pageBeforeAdEl = pageBeforeAd && pageBeforeAd.element;

    const pageAfterAd = pages[activePageIndex + 2];
    const pageAfterAdEl = pageAfterAd && pageAfterAd.element;

    pageBeforeAdEl.setAttribute('advance-to', nextAdId);
    pageAfterAdEl.setAttribute('return-to', nextAdId);
    nextAdElement.setAttribute('advance-to', pageAfterAdEl.id);
    nextAdElement.setAttribute('return-to', pageBeforeAdEl.id);

    this.adIdPointer_++;
  }
}

AMP.registerElement(TAG, AmpStoryAutoAds);


