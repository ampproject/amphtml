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

import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function invibes(global, data) {
  global.invibesAmp = {
    allowedData: ['adCateg', 'pid', 'customEndpoint'],
    mandatoryData: [],
    data,
  };

  validateData(
    data,
    global.invibesAmp.mandatoryData,
    global.invibesAmp.allowedData
  );

  let url = data.customEndpoint || 'https://k.r66net.com/GetAmpLink';

  if (data.adCateg) {
    url = addQueryParam(url, 'adCateg', data.adCateg);
  }

  if (data.pid) {
    url = addQueryParam(url, 'pid', data.pid);
  }

  if (
    window &&
    window.context &&
    window.context.location &&
    window.context.location.href
  ) {
    url = addQueryParam(url, 'referrerUrl', window.context.location.href);
  }

  loadScript(global, url);
}

/**
 * @param {string} url
 * @param {string} param
 * @param {string} value
 * @return {string}
 */
function addQueryParam(url, param, value) {
  const paramValue =
    encodeURIComponent(param) + '=' + encodeURIComponent(value);
  if (url.indexOf('?') > -1) {
    url += '&' + paramValue;
  } else {
    url += '?' + paramValue;
  }
  return url;
}
