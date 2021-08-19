import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adsnative(global, data) {
  try {
    validateData(data, ['anapiid'], ['ankv', 'ancat', 'antid']);
  } catch (e) {
    validateData(data, ['annid', 'anwid'], ['ankv', 'ancat', 'antid']);
  }

  // convert string to object
  let actualkv = undefined;
  if (data.ankv) {
    actualkv = {};
    const arraykv = data.ankv.split(',');
    for (const k in arraykv) {
      const kv = arraykv[k].split(':');
      actualkv[kv.pop()] = kv.pop();
    }
  }

  // convert string to array
  const actualcat = data.ancat ? data.ancat.split(',') : undefined;

  // populate settings
  global._AdsNativeOpts = {
    apiKey: data.anapiid,
    networkKey: data.annid,
    nativeAdElementId: 'adsnative_ampad',
    currentPageUrl: global.context.location.href,
    widgetId: data.anwid,
    templateKey: data.antid,
    categories: actualcat,
    keyValues: actualkv,
    amp: true,
  };

  // drop ad placeholder div
  const ad = global.document.createElement('div');
  const ampwrapper = global.document.getElementById('c');
  ad.id = global._AdsNativeOpts.nativeAdElementId;
  ampwrapper.appendChild(ad);

  // load renderjs
  writeScript(global, 'https://static.adsnative.com/static/js/render.v1.js');
}
