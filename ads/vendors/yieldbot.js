import {loadScript, validateData} from '#3p/3p';

import {getMultiSizeDimensions} from '#ads/google/utils';

import {rethrowAsync} from '#core/error';

import {user} from '#utils/log';

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
          dimensions = getMultiSizeDimensions(
            multiSizeDataStr,
            primaryWidth,
            primaryHeight,
            false
          );
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
      user().warn(
        'AMP-AD',
        'type="yieldbot" will no longer ' +
          'be supported starting on March 29, 2018.' +
          ' Please use your amp-ad-network and RTC to configure a' +
          ' Yieldbot callout vendor. Refer to' +
          ' https://github.com/ampproject/amphtml/blob/main/' +
          'extensions/amp-a4a/rtc-publisher-implementation-guide.md' +
          '#setting-up-rtc-config for more information.'
      );
    });
  });
}
