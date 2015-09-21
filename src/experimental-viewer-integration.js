/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {log} from './log';


/**
 * Experimental implementation of an integration with a viewer that iframes
 * this document.
 */
export function installExperimentalViewerIntegration() {
  if (parent != window) {  // the amp page is being loaded in an iframe
    listenAndPostTouchMessages_();
  }
}

/**
 * Adds listeners to touch events to copy them and post them as messages to the
 * container frame.
 * @private
 */
function listenAndPostTouchMessages_() {
  document.addEventListener('touchstart', copyTouchAndPostMessage_, false);
  document.addEventListener('touchend', copyTouchAndPostMessage_, false);
  document.addEventListener('touchmove', copyTouchAndPostMessage_, false);
}

/**
 * Makes a partial copy of the event e and posts a message with it.
 * @param {Event} e The event object to be copied and reposted.
 * @private
 */
function copyTouchAndPostMessage_(e) {
  if (e && parent != window) {
    var msg = copyTouchEvent_(/** @type {!Event} */ e);
    // TODO(flaviop, 23309537): Provide a way to pass down the parent origin to
    // be set as target frame.
    parent./*TODO-review*/postMessage({touchEvent: msg}, '*' /* any target frame */);
  }
}

/**
 * Makes a partial copy of the event and posts a message with it.
 * @param {!Event} e The event object to be copied and posted.
 * @private
 * @return {!Event}
 */
function copyTouchEvent_(e) {
  var eventProperties = [
      'altKey',
      'charCode',
      'ctrlKey',
      'detail',
      'eventPhase',
      'keyCode',
      'layerX',
      'layerY',
      'metaKey',
      'pageX',
      'pageY',
      'returnValue',
      'shiftKey',
      'timeStamp',
      'type',
      'which'
  ];
  var copiedEvent = copyProperties_(e, eventProperties);
  copiedEvent.touches = copyTouches_(e.touches);
  copiedEvent.changedTouches = copyTouches_(e.changedTouches);
  return copiedEvent;
}

/**
 * @param {!Array<Object>} touchList
 * @return {!Array<Object>}
 * @private
 */
function copyTouches_(touchList) {
  var touchProperties = [
      'clientX',
      'clientY',
      'force',
      'identifier',
      'pageX',
      'pageY',
      'radiusX',
      'radiusY',
      'screenX',
      'screenY'
  ];
  var copiedTouches = [];
  for (var i = 0; i < touchList.length; i++) {
    copiedTouches.push(copyProperties_(touchList[i], touchProperties));
  }
  return copiedTouches;
}

/**
 * @param {!Object} o
 * @param {!Array<string>} properties
 * @return {!Object}
 * @private
 */
function copyProperties_(o, properties) {
  var copy = {};
  for (var i = 0; i < properties.length; i++) {
    var p = properties[i];
    if (o[p] !== undefined) {
      copy[p] = o[p];
    }
  }
  return copy;
}
