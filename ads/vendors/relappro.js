import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function relappro(global, data) {
  validateData(data, [], ['slotId', 'nameAdUnit', 'requirements']);
  global.params = data;

  loadScript(
    global,
    'https://cdn.relappro.com/adservices/amp/relappro.amp.min.js'
  );
}
