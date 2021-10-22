import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function brainy(global, data) {
  validateData(data, [], ['aid', 'slotId']);

  const url =
    'https://proparm.jp/ssp/p/js1' +
    '?_aid=' +
    encodeURIComponent(data['aid']) +
    '&amp;_slot=' +
    encodeURIComponent(data['slotId']);

  writeScript(global, url);
}
