import {tryParseJson} from '#core/types/object/json';
import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function admixer(global, data) {
  validateData(data, ['zone'], ['sizes']);
  /**
   * @type {Object}
   */
  const payload = {
    imps: [],
    referrer: window.context.referrer,
  };
  const imp = {
    params: {
      zone: data.zone,
    },
  };
  if (data.sizes) {
    imp.sizes = tryParseJson(data.sizes);
  }
  payload.imps.push(imp);
  const json = JSON.stringify(/** @type {JsonObject} */ (payload));
  writeScript(global, 'https://inv-nets.admixer.net/ampsrc.js?data=' + json);
}
