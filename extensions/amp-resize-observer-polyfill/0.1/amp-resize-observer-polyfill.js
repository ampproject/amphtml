/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {installResizeObserver} from 'resize-observer-polyfill/resize-observer.install';
import {registerServiceBuilder} from '../../../src/service';
import {upgradePolyfill} from '../../../src/polyfillstub/resize-observer-stub';

const TAG = 'amp-resize-observer-polyfill';

/**
 * @param {!Window} win
 * @return {!Object}
 */
function upgrade(win) {
  upgradePolyfill(win, () => {
    installResizeObserver(win);
  });
  return {};
}

/**
 * Registers the polyfill.
 * @param {!Window} win
 */
export function upgradeResizeObserverPolyfill(win) {
  registerServiceBuilder(win, TAG, upgrade, /* instantiate */ true);
}

// eslint-disable-next-line no-unused-vars
AMP.extension(TAG, '0.1', function (AMP) {
  upgradeResizeObserverPolyfill(window);
});
