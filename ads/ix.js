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

import {writeScript} from '../3p/3p';
import {doubleclick} from '../ads/google/doubleclick';

/**
 * @param {!Window} global
 * @param {!Object} data
 */

function callDoubleclick(global, data) {
  if ('ixId' in data) {
    delete data['ixId'];
  }
  doubleclick(global, data);
}

function index_amp_render(doc, targetID) {
  try {
    var ad = _IndexRequestData.targetIDToBid[targetID].pop();
    if (ad != null) {
        var admDiv = document.createElement('div');
        admDiv.innerHTML = ad;
        doc.body.appendChild(admDiv);
    }
  } catch (e) {};
}

export function ix(global, data) {
  if (!('slot' in data)) {
    global.CasaleArgs = data;
    writeScript(global, 'https://js-sec.indexww.com/indexJTag.js');
  } else { //DFP ad request call
    if (typeof data.ixId === 'undefined' || isNaN(data.ixId)) {
      callDoubleclick(global, data);
      return;
    }

    global.IndexArgs = {
      siteID: parseInt(data.ixId),
      slots: [{
        width:data.width,
        height:data.height,
        id:1,
      }],
      callback: (responseID, bids) => {
        if (!('targeting' in data)) {
          data.targeting = {};
        }
        if (typeof bids !== "undefined" && bids.length > 0){
          data.targeting[bids[0].target.substring(0,2) === 'O_' ? 'IOM' : 'IPM'] = bids[0].target.substring(2);
        }
        data.targeting['IX_AMP'] = '1';
        callDoubleclick(global, data);
      },
    };

    window.addEventListener('message', (event) => {
      if (typeof event.data !== 'string' || event.data.substring(0,11) !== 'ix-message-') {
        return;
      }
      index_amp_render(document, event.data.substring(11));
    }, false);

    writeScript(global, 'https://js-sec.indexww.com/apl/apl6.js');
  }
}
