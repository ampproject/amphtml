import {loadScript, validateData} from '#3p/3p';

import {doubleclick} from '#ads/google/doubleclick';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function navegg(global, data) {
  const requiredParams = ['acc', 'wst', 'wct', 'wla'];
  const optionalParams = [];

  validateData(data, requiredParams, optionalParams);

  const {acc} = data;
  let seg,
    nvg = function () {};
  delete data.acc;
  nvg.prototype.getProfile = function () {};
  data.targeting = data.targeting || {};
  loadScript(global, 'https://tag.navdmp.com/amp.1.0.0.min.js', () => {
    nvg = global[`nvg${acc}`] = new global['AMPNavegg']({
      acc,
      wst: data.wst ? '1' : '0',
      wct: data.wct ? '1' : '0',
      wla: data.wla ? '1' : '0',
    });
    nvg.getProfile((nvgTargeting) => {
      for (seg in nvgTargeting) {
        data.targeting[seg] = nvgTargeting[seg];
      }
      doubleclick(global, data);
    });
  });
}
