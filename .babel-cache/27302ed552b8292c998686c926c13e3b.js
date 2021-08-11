import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";var _template = ["<div class=\"i-amphtml-story-info-dialog i-amphtml-story-system-reset\"><div class=i-amphtml-story-info-dialog-container><h1 class=i-amphtml-story-info-heading></h1><a class=i-amphtml-story-info-link></a> <a class=i-amphtml-story-info-moreinfo></a></div></div>"];function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
ANALYTICS_TAG_NAME,
StoryAnalyticsEvent,
getAnalyticsService } from "./story-analytics";

import {
Action,
StateProperty,
getStoreService } from "./amp-story-store-service";

import { CSS } from "../../../build/amp-story-info-dialog-1.0.css";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import { assertAbsoluteHttpOrHttpsUrl } from "../../../src/url";
import { closest, matches } from "../../../src/core/dom/query";
import { createShadowRootWithStyle, triggerClickFromLightDom } from "./utils";
import { dev } from "../../../src/log";
import { getAmpdoc } from "../../../src/service-helpers";
import { getLocalizationService } from "./amp-story-localization-service";
import { htmlFor } from "../../../src/core/dom/static-template";

/** @const {string} Class to toggle the info dialog. */
export var DIALOG_VISIBLE_CLASS = 'i-amphtml-story-info-dialog-visible';

/** @const {string} Class to toggle the info dialog link. */
export var MOREINFO_VISIBLE_CLASS = 'i-amphtml-story-info-moreinfo-visible';

/**
 * A dialog that provides a link to the canonical URL of the story, as well as
 * a link to any more information that the viewer would like to provide about
 * linking on that platform.
 */
export var InfoDialog = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} parentEl Element where to append the component
   */
  function InfoDialog(win, parentEl) {_classCallCheck(this, InfoDialog);
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.element_ = null;

    /** @private {?Element} */
    this.innerContainerEl_ = null;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private @const {!../../../src/service/localization.LocalizationService} */
    this.localizationService_ = getLocalizationService(parentEl);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win_, parentEl);

    /** @private @const {!Element} */
    this.parentEl_ = parentEl;

    /** @private @const {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(getAmpdoc(this.win_.document));

    /** @private {?Element} */
    this.moreInfoLinkEl_ = null;

    /** @const @private {!../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(this.parentEl_);
  }

  /**
   * Builds and appends the component in the story.
   * @return {!Promise} used for testing to ensure that the component is built
   *     before assertions.
   */_createClass(InfoDialog, [{ key: "build", value:
    function build() {var _this = this;
      if (this.isBuilt()) {
        return _resolvedPromise();
      }

      this.isBuilt_ = true;
      var root = this.win_.document.createElement('div');
      var html = htmlFor(this.parentEl_);
      this.element_ = html(_template);









      createShadowRootWithStyle(root, this.element_, CSS);
      this.initializeListeners_();

      this.innerContainerEl_ = this.element_.querySelector(
      '.i-amphtml-story-info-dialog-container');


      var appendPromise = this.mutator_.mutateElement(this.parentEl_, function () {
        _this.parentEl_.appendChild(root);
      });

      var pageUrl = Services.documentInfoForDoc(
      getAmpdoc(this.parentEl_)).
      canonicalUrl;

      return Promise.all([
      appendPromise,
      this.setHeading_(),
      this.setPageLink_(pageUrl),
      this.requestMoreInfoLink_().then(function (moreInfoUrl) {return (
          _this.setMoreInfoLinkUrl_(moreInfoUrl));})]);


    }

    /**
     * Whether the element has been built.
     * @return {boolean}
     */ }, { key: "isBuilt", value:
    function isBuilt() {
      return this.isBuilt_;
    }

    /**
     * @private
     */ }, { key: "initializeListeners_", value:
    function initializeListeners_() {var _this2 = this;
      this.storeService_.subscribe(StateProperty.INFO_DIALOG_STATE, function (isOpen) {
        _this2.onInfoDialogStateUpdated_(isOpen);
      });

      this.element_.addEventListener('click', function (event) {return (
          _this2.onInfoDialogClick_(event));});

    }

    /**
     * Reacts to dialog state updates and decides whether to show either the
     * native system sharing, or the fallback UI.
     * @param {boolean} isOpen
     * @private
     */ }, { key: "onInfoDialogStateUpdated_", value:
    function onInfoDialogStateUpdated_(isOpen) {var _this3 = this;
      this.mutator_.mutateElement( /** @type {!Element} */(this.element_), function () {
        _this3.element_.classList.toggle(DIALOG_VISIBLE_CLASS, isOpen);
      });

      this.element_[ANALYTICS_TAG_NAME] = 'amp-story-info-dialog';
      this.analyticsService_.triggerEvent(
      isOpen ? StoryAnalyticsEvent.OPEN : StoryAnalyticsEvent.CLOSE,
      this.element_);

    }

    /**
     * Handles click events and maybe closes the dialog.
     * @param  {!Event} event
     */ }, { key: "onInfoDialogClick_", value:
    function onInfoDialogClick_(event) {var _this4 = this;
      var el = /** @type {!Element} */(event.target);
      // Closes the dialog if click happened outside of the dialog main container.
      if (!closest(el, function (el) {return el === _this4.innerContainerEl_;}, this.element_)) {
        this.close_();
      }
      var anchorClicked = closest(event.target, function (e) {return matches(e, 'a[href]');});
      if (anchorClicked) {
        triggerClickFromLightDom(anchorClicked, this.element);
        event.preventDefault();
      }
    }

    /**
     * Closes the info dialog.
     * @private
     */ }, { key: "close_", value:
    function close_() {
      this.storeService_.dispatch(Action.TOGGLE_INFO_DIALOG, false);
    }

    /**
     * @return {!Promise<?string>} The URL to visit to receive more info on this
     *     page.
     * @private
     */ }, { key: "requestMoreInfoLink_", value:
    function requestMoreInfoLink_() {
      if (!this.viewer_.isEmbedded()) {
        return Promise.resolve(null);
      }
      return this.viewer_.
      /*OK*/sendMessageAwaitResponse('moreInfoLinkUrl', /* data */undefined).
      then(function (moreInfoUrl) {
        if (!moreInfoUrl) {
          return null;
        }
        return assertAbsoluteHttpOrHttpsUrl( /** @type {string} */(moreInfoUrl));
      });
    }

    /**
     * Sets the heading on the dialog.
     * @return {*} TODO(#23582): Specify return type
     */ }, { key: "setHeading_", value:
    function setHeading_() {
      var label = this.localizationService_.getLocalizedString(
      LocalizedStringId.AMP_STORY_DOMAIN_DIALOG_HEADING_LABEL);

      var headingEl = /** @type {!Element} */(
      this.element_.querySelector('.i-amphtml-story-info-heading'));


      return this.mutator_.mutateElement(headingEl, function () {
        headingEl.textContent = label;
      });
    }

    /**
     * @param {string} pageUrl The URL to the canonical version of the current
     *     document.
     * @return {*} TODO(#23582): Specify return type
     */ }, { key: "setPageLink_", value:
    function setPageLink_(pageUrl) {
      var linkEl = /** @type {!Element} */(
      this.element_.querySelector('.i-amphtml-story-info-link'));


      return this.mutator_.mutateElement(linkEl, function () {
        linkEl.setAttribute('href', pageUrl);

        // Add zero-width space character (\u200B) after "." and "/" characters
        // to help line-breaks occur more naturally.
        linkEl.textContent = pageUrl.replace(/([/.]+)/gi, "$1\u200B");
      });
    }

    /**
     * @param {?string} moreInfoUrl The URL to the "more info" page, if there is
     * one.
     * @return {*} TODO(#23582): Specify return type
     */ }, { key: "setMoreInfoLinkUrl_", value:
    function setMoreInfoLinkUrl_(moreInfoUrl) {var _this5 = this;
      if (!moreInfoUrl) {
        return _resolvedPromise2();
      }

      this.moreInfoLinkEl_ = /** @type {!Element} */(
      this.element_.querySelector('.i-amphtml-story-info-moreinfo'));


      return this.mutator_.mutateElement(this.moreInfoLinkEl_, function () {
        var label = _this5.localizationService_.getLocalizedString(
        LocalizedStringId.AMP_STORY_DOMAIN_DIALOG_HEADING_LINK);

        _this5.moreInfoLinkEl_.classList.add(MOREINFO_VISIBLE_CLASS);
        _this5.moreInfoLinkEl_.setAttribute(
        'href', /** @type {string} */(
        moreInfoUrl));

        _this5.moreInfoLinkEl_.setAttribute('target', '_blank');
        _this5.moreInfoLinkEl_.textContent = label;
      });
    } }]);return InfoDialog;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-info-dialog.js