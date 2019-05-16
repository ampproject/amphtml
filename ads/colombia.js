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
export function colombia(global, data) {
  validateData(data, [
    'clmb_slot',
    'clmb_position',
    'clmb_section',
    'clmb_divid',
    'loadingStrategy',
  ]);
  // push the two object into the '_colombia' global
  (global._colombia = global._colombia || []).push({
    clmbslot: data.clmb_slot,
    clmbposition: data.clmb_position,
    clmbsection: data.clmb_section,
    clmbdivid: data.clmb_divid,
  });
  // install observation on entering/leaving the view
  global.context.observeIntersection(function(newrequest) {
    newrequest.forEach(function(d) {
      if (d.intersectionRect.height > 0) {
        global._colombia.push({
          visible: true,
          rect: d,
        });
      }
    });
  });
  loadScript(
    global,
    'https://static.clmbtech.com/ad/commons/js/colombia-amp.js'
  );
}
