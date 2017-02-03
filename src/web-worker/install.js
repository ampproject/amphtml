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

import {calculateEntryPointScriptUrl} from '../service/extension-location';
import {isExperimentOn} from '../experiments';
import {getMode} from '../mode';
import {parseUrl} from '../url';
import {urls} from '../config';

const TAG = 'web-worker';

let worker;

/**
 * TODO
 */
export function getWebWorker(win) {
  if (worker) {
    return worker;
  }
  // if (!isExperimentOn(win, TAG)) {
  //   return;
  // }
  if (!('Worker' in win)) {
    return null;
  }
  if (!getMode().localDev &&
      win.location.hostname !== parseUrl(urls.cdn).hostname) {
    return;
  }
  const url =
      calculateEntryPointScriptUrl(location, 'ww', getMode().localDev);
  worker = new win.Worker(url);
  return worker;
}
