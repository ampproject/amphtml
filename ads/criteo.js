/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {computeInMasterFrame, loadScript} from '../3p/3p';
import {doubleclick} from '../ads/google/doubleclick';

/* global Criteo: false */

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function criteo(global, data) {
  loadScript(global, 'https://static.criteo.net/js/ld/publishertag.js', () => {
    if (data.tagtype === 'rta') {
      // Make sure RTA is called only once
      computeInMasterFrame(global, 'call-rta', resultCallback => {
        const params = {
          networkid: data.networkid,
          cookiename:
            data.cookiename || Criteo.PubTag.RTA.DefaultCrtgRtaCookieName,
          varname:
            data.varname || Criteo.PubTag.RTA.DefaultCrtgContentName,
        };
        Criteo.CallRTA(params);
        resultCallback(null);
      }, () => {});
      setTargeting(global, data);
    } else if (!data.tagtype || data.tagtype === 'passback') {
      Criteo.DisplayAd({
        zoneid: data.zone,
        containerid: 'c',
        integrationmode: 'amp',
      });
    }
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function setTargeting(global, data) {
  if (data.adserver === 'DFP') {
    const dblParams = {
      slot: data.slot,
      targeting: Criteo.ComputeDFPTargetingForAMP(
          data.cookiename || Criteo.PubTag.RTA.DefaultCrtgRtaCookieName,
          data.varname || Criteo.PubTag.RTA.DefaultCrtgContentName),
      width: data.width,
      height: data.height,
      type: 'criteo',
    };
    doubleclick(global, dblParams);
  }
}


