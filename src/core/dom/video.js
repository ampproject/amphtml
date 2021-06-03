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
import {devAssertElement} from '../assert';
import {setStyles} from './style';

/**
 * @param {!Window} win
 * @return {!Promise<boolean>}
 */
export function detectIsAutoplaySupported(win) {
  // To detect autoplay, we create a video element and call play on it, if
  // `paused` is true after `play()` call, autoplay is supported. Although
  // this is unintuitive, it works across browsers and is currently the lightest
  // way to detect autoplay without using a data source.
  const detectionElement = /** @type {!HTMLVideoElement} */ (
    win.document.createElement('video')
  );

  // NOTE(aghassemi): We need both attributes and properties due to Chrome and
  // Safari differences when dealing with non-attached elements.
  detectionElement.setAttribute('muted', '');
  detectionElement.setAttribute('playsinline', '');
  detectionElement.setAttribute('webkit-playsinline', '');
  detectionElement.setAttribute('height', '0');
  detectionElement.setAttribute('width', '0');

  detectionElement.muted = true;
  detectionElement.playsInline = true;
  detectionElement['playsinline'] = true;
  detectionElement['webkitPlaysinline'] = true;

  setStyles(detectionElement, {
    position: 'fixed',
    top: '0',
    width: '0',
    height: '0',
    opacity: '0',
  });

  // Promise wrapped this way to catch both sync throws and async rejections.
  // More info: https://github.com/tc39/proposal-promise-try
  new Promise((resolve) => resolve(detectionElement.play())).catch(() => {
    // Suppress any errors, useless to report as they are expected.
  });

  return Promise.resolve(!detectionElement.paused);
}

const AUTOPLAY_SUPPORTED_WIN_PROP = '__AMP_AUTOPLAY';

/**
 * Determines autoplay support.
 *
 * Note that even if platfrom supports autoplay, users or browsers can disable
 * autoplay to save data / battery. This detects both platfrom support and
 * when autoplay has been disabled by the user.
 *
 * @param {!Window} win
 * @return {!Promise<boolean>}
 */
export function isAutoplaySupported(win) {
  if (win[AUTOPLAY_SUPPORTED_WIN_PROP] == null) {
    win[AUTOPLAY_SUPPORTED_WIN_PROP] = detectIsAutoplaySupported(win);
  }
  return win[AUTOPLAY_SUPPORTED_WIN_PROP];
}

/**
 * @param {!Window} win
 * @visibleForTesting
 */
export function resetIsAutoplaySupported(win) {
  delete win[AUTOPLAY_SUPPORTED_WIN_PROP];
}

/**
 * @param {!Element} element
 * @return {!Element}
 */
export function getInternalVideoElementFor(element) {
  return devAssertElement(element.querySelector('video, iframe'));
}
