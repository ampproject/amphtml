/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {writeScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function bidtellect(global, data) {
  const requiredParams = ['t', 'pid', 'sid'];
  const optionalParams = [
    'sname',
    'pubid',
    'pubname',
    'renderid',
    'bestrender',
    'autoplay',
    'playbutton',
    'videotypeid',
    'videocloseicon',
    'targetid',
    'bustframe'];
  validateData(data, requiredParams, optionalParams);
  let params = '?t=' + encodeURIComponent(data.t);
  params += '&pid=' + encodeURIComponent(data.pid);
  params += '&sid=' + encodeURIComponent(data.sid);
  if (data.width) {
    params += '&w=' + encodeURIComponent(data.width);
  }
  if (data.height) {
    params += '&h=' + encodeURIComponent(data.height);
  }
  optionalParams.forEach(function(param) {
    if (data[param]) {
      params += '&' + param + '=' + encodeURIComponent(data[param]);
    }
  });
  const url = 'https://cdn.bttrack.com/js/infeed/2.0/infeed.min.js' + params;
  writeScript(global, url);
}
