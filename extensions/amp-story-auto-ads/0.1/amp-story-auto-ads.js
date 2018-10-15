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

import {CSS} from '../../../build/amp-story-auto-ads-0.1.css';
import {CommonSignals} from '../../../src/common-signals';
import {Services} from '../../../src/services';
import {
  StateChangeEventDef,
  StateChangeType,
} from '../../amp-story/1.0/navigation-state';
import {StateProperty} from '../../amp-story/1.0/amp-story-store-service';
import {createElementWithAttributes, isJsonScriptTag} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {dict, hasOwn, map} from '../../../src/utils/object';
import {getUniqueId} from './utils';
import {parseJson} from '../../../src/json';
import {setStyles} from '../../../src/style';
import {triggerAnalyticsEvent} from '../../../src/analytics';

/** @const */
const MIN_INTERVAL = 4;

/** @const */
const TAG = 'amp-story-auto-ads';

/** @const */
const AD_TAG = 'amp-ad';

/** @const */
const MUSTACHE_TAG = 'amp-mustache';

/** @const */
const TIMEOUT_LIMIT = 10000; // 10 seconds

/** @const */
const GLASS_PANE_CLASS = 'i-amphtml-glass-pane';

/** @const */
const LOADING_ATTR = 'i-amphtml-loading';

/** @const */
const DATA_ATTR = {
  CTA_TYPE: 'data-vars-ctatype',
  CTA_URL: 'data-vars-ctaurl',
};

/** @const */
const CTA_TYPES = {
  APPLY_NOW: 'Apply Now',
  BOOK_NOW: 'Book',
  BUY_TICKETS: 'Buy Tickets',
  DOWNLOAD: 'Download',
  EXPLORE: 'Explore Now',
  GET_NOW: 'Get Now',
  INSTALL: 'Install Now',
  LISTEN: 'Listen Now',
  MORE: 'More',
  OPEN_APP: 'Open App',
  ORDER_NOW: 'Order Now',
  PLAY: 'Play',
  READ: 'Read Now',
  SHOP: 'Shop Now',
  SHOW: 'Show',
  SHOWTIMES: 'Showtimes',
  SIGN_UP: 'Sign Up',
  SUBSCRIBE: 'Subscribe Now',
  USE_APP: 'Use App',
  VIEW: 'View',
  WATCH: 'Watch',
  WATCH_EPISODE: 'Watch Episode',
};

/** @const */
const AD_STATE = {
  PENDING: 0,
  INSERTED: 1,
  FAILED: 2,
};

/** @const */
const ALLOWED_AD_TYPES = map({
  'custom': true,
  'doubleclick': true,
});

/** @enum {string} */
const Events = {
  AD_REQUESTED: 'story-ad-request',
  AD_LOADED: 'story-ad-load',
  AD_INSERTED: 'story-ad-insert',
  AD_VIEWED: 'story-ad-view',
  AD_CLICKED: 'story-ad-click',
  AD_EXITED: 'story-ad-exit',
  AD_DISCARDED: 'story-ad-discard',
};

/** @enum {string} */
const Vars = {
  // Timestamp when ad is requested.
  AD_REQUESTED: 'requestTime',
  // Timestamp when ad emits `INI_LOAD` signal.
  AD_LOADED: 'loadTime',
  // Timestamp when ad is inserted into story as page after next.
  AD_INSERTED: 'insertTime',
  // Timestamp when page becomes active page.
  AD_VIEWED: 'viewTime',
  // Timestamp when ad is clicked.
  AD_CLICKED: 'clickTime',
  // Timestamp when ad page moves from active => inactive.
  AD_EXITED: 'exitTime',
  // Timestamp when ad is discared due to bad metadata etc.
  AD_DISCARDED: 'discardTime',
  // Index of the ad generating the trigger.
  AD_INDEX: 'adIndex',
  // Id that should be unique for every ad.
  AD_UNIQUE_ID: 'adUniqueId',
  // Position in the parent story. Number of page before ad + 1. Does not count
  // previously inserted ad pages.
  POSITION: 'position',
  // Given cta-type of inserted ad.
  CTA_TYPE: 'ctaType',
};

export class AmpStoryAutoAds extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../amp-story/0.1/amp-story.AmpStory} */
    this.ampStory_ = null;

    /** @private {?../../amp-story/0.1/navigation-state.NavigationState} */
    this.navigationState_ = null;

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
    this.currentAdElement_ = null;

    /** @private {boolean} */
    this.isCurrentAdLoaded_ = false;

    /** @private {Object<string, string>} */
    this.config_ = {};

    /** @private {Object<string, *>} */
    this.analyticsData_ = {};

    /** @private {Object<string, number>} */
    this.adPageIds_ = {};

    /** @private {number|null} */
    this.idOfAdShowing_ = null;

    /**
     * Version of the story store service depends on which version of amp-story
     * the publisher is loading. They all have the same implementation.
     * @private {?../../amp-story/0.1/amp-story-store-service.AmpStoryStoreService|?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService}
     */
    this.storeService_ = null;
  }

  /** @override */
  buildCallback() {
    return Services.storyStoreServiceForOrNull(this.win).then(storeService => {
      dev().assert(storeService, 'Could not retrieve AmpStoryStoreService');
      this.storeService_ = storeService;

      if (!this.isAutomaticAdInsertionAllowed_()) {
        return;
      }

      const ampStoryElement = this.element.parentElement;
      user().assert(ampStoryElement.tagName === 'AMP-STORY',
          `<${TAG}> should be child of <amp-story>`);

      const ampdoc = this.getAmpDoc();
      const extensionService = Services.extensionsFor(this.win);
      extensionService./*OK*/installExtensionForDoc(
          ampdoc, AD_TAG);
      extensionService./*OK*/installExtensionForDoc(
          ampdoc, MUSTACHE_TAG);

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

    this.navigationState_ = this.ampStory_.getNavigationState();
    this.navigationState_.observe(this.handleStateChange_.bind(this));

    return this.ampStory_.signals().whenSignal(CommonSignals.INI_LOAD)
        .then(() => {
          this.createAdOverlay_();
          this.readConfig_();
          this.schedulePage_();
        });
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
   * load in config from child <script> element
   * @private
   */
  readConfig_() {
    const child = this.element.children[0];
    user().assert(
        isJsonScriptTag(child),
        `The <${TAG}> config should ` +
        'be inside a <script> tag with type="application/json"');

    this.config_ = parseJson(child.textContent);
    this.validateConfig_();
  }


  /**
   * Create a hidden UI that will be shown when ad is displayed
   * @private
   */
  createAdOverlay_() {
    const container = this.win.document.createElement('aside');
    container.className = 'i-amphtml-ad-overlay-container';

    const span = this.win.document.createElement('p');
    span.className = 'i-amphtml-story-ad-attribution';
    span.textContent = 'Ad';

    container.appendChild(span);
    this.ampStory_.element.appendChild(container);
  }


  /**
   * make sure given JSON config is shaped correctly
   * @private
   */
  validateConfig_() {
    const adAttributes = this.config_['ad-attributes'];
    user().assert(adAttributes, `<${TAG}>: Error reading config.` +
      'Top level JSON should have an "ad-attributes" key');

    const {type} = adAttributes;
    user().assert(type, `<${TAG}>: Error reading config.` +
      'Missing ["ad-attribues"]["type"] key');
  }


  /**
   * build page and start preloading
   * @private
   */
  schedulePage_() {
    const page = this.createAdPage_();
    this.adPageEls_.push(page);

    this.ampStory_.element.appendChild(page);
    this.analyticsEventWithCurrentAd_(Events.AD_REQUESTED,
        {[Vars.AD_REQUESTED]: Date.now()});

    page.getImpl().then(impl => {
      this.ampStory_.addPage(impl);
      this.timeCurrentPageCreated_ = Date.now();
    });
  }


  /**
   * create an `amp-story-page` containing an `amp-ad`
   * @private
   */
  createAdPage_() {
    const ampStoryAdPage = this.createPageElement_();
    const ampAd = this.createAdElement_();

    const glassPane = this.win.document.createElement('div');
    glassPane.classList.add(GLASS_PANE_CLASS);

    const gridLayer = this.win.document.createElement('amp-story-grid-layer');
    gridLayer.setAttribute('template', 'fill');

    const paneGridLayer = gridLayer.cloneNode(false);

    gridLayer.appendChild(ampAd);
    paneGridLayer.appendChild(glassPane);
    ampStoryAdPage.appendChild(gridLayer);
    ampStoryAdPage.appendChild(paneGridLayer);

    this.currentAdElement_ = ampAd;
    this.isCurrentAdLoaded_ = false;

    // set up listener for ad-loaded event
    ampAd.getImpl().then(impl => {
      const signals = impl.signals();
      return signals.whenSignal(CommonSignals.INI_LOAD);
    }).then(() => {
      // Ensures the video-manager does not follow the autoplay attribute on
      // amp-video tags, which would play the ad in the background before it is
      // displayed.
      ampStoryAdPage.getImpl().then(impl => impl.delegateVideoAutoplay());

      // remove loading attribute once loaded so that desktop CSS will position
      // offscren with all other pages
      const currentPageEl = this.adPageEls_[this.adPageEls_.length - 1];
      currentPageEl.removeAttribute(LOADING_ATTR);

      this.analyticsEventWithCurrentAd_(Events.AD_LOADED,
          {[Vars.AD_LOADED]: Date.now()});
      this.isCurrentAdLoaded_ = true;
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

    // Also create a new object to keep track of any future analytics data.
    this.analyticsData_[id] = {
      [Vars.AD_INDEX]: id,
      [Vars.AD_UNIQUE_ID]: getUniqueId(this.win),
    };

    const attributes = dict({
      'id': pageId,
      'ad': '',
      'distance': '2',
      'i-amphtml-loading': '',
    });

    return createElementWithAttributes(
        this.win.document, 'amp-story-page', attributes);
  }


  /**
   * @return {!Element}
   * @private
   */
  createAdElement_() {
    const requiredAttrs = {
      'class': 'i-amphtml-story-ad',
      'layout': 'fill',
      'amp-story': '',
    };

    const configAttrs = this.config_['ad-attributes'];

    ['height', 'width', 'layout'].forEach(attr => {
      if (configAttrs[attr] !== undefined) {
        user().warn(TAG, `ad-attribute "${attr}" is not allowed`);
        delete configAttrs[attr];
      }
    });

    user().assert(!!ALLOWED_AD_TYPES[configAttrs.type], `${TAG}: ` +
      `"${configAttrs.type}" ad type is not supported`);

    const attributes = /** @type {!JsonObject} */ (Object.assign({},
        configAttrs, requiredAttrs));

    return createElementWithAttributes(
        this.win.document, 'amp-ad', attributes);
  }


  /**
   * Validate ad-server response has requirements to build outlink
   * @param {!Element} adPageElement
   */
  maybeCreateCtaLayer_(adPageElement) {
    // if making a CTA layer we need a button name & outlink url
    const ctaUrl = this.currentAdElement_.getAttribute(DATA_ATTR.CTA_URL);
    const ctaType = this.currentAdElement_.getAttribute(DATA_ATTR.CTA_TYPE);

    if (!ctaUrl || !ctaType) {
      user().error(TAG, 'Both CTA Type & CTA Url ' +
          'are required in ad-server response."');
      return false;
    }

    // Store the cta-type as an accesible var for any further pings.
    this.analyticsData_[this.adPagesCreated_][Vars.CTA_TYPE] = ctaType;

    const ctaText = CTA_TYPES[ctaType];
    if (!ctaType) {
      user().error(TAG, 'invalid "CTA Type" in ad response');
      return false;
    }

    return this.createCtaLayer_(adPageElement, ctaText, ctaUrl);
  }


  /**
   * Create layer to contain outlink button
   * @param {!Element} adPageElement
   * @param {string} ctaText
   * @param {string} ctaUrl
   * @return {boolean}
   */
  createCtaLayer_(adPageElement, ctaText, ctaUrl) {
    const a = this.win.document.createElement('a');
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
        [Vars.AD_INDEX]: adIndex,
        [Vars.AD_CLICKED]: Date.now(),
      };
      this.analyticsEvent_(Events.AD_CLICKED, vars);
    });

    const ctaLayer = this.win.document.createElement('amp-story-cta-layer');
    ctaLayer.appendChild(a);
    adPageElement.appendChild(ctaLayer);
    return true;
  }


  /**
   * @param {!StateChangeEventDef} stateChangeEvent
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
      // We are transitioning away from an ad, so fire the exit event.
      this.analyticsEvent_(Events.AD_EXITED, {
        [Vars.AD_EXITED]: Date.now(),
        [Vars.AD_INDEX]: this.idOfAdShowing_,
      });
      this.idOfAdShowing_ = null;
    }

    if (this.adPageIds_[pageId]) {
      // We are switching to an ad, so fire the view event on the
      // corresponding Ad.
      const adIndex = this.adPageIds_[pageId];
      this.analyticsEvent_(Events.AD_VIEWED, {
        [Vars.AD_VIEWED]: Date.now(),
        [Vars.AD_INDEX]: adIndex,
      });

      // Keeping track of this here so that we can contain the logic for when
      // we exit the ad within this extension.
      this.idOfAdShowing_ = adIndex;
    }


    if (this.uniquePagesCount_ > MIN_INTERVAL) {
      const adState = this.tryToPlaceAdAfterPage_(pageId);

      if (adState === AD_STATE.INSERTED) {
        this.analyticsEventWithCurrentAd_(Events.AD_INSERTED,
            {[Vars.AD_INSERTED]: Date.now()});
        this.adsPlaced_++;
        // start loading next ad
        this.startNextPage_();
      }

      if (adState === AD_STATE.FAILED) {
        this.analyticsEventWithCurrentAd_(Events.AD_DISCARDED,
            {[Vars.AD_DISCARDED]: Date.now()});
        this.startNextPage_();
      }
    }
  }


  /**
   * start the process over
   * @private
   */
  startNextPage_() {
    this.uniquePagesCount_ = 0;
    this.schedulePage_();
  }


  /**
   * Place ad based on user config
   * @param {string} pageBeforeAdId
   * @private
   */
  tryToPlaceAdAfterPage_(pageBeforeAdId) {
    const nextAdPageEl = this.adPageEls_[this.adPageEls_.length - 1];
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

    if (!this.isCurrentAdLoaded_ || pageBeforeAd.isAd() ||
        pageAfterAd.isAd()) {
      // if we are going to cause two consecutive ads or ad is still
      // loading we will try again on next user interaction
      return AD_STATE.PENDING;
    }

    const ctaCreated = this.maybeCreateCtaLayer_(nextAdPageEl);
    if (!ctaCreated) {
      // failed on ad-server response format
      return AD_STATE.FAILED;
    }

    this.ampStory_.insertPage(pageBeforeAdId, nextAdPageEl.id);

    // If we are inserted we now have a `position` macro available for any
    // analytics events moving forward.
    const adIndex = this.adPageIds_[nextAdPageEl.id];
    const pageNumber = this.ampStory_.getPageIndexById(pageBeforeAdId);
    this.analyticsData_[adIndex][Vars.POSITION] = pageNumber + 1;

    return AD_STATE.INSERTED;
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
    return (Date.now() - this.timeCurrentPageCreated_) > TIMEOUT_LIMIT;
  }


  /**
   * Call an analytics event with the last created Ad.
   * @param {string} eventType
   * @param {!Object<string, string>} vars A map of vars and their values.
   * @private
   */
  analyticsEventWithCurrentAd_(eventType, vars) {
    Object.assign(vars, {[Vars.AD_INDEX]: this.adPagesCreated_});
    this.analyticsEvent_(eventType, vars);
  }


  /**
   * Construct an analytics event and trigger it.
   * @param {string} eventType
   * @param {!Object<string, string>} vars A map of vars and their values.
   * @private
   */
  analyticsEvent_(eventType, vars) {
    const adIndex = vars['adIndex'];
    this.analyticsData_[adIndex] = Object.assign(this.analyticsData_[adIndex],
        vars);

    triggerAnalyticsEvent(this.element, eventType,
        this.analyticsData_[adIndex]);
  }
}

AMP.extension('amp-story-auto-ads', '0.1', AMP => {
  AMP.registerElement('amp-story-auto-ads', AmpStoryAutoAds, CSS);
});
