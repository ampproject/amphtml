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

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function xlift(global, data) {
  validateData(data, ['mediaid']);

  global.xliftParams = data;
  const d = global.document.createElement('div');
  d.id = '_XL_recommend';
  global.document.getElementById('c').appendChild(d);

  d.addEventListener('SuccessLoadedXliftAd', function(e) {
    e.detail = e.detail || {adSizeInfo: {}};
    global.context.renderStart(e.detail.adSizeInfo);
  });
  d.addEventListener('FailureLoadedXliftAd', function() {
    global.context.noContentAvailable();
  });

  //assign XliftAmpHelper property to global(window)
  global.XliftAmpHelper = null;

  loadScript(
    global,
    'https://cdn.x-lift.jp/resources/common/xlift_amp.js',
    () => {
      if (!global.XliftAmpHelper) {
        global.context.noContentAvailable();
      } else {
        global.XliftAmpHelper.show();
      }
    },
    () => {
      global.context.noContentAvailable();
    }
  );
}
