import {validateData, validateSrcPrefix, writeScript} from '#3p/3p';

const validHosts = [
  'https://go.eu.bbelements.com',
  'https://go.idnes.bbelements.com',
  'https://go.goldbachpoland.bbelements.com',
  'https://go.pol.bbelements.com',
  'https://go.idmnet.bbelements.com',
];

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function ibillboard(global, data) {
  validateData(data, ['src']);
  const {src} = data;
  validateSrcPrefix(validHosts, src);

  writeScript(global, src);
}
