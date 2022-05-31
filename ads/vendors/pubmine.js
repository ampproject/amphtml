import {loadScript, validateData} from '#3p/3p';

import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';

const pubmineOptional = [
    'section',
    'pt',
    'ht',
    'npaOnUnknownConsent',
    'blogid',
  ],
  pubmineRequired = ['siteid'],
  pubmineURL = 'https://s.pubmine.com/head.js';

/**
 * @param {!Object} data
 * @param {!Window} global
 */
function initMasterFrame(data, global) {
  /*
   * INSUFFICIENT and UNKNOWN should be treated as INSUFFICIENT
   * unless state is UNKNOWN and `data-npa-on-unknown-consent=false`
   */
  const paUnknown =
    data['npaOnUnknownConsent'] !== undefined &&
    'false' == data['npaOnUnknownConsent'];
  const ctxt = global.context;
  const consent =
    ctxt.initialConsentState === null ||
    ctxt.initialConsentState === CONSENT_POLICY_STATE.SUFFICIENT ||
    ctxt.initialConsentState === CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED ||
    (ctxt.initialConsentState === CONSENT_POLICY_STATE.UNKNOWN && paUnknown);

  global['__ATA_PP'] = {
    pt: data['pt'] || 1,
    ht: data['ht'] || 1,
    tn: 'amp',
    amp: true,
    consent: consent ? 1 : 0,
    siteid: Number(data['siteid']) || undefined,
    blogid: Number(data['blogid']) || undefined,
  };
  global['__ATA'] = global['__ATA'] || {};
  global['__ATA']['cmd'] = global['__ATA']['cmd'] || [];
  loadScript(global, pubmineURL);
}

/**
 * @param {string} slotId
 * @param {!Window} global
 */
function createSlot(slotId, global) {
  const containerEl = global.document.getElementById('c');
  const adSlot = global.document.createElement('div');
  adSlot.setAttribute('id', slotId);
  containerEl.appendChild(adSlot);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pubmine(global, data) {
  validateData(data, pubmineRequired, pubmineOptional);

  const sectionId = data['siteid'] + (data['section'] || '1');

  const slotConfig = {
    sectionId,
    height: data.height == 250 ? 250 : data.height - 15,
    width: data.width,
    window: global,
  };

  const slotId = `atatags-${sectionId}`;

  createSlot(slotId, global);
  const {isMaster} = global.context;
  if (isMaster) {
    initMasterFrame(data, global);
  }
  const master = isMaster ? global : global.context.master;
  master['__ATA']['cmd']['push'](function () {
    master['__ATA']['insertStyles'](global);
    master['__ATA']['initSlot'](slotId, slotConfig);
  });
}
