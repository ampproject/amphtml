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
import { dev } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { renderAsElement } from "./simple-template";

/** @const {string} */
var SPINNER_ACTIVE_ATTRIBUTE = 'active';

/** @private @const {!./simple-template.ElementDef} */
var SPINNER = {
  tag: 'div',
  attrs: dict({
    'class': 'i-amphtml-story-spinner',
    'aria-hidden': 'true',
    'aria-label': 'Loading video' }),

  children: [
  {
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-story-spinner-container' }),

    children: [
    {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-spinner-layer' }),

      children: [
      {
        tag: 'div',
        attrs: dict({
          'class': 'i-amphtml-story-spinner-circle-clipper left' }) },


      {
        tag: 'div',
        attrs: dict({
          'class': 'i-amphtml-story-spinner-circle-clipper right' }) }] }] }] };









/**
 * Loading spinner UI element.
 */
export var LoadingSpinner = /*#__PURE__*/function () {
  /**
   * @param {!Document} doc
   */
  function LoadingSpinner(doc) {_classCallCheck(this, LoadingSpinner);
    /** @private @const {!Document} */
    this.doc_ = doc;

    /** @public {?Element} */
    this.root_ = null;

    /** @private {boolean} */
    this.isActive_ = false;
  }

  /**
   * @return {!Element}
   */_createClass(LoadingSpinner, [{ key: "build", value:
    function build() {
      if (this.root_) {
        return this.root_;
      }

      this.root_ = renderAsElement(this.doc_, SPINNER);

      return this.getRoot();
    }

    /** @return {!Element} */ }, { key: "getRoot", value:
    function getRoot() {
      return (/** @type {!Element} */(this.root_));
    }

    /** @param {boolean} isActive */ }, { key: "toggle", value:
    function toggle(isActive) {
      if (isActive === this.isActive_) {
        return;
      }
      if (isActive) {
        this.root_.setAttribute(SPINNER_ACTIVE_ATTRIBUTE, '');
        this.root_.setAttribute('aria-hidden', 'false');
      } else {
        this.root_.removeAttribute(SPINNER_ACTIVE_ATTRIBUTE);
        this.root_.setAttribute('aria-hidden', 'true');
      }
      this.isActive_ = isActive;
    } }]);return LoadingSpinner;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/loading-spinner.js