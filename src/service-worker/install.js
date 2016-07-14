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

import {calculateScriptBase} from '../insert-extension';
import {isExperimentOn} from '../experiments';
import {dev} from '../log';

const TAG = 'cache-service-worker';

export function installCacheServiceWorker(win) {
  if (isExperimentOn(win, TAG) && 'serviceWorker' in navigator) {
    // TODO Switch this to `sw.js` after testing.
    const url = `${calculateScriptBase(win)}/sw.max.js`;
    navigator.serviceWorker.register(url).then(registration => {
      dev.info(TAG, 'ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(err => {
      dev.error(TAG, 'ServiceWorker registration failed: ', err);
    });
  }
}
