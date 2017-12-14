/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
 * Data representation of an <amp-bind-macro> that can cross the web worker
 * boundary (structured cloneable).
 * @typedef {{
 *   id: string,
 *   argumentNames: Array<string>,
 *   expressionString: string
 * }}
 */
export let AmpBindMacroDef;

/**
 * The <amp-bind-macro> element is used to define an expression macro that can
 * be called from other amp-bind expressions within the document.
 */
export class AmpBindMacro extends AMP.BaseElement {
  /** @override */
  getPriority() {
    // Loads after other content.
    return 1;
  }

  /** @override */
  isAlwaysFixed() {
    return true;
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /** @override */
  renderOutsideViewport() {
    // We want the macro to be available wherever it is in the document.
    return true;
  }

  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   *     if the element name is not unique.
   * @private
   */
  getName_() {
    return '<amp-bind-macro> ' +
        (this.element.getAttribute('id') || '<unknown id>');
  }
}
