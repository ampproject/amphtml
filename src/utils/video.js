/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {dev} from '../log';
import {once} from './function';
import {setStyles} from '../style';

/**
 * @param {!Window} win
 * @param {boolean} isLiteViewer
 * @return {!Promise<boolean>}
 */
function isAutoplaySupportedImpl(win, isLiteViewer) {
  // We do not support autoplay in amp-lite viewer regardless of platform.
  if (isLiteViewer) {
    return Promise.resolve(false);
  }

  // To detect autoplay, we create a video element and call play on it, if
  // `paused` is true after `play()` call, autoplay is supported. Although
  // this is unintuitive, it works across browsers and is currently the lightest
  // way to detect autoplay without using a data source.
  const detectionElement = win.document.createElement('video');

  // NOTE(aghassemi): We need both attributes and properties due to Chrome and
  // Safari differences when dealing with non-attached elements.
  detectionElement.setAttribute('muted', '');
  detectionElement.setAttribute('playsinline', '');
  detectionElement.setAttribute('webkit-playsinline', '');
  detectionElement.setAttribute('height', '0');
  detectionElement.setAttribute('width', '0');

  detectionElement.muted = true;
  detectionElement.playsinline = true;
  detectionElement.webkitPlaysinline = true;

  setStyles(detectionElement, {
    position: 'fixed',
    top: '0',
    width: '0',
    height: '0',
    opacity: '0',
  });

  // Promise wrapped this way to catch both sync throws and async rejections.
  // More info: https://github.com/tc39/proposal-promise-try
  new Promise(resolve => resolve(detectionElement.play())).catch(() => {
    // Suppress any errors, useless to report as they are expected.
  });

  return Promise.resolve(!detectionElement.paused);
}

/** @private {?(function(Window, boolean):!Promise<boolean>)} */
let isAutoplaySupported = null;

/**
 * Sets if autoplay is supported.
 */
function setIsAutoplaySupported() {
  isAutoplaySupported = /** @type {function(Window, boolean):!Promise<boolean>} */ (once(
    isAutoplaySupportedImpl
  ));
}

/**
 * Wrapper around static utilities for testability.
 */
export class VideoUtils {
  /**
   * Determines autoplay support.
   *
   * Note that even if platfrom supports autoplay, users or browsers can disable
   * autoplay to save data / battery. This detects both platfrom support and
   * when autoplay has been disabled by the user.
   *
   * @param {!Window} win
   * @param {boolean} isLiteViewer
   * @return {!Promise<boolean>}
   */
  static isAutoplaySupported(win, isLiteViewer) {
    if (!isAutoplaySupported) {
      setIsAutoplaySupported();
    }
    return isAutoplaySupported(win, isLiteViewer);
  }

  /** @visibleForTesting */
  static resetIsAutoplaySupported() {
    setIsAutoplaySupported();
  }
}

/**
 * @param {!Element} element
 * @return {!Element}
 * Note: Not included in `VideoUtils` as we don't need to test a
 * static selector.
 */
export function getInternalVideoElementFor(element) {
  return dev().assertElement(element.querySelector('video, iframe'));
}
