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
export function sogou_ad(global, data) {
  validateData(data, ['slot', 'w', 'h'], ['responsive']);
  const slot = global.document.getElementById('c');
  const ad = global.document.createElement('div');
  global.sogou_un = window.sogou_un || [];
  if(data.w === '100%'){
    global.sogou_un.push({id: data.slot,ele:ad});
  }else{
    global.sogou_un.push({id: data.slot,ele:ad,w:data.w,h:data.h});
  }
  slot.appendChild(ad);
  loadScript(global, 'https://theta.sogoucdn.com/wap/js/aw.js');
};
