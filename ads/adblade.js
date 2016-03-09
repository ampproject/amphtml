/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {writeScript, checkData, validateDataExists} from '../src/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adblade(global, data) {
  const adbladeClassname = 'adbladeads';
  const adbladeAdHost = 'web.adblade.com';
  const adbladeProtocol = 'https';
  const adbladeScript = adbladeProtocol + '://' + adbladeAdHost + '/js/ads/async/show.js';
  const adbladeAdType = '1';
  const adbladeFields = ['width', 'height', 'cid'];

  checkData(data, adbladeFields);
  validateDataExists(data, adbladeFields);

  // create a data element so our script knows what to do
  const ins = document.createElement('ins');
  ins.setAttribute('class', adbladeClassname);
  ins.setAttribute('data-width', data.width);
  ins.setAttribute('data-height', data.height);
  ins.setAttribute('data-cid', data.cid);
  ins.setAttribute('data-host', adbladeAdHost);
  ins.setAttribute('data-protocol', adbladeProtocol);
  ins.setAttribute('data-tag-type', adbladeAdType);

  // add the data element to the document
  document.write(ins.outerHTML);

  // run our JavaScript code to display the ad unit
  writeScript(global, adbladeScript);
}
