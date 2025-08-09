import {computeInPrimaryFrame, loadScript} from '#3p/3p';

import {parseJson} from '#core/types/object/json';

/**
 * @param context
 */

const initSlotList = (context) => {
  context.primary.availableSlots = context.primary.availableSlots || {};
};

const registerSlot = (slot) => {
  context.primary.availableSlots[slot.slotName] = slot;
};

// eslint-disable-next-line require-jsdoc
export function springAds(global, data) {
  computeInPrimaryFrame(
    global,
    'springAds',
    () => {
      initSlotList(context);
    },
    () => {}
  );
  if (data.adssetup) {
    const adSSetup = parseJson(data.adssetup);
    adSSetup['isAMP'] = !0;
    adSSetup['availableSlots'] = context.primary.availableSlots;
    context.primary.adSSetup = global.adSSetup = adSSetup;
    const sitename = adSSetup['publisher'].match(/(.*)\..*/)[1];
    loadScript(
      global,
      'https://www.asadcdn.com/adlib/pages/' + sitename + '_amp.js'
    );
  } else {
    registerSlot({
      global,
      document,
      context,
      slotName: data['adslot'],
    });
    const adlib = window.ASCDP || context.primary.ASCDP || '';
    adlib && adlib.adS.renderAd(data.adslot);
  }
}
