/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

const firstVisibleTime = Date.now();

export default new (class {
  /** */
  constructor() {
    /** @public @const {!Window} */
    this.win = self;
  }
  /**
   * @return {time}
   */
  getFirstVisibleTime() {
    // TODO(alanorozco): Maybe the visible signal is not appropriate if we're
    // not co-ordinating visibility like the runtime would. If we track some
    // kind of visibility in a different way, the meaning changes.
    return firstVisibleTime;
  }
  /**
   * @return {!Document}
   */
  getRootNode() {
    return this.win.document;
  }
  /**
   * @return {!Node}
   */
  getHeadNode() {
    return this.win.document.head;
  }
  /**
   * @return {boolean}
   */
  isSingleDoc() {
    return true;
  }
  /**
   * @return {!Promise}
   */
  whenFirstVisible() {
    return Promise.resolve(); // TODO
  }
  /**
   * @return {boolean}
   */
  isVisible() {
    return true;
  }
  /**
   * @param {function(!VisibilityState):*} handler
   * @return {function():void}
   */
  onVisibilityChanged(handler) {
    // TODO
    handler('visible');
    return () => {};
  }
})();
