/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sabavision(global, data) {
  validateData(data, ['zoneId', 'websiteId'], []);
  global.rfpData = data;
  const adContainer = global.document.getElementById('c');
  const adzoneContainer = getAdContainer(global, data.zoneId);
  const initScript = getInitAdScript(global, data);

  adContainer.appendChild(adzoneContainer);
  global.document.head.appendChild(initScript);
  // load the sabavision AMP JS file
  writeScript(global, '//plus.sabavision.com/dox/dox.min.js', () => {});
}
/**
 * @param {!Window} global
 * @param {string} zoneId
 * @return {?Node}
 */
function getAdContainer(global, zoneId) {
  const container = global.document.createElement('div');

  container['id'] = 'sabavision_zone_' + zoneId + '_plate';

  return container;
}
/**
 * @param {!Window} global
 * @param {!Object} data
 * @return {?Node}
 */
function getInitAdScript(global, data) {
  const scriptElement = global.document.createElement('script');
  const initScript = global.document.createTextNode(
    `var sabaVisionWebsiteID = "${data.websiteId}"; var sabaVisionWebsitePage = "ALL"`
  );

  scriptElement.appendChild(initScript);

  return scriptElement;
}
