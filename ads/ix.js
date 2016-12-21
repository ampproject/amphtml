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

export function ix(global, data) {
  if (!('slot' in data)) {
    global.CasaleArgs = data;
    writeScript(global, 'https://js-sec.indexww.com/indexJTag.js');
  } else { //DFP ad request call
    if (typeof data.ixId === 'undefined' || isNaN(data.ixId)) {
      callDoubleclick(global, data);
      return;
    } else {
      data.ixId = parseInt(data.ixId, 10);
    }

    if (typeof data.ixSlot === 'undefined' || isNaN(data.ixSlot)) {
      data.ixSlot = 1;
    } else {
      data.ixSlot = parseInt(data.ixSlot, 10);
    }

    if (typeof global._IndexRequestData === 'undefined') {
      global._IndexRequestData = {};
      global._IndexRequestData.impIDToSlotID = {};
      global._IndexRequestData.reqOptions = {};
      global._IndexRequestData.targetIDToBid = {};
    }

    global.IndexArgs = {
      siteID: data.ixId,
      slots: [{
        width: data.width,
        height: data.height,
        id: data.ixSlot,
      }],
      callback: (responseID, bids) => {
        data.targeting = data.targeting || {};
        if (typeof bids !== 'undefined' && bids.length > 0) {
          const target = bids[0].target.substring(0,2) === 'O_' ? 'IOM' : 'IPM';
          data.targeting[target] = bids[0].target.substring(2);
        }
        data.targeting['IX_AMP'] = '1';
        callDoubleclick(global, data);
      },
    };

    global.addEventListener('message', event => {
      if (typeof event.data !== 'string' ||
        event.data.substring(0,11) !== 'ix-message-') {
        return;
      }
      indexAmpRender(document, event.data.substring(11));
    });

    writeScript(global, 'https://js-sec.indexww.com/apl/apl6.js');
  }
}


function callDoubleclick(global, data) {
  delete data['ixId'];
  delete data['ixSlot'];
  doubleclick(global, data);
}

function indexAmpRender(doc, targetID) {
  try {
    const ad = global._IndexRequestData.targetIDToBid[targetID].pop();
    if (ad != null) {
      const admDiv = document.createElement('div');
      admDiv./*OK*/innerHTML = ad;
      doc.body.appendChild(admDiv);
    }
  } catch (e) {};
}
