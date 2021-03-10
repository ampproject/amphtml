/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {
  AnalyticsEvents,
  AnalyticsVars,
  STORY_AD_ANALYTICS,
} from './story-ad-analytics';
import {ButtonTextFitter} from './story-ad-button-text-fitter';
import {StateProperty} from '../../amp-story/1.0/amp-story-store-service';
import {StoryAdLocalization} from './story-ad-localization';
import {StoryAdPage} from './story-ad-page';
import {devAssert} from '../../../src/log';
import {findIndex} from '../../../src/utils/array';
import {getServiceForDoc, getServicePromiseForDoc} from '../../../src/service';

const TAG = 'amp-story-auto-ads:page-manager';

/** @enum {number} */
export const InsertionState = {
  DELAYED: 0,
  FAILURE: 1,
  SUCCESS: 2,
};

const NEXT_PAGE_NO_AD_ATTR = 'next-page-no-ad';

/**
 *
 */
export class StoryAdPageManager {
  /**
   *
   * @param {*} ampStory
   * @param {*} config
   */
  constructor(ampStory, config) {
    this.ampStory_ = ampStory;
    this.config_ = config;
    this.ampdoc_ = ampStory.getAmpDoc();
    this.analytics_ = getServicePromiseForDoc(this.ampdoc_, STORY_AD_ANALYTICS);
    this.localizationService_ = new StoryAdLocalization(this.ampStory_.element);
    this.buttonFitter_ = new ButtonTextFitter(this.ampdoc_);
    // id => impl
    this.pages_ = {};
    this.storeService_ = getServiceForDoc(this.ampdoc_, 'story-store');
    this.adsConsumed_ = 0;
    this.createdPageIds = [];
  }

  /**
   * Check if we have any pages left that have not been inserted or discarded.
   * @return {boolean}
   */
  hasUnusedAdPage() {
    return this.adsConsumed_ <= this.createdPageIds.length;
  }

  /**
   * Gets the next ad page that has not yet been inserted or discarded.
   * @return {!StoryAdPage}
   */
  getUnusedAdPage() {
    const pageId = this.createdPageIds[this.adsConsumed_];
    devAssert(pageId, `${TAG} all created ads consumed.`);
    console.log('get unused', pageId);
    return this.pages_[pageId];
  }

  /**
   * Called when ad has failed or been placed and we should move to next ad.
   */
  discardCurrentAd() {
    this.analyticsEvent_(AnalyticsEvents.AD_DISCARDED, {
      [AnalyticsVars.AD_INDEX]: this.adsConsumed_,
      [AnalyticsVars.AD_DISCARDED]: Date.now(),
    });
    this.adsConsumed_++;
  }

  /**
   * Number of ads created by this manager.
   * @return {number}
   */
  numberOfAdsCreated() {
    return this.createdPageIds.length;
  }

  /**
   * Creates a StoryAdPage, appends the element to DOM, and adds it to
   * parent story pages Array.
   * @return {!StoryAdPage}
   */
  createAdPage() {
    console.log('page created');
    const index = this.createdPageIds.length + 1;
    const page = new StoryAdPage(
      this.ampdoc_,
      this.config_,
      index,
      this.localizationService_,
      devAssert(this.buttonFitter_),
      devAssert(this.storeService_)
    );

    const pageElement = page.build();
    const pageId = page.getId();
    this.pages_[pageId] = page;
    this.createdPageIds.push(pageId);

    this.ampStory_.element.appendChild(pageElement);
    pageElement.getImpl().then((impl) => {
      this.ampStory_.addPage(impl);
    });

    return page;
  }

  /**
   * @param {*} pageId
   * @return {boolean}
   */
  hasId(pageId) {
    return !!this.pages_[pageId];
  }

  /**
   * @param {string} pageId
   * @return {StoryAdPage}
   */
  getAdPageById(pageId) {
    return this.pages_[pageId];
  }

  /**
   * @param {string} pageId
   * @return {number}
   */
  getIndexById(pageId) {
    return findIndex(this.createdPageIds, (id) => id === pageId);
  }

  /**
   * Can fail if slot is protected by next-page-no-ad, if there are not enough
   * pages left in the story for insertion, or the page before or after is an ad.
   * @param {string} pageBeforeAdId
   * @param {!StoryAdPage} nextAdPage
   * @return {!Promise<!InsertionState>}
   */
  maybeInsertPageAfter(pageBeforeAdId, nextAdPage) {
    const pageBeforeAd = this.ampStory_.getPageById(pageBeforeAdId);
    const pageAfterAd = this.ampStory_.getNextPage(pageBeforeAd);
    if (!pageAfterAd) {
      return Promise.resolve(InsertionState.DELAYED);
    }

    if (this.isDesktopView_()) {
      // If we are in desktop view the ad must be inserted 2 pages away because
      // the next page will already be in view
      pageBeforeAdId = pageAfterAd.element.id;
      pageBeforeAd = pageAfterAd;
      pageAfterAd = this.ampStory_.getNextPage(pageAfterAd);
    }
    if (!pageAfterAd) {
      return Promise.resolve(InsertionState.DELAYED);
    }

    // We will not insert an ad in any slot containing `next-page-no-ad` nor
    // two ads in a row.
    if (
      this.nextPageNoAd_(pageBeforeAd) ||
      pageBeforeAd.isAd() ||
      pageAfterAd.isAd()
    ) {
      return Promise.resolve(InsertionState.DELAYED);
    }

    return nextAdPage.maybeCreateCta().then((ctaCreated) => {
      if (!ctaCreated) {
        this.discardCurrentAd();
        return InsertionState.FAILURE;
      }
      return this.insertIntoParentStory_(nextAdPage, pageBeforeAdId);
    });
  }

  /**
   *
   * @param {!StoryAdPage} nextAdPage
   * @param {string} pageBeforeAdId
   * @return {InsertionState}
   */
  insertIntoParentStory_(nextAdPage, pageBeforeAdId) {
    const nextAdPageId = nextAdPage.getId();
    this.ampStory_.insertPage(pageBeforeAdId, nextAdPageId);

    // If we are inserted we now have a `position` macro available for any
    // analytics events moving forward.
    const adIndex = this.getIndexById(nextAdPageId);
    const pageNumber = this.ampStory_.getPageIndexById(pageBeforeAdId);

    this.analytics_.then((analytics) =>
      analytics.setVar(adIndex, AnalyticsVars.POSITION, pageNumber + 1)
    );

    this.currentAdInserted_();
    return InsertionState.SUCCESS;
  }

  /**
   *
   */
  currentAdInserted_() {
    this.analyticsEvent_(AnalyticsEvents.AD_INSERTED, {
      [AnalyticsVars.AD_INDEX]: this.adsConsumed_,
      [AnalyticsVars.AD_INSERTED]: Date.now(),
    });
    this.adsConsumed_++;
  }

  /**
   * @private
   * @return {boolean}
   */
  isDesktopView_() {
    return !!this.storeService_.get(StateProperty.DESKTOP_STATE);
  }

  /**
   * Users may put an 'next-page-no-ad' attribute on their pages to prevent ads
   * from showing as the next page.
   * @param {?../../amp-story/1.0/amp-story-page.AmpStoryPage} page
   * @return {boolean}
   * @private
   */
  nextPageNoAd_(page) {
    return page.element.hasAttribute(NEXT_PAGE_NO_AD_ATTR);
  }

  /**
   * Construct an analytics event and trigger it.
   * @param {string} eventType
   * @param {!Object<string, number>} vars A map of vars and their values.
   * @private
   */
  analyticsEvent_(eventType, vars) {
    this.analytics_.then((analytics) =>
      analytics.fireEvent(
        this.ampStory_.element,
        vars['adIndex'],
        eventType,
        vars
      )
    );
  }
}
