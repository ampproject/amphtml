import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function eadv(global, data) {
  validateData(data, ['x', 'u'], []);
  writeScript(
    global,
    'https://www.eadv.it/track/?x=' + data.x + '&u=' + data.u
  );
}
