import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function beaverads(global, data) {
  validateData(data, ['blockId']);

  const url =
    'https://code.beaverads.com/data/' +
    encodeURIComponent(data['blockId']) +
    '.js?async=1&div=c';

  loadScript(
    global,
    url,
    () => {
      global.context.renderStart();
    },
    () => {
      global.context.noContentAvailable();
    }
  );
}
