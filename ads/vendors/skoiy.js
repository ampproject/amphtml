import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function skoiy(global, data) {
  // TODO: check mandatory fields
  validateData(data, ['token', 'format', 'id'], ['query']);

  const {format, id, query = '', token} = data;

  const options = query ? '&' + query : '';

  const url = `https://svas.skoiy.xyz/${format}/${token}/${id}?amp${options}`;
  writeScript(global, url);
}
