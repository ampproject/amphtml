function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import { CSS } from "../../../build/amp-story-hint-1.0.css";
import {
EmbeddedComponentState,
StateProperty,
UIType,
getStoreService } from "./amp-story-store-service";

import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import { createShadowRootWithStyle } from "./utils";
import { dict } from "../../../src/core/types/object";
import { renderAsElement } from "./simple-template";

/** @private @const {!./simple-template.ElementDef} */
var TEMPLATE = {
  tag: 'aside',
  attrs: dict({
    'class':
    'i-amphtml-story-hint-container ' +
    'i-amphtml-story-system-reset i-amphtml-hidden' }),

  children: [
  {
    tag: 'div',
    attrs: dict({ 'class': 'i-amphtml-story-navigation-help-overlay' }),
    children: [
    {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-navigation-help-section prev-page' }),

      children: [
      {
        tag: 'div',
        attrs: dict({ 'class': 'i-amphtml-story-hint-placeholder' }),
        children: [
        {
          tag: 'div',
          attrs: dict({ 'class': 'i-amphtml-story-hint-tap-button' }),
          children: [
          {
            tag: 'div',
            attrs: dict({
              'class': 'i-amphtml-story-hint-tap-button-icon' }) }] },




        {
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-hint-tap-button-text' }),

          localizedStringId:
          LocalizedStringId.AMP_STORY_HINT_UI_PREVIOUS_LABEL }] }] },





    {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-navigation-help-section next-page' }),

      children: [
      {
        tag: 'div',
        attrs: dict({ 'class': 'i-amphtml-story-hint-placeholder' }),
        children: [
        {
          tag: 'div',
          attrs: dict({ 'class': 'i-amphtml-story-hint-tap-button' }),
          children: [
          {
            tag: 'div',
            attrs: dict({
              'class': 'i-amphtml-story-hint-tap-button-icon' }) }] },




        {
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-hint-tap-button-text' }),

          localizedStringId:
          LocalizedStringId.AMP_STORY_HINT_UI_NEXT_LABEL }] }] }] }] };










/** @type {string} */
var NAVIGATION_OVERLAY_CLASS = 'show-navigation-overlay';

/** @type {string} */
var FIRST_PAGE_OVERLAY_CLASS = 'show-first-page-overlay';

/** @type {number} */
var NAVIGATION_OVERLAY_TIMEOUT = 3000;

/** @type {number} */
var FIRST_PAGE_NAVIGATION_OVERLAY_TIMEOUT = 275;

/**
 * User Hint Layer for <amp-story>.
 */
export var AmpStoryHint = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} parentEl Element where to append the component
   */
  function AmpStoryHint(win, parentEl) {_classCallCheck(this, AmpStoryHint);
    /** @private {!Window} */
    this.win_ = win;

    /** @private {boolean} Whether the component is built. */
    this.isBuilt_ = false;

    /** @private {!Document} */
    this.document_ = this.win_.document;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win_);

    /** @private {?Element} */
    this.hintContainer_ = null;

    /** @private {?(number|string)} */
    this.hintTimeout_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private @const {!Element} */
    this.parentEl_ = parentEl;
  }

  /**
   * Builds the hint layer DOM.
   */_createClass(AmpStoryHint, [{ key: "build", value:
    function build() {var _this = this;
      if (this.isBuilt()) {
        return;
      }

      this.isBuilt_ = true;

      var root = this.document_.createElement('div');
      this.hintContainer_ = renderAsElement(this.document_, TEMPLATE);
      createShadowRootWithStyle(root, this.hintContainer_, CSS);

      this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      function (rtlState) {
        _this.onRtlStateUpdate_(rtlState);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.SYSTEM_UI_IS_VISIBLE_STATE,
      function (isVisible) {
        _this.onSystemUiIsVisibleStateUpdate_(isVisible);
      });


      this.storeService_.subscribe(
      StateProperty.INTERACTIVE_COMPONENT_STATE,
      /** @param {./amp-story-store-service.InteractiveComponentDef} component */function (
      component)
      {
        _this.hideOnFocusedState_(
        component.state === EmbeddedComponentState.FOCUSED);

      });


      this.vsync_.mutate(function () {
        _this.parentEl_.appendChild(root);
      });
    }

    /**
     * Whether the component is built.
     * @return {boolean}
     */ }, { key: "isBuilt", value:
    function isBuilt() {
      return this.isBuilt_;
    }

    /**
     * Shows the given hint, only if not desktop.
     * @param {string} hintClass
     * @private
     */ }, { key: "showHint_", value:
    function showHint_(hintClass) {var _this2 = this;
      if (this.storeService_.get(StateProperty.UI_STATE) !== UIType.MOBILE) {
        return;
      }

      this.build();

      this.vsync_.mutate(function () {
        _this2.hintContainer_.classList.toggle(
        NAVIGATION_OVERLAY_CLASS,
        hintClass == NAVIGATION_OVERLAY_CLASS);

        _this2.hintContainer_.classList.toggle(
        FIRST_PAGE_OVERLAY_CLASS,
        hintClass == FIRST_PAGE_OVERLAY_CLASS);

        _this2.hintContainer_.classList.remove('i-amphtml-hidden');

        var hideTimeout =
        hintClass == NAVIGATION_OVERLAY_CLASS ?
        NAVIGATION_OVERLAY_TIMEOUT :
        FIRST_PAGE_NAVIGATION_OVERLAY_TIMEOUT;
        _this2.hideAfterTimeout(hideTimeout);
      });
    }

    /**
     * Show navigation overlay DOM.
     */ }, { key: "showNavigationOverlay", value:
    function showNavigationOverlay() {
      // Don't show the overlay if the share menu is open.
      if (this.storeService_.get(StateProperty.SHARE_MENU_STATE)) {
        return;
      }

      this.showHint_(NAVIGATION_OVERLAY_CLASS);
    }

    /**
     * Show navigation overlay DOM.
     */ }, { key: "showFirstPageHintOverlay", value:
    function showFirstPageHintOverlay() {
      this.showHint_(FIRST_PAGE_OVERLAY_CLASS);
    }

    /**
     * Hides the overlay after a given time
     * @param {number} timeout
     */ }, { key: "hideAfterTimeout", value:
    function hideAfterTimeout(timeout) {var _this3 = this;
      this.hintTimeout_ = this.timer_.delay(function () {return _this3.hideInternal_();}, timeout);
    }

    /**
     * Hide all navigation hints.
     */ }, { key: "hideAllNavigationHint", value:
    function hideAllNavigationHint() {
      this.hideInternal_();

      if (this.hintTimeout_ !== null) {
        this.timer_.cancel(this.hintTimeout_);
        this.hintTimeout_ = null;
      }
    }

    /** @private */ }, { key: "hideInternal_", value:
    function hideInternal_() {var _this4 = this;
      if (!this.isBuilt()) {
        return;
      }

      this.vsync_.mutate(function () {
        _this4.hintContainer_.classList.add('i-amphtml-hidden');
      });
    }

    /**
     * Reacts to RTL state updates and triggers the UI for RTL.
     * @param {boolean} rtlState
     * @private
     */ }, { key: "onRtlStateUpdate_", value:
    function onRtlStateUpdate_(rtlState) {var _this5 = this;
      this.vsync_.mutate(function () {
        rtlState ?
        _this5.hintContainer_.setAttribute('dir', 'rtl') :
        _this5.hintContainer_.removeAttribute('dir');
      });
    }

    /**
     * Reacts to system UI visibility state updates.
     * @param {boolean} isVisible
     * @private
     */ }, { key: "onSystemUiIsVisibleStateUpdate_", value:
    function onSystemUiIsVisibleStateUpdate_(isVisible) {
      if (!isVisible) {
        this.hideAllNavigationHint();
      }
    }

    /**
     * Hides navigation hint if tooltip is open.
     * @param {boolean} isActive
     * @private
     */ }, { key: "hideOnFocusedState_", value:
    function hideOnFocusedState_(isActive) {
      if (isActive) {
        this.hideAllNavigationHint();
      }
    } }]);return AmpStoryHint;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-hint.js