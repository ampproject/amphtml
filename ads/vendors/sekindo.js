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

import {hasOwn} from '../../src/utils/object';
import {loadScript, validateData} from '../../3p/3p';

/**
 * @param {!Window} global
 * @param {{
 *   spaceid: string
 * }} data
 */
export function sekindo(global, data) {
  validateData(data, ['spaceid']);
  /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */
  const context = /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */ (global.context);
  const pubUrl = encodeURIComponent(context.sourceUrl || '');
  const excludesSet = {ampSlotIndex: 1, type: 1};
  const customParamMap = {spaceid: 's', width: 'x', height: 'y'};
  let query =
    'isAmpProject=1&pubUrl=' + pubUrl + '&cbuster=' + context.startTime + '&';
  let getParam = '';
  for (const key in data) {
    if (hasOwn(data, key)) {
      if (typeof excludesSet[key] == 'undefined') {
        getParam =
          typeof customParamMap[key] == 'undefined' ? key : customParamMap[key];
        query += getParam + '=' + encodeURIComponent(data[key]) + '&';
      }
    }
  }
  loadScript(
    global,
    'https://live.sekindo.com/live/liveView.php?' + query,
    () => {
      context.renderStart();
    },
    () => {
      context.noContentAvailable();
    }
  );
}
