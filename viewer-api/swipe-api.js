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
 *   touches: Array.<TouchData>,
 *   changedTouches: Array.<TouchData>,
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
 * SwipeAPI is an interface the Viewer Swipe Protocol.
 * @interface
 */
class SwipeAPI {
  /**
   * Notify viewer that swipe touch has started.
   * @param {!EventData} unusedEvent
   * @param {boolean} unusedRsvp always false
   */
  touchstart(unusedEvent, unusedRsvp) {}

  /**
   * Notify viewer about the swipe move event.
   * @param {!EventData} unusedEvent
   * @param {boolean} unusedRsvp always false
   */
  touchmove(unusedEvent, unusedRsvp) {}

  /**
   * Notify viewer that swipe touch has ended.
   * @param {!EventData} unusedEvent
   * @param {boolean} unusedRsvp always false
   */
  touchend(unusedEvent, unusedRsvp) {}

  /**
   * Update scroll lock state on viewer's request. When set to 'true',
   * preventDefault will prevent vertical swiping. When set to 'false',
   * vertical swiping will be enabled. Default value is 'false'.
   * @param {boolean} value
   */
  onScrollLock(value) {}
}
