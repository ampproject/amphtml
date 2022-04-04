import {loadScript, validateData} from '#3p/3p';

import {parseJson} from '#core/types/object/json';

import {user} from '#utils/log';

const TAG = 'PROMOTEIQ';
const mandatoryDataFields = ['src', 'params', 'sfcallback'];

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function promoteiq(global, data) {
  validateData(data, mandatoryDataFields, []);
  const sfInputs = parseJson(data['params']);

  loadScript(global, data['src'], () => {
    if (!!global['TagDeliveryContent']) {
      const sfCallback = new Function('response', data['sfcallback']);
      global['TagDeliveryContent']['request'](sfInputs, sfCallback);
    } else {
      user().error(TAG, 'TagDeliveryContent object not loaded on page');
    }
  });
}
