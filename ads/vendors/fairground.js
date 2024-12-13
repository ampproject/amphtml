import {validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function fairground(global, data) {
  validateData(data, ['project', 'hash']);

  const c = document.createElement('script');
  c.src =
    'https://amp.thefairground.com/' +
    data.project +
    '/' +
    data.hash +
    '/amp.script.js';
  c.type = 'text/javascript';

  global.document.getElementsByTagName('body')[0].append(c);
}
