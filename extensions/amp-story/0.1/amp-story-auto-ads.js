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

import {CommonSignals} from '../../../src/common-signals';
import {Services} from '../../../src/services';
import {StateChangeType} from './navigation-state';
import {createElementWithAttributes} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {dict, hasOwn, map} from '../../../src/utils/object';
import {isJsonScriptTag} from '../../../src/dom';
import {parseJson} from '../../../src/json';


/** @const */
const MIN_INTERVAL = 3;

/** @const */
const TAG = 'amp-story-auto-ads';

/** @const */
const AD_TAG = 'amp-ad';

/** @const */
const MUSTACHE_TAG = 'amp-mustache';

/** @const */
const TIMEOUT_LIMIT = 10000; // 10 seconds

/** @const */
const DATA_ATTR = {
  CTA_TYPE: 'data-vars-ctatype',
  CTA_URL: 'data-vars-ctaurl',
};

/** @const */
const CTA_TYPES = {
  EXPLORE: 'Explore Now',
  SHOP: 'Shop Now',
  READ: 'Read Now',
};

/** @const */
const AD_STATE = {
  PENDING: 0,
  PLACED: 1,
  FAILED: 2,
};

/** @const */
const ALLOWED_AD_TYPES = map({
  'custom': true,
});


export class AmpStoryAutoAds extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?./amp-story.AmpStory} */
    this.ampStory_ = null;

    /** @private {?./navigation-state.NavigationState} */
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
  }

  /** @override */
  buildCallback() {
    const ampStoryElement = this.element.parentElement;
    user().assert(ampStoryElement.tagName === 'AMP-STORY',
        `<${TAG}> should be child of <amp-story>`);

    const ampdoc = this.getAmpDoc();
    Services.extensionsFor(this.win)./*OK*/installExtensionForDoc(
        ampdoc, AD_TAG);
    Services.extensionsFor(this.win)./*OK*/installExtensionForDoc(
        ampdoc, MUSTACHE_TAG);

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
    return this.ampStory_.signals().whenSignal(CommonSignals.INI_LOAD)
        .then(() => {
          this.createAdOverlay_();
          this.readConfig_();
          this.schedulePage_();
        });
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
    const container = document.createElement('aside');
    container.className = 'i-amphtml-ad-overlay-container';

    const span = document.createElement('p');
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

    const type = adAttributes.type;
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

    const gridLayer = document.createElement('amp-story-grid-layer');
    gridLayer.setAttribute('template', 'fill');
    gridLayer.appendChild(ampAd);
    ampStoryAdPage.appendChild(gridLayer);

    this.currentAdElement_ = ampAd;
    this.isCurrentAdLoaded_ = false;

    // set up listener for ad-loaded event
    ampAd.getImpl().then(impl => {
      const signals = impl.signals();
      return signals.whenSignal(CommonSignals.INI_LOAD);
    }).then(() => {
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
    const attributes = dict({
      'id': `i-amphtml-ad-page-${id}`,
      'ad': '',
      'distance': '1',
    });

    return createElementWithAttributes(
        document, 'amp-story-page', attributes);
  }


  /**
   * @return {!Element}
   * @private
   */
  createAdElement_() {
    const requiredAttrs = {
      'class': 'i-amphtml-story-ad',
      'layout': 'fill',
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
        document, 'amp-ad', attributes);
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

    const ctaText = CTA_TYPES[ctaType];
    if (!ctaType) {
      user().error(TAG, 'invalid "CTA Type" in ad response');
      return false;
    }

    this.createCtaLayer_(adPageElement, ctaText, ctaUrl);
    return true;
  }


  /**
   * Create layer to contain outlink button
   * @param {!Element} adPageElement
   * @param {string} ctaText
   * @param {string} ctaUrl
   */
  createCtaLayer_(adPageElement, ctaText, ctaUrl) {
    const a = document.createElement('a');
    a.className = 'i-amphtml-story-ad-link';
    a.setAttribute('target', '_blank');
    a.href = ctaUrl;
    a.textContent = ctaText;

    const ctaLayer = document.createElement('amp-story-cta-layer');
    ctaLayer.appendChild(a);
    adPageElement.appendChild(ctaLayer);
  }


  /**
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

    if (this.uniquePagesCount_ > MIN_INTERVAL) {
      const adState = this.tryToPlaceAdAfterPage_(pageId);

      if (adState === AD_STATE.PLACED) {
        this.adsPlaced_++;
        // start loading next ad
        this.startNextPage_();
      }

      if (adState === AD_STATE.FAILED) {
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
   * @param {string} currentPageId
   * @private
   */
  tryToPlaceAdAfterPage_(currentPageId) {
    const nextAdPageEl = this.adPageEls_[this.adPageEls_.length - 1];
    if (!this.isCurrentAdLoaded_ && this.adTimedOut_()) {
      // timeout fail
      return AD_STATE.FAILED;
    }

    const currentPage = this.ampStory_.getPageById(currentPageId);
    const nextPage = this.ampStory_.getNextPage(currentPage);

    if (!this.isCurrentAdLoaded_ || currentPage.isAd() ||
        (nextPage && nextPage.isAd())) {
      // if we are going to cause two consecutive ads or ad is still
      // loading we will try again on next user interaction
      return AD_STATE.PENDING;
    }

    const ctaCreated = this.maybeCreateCtaLayer_(nextAdPageEl);
    if (!ctaCreated) {
      // failed on ad-server response format
      return AD_STATE.FAILED;
    }

    this.ampStory_.insertPage(currentPageId, nextAdPageEl.id);
    return AD_STATE.PLACED;
  }


  /**
   * @private
   * @return {boolean}
   */
  adTimedOut_() {
    return (Date.now() - this.timeCurrentPageCreated_) > TIMEOUT_LIMIT;
  }
}

AMP.registerElement(TAG, AmpStoryAutoAds);


