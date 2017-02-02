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
export function aduptech(global, data) {
  const elementId = 'aduptech';

  validateData(data, ['placementkey'], ['query', 'mincpc', 'adtest']);

  // add id attriubte to given container (required)
  global.document.getElementById('c').setAttribute('id', elementId);

  // load aduptech js api
  loadScript(global, 'https://s.d.adup-tech.com/jsapi', () => {

    // force responsive ads for amp
    data.responsive = true;

    // ads callback => render start
    //
    // NOTE: Not using "data.onAds = global.context.renderStart;"
    //       because the "onAds()" callback returns our API object
    //       as first parameter which will cause errors
    data.onAds = () => {
      global.context.renderStart();
    };

    // no ads callback => noContentAvailable
    data.onNoAds = global.context.noContentAvailable;

    // embed iframe
    global.uAd.embed(elementId, data);
  });
}
