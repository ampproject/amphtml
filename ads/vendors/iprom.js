import {validateData, writeScript} from '#3p/3p';

import {parseJson} from '#core/types/object/json';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function iprom(global, data) {
  validateData(data, ['zone', 'sitepath'], ['keywords', 'channels']);

  const ampdata = {
    sitepath: '[]',
    zone: [],
    keywords: '',
    channels: '',
    ...data,
  };

  /**
   * Callback for WriteScript
   */
  function namespaceLoaded() {
    const ipromNS = window.ipromNS || {};

    ipromNS.AdTag = ipromNS.AdTag || {};

    const config = {
      sitePath: parseJson(ampdata.sitepath),
      containerId: 'c',
      zoneId: ampdata.zone,
      prebid: true,
      amp: true,
      keywords: ampdata.keywords ? ampdata.keywords.split(',') : [],
      channels: ampdata.channels ? ampdata.channels.split(',') : [],
    };

    const tag = new ipromNS.AdTag(config);
    tag.init();
  }

  writeScript(global, 'https://cdn.ipromcloud.com/ipromNS.js', namespaceLoaded);
}
