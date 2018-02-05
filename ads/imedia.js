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

import {computeInMasterFrame, loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function imedia(global, data) {
  validateData(data, ['id', 'positions']);
  const positions = JSON.parse(data.positions);
  const mW = context.isMaster ? global : context.master;

  // create parent element
  const parentElement = document.createElement('div');
  parentElement.id = data.id;
  global.document.getElementById('c').appendChild(parentElement);

  // array of all ad elements and matching contexts through all iframes
  if (!mW.inPagePositions) {
    mW.inPagePositions = [];
  }
  mW.inPagePositions.push({parentElement, context: global.context});

  computeInMasterFrame(global, 'imedia-load', done => {
    loadScript(global, 'https://i.imedia.cz/js/im3.js', () => {
      if (global.im != null) {
        mW.im = global.im;
        mW.im.conf.referer = context.canonicalUrl;

        // send request to get all ads
        mW.im.getAds(positions, {AMPcallback: ads => {
          mW.ads = ads;
          done(null);
        }});
      }});
  }, () => {
    mW.inPagePositions = mW.inPagePositions.filter(inPagePostion => {
      let used = true;
      positions.filter((position, index) => {

        // match right element and zone to write advert from adserver
        if (inPagePostion.parentElement.id == position.id) {
          used = false;
          position.id = inPagePostion.parentElement; // right element "c" to position obj.
          if (mW.im.writeAd) {
            mW.im.writeAd(mW.ads[index], position);

            // inform AMP runtime when the ad starts rendering
            if (mW.ads[index].impress) {
              inPagePostion.context.renderStart();
            } else {
              inPagePostion.context.noContentAvailable();
            }
          }
          return false;
        }
      });
      return used; // remove (filter) element filled with add
    });
  });
};
