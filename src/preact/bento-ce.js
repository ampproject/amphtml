/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

<<<<<<< Updated upstream
let CE = typeof AMP !== 'undefined' && AMP.BaseElement;

if (!CE) {
  CE = class CustomElement extends HTMLElement {
    /** */
    constructor() {
      /** @const {!Element} */
      this.element = this;
=======
/**
 * @constructor @struct
 * @extends {BaseElement$$module$src$base_element}
 */
let BaseElement;

const AmpBaseElement = typeof AMP !== 'undefined' && AMP.BaseElement;

if (AmpBaseElement) {
  BaseElement = AmpBaseElement;
} else {
  class CustomElement extends HTMLElement {
    /** */
    constructor() {
      super();

      /** @const {!Element} */
      this.element = this;

      /** @const {!Window} */
      this.win = this.ownerDocument.defaultView;
>>>>>>> Stashed changes
    }

    /** */
    connectedCallback() {
      this.buildCallback();
      this.layoutCallback();
    }

    /**
     * @param {function():undefined} cb
     */
    mutateElement(cb) {
      Promise.resolve().then(cb);
    }
<<<<<<< Updated upstream
  };
}

export {CE};
=======

    /**
     * @param {string} alias
     * @param {function(!./service/action-impl.ActionInvocation)} handler
     * @param {*} unusedMinTrust
     * @public
     */
    registerAction(alias, handler, unusedMinTrust) {
      this.element.addEventListener(alias, (e) => {
        //TODO
        handler(e);
      });
    }

    /**
     * Unneeded in the Custom Element implementation.
     */
    isLayoutSupported() {}
  }

  BaseElement = /** @type {!BaseElement$$module$src$base_element} */ (CustomElement);
}

export {BaseElement};
>>>>>>> Stashed changes
