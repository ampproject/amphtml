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
import {dict, hasOwn} from '../../../src/utils/object';
import {isJsonScriptTag} from '../../../src/dom';
import {parseJson} from '../../../src/json';


// TODO(ccordry) replace these constants with user config
/** @const */
const MIN_INTERVAL = 3;

/** @const */
const MAX_NUMBER = 2;

/** @const */
const TAG = 'amp-story-auto-ads';

/** @const */
const AD_TAG = 'amp-ad';

/** @const */
const MUSTACHE_TAG = 'amp-mustache';

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

    /** @private {!Array} */
    this.adPageEls_ = [];

    /** @private {number} */
    this.adsPlaced_ = 0;

    /** @private {number} */
    this.adPagesCreated_ = 0;

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
    });
  }


  /**
   * create an `amp-story-page` containing an `amp-ad`
   * @private
   */
  createAdPage_() {
    // TODO(ccordry) add new <amp-story-cta-layer>
    const ampStoryAdPage = this.createPageElement_();
    const ampAd = this.createAdElement_();

    const gridLayer = document.createElement('amp-story-grid-layer');
    gridLayer.setAttribute('template', 'fill');
    gridLayer.appendChild(ampAd);
    ampStoryAdPage.appendChild(gridLayer);

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
    const defaultAttrs = {
      'id': 'i-amphtml-story-ad',
      'layout': 'fill',
    };

    const configAttrs = this.config_['ad-attributes'];
    const attributes = /** @type {!JsonObject} */ (Object.assign({},
        defaultAttrs, configAttrs));

    return createElementWithAttributes(
        document, 'amp-ad', attributes);
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

    if (this.uniquePagesCount_ > MIN_INTERVAL && !this.allAdsPlaced_()) {
      this.placeAdAfterPage_(pageId);
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
    const nextAdPageEl = this.adPageEls_[this.adPageEls_.length - 1];

    if (!nextAdPageEl || !this.isCurrentAdLoaded_) {
      return;
    }

    const inserted = this.ampStory_.insertPage(currentPageId, nextAdPageEl.id);
    // failed insertion (consecutive ads, or no next page)
    if (!inserted) {
      return;
    }

    this.adsPlaced_++;
    this.uniquePagesCount_ = 0;

    if (!this.allAdsPlaced_()) {
      // start loading next ad
      this.schedulePage_();
    }
  }
}

AMP.registerElement(TAG, AmpStoryAutoAds);


