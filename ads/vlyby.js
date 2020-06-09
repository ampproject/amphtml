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

import {validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function vlyby(global, data) {
  /*eslint "google-camelcase/google-camelcase": 0*/
  global._vlyby_amp = {
    allowed_data: ['pubref'],
    mandatory_data: ['publisherid', 'placementid'],
    data,
  };

  validateData(
    data,
    global._vlyby_amp.mandatory_data
  );

  const rand = Math.round(Math.random() * 100000000);

  // install observation on entering/leaving the view
  global.context.observeIntersection(function (changes) {
    /** @type {!Array} */ (changes).forEach(function (c) {
      if (c.intersectionRect.height) {
        if (window._vlybyAmpStart && window._vlybyAmpStart === 'function') {
            _vlybyAmpStart();
        }
      }
    });
  });

  //create Container
  const containerId = 'qad'+rand;
  createContainer(global, containerId);
  
  //create Script
  createScript(global, containerId);
  
  function createScript(global, id) {
    const s = global.document.createElement('script');
    const referrer = global._vlyby_amp.data.pubref || global.context.referrer;
    const url = global.context.canonicalUrl;
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('async', 'true');
    s.setAttribute('src', '//cdn.vlyby.com/qad/qad-outer2.js');
    s.setAttribute('data-PubId', global._vlyby_amp.data.publisherid);
    s.setAttribute('data-PlacementId', global._vlyby_amp.data.placementid);
    s.setAttribute('data-DivId', id);
    s.setAttribute('data-PubRef', referrer);
    //s.setAttribute('data-ManualStart', 'true');
    //s.setAttribute('data-ManualStartFuncName', '_vlybyAmpStart');
    global.document.getElementById('c').appendChild(s);
  }
  function createContainer(global, id) {
    const d = global.document.createElement('div');
    d.id = id;
    global.document.getElementById('c').appendChild(d);
  }
}
