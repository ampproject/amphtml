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

import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function postquare(global, data) {

  validateData(data, ['widgetids']);

  global._postquare = global._postquare || {
    viewId: global.context.pageViewId,
    widgetIds: data['widgetids'],
    websiteId: data['websiteid'],
    publisherId: data['publisherid'],
    url: data['url'] || global.context.canonicalUrl,
    ampURL: data['ampurl'] || global.context.sourceUrl,
    mode: data['mode'] || 1,
    style: data['stylecss'] || '',
    referrer: global.context.referrer,
  };

  if (data['mode'] == 100) {
    loadScript(global, 'https://widget.engageya.com/pos_amp_loader.js');
  } else {
    loadScript(global, 'https://widget.postquare.com/postquare_amp_loader.js');
  }
}
