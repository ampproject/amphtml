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

import {validateData, loadScript} from '../3p/3p';
import {doubleclick} from '../ads/google/doubleclick';

/**
* @param {!Window} global
* @param {!Object} data
*/

export function aps(global, data) {
  validateData(data, [], ['pubId', 'slot', 'bidTimeout']);
  loadScript(global, 'https://c.amazon-adsystem.com/aax2/apstag.js', () => {
    data.targeting = data.targeting || {};

        // initialize apstag with the provided publisher ID, and declaring the AMP enviornment
    global.apstag.init({
      pubID: data['pubId'],
      isAmp: true,
      bidTimeout: parseInt(data.bidTimeout, 10) || undefined,
      adServer: 'googletag',
    });

        // request a bid for the slot
    global.apstag.fetchBids({
      slots: [{
        slotID: data.slot,
        sizes: [
                    [data.width, data.height],
        ],
      }],
    }, function(bids) {
            // when the bid is returned to the page
            // get the apstag display targeting keys, and associate add the k/v to the
            // data.targeting object to be appended to the ad server request
      const bidObject = bids.filter(bid => bid.slotID === data.slot)[0];
      if (bidObject) {
        global.apstag.targetingKeys('ampDisplay')
            .forEach(targetingKey =>
                        data.targeting[targetingKey] = bidObject[targetingKey]);
      }

      delete data['pubId'];
      data.bidTimeout ? delete data.bidTimeout : null;
      doubleclick(global, data);
    });
  });
}
