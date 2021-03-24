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

import {devAssert} from '../log';

export class DetachedDomStream {
  /**
   * @param {!Window} win
   * @param {function(!Document):void} onChunk
   * @param {function(!Document):void} onEnd
   */
  constructor(win, onChunk, onEnd) {
    /** @const @private {function(!Document):void} */
    this.onChunk_ = onChunk;

    /** @const @private {function(!Document):void} */
    this.onEnd_ = onEnd;

    /** @const @private {!Document} */
    this.detachedDoc_ = win.document.implementation.createHTMLDocument('');
    this.detachedDoc_.open();

    /** @private {boolean} */
    this.eof_ = false;
  }

  /**
   * Write chunk into detached doc, and call given chunk cb.
   * @public
   * @param {string} chunk
   */
  write(chunk) {
    devAssert(!this.eof_, 'Detached doc already closed.');

    if (chunk) {
      this.detachedDoc_.write(chunk);
    }
    this.onChunk_(this.detachedDoc_);
  }

  /**
   * Called when stream is finished. Close the detached doc, and call cb.
   * @public
   */
  close() {
    this.eof_ = true;
    this.detachedDoc_.close();
    this.onEnd_(this.detachedDoc_);
  }
}
