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

import {doubleclick} from '../ads/google/doubleclick';
import {hasOwn} from '../src/utils/object';
import {loadScript, writeScript} from '../3p/3p';

const DEFAULT_TIMEOUT = 500; // ms
const EVENT_SUCCESS = 0;
const EVENT_TIMEOUT = 1;
const EVENT_ERROR = 2;
const EVENT_BADTAG = 3;

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function ix(global, data) {
  if (!('slot' in data)) {
    global.CasaleArgs = data;
    writeScript(global, 'https://js-sec.indexww.com/indexJTag.js');
  } else {
    //DFP ad request call

    const start = Date.now();
    let calledDoubleclick = false;
    data.ixTimeout = isNaN(data.ixTimeout) ? DEFAULT_TIMEOUT : data.ixTimeout;
    const timer = setTimeout(() => {
      callDoubleclick(EVENT_TIMEOUT);
    }, data.ixTimeout);

    const callDoubleclick = function (code) {
      if (calledDoubleclick) {
        return;
      }
      calledDoubleclick = true;
      clearTimeout(timer);
      reportStats(data.ixId, data.ixSlot, data.slot, start, code);
      prepareData(data);
      doubleclick(global, data);
    };

    if (typeof data.ixId === 'undefined' || isNaN(data.ixId)) {
      callDoubleclick(EVENT_BADTAG);
      return;
    }

    global.IndexArgs = {
      ampCallback: callDoubleclick,
      ampSuccess: EVENT_SUCCESS,
      ampError: EVENT_ERROR,
    };

    loadScript(
      global,
      'https://js-sec.indexww.com/apl/amp.js',
      undefined,
      () => {
        callDoubleclick(EVENT_ERROR);
      }
    );
  }
}

/**
 * @param {!Object} data
 */
function prepareData(data) {
  for (const attr in data) {
    if (hasOwn(data, attr) && /^ix[A-Z]/.test(attr)) {
      delete data[attr];
    }
  }
  data.targeting = data.targeting || {};
  data.targeting['IX_AMP'] = '1';
}

/**
 * @param {string} siteID
 * @param {string} slotID
 * @param {string} dfpSlot
 * @param {number} start
 * @param {number} code
 */
function reportStats(siteID, slotID, dfpSlot, start, code) {
  try {
    if (code == EVENT_BADTAG) {
      return;
    }
    const xhttp = new XMLHttpRequest();
    xhttp.withCredentials = true;

    const deltat = Date.now() - start;
    const ts = (start / 1000) >> 0;
    const ets = (Date.now() / 1000) >> 0;
    let url = 'https://as-sec.casalemedia.com/headerstats?s=' + siteID;
    if (typeof window.context.location.href !== 'undefined') {
      url += '&u=' + encodeURIComponent(window.context.location.href);
    }
    let stats = '{"p":"display","d":"mobile","t":' + ts + ',';
    stats += '"sl":[{"s": "' + slotID + '",';
    stats += '"t":' + ets + ',';
    stats += '"e": [{';
    if (code == EVENT_SUCCESS) {
      stats += '"n":"amp-s",';
    } else if (code == EVENT_TIMEOUT) {
      stats += '"n":"amp-t",';
    } else {
      stats += '"n":"amp-e",';
    }
    stats += '"v":"' + deltat + '",';
    stats += '"b": "INDX","x": "' + dfpSlot.substring(0, 64) + '"}]}]}';

    xhttp.open('POST', url, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(stats);
  } catch (e) {}
}
