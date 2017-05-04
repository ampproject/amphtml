/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {loadScript, computeInMasterFrame, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function imedia(global, data) {
  validateData(data, ['id', 'positions']);

  let positions = null;
  if (data.positions) {
    positions = JSON.parse(data.positions);
  }
  const mW = context.isMaster ? global : context.master;

  // create parent element
  const parentElement = document.createElement('div');
  parentElement.id = data.id;
  global.document.getElementById('c').appendChild(parentElement);

  // array of all ad elements through all iframes
  if (!mW.elements) {
    mW.elements = [];
  }
  mW.elements.push(parentElement);

  computeInMasterFrame(global, 'imedia-load', function(done) {
    loadScript(this, 'https://i.imedia.cz/js/im3.js', () => {
      if (this.im != null) {
        mW.im = this.im;
        mW.im.conf.referer = context.location.href;
        // send request to get all ads
        mW.im.getAds(positions, {AMPcallback: ads => {
          mW.ads = ads;
          done(true);
        }});
      }});
  }, () => {
    mW.elements.forEach(element => {
      positions.forEach((position, index) => {
        // match right elemnent and zone to write advert from adserver
        if (element.id == position.id) {
          position.id = element; // right element "c" to position obj.
          if (mW.im.writeAd) {
            mW.im.writeAd(mW.ads[index], position);
          }
        }
      });
    });
  });
};
