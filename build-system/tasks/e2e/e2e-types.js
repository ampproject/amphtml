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

/**
 * A wrapper class that allows client code to own references to
 * framework-specific element handles, but which does not expose any of the
 * framework-specific methods on that element.
 *
 * @template T
 * @public
 */
class ElementHandle {
  /**
   * Wrap the framework-specific element handle object.
   * @param {!T} element
   * @package
   */
  constructor(element) {
    /** @private */
    this.element_ = element;
  }

  /**
   * Unwrap the framework-specific element handle object.
   * @return {!T}
   * @package
   */
  getElement() {
    return this.element_;
  }
}

/**
 * Key codes used to trigger actions.
 * @enum {string}
 */
const Key = {
  'ArrowDown': 'ArrowDown',
  'ArrowLeft': 'ArrowLeft',
  'ArrowRight': 'ArrowRight',
  'ArrowUp': 'ArrowUp',
  'Enter': 'Enter',
  'Escape': 'Escape',
  'Tab': 'Tab',
  'CtrlV': 'CtrlV',
};

/**
 * @typedef {{
 *   width: number,
 *   height: number
 * }} WindowRectDef
 */
let WindowRectDef;

/**
 * @typedef {{
 *   x: number,
 *   y: number,
 *   top: number,
 *   bottom: number,
 *   left: number,
 *   right: number,
 *   width: number,
 *   height: number
 * }}
 */
let DOMRectDef;

/** @enum {string} */
// export let ScrollBehavior = {
//   AUTO: 'auto',
//   SMOOTH: 'smooth',
// }

/** @typedef {{
 *   left: number,
 *   top: number,
 *   behavior: ScrollBehavior
 * }}
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/ScrollToOptions}
 */
let ScrollToOptionsDef;

module.exports = {
  ElementHandle,
  Key,
  WindowRectDef,
  DOMRectDef,
  ScrollToOptionsDef,
};
