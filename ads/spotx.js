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

import {hasOwn} from '../src/utils/object';
import {startsWith} from '../src/string';
import {validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function spotx(global, data) {
  // ensure we have valid channel id
  validateData(data, ['spotx_channel_id', 'width', 'height']);

  // Because 3p's loadScript does not allow for data attributes,
  // we will write the JS tag ourselves.
  const script = global.document.createElement('script');

  data['spotx_content_width'] = data.spotx_content_width || data.width;
  data['spotx_content_height'] = data.spotx_content_height || data.height;
  data['spotx_content_page_url'] = global.context.location.href ||
      global.context.sourceUrl;

  // Add data-* attribute for each data value passed in.
  for (const key in data) {
    if (hasOwn(data, key) && startsWith(key, 'spotx_')) {
      script.setAttribute(`data-${key}`, data[key]);
    }
  }

  global['spotx_ad_done_function'] = function(spotxAdFound) {
    if (!spotxAdFound) {
      global.context.noContentAvailable();
    }
  };

  // TODO(KenneyE): Implement AdLoaded callback in script to accurately trigger renderStart()
  script.onload = global.context.renderStart;

  script.src = `//js.spotx.tv/easi/v1/${data['spotx_channel_id']}.js`;
  global.document.body.appendChild(script);
}
