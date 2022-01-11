import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function aja(global, data) {
  validateData(data, ['asi']);

  const {document} = global;
  const asi = data['asi'];

  const d = document.createElement('div');
  d.dataset['ajaAd'] = '';
  d.dataset['ajaAsi'] = asi;
  document.getElementById('c').appendChild(d);

  loadScript(global, 'https://cdn.as.amanad.adtdp.com/sdk/asot-amp.js');
}
