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

import {computeInMasterFrame, loadScript} from '../../3p/3p';
import {parseJson} from '../../src/json';

/**
 * @param {./3p/ampcontext-integration.IntegrationAmpContext} context
 */
function initSlotList(context) {
  context.master.availableSlots = context.master.availableSlots || {};
}

/**
 * @param {./3p/ampcontext-integration.IntegrationAmpContext} context
 * @param {{
 *   slotName: string
 * }} slot
 */
function registerSlot(context, slot) {
  context.master.availableSlots[slot.slotName] = slot;
}

/**
 * @param {!Window} global
 * @param {{
 *   adssetup: (JsonObject|undefined),
 *   adslot: string,
 * }} data
 */
export function springAds(global, data) {
  /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */
  const context = /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */ (global.context);
  computeInMasterFrame(
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
    adSSetup['availableSlots'] = context.master.availableSlots;
    context.master.adSSetup = global.adSSetup = adSSetup;
    const sitename = adSSetup['publisher'].match(/(.*)\..*/)[1];
    loadScript(
      global,
      'https://www.asadcdn.com/adlib/pages/' + sitename + '_amp.js'
    );
  } else {
    registerSlot(context, {
      global,
      document,
      context,
      slotName: data['adslot'],
    });
    const adlib = window.ASCDP || context.master.ASCDP || '';
    adlib && adlib.adS.renderAd(data.adslot);
  }
}
