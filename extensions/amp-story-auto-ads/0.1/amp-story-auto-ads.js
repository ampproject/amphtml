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

import {
  AnalyticsEvents,
  AnalyticsVars,
  STORY_AD_ANALYTICS,
  StoryAdAnalytics,
} from './story-ad-analytics';
import {ButtonTextFitter} from './story-ad-button-text-fitter';
import {CSS} from '../../../build/amp-story-auto-ads-0.1.css';
import {CommonSignals} from '../../../src/common-signals';
import {EventType, dispatch} from '../../amp-story/1.0/events';
import {Services} from '../../../src/services';
import {
  StateProperty,
  UIType,
} from '../../amp-story/1.0/amp-story-store-service';
import {StoryAdConfig} from './story-ad-config';
import {StoryAdLocalization} from './story-ad-localization';
import {StoryAdPage} from './story-ad-page';
import {CSS as adBadgeCSS} from '../../../build/amp-story-auto-ads-ad-badge-0.1.css';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';
import {dev, devAssert, userAssert} from '../../../src/log';
import {dict, hasOwn} from '../../../src/utils/object';
import {getServicePromiseForDoc} from '../../../src/service';
import {lastItem} from '../../../src/utils/array';

/** @const {number} */
const FIRST_AD_MIN = 7;

/** @const {number} */
const MIN_INTERVAL = 7;

/** @const {string} */
const TAG = 'amp-story-auto-ads';

/** @const {string} */
const AD_TAG = 'amp-ad';

/** @const {string} */
const MUSTACHE_TAG = 'amp-mustache';

/** @enum {string} */
export const Attributes = {
  AD_SHOWING: 'ad-showing',
  DESKTOP_PANELS: 'desktop-panels',
  DIR: 'dir',
  NEXT_PAGE_NO_AD: 'next-page-no-ad',
};

/** @enum {number} */
const AD_STATE = {
  PENDING: 0,
  INSERTED: 1,
  FAILED: 2,
};

export class AmpStoryAutoAds extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private */
    this.doc_ = this.win.document;

    /** @private {?../../amp-story/1.0/amp-story.AmpStory} */
    this.ampStory_ = null;

    /** @private {number} */
    this.uniquePagesCount_ = 0;

    /** @private {!Object<string, boolean>} */
    this.uniquePageIds_ = dict({});

    /** @private {!Array<StoryAdPage>} */
    this.adPages_ = [];

    /** @private {number} */
    this.adsPlaced_ = 0;

    /** @private {number} */
    this.adPagesCreated_ = 0;

    /** @private {?StoryAdPage}} */
    this.visibleAdPage_ = null;

    /** @private {!JsonObject} */
    this.config_ = dict();

    /** @private {?Promise} */
    this.analytics_ = null;

    /** @private {Object<string, number>} */
    this.adPageIds_ = {};

    /** @private {number|null} */
    this.idOfAdShowing_ = null;

    /** @private {boolean} */
    this.firstAdViewed_ = false;

    /** @private {boolean} */
    this.pendingAdView_ = false;

    /** @private {?Element} */
    this.adBadgeContainer_ = null;

    /**
     * @private {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService}
     */
    this.storeService_ = null;

    /** @private {!./story-ad-localization.StoryAdLocalization} */
    this.localizationService_ = new StoryAdLocalization(this.element);

    /** @private {boolean} */
    this.hasForcedRender_ = false;

    /** @private {boolean} */
    this.tryingToPlace_ = false;

    /** @private {?./story-ad-button-text-fitter.ButtonTextFitter} */
    this.buttonFitter_ = null;
  }

  /** @override */
  buildCallback() {
    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        devAssert(storeService, 'Could not retrieve AmpStoryStoreService');
        this.storeService_ = storeService;

        if (!this.isAutomaticAdInsertionAllowed_()) {
          return;
        }

        const ampStoryElement = this.element.parentElement;
        userAssert(
          ampStoryElement.tagName === 'AMP-STORY',
          `<${TAG}> should be child of <amp-story>`
        );

        const ampdoc = this.getAmpDoc();
        const extensionService = Services.extensionsFor(this.win);
        extensionService./*OK*/ installExtensionForDoc(ampdoc, AD_TAG);

        this.buttonFitter_ = new ButtonTextFitter(ampdoc);

        return ampStoryElement.getImpl().then((impl) => {
          this.ampStory_ = impl;
        });
      }
    );
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /** @override */
  layoutCallback() {
    if (!this.isAutomaticAdInsertionAllowed_()) {
      return Promise.resolve();
    }

    return this.ampStory_
      .signals()
      .whenSignal(CommonSignals.INI_LOAD)
      .then(() => {
        this.handleConfig_();
        this.analytics_ = getServicePromiseForDoc(
          this.element,
          STORY_AD_ANALYTICS
        );
        this.createAdOverlay_();
        this.initializeListeners_();
        this.schedulePage_();
      });
  }

  /**
   * Force an immediate ad placement without waiting for ad being loaded,
   * and then navigate to the ad page.
   * @param {string=} pageBeforeAdId
   * @visibleForTesting
   */
  forcePlaceAdAfterPage(pageBeforeAdId) {
    const pageBeforeId =
      pageBeforeAdId ||
      /** @type {string} */ (this.storeService_.get(
        StateProperty.CURRENT_PAGE_ID
      ));
    this.tryToPlaceAdAfterPage_(pageBeforeId);
    this.navigateToFirstAdPage_();
    this.hasForcedRender_ = true;
  }

  /**
   * Fires event to navigate to ad page once inserted into the story.
   */
  navigateToFirstAdPage_() {
    const lastPageElement = lastItem(this.adPages_).getPageElement();
    // Setting distance manually to avoid flash of next page.
    lastPageElement.setAttribute('distance', '1');
    const payload = dict({
      'targetPageId': 'i-amphtml-ad-page-1',
      'direction': 'next',
    });
    const eventInit = {bubbles: true};
    dispatch(
      this.win,
      lastPageElement,
      EventType.SWITCH_PAGE,
      payload,
      eventInit
    );
  }

  /**
   * Sets config and installs additional extensions if necessary.
   * @private
   */
  handleConfig_() {
    this.config_ = new StoryAdConfig(this.element).getConfig();
    if (this.config_['type'] === 'custom') {
      Services.extensionsFor(this.win)./*OK*/ installExtensionForDoc(
        this.element.getAmpDoc(),
        MUSTACHE_TAG
      );
    }
  }

  /**
   * Determines whether or not ad insertion is allowed based on how the story
   * is served, and the number of pages in the story.
   * @return {boolean}
   * @private
   */
  isAutomaticAdInsertionAllowed_() {
    return (
      !!this.storeService_.get(StateProperty.CAN_INSERT_AUTOMATIC_AD) &&
      this.enoughPagesLeftInStory_(0) // Beginning of story.
    );
  }

  /**
   * Determine if enough pages in the story are left for ad placement to be
   * possible.
   * @param {number} pageIndex
   * @return {boolean}
   * @private
   */
  enoughPagesLeftInStory_(pageIndex) {
    return (
      this.storeService_.get(StateProperty.PAGE_IDS).length - pageIndex >
      MIN_INTERVAL
    );
  }

  /**
   * Subscribes to all relevant state changes from the containing story.
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.AD_STATE, (isAd) => {
      this.onAdStateUpdate_(isAd);
    });

    this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      (rtlState) => {
        this.onRtlStateUpdate_(rtlState);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.UI_STATE,
      (uiState) => {
        this.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, (pageId) => {
      const pageIndex = this.storeService_.get(
        StateProperty.CURRENT_PAGE_INDEX
      );

      this.handleActivePageChange_(
        dev().assertNumber(pageIndex),
        dev().assertString(pageId)
      );
    });
  }

  /**
   * Reacts to the ad state updates and passes the information along as
   * attributes to the shadowed ad badge.
   * @param {boolean} isAd
   */
  onAdStateUpdate_(isAd) {
    this.mutateElement(() => {
      isAd
        ? this.adBadgeContainer_.setAttribute(Attributes.AD_SHOWING, '')
        : this.adBadgeContainer_.removeAttribute(Attributes.AD_SHOWING);
    });
  }

  /**
   * Reacts to the rtl state updates and passes the information along as
   * attributes to the shadowed ad badge.
   * @param {boolean} rtlState
   */
  onRtlStateUpdate_(rtlState) {
    this.mutateElement(() => {
      rtlState
        ? this.adBadgeContainer_.setAttribute(Attributes.DIR, 'rtl')
        : this.adBadgeContainer_.removeAttribute(Attributes.DIR);
    });
  }

  /**
   * Reacts to UI state updates and passes the information along as
   * attributes to the shadowed ad badge.
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    this.mutateElement(() => {
      const {DESKTOP_PANELS} = Attributes;
      const root = this.adBadgeContainer_;

      root.removeAttribute(DESKTOP_PANELS);

      if (uiState === UIType.DESKTOP_PANELS) {
        root.setAttribute(DESKTOP_PANELS, '');
      }
    });
  }

  /**
   * @visibleForTesting
   * @return {Element}
   */
  getAdBadgeRoot() {
    return this.adBadgeContainer_;
  }

  /**
   * Create a hidden UI that will be shown when ad is displayed
   * @private
   */
  createAdOverlay_() {
    const root = this.doc_.createElement('div');
    root.className = 'i-amphtml-ad-overlay-host';

    this.adBadgeContainer_ = this.doc_.createElement('aside');
    this.adBadgeContainer_.className = 'i-amphtml-ad-overlay-container';

    const badge = this.doc_.createElement('p');
    badge.className = 'i-amphtml-story-ad-badge';
    badge.textContent = 'Ad';

    this.adBadgeContainer_.appendChild(badge);
    createShadowRootWithStyle(root, this.adBadgeContainer_, adBadgeCSS);
    this.ampStory_.element.appendChild(root);
  }

  /**
   * Create new page containing ad and start preloading.
   * @private
   */
  schedulePage_() {
    const index = ++this.adPagesCreated_;
    const page = new StoryAdPage(
      this.getAmpDoc(),
      this.config_,
      index,
      this.localizationService_,
      devAssert(this.buttonFitter_),
      devAssert(this.storeService_)
    );

    this.maybeForceAdPlacement_(page);

    const pageElement = page.build();
    this.adPages_.push(page);

    // Keep track of ids created so far and a mapping to their index. This
    // is used to check if a page id is an ad later.
    this.adPageIds_[page.getId()] = index;

    this.ampStory_.element.appendChild(pageElement);

    pageElement.getImpl().then((impl) => {
      this.ampStory_.addPage(impl);
    });
  }

  /**
   * Development mode forces navigation to ad page for better dev-x.
   * Only do this once to prevent an infinite view->request->navigate loop.
   * @param {StoryAdPage} page
   */
  maybeForceAdPlacement_(page) {
    if (
      this.element.hasAttribute('development') &&
      this.config_['type'] === 'fake' &&
      !this.hasForcedRender_
    ) {
      page.registerLoadCallback(() => this.forcePlaceAdAfterPage());
    }
  }

  /**
   * Respond to page navigation event. This method is not called for the first
   * page that is shown on load.
   * @param {number} pageIndex
   * @param {string} pageId
   * @private
   */
  handleActivePageChange_(pageIndex, pageId) {
    if (!hasOwn(this.uniquePageIds_, pageId)) {
      this.uniquePagesCount_++;
      this.uniquePageIds_[pageId] = true;
    }

    if (this.adPagesCreated_ === 0) {
      // This is protection against us running our placement algorithm in a
      // story where no ads have been created. Most likely because INI_LOAD on
      // the story has not fired yet.
      return;
    }

    if (this.idOfAdShowing_) {
      // We are transitioning away from an ad
      this.removeVisibleAttribute_();
      // Fire the exit event.
      this.analyticsEvent_(AnalyticsEvents.AD_EXITED, {
        [AnalyticsVars.AD_EXITED]: Date.now(),
        [AnalyticsVars.AD_INDEX]: this.idOfAdShowing_,
      });
      this.idOfAdShowing_ = null;
    }

    if (this.adPageIds_[pageId]) {
      // We are switching to an ad.
      const adIndex = this.adPageIds_[pageId];
      const adPage = this.adPages_[adIndex - 1];

      if (!adPage.hasBeenViewed()) {
        this.pendingAdView_ = false;
        this.resetPageCount_();
        if (this.enoughPagesLeftInStory_(pageIndex)) {
          this.startNextAdPage_();
        }
      }

      // Tell the iframe that it is visible.
      this.setVisibleAttribute_(adPage);

      // Fire the view event on the corresponding Ad.
      this.analyticsEvent_(AnalyticsEvents.AD_VIEWED, {
        [AnalyticsVars.AD_VIEWED]: Date.now(),
        [AnalyticsVars.AD_INDEX]: adIndex,
      });

      // Keeping track of this here so that we can contain the logic for when
      // we exit the ad within this extension.
      this.idOfAdShowing_ = adIndex;
    }

    if (
      !this.pendingAdView_ &&
      this.enoughContentPagesViewed_() &&
      // If there is already an ad inserted, but not viewed it doesn't matter how
      // many pages we have seen, we should not keep trying to insert more ads.
      !this.tryingToPlace_ &&
      // Prevent edge case where we try to place an ad twice. See #28840.
      this.adsPlaced_ < this.adPagesCreated_
    ) {
      this.tryToPlaceAdAfterPage_(pageId).then((adState) => {
        this.tryingToPlace_ = false;

        if (adState === AD_STATE.INSERTED) {
          this.analyticsEventWithCurrentAd_(AnalyticsEvents.AD_INSERTED, {
            [AnalyticsVars.AD_INSERTED]: Date.now(),
          });
          this.adsPlaced_++;
          // We have an ad inserted that has yet to be viewed.
          this.pendingAdView_ = true;
        }

        if (adState === AD_STATE.FAILED) {
          this.analyticsEventWithCurrentAd_(AnalyticsEvents.AD_DISCARDED, {
            [AnalyticsVars.AD_DISCARDED]: Date.now(),
          });
          this.startNextAdPage_();
        }
      });
    }
  }

  /**
   * Sets a `amp-story-visible` attribute on the fie body so that embedded ads
   * can know when they are visible and do things like trigger animations.
   * @param {StoryAdPage} adPage
   */
  setVisibleAttribute_(adPage) {
    this.mutateElement(() => {
      adPage.toggleVisibility();
      this.visibleAdPage_ = adPage;
    });
  }

  /**
   *  Removes `amp-story-visible` attribute from the fie body.
   */
  removeVisibleAttribute_() {
    this.mutateElement(() => {
      if (this.visibleAdPage_) {
        this.visibleAdPage_.toggleVisibility();
        this.visibleAdPage_ = null;
      }
    });
  }

  /**
   * Determine if user has seen enough pages to show an ad. We want a certain
   * number of pages before the first ad, and then a separate interval
   * thereafter.
   * @return {boolean}
   * @private
   */
  enoughContentPagesViewed_() {
    // In desktop we have to insert ads two pages away, because the next page is
    // already visible. This adjustment ensures the ads show in the same place
    // on mobile and desktop.
    const adjustedInterval = this.isDesktopView_
      ? MIN_INTERVAL - 1
      : MIN_INTERVAL;
    const adjustedFirst = this.isDesktopView_ ? FIRST_AD_MIN - 1 : FIRST_AD_MIN;

    if (this.firstAdViewed_ && this.uniquePagesCount_ >= adjustedInterval) {
      return true;
    }

    if (!this.firstAdViewed_ && this.uniquePagesCount_ >= adjustedFirst) {
      return true;
    }

    return false;
  }

  /**
   * Start the process over.
   * @private
   */
  startNextAdPage_() {
    if (!this.firstAdViewed_) {
      this.firstAdViewed_ = true;
    }
    this.schedulePage_();
  }

  /**
   * Reset the counter that tracks when to place ads.
   * @private
   */
  resetPageCount_() {
    this.uniquePagesCount_ = 0;
  }

  /**
   * Place ad based on user config
   * @param {string} pageBeforeAdId
   * @return {Promise<AD_STATE>}
   * @private
   */
  tryToPlaceAdAfterPage_(pageBeforeAdId) {
    this.tryingToPlace_ = true;

    return Promise.resolve().then(() => {
      const nextAdPage = lastItem(this.adPages_);
      if (!nextAdPage.isLoaded() && nextAdPage.hasTimedOut()) {
        // Timeout fail.
        return AD_STATE.FAILED;
      }

      let pageBeforeAd = this.ampStory_.getPageById(pageBeforeAdId);
      let pageAfterAd = this.ampStory_.getNextPage(pageBeforeAd);

      if (!pageAfterAd) {
        return AD_STATE.PENDING;
      }

      if (this.isDesktopView_()) {
        // If we are in desktop view the ad must be inserted 2 pages away because
        // the next page will already be in view
        pageBeforeAd = pageAfterAd;
        pageBeforeAdId = pageAfterAd.element.id;
        pageAfterAd = this.ampStory_.getNextPage(pageAfterAd);
      }

      if (!pageAfterAd) {
        return AD_STATE.PENDING;
      }

      // There are three checks here that we check before inserting an ad. If
      // any of these fail we will try again on next page navigation.
      if (
        !nextAdPage.isLoaded() || // 1. Ad must be loaded.
        // 2. Pubs can opt out of ad placement using 'next-page-no-ad' attribute
        this.nextPageNoAd_(pageBeforeAd) ||
        // 3. We will not show two ads in a row.
        pageBeforeAd.isAd() ||
        pageAfterAd.isAd()
      ) {
        return AD_STATE.PENDING;
      }

      return nextAdPage.maybeCreateCta().then((ctaCreated) => {
        if (!ctaCreated) {
          // Failed on outlink creation.
          return AD_STATE.FAILED;
        }

        const nextAdPageId = nextAdPage.getId();
        this.ampStory_.insertPage(pageBeforeAdId, nextAdPageId);

        // If we are inserted we now have a `position` macro available for any
        // analytics events moving forward.
        const adIndex = this.adPageIds_[nextAdPageId];
        const pageNumber = this.ampStory_.getPageIndexById(pageBeforeAdId);
        this.analytics_.then((analytics) =>
          analytics.setVar(adIndex, AnalyticsVars.POSITION, pageNumber + 1)
        );

        return AD_STATE.INSERTED;
      });
    });
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
    return page.element.hasAttribute(Attributes.NEXT_PAGE_NO_AD);
  }

  /**
   * Call an analytics event with the last created Ad.
   * @param {string} eventType
   * @param {!Object<string, number>} vars A map of vars and their values.
   * @private
   */
  analyticsEventWithCurrentAd_(eventType, vars) {
    Object.assign(vars, {[AnalyticsVars.AD_INDEX]: this.adPagesCreated_});
    this.analyticsEvent_(eventType, vars);
  }

  /**
   * Construct an analytics event and trigger it.
   * @param {string} eventType
   * @param {!Object<string, number>} vars A map of vars and their values.
   * @private
   */
  analyticsEvent_(eventType, vars) {
    this.analytics_.then((analytics) =>
      analytics.fireEvent(this.element, vars['adIndex'], eventType, vars)
    );
  }
}

AMP.extension('amp-story-auto-ads', '0.1', (AMP) => {
  AMP.registerElement('amp-story-auto-ads', AmpStoryAutoAds, CSS);
  AMP.registerServiceForDoc(STORY_AD_ANALYTICS, StoryAdAnalytics);
});
