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

import {getMode} from './mode';

/**
 * Provides info about the current app. This return value may be cached and
 * passed around as it will always be DCE'd.
 * @param {?Window=} opt_win
 * @return {!./mode.ModeDef}
 */
export function getModeObject(opt_win) {
  return {
    localDev: getMode(opt_win).localDev,
    development: getMode(opt_win).development,
    filter: getMode(opt_win).filter,
    minified: getMode(opt_win).minified,
    lite: getMode(opt_win).lite,
    test: getMode(opt_win).test,
    log: getMode(opt_win).log,
    version: getMode(opt_win).version,
    rtvVersion: getMode(opt_win).rtvVersion,
  };
}
