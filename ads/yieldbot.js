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

import {doubleclick} from '../ads/google/doubleclick';
import {getMultiSizeDimensions} from '../ads/google/utils';
import {loadScript, validateData} from '../3p/3p';
import {rethrowAsync} from '../src/log';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yieldbot(global, data) {
  validateData(data, ['psn', 'ybSlot', 'slot']);

  global.ybotq = global.ybotq || [];

  loadScript(global, 'https://cdn.yldbt.com/js/yieldbot.intent.amp.js', () => {
    global.ybotq.push(() => {
      try {
        const multiSizeDataStr = data.multiSize || null;
        const primaryWidth = parseInt(data.overrideWidth || data.width, 10);
        const primaryHeight = parseInt(data.overrideHeight || data.height, 10);
        let dimensions;

        if (multiSizeDataStr) {
          dimensions = getMultiSizeDimensions(multiSizeDataStr,
              primaryWidth,
              primaryHeight,
              false);
          dimensions.unshift([primaryWidth, primaryHeight]);
        } else {
          dimensions = [[primaryWidth, primaryHeight]];
        }

        global.yieldbot.psn(data.psn);
        global.yieldbot.enableAsync();
        if (window.context.isMaster) {
          global.yieldbot.defineSlot(data.ybSlot, {sizes: dimensions});
          global.yieldbot.go();
        } else {
          const slots = {};
          slots[data.ybSlot] = dimensions;
          global.yieldbot.nextPageview(slots);
        }
      } catch (e) {
        rethrowAsync(e);
      }
    });

    global.ybotq.push(() => {
      try {
        const targeting = global.yieldbot.getSlotCriteria(data['ybSlot']);
        data['targeting'] = data['targeting'] || {};
        for (const key in targeting) {
          data.targeting[key] = targeting[key];
        }
      } catch (e) {
        rethrowAsync(e);
      }
      delete data['ybSlot'];
      delete data['psn'];
      doubleclick(global, data);
    });
  });
}
