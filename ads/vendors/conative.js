import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function conative(global, data) {
  validateData(data, ['domain', 'adslot', 'height'], ['preview']);

  data.domain = data.domain || null;
  data.adslot = data.adslot || null;
  data.preview = data.preview || null;

  window.dmConativeData = window.dmConativeData || {};
  window.dmConativeData.domain = window.dmConativeData.domain || data.domain;
  window.dmConativeData.adslot = window.dmConativeData.adslot || data.adslot;
  window.dmConativeData.preview = window.dmConativeData.preview || data.preview;
  window.dmConativeData.visibility = window.dmConativeData.visibility || 0;

  window.context.observeIntersection(function (changes) {
    /** @type {!Array} */ (changes).forEach(function (c) {
      window.dmConativeData.visibility = parseInt(
        (c.intersectionRect.height / c.boundingClientRect.height) * 100,
        10
      );
    });
  });

  if (data.domain) {
    writeScript(
      global,
      '//s3-eu-west-1.amazonaws.com/ccc-adscript/serve/domain/' +
        data.domain +
        '/config.js'
    );
  }
}
