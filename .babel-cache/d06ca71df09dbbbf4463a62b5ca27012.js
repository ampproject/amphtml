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

/** @enum {string} */
export var FilterType = {
  CLICK_DELAY: 'clickDelay',
  CLICK_LOCATION: 'clickLocation',
  INACTIVE_ELEMENT: 'inactiveElement' };


export var Filter = /*#__PURE__*/function () {
  /**
   * @param {string} name The name given to this filter.
   * @param {!FilterType} type
   */
  function Filter(name, type) {_classCallCheck(this, Filter);
    /** @const {string} */
    this.name = name;
    /** @const {!FilterType} */
    this.type = type;
  }

  /**
   * @param {!../../../../src/service/action-impl.ActionEventDef} unusedEvent
   * @return {boolean} Whether the exit is allowed.
   */_createClass(Filter, [{ key: "filter", value:
    function filter(unusedEvent) {}

    /**
     * This function is expected to be called in the onLayoutMeasure function of
     * AmpAdExit element to do any measure work for the filter.
     */ }, { key: "onLayoutMeasure", value:
    function onLayoutMeasure() {} }]);return Filter;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-ad-exit/0.1/filters/filter.js