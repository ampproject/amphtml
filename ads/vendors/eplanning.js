import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function eplanning(global, data) {
  validateData(data, [
    'epl_si',
    'epl_isv',
    'epl_sv',
    'epl_sec',
    'epl_kvs',
    'epl_e',
  ]);
  // push the two object into the '_eplanning' global
  (global._eplanning = global._eplanning || []).push({
    sI: data.epl_si,
    isV: data.epl_isv,
    sV: data.epl_sv,
    sec: data.epl_sec,
    kVs: data.epl_kvs,
    e: data.epl_e,
  });
  loadScript(global, 'https://us.img.e-planning.net/layers/epl-amp.js');
}
