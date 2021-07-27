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

import {toWin} from '#core/window';

/** @type {typeof AMP.BaseElement} */
let BaseElement;

if (typeof AMP !== 'undefined' && AMP.BaseElement) {
  BaseElement = AMP.BaseElement;
} else {
  class CeBaseElement {
    /**
     * @param {!Element} element
     */
    constructor(element) {
      /** @const {!Element} */
      this.element = element;

      /** @const {!Window} */
      this.win = toWin(element.ownerDocument.defaultView);
    }

    /**
     * @param {typeof CeBaseElement} BaseElement
     * @return {typeof HTMLElement}
     */
    static 'CustomElement'(BaseElement) {
      return class CustomElement extends HTMLElement {
        /** */
        constructor() {
          super();

          /** @const {!CeBaseElement} */
          this.implementation = new BaseElement(this);
        }

        /** */
        connectedCallback() {
          this.implementation.mountCallback();
          this.implementation.buildCallback();
        }

        /** */
        disconnectedCallback() {
          this.implementation.unmountCallback();
        }

        /** @return {Promise<*>} */
        getApi() {
          return this.implementation.getApi();
        }
      };
    }

    /**
     * @param {function():undefined} cb
     */
    mutateElement(cb) {
      Promise.resolve().then(cb);
    }

    /** @return {boolean} */
    isLayoutSupported() {
      return true;
    }

    /** */
    mountCallback() {}

    /** */
    unmountCallback() {}

    /** */
    buildCallback() {}
  }

  BaseElement = /** @type {typeof AMP.BaseElement} */ (CeBaseElement);
}

export {BaseElement};
