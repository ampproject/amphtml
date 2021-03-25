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
import {CSS} from '../../../build/amp-story-auto-ads-0.1.css';
import {CommonSignals} from '../../../src/common-signals';
import {EventType, dispatch} from '../../amp-story/1.0/events';
import {Services} from '../../../src/services';
import {
  StateProperty,
  UIType,
} from '../../amp-story/1.0/amp-story-store-service';
import {StoryAdConfig} from './story-ad-config';
import {StoryAdPageManager} from './story-ad-page-manager';
import {CSS as adBadgeCSS} from '../../../build/amp-story-auto-ads-ad-badge-0.1.css';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';
import {dev, devAssert, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {divertStoryAdPlacements} from '../../../src/experiments/story-ad-placements';
import {getPlacementAlgo} from './algorithm-utils';
import {getServicePromiseForDoc} from '../../../src/service';
import {CSS as sharedCSS} from '../../../build/amp-story-auto-ads-shared-0.1.css';

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
};

export class AmpStoryAutoAds extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private */
    this.doc_ = this.win.document;

    /** @private {?../../amp-story/1.0/amp-story.AmpStory} */
    this.ampStory_ = null;

    /** @private {?StoryAdPage} */
    this.visibleAdPage_ = null;

    /** @private {!JsonObject} */
    this.config_ = dict();

    /** @private {?Promise} */
    this.analytics_ = null;

    /** @private {?Element} */
    this.adBadgeContainer_ = null;

    /** @private {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?StoryAdPlacementAlgorithm} */
    this.placementAlgorithm_ = null;

    /** @private {?StoryAdPageManager} */
    this.adPageManager_ = null;
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
        this.adPageManager_ = new StoryAdPageManager(
          this.ampStory_,
          this.config_
        );
        divertStoryAdPlacements(this.win);
        this.placementAlgorithm_ = getPlacementAlgo(
          this.win,
          this.storeService_,
          this.adPageManager_
        );
        // Bail out early on short stories.
        if (!this.placementAlgorithm_.isStoryEligible()) {
          return;
        }
        this.analytics_ = getServicePromiseForDoc(
          this.element,
          STORY_AD_ANALYTICS
        );
        this.createAdOverlay_();
        this.initializeListeners_();
        this.initializePages_();
      });
  }

  /**
   * Force an immediate ad placement without waiting for ad being loaded,
   * and then navigate to the ad page.
   * @param {!StoryAdPage} adPage
   */
  forcePlaceAdAfterPage_(adPage) {
    const pageBeforeAdId = /** @type {string} */ (this.storeService_.get(
      StateProperty.CURRENT_PAGE_ID
    ));
    adPage.registerLoadCallback(() =>
      this.adPageManager_
        .maybeInsertPageAfter(pageBeforeAdId, adPage)
        .then(() => this.navigateToFirstAdPage_(adPage))
    );
  }

  /**
   * Fires event to navigate to ad page once inserted into the story.
   * @param {!StoryAdPage} adPage
   */
  navigateToFirstAdPage_(adPage) {
    const firstAdPageElement = adPage.getPageElement();
    // Setting distance manually to avoid flash of next page.
    firstAdPageElement.setAttribute('distance', '1');
    const payload = dict({
      'targetPageId': 'i-amphtml-ad-page-1',
      'direction': 'next',
    });
    const eventInit = {bubbles: true};
    dispatch(
      this.win,
      firstAdPageElement,
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
        MUSTACHE_TAG,
        'latest'
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
    return !!this.storeService_.get(StateProperty.CAN_INSERT_AUTOMATIC_AD);
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
  initializePages_() {
    const pages = this.placementAlgorithm_.initializePages();
    this.maybeForceAdPlacement_(devAssert(pages[0]));
  }

  /**
   * Development mode forces navigation to ad page for better dev-x.
   * @param {StoryAdPage} adPage
   */
  maybeForceAdPlacement_(adPage) {
    if (
      this.element.hasAttribute('development') &&
      this.config_['type'] === 'fake'
    ) {
      this.forcePlaceAdAfterPage_(adPage);
    }
  }

  /**
   * Respond to page navigation event. This method is not called for the first
   * page that is shown on load.
   * @param {number} pageIndex Does not update when ad is showing.
   * @param {string} pageId
   * @private
   */
  handleActivePageChange_(pageIndex, pageId) {
    if (this.adPageManager_.numberOfAdsCreated() === 0) {
      // This is protection against us running our placement algorithm in a
      // story where no ads have been created. Most likely because INI_LOAD on
      // the story has not fired yet but we still are receiving page changes.
      return;
    }

    this.placementAlgorithm_.onPageChange(pageId);

    if (this.visibleAdPage_) {
      this.transitionFromAdShowing_();
    }

    if (this.adPageManager_.hasId(pageId)) {
      this.transitionToAdShowing_(pageIndex, pageId);
    }
  }

  /**
   * Called when switching away from an ad.
   */
  transitionFromAdShowing_() {
    // We are transitioning away from an ad
    const adPageId = this.visibleAdPage_.getId();
    const adIndex = this.adPageManager_.getIndexById(adPageId);
    this.removeVisibleAttribute_();
    // Fire the exit event.
    this.analyticsEvent_(AnalyticsEvents.AD_EXITED, {
      [AnalyticsVars.AD_EXITED]: Date.now(),
      [AnalyticsVars.AD_INDEX]: adIndex,
    });
  }

  /**
   * We are switching to an ad.
   * @param {number} pageIndex
   * @param {string} adPageId
   */
  transitionToAdShowing_(pageIndex, adPageId) {
    const adPage = this.adPageManager_.getAdPageById(adPageId);
    const adIndex = this.adPageManager_.getIndexById(adPageId);

    if (!adPage.hasBeenViewed()) {
      this.placementAlgorithm_.onNewAdView(pageIndex);
    }

    // Tell the iframe that it is visible.
    this.setVisibleAttribute_(adPage);

    // Fire the view event on the corresponding Ad.
    this.analyticsEvent_(AnalyticsEvents.AD_VIEWED, {
      [AnalyticsVars.AD_VIEWED]: Date.now(),
      [AnalyticsVars.AD_INDEX]: adIndex,
    });
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
  AMP.registerElement('amp-story-auto-ads', AmpStoryAutoAds, CSS + sharedCSS);
  AMP.registerServiceForDoc(STORY_AD_ANALYTICS, StoryAdAnalytics);
});
