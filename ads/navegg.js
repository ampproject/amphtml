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
import {cidForDocOrNull} from '../src/cid';

/* global Navegg: false */

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function navegg(global, data) {
    let acc = data.acc;
    let ampPromise = Promise.resolve();
    delete(data.acc);
    loadScript(global, 'http://local.amp.com.br/amp.js', () => {
        new global['AMPNavegg']({
           acc: acc,
        }).then(function(nvg_targeting){
            console.log('nvg_targeting',nvg_targeting);
            doubleclick(global, data);
        });
/*    for(var x=0;x<global['nvg'+acc].seg.length; x++){
        var seg_name = global['nvg'+acc].seg[x];
        data.targeting[seg_name] = global['nvg'+acc].getSegment(seg_name);
    }*/
    doubleclick(global, data);
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
      targeting: Navegg.ComputeDFPTargetingForAMP(
        data.cookiename || Navegg.PubTag.RTA.DefaultCrtgRtaCookieName,
        data.varname || Navegg.PubTag.RTA.DefaultCrtgContentName),
      width: data.width,
      height: data.height,
      type: 'navegg',
    };
    doubleclick(global, dblParams);
  }
}


