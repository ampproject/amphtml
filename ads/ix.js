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
  } else { //DFP ad request call

    const start = Date.now();
    let calledDoubleclick = false;
    data.ixTimeout = isNaN(data.ixTimeout) ? DEFAULT_TIMEOUT : data.ixTimeout;
    const timer = setTimeout(() => {
      callDoubleclick(data, EVENT_TIMEOUT);
    }, data.ixTimeout);

    const callDoubleclick = function(data, code) {
      if (calledDoubleclick) { return; }
      calledDoubleclick = true;
      clearTimeout(timer);
      reportStats(data.ixId, data.ixSlot, data.slot, start, code);
      prepareData(data);
      doubleclick(global, data);
    };

    data.targeting = data.targeting || {};
    if (typeof data.ixId === 'undefined' || isNaN(data.ixId)) {
      callDoubleclick(data, EVENT_BADTAG);
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
          const target = bids[0].targetKey;
          data.targeting[target] = bids[0].targetVal;
        }
        callDoubleclick(data, EVENT_SUCCESS);
      },
    };

    global.addEventListener('message', event => {
      if (typeof event.data !== 'string' ||
          event.data.substring(0,11) !== 'ix-message-') {
        return;
      }
      indexAmpRender(document, event.data.substring(11), global);
    });

    try {
      startAPL(global, data, callDoubleclick);
    } catch (e) {
      callDoubleclick(data, EVENT_ERROR);
    }
  }
}

function prepareData(data) {
  for (const attr in data) {
    if (data.hasOwnProperty(attr) && /^ix[A-Z]/.test(attr)) {
      delete data[attr];
    }
  }
  data.targeting['IX_AMP'] = '1';
}

function reportStats(siteID, slotID, dfpSlot, start, code) {
  if (code == EVENT_BADTAG) { return; }
  const xhttp = new XMLHttpRequest();
  xhttp.withCredentials = true;

  const deltat = Date.now() - start;
  const ts = start / 1000 >> 0;
  const ets = Date.now() / 1000 >> 0;
  let url = 'https://as-sec.casalemedia.com/headerstats?s=' + siteID;
  url += '&u=' + encodeURIComponent(window.context.location.href);
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
  stats += '"b": "INDX","x": "' + dfpSlot.substring(0,64) + '"}]}]}';

  xhttp.open('POST', url, true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send(stats);
}

function indexAmpRender(doc, targetID, global) {
  try {
    const ad = global._IndexRequestData.targetIDToBid[targetID].pop();
    if (ad != null) {
      const admDiv = document.createElement('div');
      admDiv./*OK*/innerHTML = ad;
      doc.body.appendChild(admDiv);
    } else {
      global.context.noContentAvailable();
    }
  } catch (e) {
    global.context.noContentAvailable();
  };
}

function indexParseResponse(global, response) {
  const rdata = global._IndexRequestData;
  if (response) {
    if (typeof rdata !== 'object'
        || typeof rdata.impIDToSlotID !== 'object'
        || typeof rdata.impIDToSlotID[response.id] === 'undefined') {
      return;
    }

    let targetMode = 0;
    let callbackFn;
    if (typeof rdata.reqOptions === 'object'
        && typeof rdata.reqOptions[response.id] === 'object') {
      if (typeof rdata.reqOptions[response.id].callback === 'function') {
        callbackFn = rdata.reqOptions[response.id].callback;
      }
      if (typeof rdata.reqOptions[response.id].targetMode === 'number') {
        targetMode = rdata.reqOptions[response.id].targetMode;
      }
    }
    const allBids = [];
    const seatbidLength =
      typeof response.seatbid === 'undefined' ? 0 : response.seatbid.length;
    for (let i = 0; i < seatbidLength; i++) {
      for (let j = 0; j < response.seatbid[i]['bid'].length; j++) {
        const bid = response.seatbid[i]['bid'][j];
        if (typeof bid.ext !== 'object'
            || typeof bid.ext.pricelevel !== 'string') {
          continue;
        }
        if (typeof
            rdata.impIDToSlotID[response.id][bid['impid']] === 'undefined') {
          continue;
        }
        const slotID = rdata.impIDToSlotID[response.id][bid['impid']];
        if (typeof rdata.targetIDToBid === 'undefined') {
          rdata.targetIDToBid = {};
        }
        let targetID;
        let targetKey;
        if (typeof bid.ext.dealid === 'string') {
          if (targetMode === 1) {
            targetID = slotID + bid.ext.pricelevel;
          } else {
            targetID = slotID + '_' + bid.ext.dealid;
          }
          targetKey = 'IPM';
        } else {
          targetID = slotID + bid.ext.pricelevel;
          targetKey = 'IOM';
        }
        if (rdata.targetIDToBid[targetID] === undefined) {
          rdata.targetIDToBid[targetID] = [bid['adm']];
        } else {
          rdata.targetIDToBid[targetID].push(bid['adm']);
        }
        const impBid = {};
        impBid.impressionID = bid['impid'];
        if (typeof bid.ext.dealid !== 'undefined') {
          impBid.dealID = bid.ext.dealid;
        }
        impBid.slotID = slotID;
        impBid.priceLevel = bid.ext.pricelevel;
        impBid.targetKey = targetKey;
        impBid.targetVal = targetID;
        allBids.push(impBid);
      }
    }
    if (typeof callbackFn === 'function') {
      if (allBids.length === 0) {
        callbackFn(response.id);
      } else {
        callbackFn(response.id, allBids);
      }
    }
  }
}

function startAPL(global, data, erf) {
  let escapableStr = '[\\\\\\"\\x00-\\x1f\\x7f-\\x9f';
  escapableStr += '\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f';
  escapableStr += '\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]';
  const escapable = new RegExp(escapableStr, 'g');
  const meta = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
    '\\': '\\\\',
  };

  const escapeCharacter = function(character) {
    const escaped = meta[character];
    if (typeof escaped === 'string') {
      return escaped;
    } else {
      return '\\u' + ('0000' + character.charCodeAt(0).toString(16)).slice(-4);
    }
  };

  const quote = function(string) {
    escapable.lastIndex = 0;
    if (escapable.test(string)) {
      return string.replace(escapable, escapeCharacter);
    } else {
      return string;
    }
  };

  let rdata = global._IndexRequestData;

  /**
  * OpenRTBRequest object
  * @constructor
  */
  function OpenRTBRequest(siteID) {
    this.initialized = false;
    if (typeof siteID !== 'number' || siteID % 1 !== 0 || siteID < 0) {
      throw new Error('Invalid Site ID');
    }
    this.siteID = siteID;
    this.impressions = [];
    this.sitePage = window.context.location.href;
    this.topframe = 0;
    if (typeof rdata.requestCounter === 'undefined') {
      rdata.requestCounter = Math.floor(Math.random() * 256);
    } else {
      rdata.requestCounter = (rdata.requestCounter + 1) % 256;
    }
    this.requestID = String((Date.now() % 2592000) * 256
                            + rdata.requestCounter + 256);
    this.initialized = true;
  };
  OpenRTBRequest.prototype.serialize = function() {
    let json = '{"id":' + this.requestID;
    json += ',"site":{"page":"' + quote(this.sitePage) + '"';
    json += '},"imp":[';
    for (let i = 0; i < this.impressions.length; i++) {
      const impObj = this.impressions[i];
      const ext = [];
      json += '{"id":"' + impObj.id + '", ';
      json += '"banner":{"w":' + impObj.w + ',"h":' + impObj.h + ',';
      json += '"topframe":' + String(this.topframe) + '}';
      if (typeof impObj.bidfloor === 'number') {
        json += ',"bidfloor":' + impObj.bidfloor;
        if (typeof impObj.bidfloorcur === 'string') {
          json += ',"bidfloorcur":"' + quote(impObj.bidfloorcur) + '"';
        }
      }
      if (typeof impObj.slotID === 'string'
          && (!impObj.slotID.match(/^\s*$/))) {
        ext.push('"sid":"' + quote(impObj.slotID) + '"');
      }
      if (typeof impObj.siteID === 'number') {
        ext.push('"siteID":' + impObj.siteID);
      }
      if (ext.length > 0) {
        json += ',"ext": {' + ext.join() + '}';
      }
      if (i + 1 == this.impressions.length) {
        json += '}';
      } else {
        json += '},';
      }
    }
    json += ']}';
    return json;
  };
  OpenRTBRequest.prototype.addImpression =
    function(width, height, bidFloor, bidFloorCurrency, slotID, siteID) {
      const impObj = {
        'id': String(this.impressions.length + 1),
      };
      if (typeof width !== 'number' || width <= 1) {
        return null;
      }
      if (typeof height !== 'number' || height <= 1) {
        return null;
      }
      if ((typeof slotID === 'string' || typeof slotID === 'number')
           && String(slotID).length <= 50) {
        impObj.slotID = String(slotID);
      }
      impObj.w = width;
      impObj.h = height;
      if (bidFloor != undefined && typeof bidFloor !== 'number') {
        return null;
      }
      if (typeof bidFloor === 'number') {
        if (bidFloor < 0) {
          return null;
        }
        impObj.bidfloor = bidFloor;
        if (bidFloorCurrency != undefined
            && typeof bidFloorCurrency !== 'string') {
          return null;
        }
        impObj.bidfloorcur = bidFloorCurrency;
      }
      if (typeof siteID !== 'undefined') {
        if (typeof siteID === 'number' && siteID % 1 === 0 && siteID >= 0) {
          impObj.siteID = siteID;
        } else {
          return null;
        }
      }
      this.impressions.push(impObj);
      return impObj.id;
    };

  OpenRTBRequest.prototype.sendRequestAsync = function(erf, data) {
    if (this.impressions.length === 0 || this.initialized !== true) {
      return;
    }
    const jsonURI = encodeURIComponent(this.serialize());
    let scriptSrc = 'https://as-sec.casalemedia.com';
    scriptSrc += '/cygnus?amp=1&v=7&fn=ix&s=' + this.siteID;
    scriptSrc += '&r=' + jsonURI;

    const xhttp = new XMLHttpRequest();
    xhttp.withCredentials = true;
    xhttp.onreadystatechange = function() {
      // If response recieved, and is OK parse response and return demand.
      // Otherwise return nothing.
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        try {
          const response = JSON.parse(xhttp.responseText.substring(3,
            xhttp.responseText.length - 2));
          indexParseResponse(global, response);
        } catch (e) { erf(data); };
      }
    };
    xhttp.open('GET', scriptSrc, true);
    xhttp.send();
    return this.requestID;
  };

  if (typeof global.IndexArgs === 'undefined'
      || typeof global.IndexArgs.siteID === 'undefined'
      || typeof global.IndexArgs.slots === 'undefined') {
    return;
  }
  if (typeof rdata === 'undefined') {
    rdata = {};
    rdata.impIDToSlotID = {};
    rdata.reqOptions = {};
  }
  const req = new OpenRTBRequest(global.IndexArgs.siteID);
  rdata.impIDToSlotID[req.requestID] = {};
  rdata.reqOptions[req.requestID] = {};
  let slotDef, impID;
  for (let i = 0; i < global.IndexArgs.slots.length; i++) {
    slotDef = global.IndexArgs.slots[i];
    impID = req.addImpression(slotDef.width, slotDef.height,
      slotDef.bidfloor, slotDef.bidfloorcur, slotDef.id, slotDef.siteID);
    if (impID) {
      rdata.impIDToSlotID[req.requestID][impID] = String(slotDef.id);
    }
  }
  if (typeof global.IndexArgs.targetMode === 'number') {
    rdata.reqOptions[req.requestID].targetMode = global.IndexArgs.targetMode;
  }

  if (typeof global.IndexArgs.callback === 'function') {
    rdata.reqOptions[req.requestID].callback = global.IndexArgs.callback;
  }

  return req.sendRequestAsync(erf, data);
};
