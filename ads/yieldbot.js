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
          dimensions = getMultiSizeDimensions(multiSizeDataStr);
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

/**
 * Parse a string of comma separated <code>WxH</code> values.
 * @param {string} multiSizeDataStr The amp-ad data attribute containing the multi-size dimensions.
 * @return {?Array<!Array<number>>} An array of dimensions.
 * @see https://github.com/ampproject/amphtml/blob/master/ads/google/doubleclick.md#multi-size-ad
 * @example data-multi-size="300x220,300x210,300x200"
 * @private
 */
function getMultiSizeDimensions(multiSizeDataStr) {
  const dimensions = [];

  if (multiSizeDataStr) {
    const arrayOfSizeStrs = multiSizeDataStr.split(',');

    for (let idx = 0; idx < arrayOfSizeStrs.length; idx++) {
      const sizeStr = arrayOfSizeStrs[idx];
      const size = sizeStr.split('x');

      if (size.length != 2) {
        continue;
      }
      const width = Number(size[0]);
      const height = Number(size[1]);

      if (isNaN(width) || isNaN(height)) {
        continue;
      }

      dimensions.push([width, height]);
    }
  }
  return dimensions;
}
