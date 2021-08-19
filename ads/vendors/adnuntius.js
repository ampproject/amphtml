import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adnuntius(global, data) {
  validateData(data, ['auId']);

  loadScript(global, 'https://cdn.adnuntius.com/adn.js', () => {
    global.adn = global.adn || {};
    global.adn.calls = global.adn.calls || [];
    global.adn.calls.push(() => {
      global.adn.request({
        amp: {data},
      });
    });
  });
}
