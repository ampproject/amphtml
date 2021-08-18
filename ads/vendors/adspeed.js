import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adspeed(global, data) {
  validateData(data, ['zone', 'client']);

  const url =
    'https://g.adspeed.net/ad.php?do=amphtml&zid=' +
    data.zone +
    '&oid=' +
    data.client +
    '&cb=' +
    Math.random();

  writeScript(global, url);
}
