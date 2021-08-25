import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function atomx(global, data) {
  const optionals = ['click', 'uv1', 'uv2', 'uv3', 'context'];

  validateData(data, ['id'], optionals);

  const args = [
    'size=' + data.width + 'x' + data.height,
    'id=' + encodeURIComponent(data.id),
  ];

  for (let i = 0; i < optionals.length; i++) {
    const optional = optionals[i];
    if (optional in data) {
      args.push(optional + '=' + encodeURIComponent(data[optional]));
    }
  }

  writeScript(global, 'https://s.ato.mx/p.js#' + args.join('&'));
}
