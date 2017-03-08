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

import {writeScript, loadScript} from '../3p/3p';
import {doubleclick} from '../ads/google/doubleclick';

const DEFAULT_TIMEOUT = 500; // ms

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function ix(global, data) {
  if (!('slot' in data)) {
    global.CasaleArgs = data;
    writeScript(global, 'https://js-sec.indexww.com/indexJTag.js');
  } else { //DFP ad request call

    let calledDoubleclick = false;
    data.ixTimeout = isNaN(data.ixTimeout) ? DEFAULT_TIMEOUT : data.ixTimeout;
    const timer = setTimeout(() => {
      callDoubleclick();
    }, data.ixTimeout);

    const callDoubleclick = function() {
      if (calledDoubleclick) { return; }
      calledDoubleclick = true;
      clearTimeout(timer);
      delete data['ixId'];
      delete data['ixSlot'];
      delete data['ixTimeout'];
      data.targeting['IX_AMP'] = '1';
      doubleclick(global, data);
    };

    data.targeting = data.targeting || {};
    if (typeof data.ixId === 'undefined' || isNaN(data.ixId)) {
      callDoubleclick();
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
        if (typeof bids !== 'undefined' && bids.length > 0) {
          const target = bids[0].target.substring(0,2) === 'O_' ? 'IOM' : 'IPM';
          data.targeting[target] = bids[0].target.substring(2);
        }
        callDoubleclick();
      },
    };

    global.addEventListener('message', event => {
      if (typeof event.data !== 'string' ||
        event.data.substring(0,11) !== 'ix-message-') {
        return;
      }
      indexAmpRender(document, event.data.substring(11), global);
    });

    loadScript(global, 'https://js-sec.indexww.com/apl/apl6.js', undefined, () => {
      callDoubleclick();
    });
  }
}

function indexAmpRender(doc, targetID, global) {
  try {
    const ad = global._IndexRequestData.targetIDToBid[targetID].pop();
    if (ad != null) {
      const admDiv = document.createElement('div');
      admDiv.setAttribute('style', 'position: absolute; top: 0; left: 0;');
      admDiv./*OK*/innerHTML = ad;
      document.getElementById('c').appendChild(admDiv);
    } else {
      global.context.noContentAvailable();
    }
  } catch (e) {
    global.context.noContentAvailable();
  };
}
