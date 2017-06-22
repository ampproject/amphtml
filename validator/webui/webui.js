/**
 * @license
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
 * limitations under the license.
 */

// Extracts a dictionary of parameters from window.location.hash.
function getLocationHashParams() {
  var paramStrings = window.location.hash.substr(1).split('&');
  var params = {};
  for (var ii = 0; ii < paramStrings.length; ii++) {
    var keyValue = paramStrings[ii].split('=');
    if (keyValue[0].length > 0) {
      params[keyValue[0]] = keyValue[1]
          ? decodeURIComponent(keyValue[1]) : undefined;
    }
  }
  return params;
}

// Removes given parameter from window.location.hash.
function removeParamFromLocationHashParams(param) {
  var params = getLocationHashParams();
  delete params[param];
  setLocationHashParams(params);
}

// Sets window.location hash based on a dictionary of parameters.
function setLocationHashParams(params) {
  var out = [];
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      out.push(key + '=' + encodeURIComponent(params[key]));
    }
  }
  window.location.hash = out.join('&');
}
