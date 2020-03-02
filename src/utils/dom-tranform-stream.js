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
import {Services} from '../services';
import {devAssert, user} from '../log';
import {removeNoScriptElements} from './dom-writer';

export class DomTransformStream {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    const headDefer = new Deferred();
    /** @const @private {!Promise<!Element>} */
    this.headPromise_ = headDefer.promise;

    /** @const @private {!function()} */
    this.headResolver_ = headDefer.resolve;

    const transferDefer = new Deferred();
    /** @const @private {!Promise} */
    this.bodyTransferPromise_ = transferDefer.promise;

    /** @const @private {!function()} */
    this.bodyTransferResolver_ = transferDefer.resolve;

    /** @private {?Element} */
    this.detachedBody_ = null;

    /** @private {?Promise} */
    this.currentChunkTransferPromise_ = null;

    /** @private {boolean} */
    this.shouldTransfer_ = false;

    /** @private {boolean} */
    this.mergeScheduled_ = false;

    /** @const @private */
    this.vsync_ = Services.vsyncFor(win);
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

    // If bodyTransfer has already been called, keep transferring on new chunks.
    if (this.shouldTransfer_) {
      this.transferBodyChunk_();
    }
  }

  /**
   * Callback passed into DetachedDomWriter constructor. Called with complete
   * doc when stream is closed.
   * @param {!Document} unusedCompleteDoc
   */
  onEnd(unusedCompleteDoc) {
    this.transferBodyChunk_().then(this.bodyTransferResolver_);
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
   * @param {!Element} target DOM element to be appended to.
   * @return {!Promise} resolves when doc has been fully transferred.
   */
  transferBody(target) {
    user().assertElement(
      target,
      'No target given to DomTransformStream.transferBody'
    );

    devAssert(
      !this.shouldTransfer_,
      'DomTransformStream.transferBody should only be called once'
    );

    this.shouldTransfer_ = true;
    this.target_ = target;

    this.transferBodyChunk_();

    return this.bodyTransferPromise_;
  }

  /**
   * Transfers available body elements in vsync cycle.
   * @return {!Promise}
   */
  transferBodyChunk_() {
    if (this.mergeScheduled_) {
      return this.currentChunkTransferPromise_;
    }

    this.mergeScheduled_ = true;

    this.currentChunkTransferPromise_ = this.headPromise_.then(() =>
      this.vsync_.mutatePromise(() => {
        this.mergeScheduled_ = false;
        removeNoScriptElements(this.detachedBody_);
        while (this.detachedBody_.firstChild) {
          this.target_.appendChild(this.detachedBody_.firstChild);
        }
      })
    );

    return this.currentChunkTransferPromise_;
  }
}
