/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import {loadPromise} from '../../../src/event-helper';
import {setStyle} from '../../../src/style';

/** @fileoverview
 * Wraps the creation of an invisible sandboxed IFrame. Exposes a load() method
 * that resolves a Promise when the iFrame has finished loading.
 */
export class IFrameHost {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc The AMP document
   * to add the <iframe> to.
   * @param {string} url The <iframe> src URL.
   */
  constructor(ampdoc, url) {
    /**
     * @type {!../../../src/service/ampdoc-impl.AmpDoc}
     * @private
     */
    this.ampdoc_ = ampdoc;

    /**
     * @type {string}
     * @private
     */
    this.url_ = url;

    /**
     * @type {Element|null}
     * @private
     */
    this.domElement_ = null;

    /**
     * @type {!Promise}
     * @private
     */
    this.loadPromise_ = new Promise(() => {});
  }

  /**
   * Returns a Promise that resolves when the IFrame has finished constructing
   * and loading.
   *
   * @return {!Promise}
   */
  load() {
    return this.ampdoc_.whenReady().then(() => {
      this.domElement_ = this.ampdoc_.win.document.createElement('iframe');
      setStyle(this.domElement_, 'display', 'none');
      this.domElement_.sandbox = 'allow-same-origin allow-scripts';
      this.domElement_.src = this.url_;

      this.ampdoc_.getBody().appendChild(this.domElement_);
      this.loadPromise_ = loadPromise(this.domElement_);
      return this.whenReady();
    });
  }

  /**
   * Returns the IFrame DOM element.
   * @return {?Element}
   */
  getDomElement() {
    return this.domElement_;
  }

  /**
   * Returns the IFrame DOM element.
   * @return {!Promise}
   */
  whenReady() {
    return this.loadPromise_;
  }
}
