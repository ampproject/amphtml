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
import {loadScript, validateData} from '../../3p/3p';

/**
 * @param {!Window} global
 * @param {{
 *   code: string,
 * }} data
 */
export function meg(global, data) {
  validateData(data, ['code']);
  const {code} = data;
  /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */
  const context = /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */ (global.context);
  const lang = global.encodeURIComponent(global.navigator.language);
  const ref = global.encodeURIComponent(context.referrer || '');
  const params = ['lang=' + lang, 'ref=' + ref].join('&');
  const url = 'https://apps.meg.com/embedjs/' + code + '?' + params;
  global._megAdsLoaderCallbacks = {
    onSuccess: () => {
      context.renderStart();
    },
    onError: () => {
      context.noContentAvailable();
    },
  };
  loadScript(
    global,
    url,
    () => {
      // Meg has been loaded
    },
    () => {
      // Cannot load meg embed.js
      context.noContentAvailable();
    }
  );
}
