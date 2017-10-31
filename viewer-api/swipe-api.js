/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

/* eslint no-unused-vars: 0 */

/**
 * @typedef {{
 *   clientX: number,
 *   clientY: number,
 *   force: number,
 *   identifier: number,
 *   pageX: number,
 *   pageY: number,
 *   radiusX: number,
 *   radiusY: number,
 *   screenX: number,
 *   screenY: number,
 * }}
 */
let TouchData;

/**
 * @typedef {{
 *   type: string,
 *   touches: !Array<TouchData>|undefined,
 *   changedTouches: !Array<TouchData>|undefined,
 *   altKey: boolean,
 *   ctrlKey: boolean,
 *   detail: number,
 *   eventPhase: number,
 *   metaKey: boolean,
 *   returnValue: boolean,
 *   shiftKey: boolean,
 *   timeStamp: number,
 *   which: number,
 * }}
 */
let EventData;

/**
 * SwipeApi is an interface the Viewer Swipe Protocol.
 * To enable this protocol set cap=swipe in the Viewer's init params.
 * This will add #cap=swipe to the AMP Doc's URL.
 * @interface
 */
class SwipeApi {
  /**
   * Notify viewer that swipe touch has started.
   * @param {!EventData} event
   */
  touchstart(event) {}

  /**
   * Notify viewer about the swipe move event.
   * @param {!EventData} event
   */
  touchmove(event) {}

  /**
   * Notify viewer that swipe touch has ended.
   * @param {!EventData} event
   */
  touchend(event) {}

  /**
   * When true - the scrolling will be locked in the document.
   * @param {boolean} value
   */
  onScrollLock(value) {}
}
