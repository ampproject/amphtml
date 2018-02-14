/**
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

import {ampMediaElementFor} from './utils';
import {removeElement} from '../../../src/dom';



export class Sources {
  /**
   * @param {?string=} opt_srcAttr The 'src' attribute of the media element.
   * @param {?IArrayLike<!Element>=} opt_srcEls Any child <source> tags of the
   *     media element.
   */
  constructor(opt_srcAttr, opt_srcEls) {
    /** @private @const {?string} */
    this.srcAttr_ = opt_srcAttr && opt_srcAttr.length ? opt_srcAttr : null;

    /** @private @const {!IArrayLike<!Element>} */
    this.srcEls_ = opt_srcEls || [];
  }


  /**
   * Applies the src attribute and source tags to a specified element.
   * @param {!HTMLMediaElement} element The element to adopt the sources
   *     represented by this object.
   */
  applyToElement(element) {
    Sources.removeFrom(element);

    if (!this.srcAttr_) {
      element.removeAttribute('src');
    } else {
      element.setAttribute('src', this.srcAttr_);
    }

    Array.prototype.forEach.call(this.srcEls_,
        srcEl => element.appendChild(srcEl));
  }


  /**
   * Removes and returns the sources from a specified element.
   * @param {!Element} element The element whose sources should be removed and
   *     returned.
   * @return {!Sources} An object representing the sources of the specified
   *     element.
   */
  static removeFrom(element) {
    const elementToUse = ampMediaElementFor(element) || element;
    const srcAttr = elementToUse.getAttribute('src');
    elementToUse.removeAttribute('src');
    const srcEls = elementToUse.querySelectorAll('source');
    Array.prototype.forEach.call(srcEls, srcEl => removeElement(srcEl));

    return new Sources(srcAttr, srcEls);
  }
}
