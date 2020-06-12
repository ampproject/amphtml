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

import {dev} from '../../../src/log';

/** @enum {string} */
export const VideoDockingEvents = {
  DISMISS_ON_TAP: 'dock-dismiss-on-tap',
  SCROLL_BACK: 'dock-scroll-back',
};

/**
 * @param {!MouseEvent|!TouchEvent} e
 * @return {{x: number, y: number}}
 * @package
 */
export function pointerCoords(e) {
  const coords = e.touches ? e.touches[0] : e;
  return {
    x: dev().assertNumber('x' in coords ? coords.x : coords.clientX),
    y: dev().assertNumber('y' in coords ? coords.y : coords.clientY),
  };
}
