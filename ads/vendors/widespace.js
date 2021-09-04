import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function widespace(global, data) {
  const WS_AMP_CODE_VER = '1.0.1';
  // Optional demography parameters.
  let demo = [];

  demo = ['Gender', 'Country', 'Region', 'City', 'Postal', 'Yob'].map((d) => {
    return 'demo' + d;
  });

  validateData(data, ['sid'], demo);

  const url =
    'https://engine.widespace.com/map/engine/dynamic?isamp=1' +
    '&ampver=' +
    WS_AMP_CODE_VER +
    '&#sid=' +
    encodeURIComponent(data.sid);

  writeScript(global, url);
}
