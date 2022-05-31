import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function mads(global, data) {
  validateData(data, ['adrequest'], []);

  writeScript(global, 'https://eu2.madsone.com/js/tags.js', function () {
    window.MADSAdrequest.adrequest(JSON.parse(data.adrequest));
  });
}
