/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {calculateScriptBaseUrl} from '../service/extensions-impl';
import {isExperimentOn} from '../experiments';
import {dev} from '../log';
import {getMode} from '../mode';
import {timerFor} from '../timer';

/** @const */
const TAG = 'cache-service-worker';

/**
 * Registers the Google AMP Cache service worker if the browser supports SWs.
 */
export function installCacheServiceWorker(win) {
  timerFor(win).delay(() => {
    if (!isExperimentOn(win, TAG)) {
      return;
    }
    if (!('serviceWorker' in navigator)) {
      return;
    }
    if (!getMode().localDev &&
        win.location.hostname !== 'cdn.ampproject.org') {
      return;
    }
    const base = calculateScriptBaseUrl(win.location.pathname,
      getMode().localDev, getMode().test);
    const url = `${base}/sw.js`;
    navigator.serviceWorker.register(url).then(reg => {
      dev().info(TAG, 'ServiceWorker registration successful: ', reg);
    }, err => {
      dev().error(TAG, 'ServiceWorker registration failed: ', err);
    });
  });
}
