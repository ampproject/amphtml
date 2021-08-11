var _template = ["<div class=i-amphtml-story-affiliate-link-circle><i class=i-amphtml-story-affiliate-link-icon></i><div class=\"i-amphtml-story-reset i-amphtml-hidden\"><span class=i-amphtml-story-affiliate-link-text hidden></span> <i class=i-amphtml-story-affiliate-link-launch hidden></i></div></div>"],_template2 = ["<div class=i-amphtml-story-affiliate-link-pulse></div>"];function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

/**
 * @fileoverview Affiliate link component that expands when clicked.
 */

import { Services } from "../../../src/service";
import { StateProperty, getStoreService } from "./amp-story-store-service";
import { StoryAnalyticsEvent, getAnalyticsService } from "./story-analytics";
import { getAmpdoc } from "../../../src/service-helpers";
import { htmlFor } from "../../../src/core/dom/static-template";

/**
 * Links that are affiliate links.
 * @const {string}
 */
export var AFFILIATE_LINK_SELECTOR = 'a[affiliate-link-icon]';

/**
 * Custom property signifying a built link.
 * @const {string}
 */
export var AFFILIATE_LINK_BUILT = '__AMP_AFFILIATE_LINK_BUILT';

export var AmpStoryAffiliateLink = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  function AmpStoryAffiliateLink(win, element) {_classCallCheck(this, AmpStoryAffiliateLink);
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Element} */
    this.element_ = element;

    /** @private {?Element} */
    this.textEl_ = null;

    /** @private {?Element} */
    this.launchEl_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private {string} */
    this.text_ = this.element_.textContent;

    /** @private @const {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(getAmpdoc(this.win_.document));

    /** @private @const {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win_, element);
  }

  /**
   * Builds affiliate link.
   */_createClass(AmpStoryAffiliateLink, [{ key: "build", value:
    function build() {var _this = this;
      if (this.element_[AFFILIATE_LINK_BUILT]) {
        return;
      }

      this.mutator_.mutateElement(this.element_, function () {
        _this.element_.textContent = '';
        _this.element_.setAttribute('pristine', '');
        _this.addPulseElement_();
        _this.addIconElement_();
        _this.addText_();
        _this.addLaunchElement_();
      });

      this.initializeListeners_();
      this.element_[AFFILIATE_LINK_BUILT] = true;
    }

    /**
     * Initializes listeners.
     * @private
     */ }, { key: "initializeListeners_", value:
    function initializeListeners_() {var _this2 = this;
      this.storeService_.subscribe(
      StateProperty.AFFILIATE_LINK_STATE,
      function (elementToToggleExpand) {
        var expand = _this2.element_ === elementToToggleExpand;
        if (expand) {
          _this2.element_.setAttribute('expanded', '');
          _this2.textEl_.removeAttribute('hidden');
          _this2.launchEl_.removeAttribute('hidden');
        } else {
          _this2.element_.removeAttribute('expanded');
          _this2.textEl_.setAttribute('hidden', '');
          _this2.launchEl_.setAttribute('hidden', '');
        }
        if (expand) {
          _this2.element_.removeAttribute('pristine');
          _this2.analyticsService_.triggerEvent(
          StoryAnalyticsEvent.FOCUS,
          _this2.element_);

        }
      });


      this.element_.addEventListener('click', function (event) {
        if (_this2.element_.hasAttribute('expanded')) {
          event.stopPropagation();
          _this2.analyticsService_.triggerEvent(
          StoryAnalyticsEvent.CLICK_THROUGH,
          _this2.element_);

        }
      });
    }

    /**
     * Adds icon as a child element of <amp-story-affiliate-link>.
     * @private
     */ }, { key: "addIconElement_", value:
    function addIconElement_() {
      var iconEl = htmlFor(this.element_)(_template);







      this.element_.appendChild(iconEl);
    }

    /**
     * Adds text from <a> tag to expanded link.
     * @private
     */ }, { key: "addText_", value:
    function addText_() {
      this.textEl_ = this.element_.querySelector(
      '.i-amphtml-story-affiliate-link-text');


      this.textEl_.textContent = this.text_;
      this.textEl_.setAttribute('hidden', '');
    }

    /**
     * Adds launch arrow to expanded link.
     * @private
     */ }, { key: "addLaunchElement_", value:
    function addLaunchElement_() {
      this.launchEl_ = this.element_.querySelector(
      '.i-amphtml-story-affiliate-link-launch');


      this.launchEl_.setAttribute('hidden', '');
    }

    /**
     * Adds pulse as a child element of <amp-story-affiliate-link>.
     * @private
     */ }, { key: "addPulseElement_", value:
    function addPulseElement_() {
      var pulseEl = htmlFor(this.element_)(_template2);

      this.element_.appendChild(pulseEl);
    } }]);return AmpStoryAffiliateLink;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-affiliate-link.js