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
const INTERACTIONS_BEFORE_AD_SHOWN = 3;

/** @const */
// const EXPERIMENT = 'amp-story-auto-ad';

/** @const */
const TAG = 'amp-story-auto-ads';

export class AmpStoryAutoAds extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?AmpStory} */
    this.ampStory_ = null;

    /** @private {?NavigationState} */
    this.navigationState_ = null;

    /** @private {!number} */
    this.interactions_ = 0;

    /** @private {!array} */
    this.adElements = [];

    /** @private {!array} */
    this.adIdPointer_ = 0;
  }

  /** @override */
  buildCallback() {
    this.ampStoryElement_ = this.element.parentElement;
    user().assert(this.ampStoryElement_.tagName === 'AMP-STORY',
        `<${TAG}> should be child of <amp-story>`);

    this.ampStoryElement_.getImpl().then(impl => {
      this.ampStory_ = impl;
      this.navigationState_ = this.ampStory_.getNavigationState();
      this.navigationState_.observe(this.handleStateChange_.bind(this));
    });

    // move this chunk to layoutCallback
    const mockPage = this.makeMockPage();
    this.adElements.push(mockPage);
    this.ampStoryElement_.appendChild(mockPage);
    // mockPage.getImpl().then(impl => impl.setDistance(0));
    // layoutCallback

  };

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /** @override */
  layoutCallback() {
  }

  // temporary to be replaced with real page later
  makeMockPage() {
    const ampStoryAdPage = document.createElement('amp-story-page');
    ampStoryAdPage.id = 'i-amphtml-ad-page-1';
    ampStoryAdPage./*OK*/innerHTML = `
      <amp-story-grid-layer template="vertical">
        <h1>First Ad Page</h1>
        <p>This is the first ad shown in this story.</p>
      </amp-story-grid-layer>
      `;
    return ampStoryAdPage;
  }

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

  handleActivePageChange_(unusedPageIndex, unusedPageId) {
    this.interactions_++;
    console.log(this.interactions_);
    if (this.interactions_ >= INTERACTIONS_BEFORE_AD_SHOWN) {
      this.placeNextAd_();
      this.interactions_ = 0;
    }
  }

  placeNextAd_() {
    const nextAdElement = this.adElements[this.adIdPointer_];
    const nextAdId = nextAdElement.id;
    if (!nextAdId) {
      return;
    }

    const activePage = this.ampStory_.getActivePage();
    // make these public
    const nextPageId = activePage.getNextPageId_();
    const nexPageEl = this.ampStory_getPageById_(nextPageId);
    const activePageEl = activePage.element;
    const activePageElId = activePageEl.id;

    activePageEl.setAttribute('advance-to', nextAdId);
    nextAdElement.setAttribute('return-to', activePageElId);
    nextAdElement.setAttribute('advance-to', nextPageId);
    nexPageEl.setAttribute('return-to', nextAdId);

    this.adIdPointer_++;
  }
}

AMP.registerElement(TAG, AmpStoryAutoAds);


