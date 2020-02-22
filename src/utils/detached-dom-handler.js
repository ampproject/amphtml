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

import {Deferred} from './promise';

export class StreamHandler {
  /**
   *
   */
  constructor() {
    const {promise, resolve} = new Deferred();
    /** @const @private {!Promise(!Element)} */
    this.headPromise_ = promise;

    /** @const @private {!function()} */
    this.headResolver_ = resolve;

    /** @private {?Element} */
    this.detachedBody_ = null;

    /** @private {boolean} */
    this.shouldTransfer_ = false;

    /** @private {boolean} */
    this.mergeScheduled_ = false;

    // Fake vsync for glitch demo.
    // TODO: switch to real vsync service.
    /** @const @private */
    this.vsync_ = {mutate: cb => Promise.resolve(cb())};
  }

  /**
   * Callback passed into DetachedDomWriter constructor. Receives updated
   * document everytime a new chunk is written.
   * @param {!Document} detachedDoc
   */
  onChunk(detachedDoc) {
    // <body> is newly formed.
    if (!this.detachedBody_ && detachedDoc.body) {
      this.detachedBody_ = detachedDoc.body;
      this.headResolver_(detachedDoc.head);
    }

    if (this.shouldTransfer_ && !this.mergeScheduled_) {
      this.transferBody_(detachedDoc);
    }
  }

  /**
   * Callback passed into DetachedDomWriter constructor. Called with complete
   * doc when stream is closed.
   * @param {!Document} unusedCompleteDoc
   */
  onEnd(unusedCompleteDoc) {
    console.log('stream done.');
  }

  /**
   * Promise that will resolve with <head> when available.
   * @return {!Promise<!Element>}
   */
  waitForHead() {
    return this.headPromise_;
  }

  /**
   * Start the body transfer process. Should only be called once.
   * Returns a promise indicating that the first body chunk has been transfered.
   * @param {!Element} target DOM element to be appended to.
   * @return {!Promise} resolves when first chunk has been transfered.
   */
  transferBody(target) {
    if (!target) {
      // Throw on no target given.
    }

    if (this.shouldTransfer_) {
      // Maybe throw on subsequent calls?
      return Promise.resolve();
    }

    this.shouldTransfer_ = true;
    this.target_ = target;

    return this.headPromise_.then(() => this.transferBody_());
  }

  /**
   * Transfers available body elements in vsync cycle.
   * @return {!Promise}
   */
  transferBody_() {
    this.mergeScheduled_ = true;

    return this.vsync_.mutate(() => {
      this.mergeScheduled_ = false;
      // TODO: removeNoScriptElements
      while (this.detachedBody_.firstChild) {
        this.target_.appendChild(this.detachedBody_.firstChild);
      }
    });
  }
}
