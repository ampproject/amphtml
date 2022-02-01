import {loadScript, writeScript} from '#3p/3p';

import {doubleclick} from '#ads/google/doubleclick';

import {hasOwn} from '#core/types/object';

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
  } else {
    //DFP ad request call
    let calledDoubleclick = false;
    data.timeout = isNaN(data.timeout) ? DEFAULT_TIMEOUT : data.timeout;
    const timer = setTimeout(() => {
      callDoubleclick(EVENT_TIMEOUT);
    }, data.timeout);
    const callDoubleclick = function (code) {
      if (calledDoubleclick) {
        return;
      }
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
      global,
      `//tag.imonomy.com/amp/${data.pid}/amp.js`,
      () => {
        global.context.renderStart();
      },
      () => {
        global.context.noContentAvailable();
      }
    );
  }
}

/**
 * @param {*} data
 */
function prepareData(data) {
  for (const attr in data) {
    if (hasOwn(data, attr) && imonomyData.indexOf(attr) >= 0) {
      delete data[attr];
    }
  }
  data.targeting = data.targeting || {};
  data.targeting['IMONOMY_AMP'] = '1';
}

/**
 * @param {*} data
 * @param {number} code
 */
function reportStats(data, code) {
  try {
    if (code == EVENT_BADTAG) {
      return;
    }
    const xhttp = new XMLHttpRequest();
    xhttp.withCredentials = true;
    let unitFormat = '';
    let pageLocation = '';
    if (typeof window.context.location.href !== 'undefined') {
      pageLocation = encodeURIComponent(window.context.location.href);
    }
    const {pid, subId} = data,
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
