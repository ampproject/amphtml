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
import {CtaTypes, StoryAdLocalization} from './story-ad-localization';
import {EventType, dispatch} from '../../amp-story/1.0/events';
import {Services} from '../../../src/services';
import {
  StateProperty,
  UIType,
} from '../../amp-story/1.0/amp-story-store-service';
import {StoryAdConfig} from './story-ad-config';
import {CSS as adBadgeCSS} from '../../../build/amp-story-auto-ads-ad-badge-0.1.css';
import {assertConfig} from '../../amp-ad-exit/0.1/config';
import {assertHttpsUrl} from '../../../src/url';
import {CSS as attributionCSS} from '../../../build/amp-story-auto-ads-attribution-0.1.css';
import {
  createElementWithAttributes,
  elementByTag,
  isJsonScriptTag,
  iterateCursor,
  openWindowDialog,
} from '../../../src/dom';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {dict, hasOwn} from '../../../src/utils/object';
import {getA4AMetaTags, getFrameDoc} from './utils';
import {getServicePromiseForDoc} from '../../../src/service';
import {lastItem} from '../../../src/utils/array';
import {parseJson} from '../../../src/json';
import {setStyles} from '../../../src/style';

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

/** @const {number} */
const TIMEOUT_LIMIT = 10000; // 10 seconds

/** @const {string} */
const GLASS_PANE_CLASS = 'i-amphtml-glass-pane';

/** @enum {string} */
export const Attributes = {
  AD_SHOWING: 'ad-showing',
  DESKTOP_PANELS: 'desktop-panels',
  DIR: 'dir',
  IFRAME_BODY_VISIBLE: 'amp-story-visible',
  LOADING: 'i-amphtml-loading',
  NEXT_PAGE_NO_AD: 'next-page-no-ad',
};

/** @enum {string} */
const DataAttrs = {
  CTA_TYPE: 'data-vars-ctatype',
  CTA_URL: 'data-vars-ctaurl',
};

/** @enum {string} */
const A4AVarNames = {
  ATTRIBUTION_ICON: 'attribution-icon',
  ATTRIBUTION_URL: 'attribution-url',
  CTA_TYPE: 'cta-type',
  CTA_URL: 'cta-url',
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

    /** @private {!Array<Element>} */
    this.adPageEls_ = [];

    /** @private {number} */
    this.timeCurrentPageCreated_ = -Infinity;

    /** @private {number} */
    this.adsPlaced_ = 0;

    /** @private {number} */
    this.adPagesCreated_ = 0;

    /** @private {?Element} */
    this.lastCreatedAdElement_ = null;

    /** @private {?Element}} */
    this.visibleAdBody_ = null;

    /** @private {boolean} */
    this.isCurrentAdLoaded_ = false;

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
     * Version of the story store service depends on which version of amp-story
     * the publisher is loading. They all have the same implementation.
     * @private {?../../amp-story/0.1/amp-story-store-service.AmpStoryStoreService|?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService}
     */
    this.storeService_ = null;

    /** @private {!./story-ad-localization.StoryAdLocalization} */
    this.localizationService_ = new StoryAdLocalization(this.win);

    /** @private {boolean} */
    this.hasForcedRender_ = false;
  }

  /** @override */
  buildCallback() {
    return Services.storyStoreServiceForOrNull(this.win).then(storeService => {
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

      return ampStoryElement.getImpl().then(impl => {
        this.ampStory_ = impl;
      });
    });
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
    this.isCurrentAdLoaded_ = true;
    this.tryToPlaceAdAfterPage_(pageBeforeId);
    this.navigateToFirstAdPage_();
    this.hasForcedRender_ = true;
  }

  /**
   * Fires event to navigate to ad page once inserted into the story.
   */
  navigateToFirstAdPage_() {
    // Setting distance manually to avoid flash of next page.
    const lastPage = lastItem(this.adPageEls_);
    lastPage.setAttribute('distance', '1');
    const payload = dict({
      'targetPageId': 'i-amphtml-ad-page-1',
      'direction': 'next',
    });
    const eventInit = {bubbles: true};
    dispatch(this.win, lastPage, EventType.SWITCH_PAGE, payload, eventInit);
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
   * is served.
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
    this.storeService_.subscribe(StateProperty.AD_STATE, isAd => {
      this.onAdStateUpdate_(isAd);
    });

    this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      rtlState => {
        this.onRtlStateUpdate_(rtlState);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.UI_STATE,
      uiState => {
        this.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, pageId => {
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
   * build page and start preloading
   * @private
   */
  schedulePage_() {
    const page = this.createAdPage_();
    this.adPageEls_.push(page);

    this.ampStory_.element.appendChild(page);
    this.analyticsEventWithCurrentAd_(AnalyticsEvents.AD_REQUESTED, {
      [AnalyticsVars.AD_REQUESTED]: Date.now(),
    });

    page.getImpl().then(impl => {
      this.ampStory_.addPage(impl);
      this.timeCurrentPageCreated_ = Date.now();
    });
  }

  /**
   * create an `amp-story-page` containing an `amp-ad`
   * @private
   * @return {!Element}
   */
  createAdPage_() {
    const ampStoryAdPage = this.createPageElement_();
    const ampAd = this.createAdElement_();

    const glassPane = this.doc_.createElement('div');
    glassPane.classList.add(GLASS_PANE_CLASS);

    const gridLayer = this.doc_.createElement('amp-story-grid-layer');
    gridLayer.setAttribute('template', 'fill');

    const paneGridLayer = gridLayer.cloneNode(false);

    gridLayer.appendChild(ampAd);
    paneGridLayer.appendChild(glassPane);
    ampStoryAdPage.appendChild(gridLayer);
    ampStoryAdPage.appendChild(paneGridLayer);

    this.lastCreatedAdElement_ = ampAd;
    this.isCurrentAdLoaded_ = false;

    // Set up listener for ad-loaded event.
    ampAd
      .signals()
      // TODO(ccordry): Investigate using a better signal waiting for video loads.
      .whenSignal(CommonSignals.INI_LOAD)
      .then(() => {
        // Ensures the video-manager does not follow the autoplay attribute on
        // amp-video tags, which would play the ad in the background before it is
        // displayed.
        ampStoryAdPage.getImpl().then(impl => impl.delegateVideoAutoplay());

        // remove loading attribute once loaded so that desktop CSS will position
        // offscren with all other pages
        const currentPageEl = lastItem(this.adPageEls_);
        currentPageEl.removeAttribute(Attributes.LOADING);

        this.analyticsEventWithCurrentAd_(AnalyticsEvents.AD_LOADED, {
          [AnalyticsVars.AD_LOADED]: Date.now(),
        });
        this.isCurrentAdLoaded_ = true;

        // Development mode forces navigation to ad page for better dev-x.
        // Only do this once to prevent an infinite view->request->navigate loop.
        if (
          this.element.hasAttribute('development') &&
          this.config_['type'] === 'fake' &&
          !this.hasForcedRender_
        ) {
          this.forcePlaceAdAfterPage();
        }
      });

    return ampStoryAdPage;
  }

  /**
   * @return {!Element}
   * @private
   */
  createPageElement_() {
    const id = ++this.adPagesCreated_;
    const pageId = `i-amphtml-ad-page-${id}`;

    // Keep track of ids created so far and a mapping to their index. This
    // is used to check if a page id is an ad later.
    this.adPageIds_[pageId] = id;

    const attributes = dict({
      'id': pageId,
      'ad': '',
      'distance': '2',
      'i-amphtml-loading': '',
    });

    return createElementWithAttributes(this.doc_, 'amp-story-page', attributes);
  }

  /**
   * @return {!Element}
   * @private
   */
  createAdElement_() {
    if (this.config_['type'] === 'fake') {
      this.config_['id'] = `i-amphtml-demo-${this.adPagesCreated_}`;
    }
    return createElementWithAttributes(this.doc_, 'amp-ad', this.config_);
  }

  /**
   * Validate ad-server response has requirements to build outlink
   * @param {!Element} adPageElement
   * @return {boolean}
   */
  maybeCreateCtaLayer_(adPageElement) {
    let a4aVars = {};
    let ampAdExitOutlink = null;

    const iframe = elementByTag(adPageElement, 'iframe');
    // No iframe for custom ad.
    if (iframe) {
      const iframeDoc = getFrameDoc(/** @type {!HTMLIFrameElement} */ (iframe));
      ampAdExitOutlink = this.readAmpAdExit_(iframeDoc);
      a4aVars = this.extractA4AVars_(iframeDoc);
    }

    // If making a CTA layer we need a button name & outlink url.
    const ctaUrl =
      ampAdExitOutlink ||
      a4aVars[A4AVarNames.CTA_URL] ||
      this.lastCreatedAdElement_.getAttribute(DataAttrs.CTA_URL);

    const ctaType =
      a4aVars[A4AVarNames.CTA_TYPE] ||
      this.lastCreatedAdElement_.getAttribute(DataAttrs.CTA_TYPE);

    if (!ctaUrl || !ctaType) {
      user().error(
        TAG,
        'Both CTA Type & CTA Url are required in ad-server response."'
      );
      return false;
    }

    // Store the cta-type as an accesible var for any further pings.
    this.analytics_.then(analytics =>
      analytics.setVar(
        this.adPagesCreated_, // adIndex
        AnalyticsVars.CTA_TYPE,
        ctaType
      )
    );

    const ctaLocalizedStringId = CtaTypes[ctaType];
    const ctaText = this.localizationService_.getLocalizedString(
      ctaLocalizedStringId
    );
    if (!ctaType) {
      user().error(TAG, 'invalid "CTA Type" in ad response');
      return false;
    }

    this.maybeCreateAttribution_(adPageElement, a4aVars);

    return this.createCtaLayer_(
      adPageElement,
      dev().assertString(ctaText),
      ctaUrl
    );
  }

  /**
   * Create layer to contain outlink button
   * @param {!Element} adPageElement
   * @param {string} ctaText
   * @param {string} ctaUrl
   * @return {boolean}
   */
  createCtaLayer_(adPageElement, ctaText, ctaUrl) {
    // TODO(ccordry): Move button to shadow root.
    const a = this.doc_.createElement('a');
    a.className = 'i-amphtml-story-ad-link';
    a.setAttribute('target', '_blank');
    setStyles(a, {
      'font-size': '0',
      opactiy: '0',
      transform: 'scale(0)',
    });
    a.href = ctaUrl;
    a.textContent = ctaText;

    if (a.protocol !== 'https:' && a.protocol !== 'http:') {
      user().warn(TAG, 'CTA url is not valid. Ad was discarded');
      return false;
    }

    // Click listener so that we can fire `story-ad-click` analytics trigger at
    // the appropriate time.
    const adIndex = this.adPagesCreated_;
    a.addEventListener('click', () => {
      const vars = {
        [AnalyticsVars.AD_INDEX]: adIndex,
        [AnalyticsVars.AD_CLICKED]: Date.now(),
      };
      this.analyticsEvent_(AnalyticsEvents.AD_CLICKED, vars);
    });

    const ctaLayer = this.doc_.createElement('amp-story-cta-layer');
    ctaLayer.appendChild(a);
    adPageElement.appendChild(ctaLayer);
    return true;
  }

  /**
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
      // Tell the iframe that it is visible.
      this.setVisibleAttribute_(this.adPageEls_[adIndex - 1]);
      // Fire the view event on the corresponding Ad.
      this.analyticsEvent_(AnalyticsEvents.AD_VIEWED, {
        [AnalyticsVars.AD_VIEWED]: Date.now(),
        [AnalyticsVars.AD_INDEX]: adIndex,
      });

      // Previously inserted ad has been viewed.
      this.pendingAdView_ = false;

      // Start loading next ad.
      this.startNextAdPage_();

      // Keeping track of this here so that we can contain the logic for when
      // we exit the ad within this extension.
      this.idOfAdShowing_ = adIndex;
    }

    // If there is already an ad inserted, but not viewed it doesn't matter how
    // many pages we have seen, we should not keep trying to insert more ads.
    if (!this.pendingAdView_ && this.enoughContentPagesViewed_()) {
      const adState = this.tryToPlaceAdAfterPage_(pageId);

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
        this.startNextAdPage_(/* failure */ true);
      }
    }
  }

  /**
   * Sets a `amp-story-visible` attribute on the fie body so that embedded ads
   * can know when they are visible and do things like trigger animations.
   * @param {Element} adElement
   */
  setVisibleAttribute_(adElement) {
    const friendlyIframeEmbed = /** @type {HTMLIFrameElement} */ (adElement.querySelector(
      'iframe'
    ));
    // TODO(calebcordry): Properly handle visible trigger for custom ads.
    if (!friendlyIframeEmbed) {
      return;
    }

    const frameDoc = getFrameDoc(friendlyIframeEmbed);
    const {body} = frameDoc;
    // TODO(#24829) Remove alternate body when we have full ad network support.
    const alternateBody = body.querySelector('#x-a4a-former-body');
    this.mutateElement(() => {
      body.setAttribute(Attributes.IFRAME_BODY_VISIBLE, '');
      alternateBody &&
        alternateBody.setAttribute(Attributes.IFRAME_BODY_VISIBLE, '');
      this.visibleAdBody_ = body;
    });
  }

  /**
   *  Removes `amp-story-visible` attribute from the fie body.
   */
  removeVisibleAttribute_() {
    this.mutateElement(() => {
      if (this.visibleAdBody_) {
        // TODO(#24829) Remove alternate body when we have full ad network support.
        const alternateBody = this.visibleAdBody_.querySelector(
          '#x-a4a-former-body'
        );
        alternateBody &&
          alternateBody.removeAttribute(Attributes.IFRAME_BODY_VISIBLE);
        this.visibleAdBody_.removeAttribute(Attributes.IFRAME_BODY_VISIBLE);
        this.visibleAdBody_ = null;
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
   * @param {boolean=} opt_failure If we are calling this due to failed ad.
   */
  startNextAdPage_(opt_failure) {
    if (!this.firstAdViewed_) {
      this.firstAdViewed_ = true;
    }

    if (!opt_failure) {
      // Don't reset the count on a failed ad.
      this.uniquePagesCount_ = 0;
    }

    this.schedulePage_();
  }

  /**
   * Place ad based on user config
   * @param {string} pageBeforeAdId
   * @return {AD_STATE}
   * @private
   */
  tryToPlaceAdAfterPage_(pageBeforeAdId) {
    const nextAdPageEl = lastItem(this.adPageEls_);
    if (!this.isCurrentAdLoaded_ && this.adTimedOut_()) {
      // timeout fail
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
      !this.isCurrentAdLoaded_ || // 1. Ad must be loaded.
      // 2. Pubs can opt out of ad placement using 'next-page-no-ad' attribute
      this.nextPageNoAd_(pageBeforeAd) ||
      // 3. We will not show two ads in a row.
      pageBeforeAd.isAd() ||
      pageAfterAd.isAd()
    ) {
      return AD_STATE.PENDING;
    }

    const ctaCreated = this.maybeCreateCtaLayer_(
      dev().assertElement(nextAdPageEl)
    );
    if (!ctaCreated) {
      // failed on ad-server response format
      return AD_STATE.FAILED;
    }

    this.ampStory_.insertPage(pageBeforeAdId, nextAdPageEl.id);

    // If we are inserted we now have a `position` macro available for any
    // analytics events moving forward.
    const adIndex = this.adPageIds_[nextAdPageEl.id];
    const pageNumber = this.ampStory_.getPageIndexById(pageBeforeAdId);
    this.analytics_.then(analytics =>
      analytics.setVar(adIndex, AnalyticsVars.POSITION, pageNumber + 1)
    );

    return AD_STATE.INSERTED;
  }

  /**
   * Find all `amp4ads-vars-` prefixed meta tags and return all kv pairs
   * in a single object.
   * @private
   * @param {!Document} iframeDoc
   * @return {!Object}
   */
  extractA4AVars_(iframeDoc) {
    const tags = getA4AMetaTags(iframeDoc);
    const vars = {};
    iterateCursor(tags, tag => {
      const name = tag.name.split('amp4ads-vars-')[1];
      const {content} = tag;
      vars[name] = content;
    });
    return vars;
  }

  /**
   * TODO(#24080) Remove this when story ads have full ad network support.
   * This in intended to be a temporary hack so we can can support
   * ad serving pipelines that are reliant on using amp-ad-exit for
   * outlinks.
   * Reads amp-ad-exit config and tries to extract a suitable outlink.
   * If there are multiple exits present, behavior is unpredictable due to
   * JSON parse.
   * @private
   * @param {!Document} iframeDoc
   * @return {?string}
   */
  readAmpAdExit_(iframeDoc) {
    const ampAdExit = iframeDoc.querySelector('amp-ad-exit');
    if (!ampAdExit) {
      return null;
    }
    try {
      const {children} = ampAdExit;
      userAssert(
        children.length == 1,
        'The tag should contain exactly one <script> child.'
      );
      const child = children[0];
      userAssert(
        isJsonScriptTag(child),
        'The amp-ad-exit config should ' +
          'be inside a <script> tag with type="application/json"'
      );
      const config = assertConfig(parseJson(child.textContent));
      const target = config['targets'][Object.keys(config['targets'])[0]];
      return target['finalUrl'];
    } catch (e) {
      dev().error(TAG, e);
      return null;
    }
  }

  /**
   * @param {Element} adPageElement
   * @param {!Object} a4aVars
   */
  maybeCreateAttribution_(adPageElement, a4aVars) {
    const href = a4aVars[A4AVarNames.ATTRIBUTION_URL];
    const src = a4aVars[A4AVarNames.ATTRIBUTION_ICON];

    // Ad attribution is optional, but need both to render.
    if (!href && !src) {
      return;
    }

    if (!href || !src) {
      user().warn(TAG, 'Both icon and URL must be supplied for Ad Choices.');
      return;
    }

    assertHttpsUrl(href, this.element);
    assertHttpsUrl(src, this.element);

    const root = createElementWithAttributes(
      this.doc_,
      'div',
      dict({
        'role': 'button',
        'class': 'i-amphtml-attribution-host',
      })
    );

    const adChoicesIcon = createElementWithAttributes(
      this.doc_,
      'img',
      dict({
        'class': 'i-amphtml-story-ad-attribution',
        'src': src,
      })
    );

    adChoicesIcon.addEventListener(
      'click',
      this.handleAttributionClick_.bind(this, href)
    );

    createShadowRootWithStyle(root, adChoicesIcon, attributionCSS);
    adPageElement.appendChild(root);
  }

  /**
   * @private
   * @param {string} href
   * @param {!Event} unusedEvent
   */
  handleAttributionClick_(href, unusedEvent) {
    openWindowDialog(this.win, href, '_blank');
  }

  /**
   * @private
   * @return {boolean}
   */
  isDesktopView_() {
    return !!this.storeService_.get(StateProperty.DESKTOP_STATE);
  }

  /**
   * @private
   * @return {boolean}
   */
  adTimedOut_() {
    return Date.now() - this.timeCurrentPageCreated_ > TIMEOUT_LIMIT;
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
    this.analytics_.then(analytics =>
      analytics.fireEvent(this.element, vars['adIndex'], eventType, vars)
    );
  }
}

AMP.extension('amp-story-auto-ads', '0.1', AMP => {
  AMP.registerElement('amp-story-auto-ads', AmpStoryAutoAds, CSS);
  AMP.registerServiceForDoc(STORY_AD_ANALYTICS, StoryAdAnalytics);
});
