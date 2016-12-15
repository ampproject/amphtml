/* Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-signal-collection-frame-0.1.css';
import {CONFIG} from './_amp-signal-collection-frame-config';
import {
  closestByTag,
  createElementWithAttributes,
} from '../../../src/dom';
import {isValidAttr} from '../../../src/sanitizer';
import {user} from '../../../src/log';

    /** @const {string} */
const TAG = 'AMP-SIGNAL-COLLECTION-FRAME';

export class AmpSignalCollectionFrame extends AMP.BaseElement {

  /**
  * @param {!Element} element
  */
  constructor(element) {
    super(element);
    console.log('In signal', element.attributes);
    const type = this.element.getAttribute('type');
    user().assert(type, `${TAG} requires attribute type`);
    const src = CONFIG[type];
    user().assert(src, `${TAG}: invalid type ${this.type}`);
    // Ensure element is child of amp-ad element.
    user().assert(closestByTag(this.element, 'AMP-AD'),
        `${TAG}:${type} is not child of amp-ad element`);

    const hashAttributeName = 'data-hash';
    const hash = this.element.getAttribute(hashAttributeName);
    user().assert(isValidAttr(this.element.tagName, hashAttributeName, hash),
        `${TAG}:${type} invalid ${hashAttributeName}`);

    const suffixAttributeName = 'data-src-suffix';
    const suffix = this.element.getAttribute(suffixAttributeName);
    user().assert(
        isValidAttr(this.element.tagName, suffixAttributeName, suffix),
        `${TAG}:${type} invalid ${suffixAttributeName}`);

    /**
    * Derived from config plus optional src suffix and hash.
    * @private {string}
    */
    this.src_ = `${src}/${suffix}#${hash}`;
  }

  /** @override */
  getPriority() {
    // Set priority of 2 to ensure it executes after AMP creative content.
    return 2;
  }

  /** @override */
  layoutCallback() {
    console.log(this.element.tagName, 'layoutCallback');
    const iframe = createElementWithAttributes(
       /** @type {!Document} */(this.element.ownerDocument),
       'iframe',{
         'height': 0,
         'width': 0,
         'src': this.src_,
       });
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    // TODO: register instance of xdomain API handler (waiting on brad).
    return Promise.resolve();
  }
}

AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerElement(TAG, AmpSignalCollectionFrame, CSS);
});
