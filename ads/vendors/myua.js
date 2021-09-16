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

import {validateData} from '../../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function myua(global, data) {
  validateData(data, ['sid', 'iid'], ['demo', 'options']);

  const informerTag = global.document.createElement('div');
  informerTag.setAttribute('data-top-iid', data.iid);
  global.document.body.appendChild(informerTag);

  const scriptTag = global.document.createElement('script');
  scriptTag.src = `https://amp.top-js-metrics.top.${data.demo ? `dev.` : ''}my.ua/script.js`;
  scriptTag.setAttribute('async', 'true');
  scriptTag.setAttribute('data-top-sid', data.sid);

  global.document.body.appendChild(scriptTag);
}
