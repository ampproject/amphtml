/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS-IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {loadScript, validateData} from '#3p/3p';

import {setStyle} from '#core/dom/style';

/**
 * @typedef FeedAdGlobal
 * @private
 *
 * @property {FeedAdAsync} feedad
 */

/**
 * @typedef {object} FeedAdAsync
 * @private
 *
 * @property {FeedAd} [sdk]
 * @property {!Function[]} cmd
 */

/**
 * @typedef {object} FeedAd
 * @private
 *
 * @property {function(string)} init
 * @property {function(string):Promise<FeedAdResponse>} requestAd
 */

/**
 * @typedef {object} FeedAdResponse
 * @private
 *
 * @property {function():HTMLElement} createAdContainer()
 */

/**
 * @typedef {object} FeedAdData
 * @private
 *
 * @property {string} clientToken
 * @property {string} placementId
 * @property {string} [background]
 */

/**
 * @param {!FeedAdGlobal} global
 * @param {!FeedAdData} data
 */
export function feedad(global, data) {
  validateData(data, ['clientToken', 'placementId'], ['background']);

  global.feedad = global.feedad || {cmd: []};
  global.feedad.cmd.push(() => {
    global.feedad.sdk
      .init(data.clientToken)
      .then(() => global.feedad.sdk.requestAd(data.placementId))
      .then((response) => {
        const ad = response.createAdContainer();
        const container = global.document.getElementById('c');
        applyContainerStyle(container, data);
        container.appendChild(ad);
        global.context.renderStart();
        global.context.reportRenderedEntityIdentifier('FeedAd');
        return response.promise;
      })
      .catch(() => {
        global.context.noContentAvailable();
      });
  });
  loadScript(global, 'https://web.feedad.com/sdk/feedad-async.js');
}

/**
 * Centers the ad container within the AMP container.
 * Applies the optional background color for the unfilled space.
 *
 * @param {HTMLElement} container
 * @param {!FeedAdData} data
 */
function applyContainerStyle(container, data) {
  setStyle(container, 'display', 'flex');
  setStyle(container, 'flexDirection', 'row');
  setStyle(container, 'justifyContent', 'stretch');
  setStyle(container, 'alignItems', 'center');
  if (data.background) {
    setStyle(container, 'backgroundColor', data.background);
  }
}
