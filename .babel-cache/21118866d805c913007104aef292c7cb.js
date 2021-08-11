function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { Action, getStoreService } from "./amp-story-store-service";
import { CSS } from "../../../build/amp-story-unsupported-browser-layer-1.0.css";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { createShadowRootWithStyle } from "./utils";
import { dict } from "../../../src/core/types/object";
import { removeElement } from "../../../src/core/dom";
import { renderAsElement } from "./simple-template";

/** @const {string} Class for the continue anyway button */
var CONTINUE_ANYWAY_BUTTON_CLASS = 'i-amphtml-continue-button';
/**
 * Full viewport black layer indicating browser is not supported.
 * @private @const {!./simple-template.ElementDef}
 */
var UNSUPPORTED_BROWSER_LAYER_TEMPLATE = {
  tag: 'div',
  attrs: dict({ 'class': 'i-amphtml-story-unsupported-browser-overlay' }),
  children: [
  {
    tag: 'div',
    attrs: dict({ 'class': 'i-amphtml-overlay-container' }),
    children: [
    {
      tag: 'div',
      attrs: dict({ 'class': 'i-amphtml-gear-icon' }) },

    {
      tag: 'div',
      attrs: dict({ 'class': 'i-amphtml-story-overlay-text' }),
      localizedStringId:
      LocalizedStringId.AMP_STORY_WARNING_UNSUPPORTED_BROWSER_TEXT },

    // The continue button functionality will only be present in the default
    // layer. Publisher provided fallbacks will not provide users with the
    // ability to continue with an unsupported browser
    {
      tag: 'button',
      attrs: dict({ 'class': 'i-amphtml-continue-button' }),
      localizedStringId:
      LocalizedStringId.AMP_STORY_CONTINUE_ANYWAY_BUTTON_LABEL }] }] };






/**
 * Unsupported browser layer UI.
 */
export var UnsupportedBrowserLayer = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function UnsupportedBrowserLayer(win) {_classCallCheck(this, UnsupportedBrowserLayer);
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.root_ = null;

    /** @private {?Element} */
    this.element_ = null;

    /** @private {?Element} */
    this.continueButton_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);
  }

  /**
   * Builds and appends the component in the story.
   * @return {*} TODO(#23582): Specify return type
   */_createClass(UnsupportedBrowserLayer, [{ key: "build", value:
    function build() {var _this = this;
      if (this.root_) {
        return this.root_;
      }
      this.root_ = this.win_.document.createElement('div');
      this.element_ = renderAsElement(
      this.win_.document,
      UNSUPPORTED_BROWSER_LAYER_TEMPLATE);

      createShadowRootWithStyle(this.root_, this.element_, CSS);
      this.continueButton_ = this.element_. /*OK*/querySelector(".".concat(
      CONTINUE_ANYWAY_BUTTON_CLASS));

      this.continueButton_.addEventListener('click', function () {
        _this.storeService_.dispatch(Action.TOGGLE_SUPPORTED_BROWSER, true);
      });
      return this.root_;
    }

    /**
     * Returns the unsupported browser componenet
     * @return {?Element} The root element of the componenet
     */ }, { key: "get", value:
    function get() {
      if (!this.root_) {
        this.build();
      }
      return this.root_;
    }

    /**
     * Removes the entire layer
     */ }, { key: "removeLayer", value:
    function removeLayer() {
      if (this.root_) {
        removeElement(this.root_);
      }
    } }]);return UnsupportedBrowserLayer;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-unsupported-browser-layer.js