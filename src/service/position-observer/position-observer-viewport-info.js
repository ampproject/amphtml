/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use baseInstance file except in compliance with the License.
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

import {Services} from '../../services';
import {
  layoutRectFromDomRect,
} from '../../layout-rect';

/**
 * An interface that get the current doc position to the top level viewport via host
 * @interface
 */
export class PosObViewportInfoDef {
  /**
   * Connect to listen to host viewport scroll/resize event.
   */
  connect() {}

  /**
   * Disconnect to host viewport when no element is being observed.
   */
  disconnect() {}

  /**
   * @param {function()} unusedCallback
   * @return {function()}
   */
  onScroll(unusedCallback) {}

  /**
   * @param {function()} unusedCallback
   * @return {function()}
   */
  onResize(unusedCallback) {}

  /**
   * @param {function(?)} unusedCallback
   * @return {function()}
   */
  onHostMessage(unusedCallback) {}

  /**
   * Returns the size of top window viewport.
   * @return {?{width: number, height: number}}
   */
  getSize() {}

  /**
   * Returns the rect of the element to the top window viewport.
   * @param {!Element} unusedElement
   * @return {?../../layout-rect.LayoutRectDef}
   */
  getLayoutRect(unusedElement) {}

  /**
   * TODO: remove after using iframeClient to make request
   * @return {?string}
   */
  getSentinel() {}

  /**
   * Store the host viewport position
   * @param {!JsonObject} unusedPosition
   */
  storeIframePosition(unusedPosition) {}
}

/**
 * @implements {PosObViewportInfoDef}
 * @visibleForTesting
 */
export class PosObViewportInfoAmpDoc {
  constructor(ampdoc) {
    this.ampdoc = ampdoc;
    this.viewport_ = Services.viewportForDoc(ampdoc);
  }

  /**
   * Ampdoc is the host itself
   */
  connect() {}

  disconnect() {}

  /**
   * @param {function()} callback
   * @return {function()}
   */
  onScroll(callback) {
    return this.viewport_.onScroll(callback);
  }

  /**
   * @param {function()} callback
   * @return {function()}
   */
  onResize(callback) {
    return this.viewport_.onResize(callback);
  }

  /**
   * @param {function(?)} unusedCallback
   * @return {function()}
   */
  onHostMessage(unusedCallback) {
    // return unused unlisten function;
    return () => {};
  }

  /**
   * @return {?{width: number, height: number}}
   */
  getSize() {
    return this.viewport_.getSize();
  }

  /**
   * @param {!Element} element
   * @return {?../../layout-rect.LayoutRectDef}
   */
  getLayoutRect(element) {
    //return this.viewport_.getLayoutRect(element);
    return layoutRectFromDomRect(
        element./*OK*/getBoundingClientRect());
  }

  /**
   * no sentinel for ampdoc
   * @return {?string}
   */
  getSentinel() {}

  /**
   * Ampdoc is the host, no iframe position to store.
   * @param {!JsonObject} unusedPosition
   */
  storeIframePosition(unusedPosition) {}
}
