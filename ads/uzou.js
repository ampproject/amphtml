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

import {loadScript, validateData} from '../3p/3p';
import {parseJson} from '../src/json';

/**
* @param {!Window} global
* @param {!Object} data
*/
export function uzou(global, data) {
  varidateData(data, ['widgetParams'], []);

  const widgetParams = parseJson(data.widgetParams);
  const placement_code = widgetParams.placement_code;

  global.UzouInjector = {
    url: data['url'] || global.context.canonicalUrl || global.context.sourceUrl,
    ref: data['referrer'] || global.context.referrer,
  }

  loadScript(global, `https://speee-ad.akamaized.net/tag/${placement_code}/js/outer-frame.min.js`);
}
