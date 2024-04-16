import {loadScript} from '#3p/3p';

import {dev} from '#utils/log';

/* global Criteo: false */

/** @const {string} */
const TAG = 'CRITEO';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function criteo(global, data) {
  loadScript(global, 'https://static.criteo.net/js/ld/publishertag.js', () => {
    if (!data.tagtype || data.tagtype === 'passback') {
      Criteo.DisplayAd({
        zoneid: data.zone,
        containerid: 'c',
        integrationmode: 'amp',
      });
    } else if (data.tagtype === 'rta' || data.tagtype === 'standalone') {
      dev().error(
        TAG,
        'You are using a deprecated Criteo integration',
        data.tagtype
      );
    } else {
      dev().error(
        TAG,
        'You are using an unknown Criteo integration',
        data.tagtype
      );
    }
  });
}
