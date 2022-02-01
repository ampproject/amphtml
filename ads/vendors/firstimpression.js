import {validateData, writeScript} from '#3p/3p';

import {parseQueryString} from '#core/types/string/url';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function firstimpression(global, data) {
  validateData(data, ['zoneId', 'websiteId']);

  const {hash, search} = global.context.location;
  const parameters = Object.assign(
    parseQueryString(hash),
    parseQueryString(search)
  );

  const cdnHost =
    'https://' + (parameters['fi_ecdnhost'] || 'ecdn.firstimpression.io');

  const cdnpath = parameters['fi_ecdnpath'] || '/static/js/fiamp.js';

  global.params = data;

  writeScript(global, cdnHost + cdnpath);
}
