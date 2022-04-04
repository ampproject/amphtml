import {loadScript, validateData} from '#3p/3p';

import {serializeQueryString} from '../../src/url';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function directadvert(global, data) {
  validateData(data, ['blockId']);

  const params = /** @type {!JsonObject} */ ({
    'async': 1,
    'div': 'c',
  });

  if (global.context.referrer) {
    params['amp_rref'] = encodeURIComponent(global.context.referrer);
  }

  if (global.context.canonicalUrl) {
    params['amp_rurl'] = encodeURIComponent(global.context.canonicalUrl);
  }

  const serverName = data['serverName'] || 'code.directadvert.ru';

  const url =
    '//' +
    encodeURIComponent(serverName) +
    '/data/' +
    encodeURIComponent(data['blockId']) +
    '.js?' +
    serializeQueryString(params);

  loadScript(
    global,
    url,
    () => {
      global.context.renderStart();
    },
    () => {
      global.context.noContentAvailable();
    }
  );
}
