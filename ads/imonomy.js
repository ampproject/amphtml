/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {loadScript, writeScript} from '../3p/3p';

const DEFAULT_TIMEOUT = 500; // ms
const EVENT_SUCCESS = 0;
const EVENT_TIMEOUT = 1;
const EVENT_ERROR = 2;
const EVENT_BADTAG = 3;
const imonomyData = ['pid', 'subId', 'timeout'];

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function imonomy(global, data) {
  if (!('slot' in data)) {
    global.CasaleArgs = data;
    writeScript(global, `//tag.imonomy.com/${data.pid}/indexJTag.js`);
  } else { //DFP ad request call
    let calledDoubleclick = false;
    data.timeout = isNaN(data.timeout) ? DEFAULT_TIMEOUT : data.timeout;
    const timer = setTimeout(() => {
      callDoubleclick(EVENT_TIMEOUT);
    }, data.timeout);
    const callDoubleclick = function(code) {
      if (calledDoubleclick) { return; }
      calledDoubleclick = true;
      clearTimeout(timer);
      reportStats(data, code);
      prepareData(data);
      doubleclick(global, data);
    };

    if (typeof data.pid === 'undefined' || isNaN(data.pid)) {
      callDoubleclick(EVENT_BADTAG);
      return;
    }

    global.IndexArgs = {
      ampCallback: callDoubleclick,
      ampSuccess: EVENT_SUCCESS,
      ampError: EVENT_ERROR,
    };

    loadScript(
        global, `//tag.imonomy.com/amp/${data.pid}/amp.js`, () => {
          global.context.renderStart();
        }, () => {
          global.context.noContentAvailable();
        });
  }
}

function prepareData(data) {
  for (const attr in data) {
    if (data.hasOwnProperty(attr) && imonomyData.indexOf(attr) >= 0) {
      delete data[attr];
    }
  }
  data.targeting = data.targeting || {};
  data.targeting['IMONOMY_AMP'] = '1';
}

function reportStats(data, code) {
  try {
    if (code == EVENT_BADTAG) { return; }
    const xhttp = new XMLHttpRequest();
    xhttp.withCredentials = true;
    let unitFormat = '';
    let pageLocation = '';
    if (typeof window.context.location.href !== 'undefined') {
      pageLocation = encodeURIComponent(window.context.location.href);
    }
    const subId = data.subId,
        pid = data.pid,
        trackId = 'AMP',
        notFirst = true,
        cid = '',
        abLabel = '',
        rand = Math.random();
    if (!isNaN(data.width) && !isNaN(data.height)) {
      unitFormat = `${data.width}x${data.height}`;
    }
    const uid = '',
        isLocked = false,
        isTrackable = false,
        isClient = false,
        tier = 0;
    const baseUrl = '//srv.imonomy.com/internal/reporter';
    let unitCodeUrl = `${baseUrl}?v=2&subid=${subId}&sid=${pid}&`;
    unitCodeUrl = unitCodeUrl + `format=${unitFormat}&ai=`;
    unitCodeUrl = unitCodeUrl + `${trackId}&ctxu=${pageLocation}&`;
    unitCodeUrl = unitCodeUrl + `fb=${notFirst}&`;
    unitCodeUrl = unitCodeUrl + `cid=${cid} &ab=${abLabel}&cbs=${rand}`;
    if (uid) {
      unitCodeUrl = unitCodeUrl + `&uid=${uid}`;
    }
    if (isLocked) {
      unitCodeUrl = unitCodeUrl + `&is_locked=${isLocked}`;
    }
    if (isTrackable) {
      unitCodeUrl = unitCodeUrl + `&istrk=${isTrackable}`;
    }
    if (isClient) {
      unitCodeUrl = unitCodeUrl + `&is_client=${isClient}`;
      if (tier) {
        unitCodeUrl = unitCodeUrl + `&tier=${tier}`;
      }
    }

    xhttp.open('GET', unitCodeUrl, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();

  } catch (e) {}
}
