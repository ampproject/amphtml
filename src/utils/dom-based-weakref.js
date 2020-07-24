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

/**
 * A `WeakRef` polyfill that works for DOM Elements only.
 *
 * NOTE, and this is a big NOTE, that the fallback implementation fails to
 * `deref` an element if it is no longer in the respective document.
 * Technically it could still be around, but for the purpose of this class
 * we assume that the element is not longer reachable.
 */
export class DomBasedWeakRef {
  /**
   * @param {!Window} win
   * @param {string} id
   * @package
   */
  constructor(win, id) {
    this.win = win;
    /** @private @const */
    this.id_ = id;
  }

  /**
   * Returns a WeakRef. Uses this implementation if the real WeakRef class
   * is not available.
   * @param {!Window} win
   * @param {!Element} element
   * @return {!WeakRef<!Element>|!DomBasedWeakRef<!Element>}
   */
  static make(win, element) {
    if (win.WeakRef) {
      return new win.WeakRef(element);
    }
    if (!element.id) {
      const index = (win.__AMP_WEAKREF_ID = (win.__AMP_WEAKREF_ID || 0) + 1);
      element.id = 'weakref-id-' + index;
    }
    return new DomBasedWeakRef(win, element.id);
  }

  /** @return {!Element|undefined} */
  deref() {
    return this.win.document.getElementById(this.id_) || undefined;
  }
}
