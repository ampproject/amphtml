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
import {dev} from '../../../src/log';


/**
 * @param {!Element} el
 */
const requestFullScreenImpl = function(el) {
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.webkitRequestFullScreen) {
    el.webkitRequestFullScreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  } else {
    dev().warn('Ignored fullscreen request.');
  }
};


/**
 * @param {!Element} el
 */
const exitFullScreenImpl = function(el) {
  const doc = el.ownerDocument;

  if (doc.exitFullscreen) {
    doc.exitFullscreen();
  } else if (doc.webkitExitFullscreen) {
    doc.webkitExitFullscreen();
  } else if (doc.mozCancelFullScreen) {
    doc.mozCancelFullScreen();
  } else if (doc.msExitFullscreen) {
    doc.msExitFullscreen();
  } else {
    dev().warn('Ignored fullscreen request.');
  }
};


/**
 * @param {!Element} el
 * @return {boolean}
 */
const isFullScreenSupportedImpl = function(el) {
  return !!(el.requestFullscreen ||
      el.webkitRequestFullScreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen);
};


/**
 * @param {!Document} doc
 * @return {?Element}
 */
const getFullscreenElementImpl = function(doc) {
  return doc.fullscreenElement || doc.webkitFullscreenElement ||
      doc.mozFullScreenElement || doc.msFullscreenElement;
};


/**
 * @param {!Element} el
 */
export let requestFullScreen = requestFullScreenImpl;


/**
 * @param {!Element} el
 */
export let exitFullScreen = exitFullScreenImpl;


/**
 * @param {!Element} el
 * @return {boolean}
 */
export let isFullScreenSupported = isFullScreenSupportedImpl;


/**
 * @param {!Document} doc
 * @return {?Element}
 */
export const getFullScreenElement = getFullscreenElementImpl;


/** @visibleForTesting */
export function stubFullScreenForTesting(isSupported, requestFn, exitFn) {
  isFullScreenSupported = () => !!isSupported;
  requestFullScreen = requestFn;
  exitFullScreen = exitFn;
}


/** @visibleForTesting */
export function resetFullScreenForTesting() {
  requestFullScreen = requestFullScreenImpl;
  exitFullScreen = exitFullScreenImpl;
  isFullScreenSupported = isFullScreenSupportedImpl;
}
