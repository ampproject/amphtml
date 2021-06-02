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

/**
 * Replacement for `Element.requestFullscreen()` method.
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
 * @param {!Element} element
 */
export function fullscreenEnter(element) {
  const requestFs =
    element.requestFullscreen ||
    element.requestFullScreen ||
    element.webkitRequestFullscreen ||
    element.webkitEnterFullscreen ||
    element.msRequestFullscreen ||
    element.mozRequestFullScreen;
  if (requestFs) {
    requestFs.call(element);
  }
}

/**
 * Replacement for `Document.exitFullscreen()` method.
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/exitFullscreen
 * @param {!Element} element
 */
export function fullscreenExit(element) {
  const elementBoundExit =
    element.cancelFullScreen ||
    element.exitFullscreen ||
    element.webkitExitFullscreen ||
    element.webkitCancelFullScreen ||
    element.mozCancelFullScreen ||
    element.msExitFullscreen;
  if (elementBoundExit) {
    elementBoundExit.call(element);
    return;
  }
  const {ownerDocument} = element;
  if (!ownerDocument) {
    return;
  }
  const docBoundExit =
    ownerDocument.cancelFullScreen ||
    ownerDocument.exitFullscreen ||
    ownerDocument.webkitExitFullscreen ||
    ownerDocument.webkitCancelFullScreen ||
    ownerDocument.mozCancelFullScreen ||
    ownerDocument.msExitFullscreen;
  if (docBoundExit) {
    docBoundExit.call(ownerDocument);
  }
}

/**
 * Replacement for `Document.fullscreenElement`.
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/fullscreenElement
 * @param {!Element} element
 * @return {boolean}
 */
export function isFullscreenElement(element) {
  const {webkitDisplayingFullscreen} = element;
  if (webkitDisplayingFullscreen !== undefined) {
    return webkitDisplayingFullscreen;
  }
  const {ownerDocument} = element;
  if (!ownerDocument) {
    return false;
  }
  const fullscreenElement =
    ownerDocument.fullscreenElement ||
    ownerDocument.webkitFullscreenElement ||
    ownerDocument.mozFullScreenElement ||
    ownerDocument.webkitCurrentFullScreenElement;
  return fullscreenElement == element;
}
