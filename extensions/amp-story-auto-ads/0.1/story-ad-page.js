/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {CommonSignals} from '../../../src/common-signals';
import {CtaTypes} from './story-ad-localization';
import {
  StateProperty,
  UIType,
} from '../../amp-story/1.0/amp-story-store-service';
import {assertConfig} from '../../amp-ad-exit/0.1/config';
import {assertHttpsUrl} from '../../../src/url';
import {CSS as attributionCSS} from '../../../build/amp-story-auto-ads-attribution-0.1.css';
import {
  createElementWithAttributes,
  elementByTag,
  isJsonScriptTag,
  iterateCursor,
  openWindowDialog,
  toggleAttribute,
} from '../../../src/dom';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';
import {dev, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getA4AVarsMetaTags, getAmpCtaMetaTags, getFrameDoc} from './utils';
import {getServicePromiseForDoc} from '../../../src/service';
import {parseJson} from '../../../src/json';
import {setStyle} from '../../../src/style';

/** @const {string} */
const TAG = 'amp-story-auto-ads:page';

/** @const {number} */
const TIMEOUT_LIMIT = 10000; // 10 seconds

/** @const {string} */
const GLASS_PANE_CLASS = 'i-amphtml-glass-pane';

/** @const {string} */
const DESKTOP_FULLBLEED_CLASS = 'i-amphtml-story-ad-fullbleed';

/** @enum {string} */
const PageAttributes = {
  LOADING: 'i-amphtml-loading',
  IFRAME_BODY_VISIBLE: 'amp-story-visible',
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

export class StoryAdPage {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} config
   * @param {number} index
   * @param {!./story-ad-localization.StoryAdLocalization} localization
   * @param {!./story-ad-button-text-fitter.ButtonTextFitter} buttonFitter
   * @param {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} storeService
   */
  constructor(ampdoc, config, index, localization, buttonFitter, storeService) {
    /** @private @const {!JsonObject} */
    this.config_ = config;

    /** @private @const {number} */
    this.index_ = index;

    /** @private @const {!./story-ad-localization.StoryAdLocalization} */
    this.localizationService_ = localization;

    /** @private @const {string} */
    this.id_ = `i-amphtml-ad-page-${this.index_}`;

    /** @private @const {!Window} */
    this.win_ = ampdoc.win;

    /** @private @const {!Document} */
    this.doc_ = this.win_.document;

    /** @private @const {!Promise} */
    this.analytics_ = getServicePromiseForDoc(ampdoc, STORY_AD_ANALYTICS);

    /** @private {?number} */
    this.timeCreated_ = null;

    /** @private {?Element} */
    this.pageElement_ = null;

    /** @private {?Element} */
    this.adElement_ = null;

    /** @private {?Element} */
    this.adChoicesIcon_ = null;

    /** @private {?Document} */
    this.adDoc_ = null;

    /** @private {?string} */
    this.ampAdExitOutlink_ = null;

    /** @private {boolean} */
    this.loaded_ = false;

    /** @private @const {!JsonObject} */
    this.a4aVars_ = dict();

    /** @private @const {!Array<Function>} */
    this.loadCallbacks_ = [];

    /** @private @const {./story-ad-button-text-fitter.ButtonTextFitter} */
    this.buttonFitter_ = buttonFitter;

    /** @private {boolean} */
    this.viewed_ = false;

    /** @private @const {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = storeService;
  }

  /** @return {?Document} ad document within FIE */
  getAdDoc() {
    return this.adDoc_;
  }

  /** @return {string} */
  getId() {
    return this.id_;
  }

  /** @return {boolean} */
  hasTimedOut() {
    return (
      !!this.timeCreated_ && Date.now() - this.timeCreated_ > TIMEOUT_LIMIT
    );
  }

  /** @return {boolean} */
  isLoaded() {
    return this.loaded_;
  }

  /** @return {boolean} */
  hasBeenViewed() {
    return this.viewed_;
  }

  /** @return {?Element} */
  getPageElement() {
    return this.pageElement_;
  }

  /**
   * Register functions to be executed when ad has loaded.
   * @param {Function} cb
   */
  registerLoadCallback(cb) {
    this.loadCallbacks_.push(cb);
  }

  /**
   * Adds/removes [amp-story-visible] on FIE body so that animations can
   * respond accordingly.
   */
  toggleVisibility() {
    this.viewed_ = true;
    // TODO(calebcordry): Properly handle visible attribute for custom ads.
    if (this.adDoc_) {
      toggleAttribute(
        dev().assertElement(this.adDoc_.body),
        PageAttributes.IFRAME_BODY_VISIBLE
      );
      // TODO(#24829) Remove alternate body when we have full ad network support.
      const alternateBody = this.adDoc_.querySelector('#x-a4a-former-body');
      alternateBody &&
        toggleAttribute(alternateBody, PageAttributes.IFRAME_BODY_VISIBLE);
    }
  }

  /**
   * Create an `amp-story-page` containing an `amp-ad`.
   * @return {!Element}
   */
  build() {
    this.timeCreated_ = Date.now();
    this.pageElement_ = this.createPageElement_();
    this.adElement_ = this.createAdElement_();

    const glassPane = this.doc_.createElement('div');
    glassPane.classList.add(GLASS_PANE_CLASS);

    const gridLayer = this.doc_.createElement('amp-story-grid-layer');
    gridLayer.setAttribute('template', 'fill');

    const paneGridLayer = gridLayer.cloneNode(/* deep */ false);

    gridLayer.appendChild(this.adElement_);
    paneGridLayer.appendChild(glassPane);
    this.pageElement_.appendChild(gridLayer);
    this.pageElement_.appendChild(paneGridLayer);

    // Set up listener for ad-loaded event.
    this.adElement_
      .signals()
      // TODO(ccordry): Investigate using a better signal waiting for video loads.
      .whenSignal(CommonSignals.INI_LOAD)
      .then(() => this.onAdLoaded_());

    this.analyticsEvent_(AnalyticsEvents.AD_REQUESTED, {
      [AnalyticsVars.AD_REQUESTED]: Date.now(),
    });

    return this.pageElement_;
  }

  /**
   * Try to create CTA (Click-To-Action) before showing the ad. Will fail if
   * not enough metadata to create the outlink button.
   * @return {Promise<boolean>}
   */
  maybeCreateCta() {
    return Promise.resolve().then(() => {
      // FIE only. Template ads have no iframe, and we can't access x-domain iframe.
      if (this.adDoc_) {
        this.extractA4AVars_();
        this.readAmpAdExit_();
      }

      // If making a CTA layer we need a button name & outlink url.
      const ctaUrl =
        this.ampAdExitOutlink_ ||
        this.a4aVars_[A4AVarNames.CTA_URL] ||
        this.adElement_.getAttribute(DataAttrs.CTA_URL);

      const ctaType =
        this.a4aVars_[A4AVarNames.CTA_TYPE] ||
        this.adElement_.getAttribute(DataAttrs.CTA_TYPE);

      if (!ctaUrl || !ctaType) {
        user().error(
          TAG,
          'Both CTA Type & CTA Url are required in ad response.'
        );
        return false;
      }

      let ctaText;
      // CTA picked from predefined choices.
      if (CtaTypes[ctaType]) {
        const ctaLocalizedStringId = CtaTypes[ctaType];
        ctaText = this.localizationService_.getLocalizedString(
          ctaLocalizedStringId
        );
      } else {
        // Custom CTA text - Should already be localized.
        ctaText = ctaType;
      }

      // Store the cta-type as an accesible var for any further pings.
      this.analytics_.then((analytics) =>
        analytics.setVar(
          this.index_, // adIndex
          AnalyticsVars.CTA_TYPE,
          ctaText
        )
      );

      try {
        this.maybeCreateAttribution_();
      } catch (e) {
        // Failure due to missing adchoices icon or url.
        return false;
      }

      return this.createCtaLayer_(ctaUrl, ctaText);
    });
  }

  /**
   * @return {!Element}
   * @private
   */
  createPageElement_() {
    const attributes = dict({
      'ad': '',
      'distance': '2',
      'i-amphtml-loading': '',
      'id': this.id_,
    });

    const page = createElementWithAttributes(
      this.doc_,
      'amp-story-page',
      attributes
    );
    // TODO(ccordry): Allow creative to change default background color.
    setStyle(page, 'background-color', '#212125');
    return page;
  }

  /**
   * @return {!Element}
   * @private
   */
  createAdElement_() {
    if (this.config_['type'] === 'fake') {
      this.config_['id'] = `i-amphtml-demo-${this.index_}`;
    }
    return createElementWithAttributes(this.doc_, 'amp-ad', this.config_);
  }

  /**
   * Things that need to happen after the created ad is "loaded".
   * @private
   */
  onAdLoaded_() {
    // Ensures the video-manager does not follow the autoplay attribute on
    // amp-video tags, which would play the ad in the background before it is
    // displayed.
    this.pageElement_.getImpl().then((impl) => impl.delegateVideoAutoplay());

    // Remove loading attribute once loaded so that desktop CSS will position
    // offscren with all other pages.
    this.pageElement_.removeAttribute(PageAttributes.LOADING);

    this.analyticsEvent_(AnalyticsEvents.AD_LOADED, {
      [AnalyticsVars.AD_LOADED]: Date.now(),
    });

    const adFrame = elementByTag(this.pageElement_, 'iframe');
    if (adFrame) {
      this.adDoc_ = getFrameDoc(/** @type {!HTMLIFrameElement} */ (adFrame));
    }

    this.loaded_ = true;

    this.loadCallbacks_.forEach((cb) => cb());
  }

  /**
   * Create layer to contain outlink button.
   * @param {string} ctaUrl
   * @param {string} ctaText
   * @return {Promise<boolean>}
   */
  createCtaLayer_(ctaUrl, ctaText) {
    // TODO(ccordry): Move button to shadow root.
    const a = createElementWithAttributes(
      this.doc_,
      'a',
      dict({
        'class': 'i-amphtml-story-ad-link',
        'target': '_blank',
        'href': ctaUrl,
      })
    );

    const fitPromise = this.buttonFitter_.fit(
      dev().assertElement(this.pageElement_),
      a, // Container
      ctaText // Content
    );

    return fitPromise.then((success) => {
      if (!success) {
        user().warn(TAG, 'CTA button text is too long. Ad was discarded.');
        return false;
      }

      a.href = ctaUrl;
      a.textContent = ctaText;

      if (a.protocol !== 'https:' && a.protocol !== 'http:') {
        user().warn(TAG, 'CTA url is not valid. Ad was discarded');
        return false;
      }

      // Click listener so that we can fire `story-ad-click` analytics trigger at
      // the appropriate time.
      a.addEventListener('click', () => {
        const vars = {
          [AnalyticsVars.AD_CLICKED]: Date.now(),
        };
        this.analyticsEvent_(AnalyticsEvents.AD_CLICKED, vars);
      });

      const ctaLayer = this.doc_.createElement('amp-story-cta-layer');
      ctaLayer.className = 'i-amphtml-cta-container';
      ctaLayer.appendChild(a);
      this.pageElement_.appendChild(ctaLayer);
      return true;
    });
  }

  /**
   * Find all `amp4ads-vars-` & `amp-cta-` prefixed meta tags and store them
   * in single obj.
   * @private
   */
  extractA4AVars_() {
    const a4aVarsTags = getA4AVarsMetaTags(this.adDoc_);
    iterateCursor(a4aVarsTags, (tag) => {
      const name = tag.name.split('amp4ads-vars-')[1];
      const {content} = tag;
      this.a4aVars_[name] = content;
    });
    const ampCtaTags = getAmpCtaMetaTags(this.adDoc_);
    iterateCursor(ampCtaTags, (tag) => {
      const name = tag.name.split('amp-')[1];
      const {content} = tag;
      this.a4aVars_[name] = content;
    });
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
   */
  readAmpAdExit_() {
    const ampAdExit = elementByTag(
      dev().assertElement(this.adDoc_.body),
      'amp-ad-exit'
    );
    if (ampAdExit) {
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
        this.ampAdExitOutlink_ = target['finalUrl'];
      } catch (e) {
        dev().error(TAG, e);
      }
    }
  }

  /**
   * Create attribution if creative contains the appropriate meta tags.
   * @private
   */
  maybeCreateAttribution_() {
    const href = this.a4aVars_[A4AVarNames.ATTRIBUTION_URL];
    const src = this.a4aVars_[A4AVarNames.ATTRIBUTION_ICON];

    // Ad attribution is optional, but need both to render.
    if (!href && !src) {
      return;
    }

    assertHttpsUrl(
      href,
      dev().assertElement(this.pageElement_),
      'amp-story-auto-ads attribution url'
    );

    assertHttpsUrl(
      src,
      dev().assertElement(this.pageElement_),
      'amp-story-auto-ads attribution icon'
    );

    const root = createElementWithAttributes(
      this.doc_,
      'div',
      dict({
        'role': 'button',
        'class': 'i-amphtml-attribution-host',
      })
    );

    this.adChoicesIcon_ = createElementWithAttributes(
      this.doc_,
      'img',
      dict({
        'class': 'i-amphtml-story-ad-attribution',
        'src': src,
      })
    );
    this.storeService_.subscribe(
      StateProperty.UI_STATE,
      (uiState) => {
        this.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */
    );

    this.adChoicesIcon_.addEventListener(
      'click',
      this.handleAttributionClick_.bind(this, href)
    );

    createShadowRootWithStyle(root, this.adChoicesIcon_, attributionCSS);
    this.pageElement_.appendChild(root);
  }

  /**
   * Reacts to UI state updates and passes the information along as
   * attributes to the shadowed attribution icon.
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    if (!this.adChoicesIcon_) {
      return;
    }

    this.adChoicesIcon_.classList.toggle(
      DESKTOP_FULLBLEED_CLASS,
      uiState === UIType.DESKTOP_FULLBLEED
    );
  }

  /**
   * @private
   * @param {string} href
   * @param {!Event} unusedEvent
   */
  handleAttributionClick_(href, unusedEvent) {
    openWindowDialog(this.win_, href, '_blank');
  }

  /**
   * Construct an analytics event and trigger it.
   * @param {string} eventType
   * @param {!Object<string, number>} vars A map of vars and their values.
   * @private
   */
  analyticsEvent_(eventType, vars) {
    this.analytics_.then((analytics) =>
      analytics.fireEvent(this.pageElement_, this.index_, eventType, vars)
    );
  }
}
