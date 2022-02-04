import {loadScript, validateData} from '#3p/3p';

import {doubleclick} from '#ads/google/doubleclick';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function navegg(global, data) {
  validateData(data, ['acc']);
  const {acc} = data;
  let seg,
    nvg = function () {};
  delete data.acc;
  nvg.prototype.getProfile = function () {};
  data.targeting = data.targeting || {};
  loadScript(global, 'https://tag.navdmp.com/amp.1.0.0.min.js', () => {
    nvg = global[`nvg${acc}`] = new global['AMPNavegg']({
      acc,
    });
    nvg.getProfile((nvgTargeting) => {
      for (seg in nvgTargeting) {
        data.targeting[seg] = nvgTargeting[seg];
      }
      doubleclick(global, data);
    });
  });
}
