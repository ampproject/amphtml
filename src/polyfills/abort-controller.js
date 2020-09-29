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
 * @param {!Window} win
 */
export function install(win) {
  if (win.AbortController) {
    return;
  }
  Object.defineProperty(win, 'AbortController', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: AbortController,
  });
  Object.defineProperty(win, 'AbortSignal', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: AbortSignal,
  });
}

class AbortController {
  /** */
  constructor() {
    /** @const {!AbortSignal} */
    this.signal_ = new AbortSignal();
  }

  /** */
  abort() {
    this.signal_.isAborted_ = true;
  }

  /**
   * @return {!AbortSignal}
   */
  get signal() {
    return this.signal_;
  }
}

class AbortSignal {
  /** */
  constructor() {
    /** @private {boolean} */
    this.isAborted_ = false;
  }

  /**
   * @return {boolean}
   */
  get aborted() {
    return this.isAborted_;
  }
}
