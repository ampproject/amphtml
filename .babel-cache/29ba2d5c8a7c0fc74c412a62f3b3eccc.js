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
import { Services } from "../../../src/service";
import { createElementWithAttributes, removeElement } from "../../../src/core/dom";
import { toWin } from "../../../src/core/window";

/** @private @const {string} */
var TOAST_CLASSNAME = 'i-amphtml-story-toast';

/**
 * The 'alert' role assertively announces toast content to screen readers.
 * @private @const {string}
 * */
var TOAST_ROLE = 'alert';

/**
 * Should be higher than total animation time.
 * @private @const {number}
 */
var TOAST_VISIBLE_TIME_MS = 2600;

/**
 * UI notifications service, displaying a message to the user for a limited
 * amount of time.
 */
export var Toast = /*#__PURE__*/function () {function Toast() {_classCallCheck(this, Toast);}_createClass(Toast, null, [{ key: "show", value:
    /**
     * @param {!Element} storyEl
     * @param {!Node|string} childNodeOrText
     */
    function show(storyEl, childNodeOrText) {
      var win = toWin(storyEl.ownerDocument.defaultView);

      var toast = createElementWithAttributes(
      win.document,
      'div',
      /** @type {!JsonObject} */({
        'class': TOAST_CLASSNAME,
        'role': TOAST_ROLE }));



      if (typeof childNodeOrText == 'string') {
        toast.textContent = childNodeOrText;
      } else {
        toast.appendChild(childNodeOrText);
      }

      storyEl.appendChild(toast);

      Services.timerFor(win).delay(
      function () {return removeElement(toast);},
      TOAST_VISIBLE_TIME_MS);

    } }]);return Toast;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/toast.js