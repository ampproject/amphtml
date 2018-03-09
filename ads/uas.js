/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {loadScript, validateData} from '../3p/3p';

function forEachOnObject(theObject, callback){
  if(typeof theObject === "object" && theObject !== null){
    if(typeof callback === "function"){
      for(var key in theObject){
        if(theObject.hasOwnProperty(key)){
          callback(key, theObject[key]);
        }
      }
    }
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function uas(global, data) {
  validateData(
    data,
    ['accId', 'adUnit', 'sizes', 'width', 'height'], 
    ['locLat', 'locLon', 'locSrc', 'pageURL', 'targeting', 'extraParams']
  );
  var uasDivId = "uas-amp-slot";
  document.write("<div id='"+uasDivId+"'></div>");
  var Phoenix = {};
  Phoenix.EQ = [];
  Phoenix.EQ.push(function(){
    Phoenix.enableSingleRequestCallMode();
    Phoenix.setInfo('SEC', 1);
    Phoenix.setInfo('ACCID', data.accId);
    Phoenix.setInfo('PAGEURL', global.context.location.href);
    data.pageURL && Phoenix.setInfo('PAGEURL', data.pageURL);
    data.locLat && Phoenix.setInfo('LAT', data.locLat);
    data.locLon && Phoenix.setInfo('LON', data.locLon);
    data.locSrc && Phoenix.setInfo('LOC_SRC', data.locSrc);
    var slot = Phoenix.defineAdSlot(data.adUnit, data.sizes, uasDivId);
    slot.setVisibility(1);
    forEachOnObject(data.targeting, function(key, value){
      slot.setTargeting(key, value);
    });
    forEachOnObject(data.extraParams, function(key, value){
      slot.setExtraParameters(key, value);
    });
    Phoenix.display(uasDivId);
  });
  loadScript(global, 'https://ads.pubmatic.com/AdServer/js/phoenix.js', () => {});
}