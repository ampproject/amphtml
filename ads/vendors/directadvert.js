/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {loadScript, validateData} from '../../3p/3p';
import {serializeQueryString} from '../../src/url';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function directadvert(global, data) {
  validateData(data, ['blockId']);

  /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */
  const context = /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */ (global.context);
  const params = /** @type {!JsonObject} */ ({
    'async': 1,
    'div': 'c',
  });

  if (context.referrer) {
    params['amp_rref'] = encodeURIComponent(context.referrer);
  }

  if (context.canonicalUrl) {
    params['amp_rurl'] = encodeURIComponent(context.canonicalUrl);
  }

  const serverName = data['serverName'] || 'code.directadvert.ru';

  const url =
    '//' +
    encodeURIComponent(serverName) +
    '/data/' +
    encodeURIComponent(data['blockId']) +
    '.js?' +
    serializeQueryString(params);

  loadScript(
    global,
    url,
    () => {
      context.renderStart();
    },
    () => {
      context.noContentAvailable();
    }
  );
}
