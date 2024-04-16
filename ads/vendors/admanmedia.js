import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function admanmedia(global, data) {
  validateData(data, ['id']);

  const encodedId = encodeURIComponent(data.id);
  loadScript(
    global,
    `https://pub.admanmedia.com/go?id=${encodedId}`,
    () => {
      global.context.renderStart();
    },
    () => {
      global.context.noContentAvailable();
    }
  );
}
