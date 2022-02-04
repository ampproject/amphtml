import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function tracdelight(global, data) {
  const mandatoryFields = ['widget_id', 'access_key'];
  const optionalFields = ['mode'];

  validateData(data, mandatoryFields, optionalFields);

  global.tdData = data;
  writeScript(global, 'https://scripts.tracdelight.io/amp.js');
}
